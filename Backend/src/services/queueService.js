const Appointment = require('../models/Appointment');
const queueService = require('../services/queueService');
const { emitToDoctor, emitToPatient, emitToAll } = require('./socket');

const SEVERITY_PRIORITY = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4
};

const AVG_CONSULTATION_TIME = 15; // minutes

class QueueService {
  
  async calculateQueuePositions() {
    const queueItems = await Appointment.find({
      status: { $in: ['scheduled', 'in_queue'] }
    }).sort({ 
      severity: 1,
      createdAt: 1 
    });

    const sortedQueue = queueItems.sort((a, b) => {
      const priorityDiff = SEVERITY_PRIORITY[a.severity] - SEVERITY_PRIORITY[b.severity];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    const updates = sortedQueue.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        update: { 
          queuePosition: index + 1,
          waitTime: (index + 1) * AVG_CONSULTATION_TIME,
          status: 'in_queue',
          _version: (item._version || 0) + 1
        }
      }
    }));

    if (updates.length > 0) {
      await Appointment.bulkWrite(updates);
    }

    return sortedQueue;
  }

  async assignDoctorByWorkload(appointmentId, specialty = null) {
    const doctors = await User.find({ 
      role: 'doctor',
      status: 'active',
      ...(specialty && { specialty })
    });

    if (doctors.length === 0) {
      throw new Error('No available doctors');
    }

    const workloadPromises = doctors.map(async (doctor) => {
      const count = await Appointment.countDocuments({
        doctorId: doctor._id,
        status: { $in: ['scheduled', 'in_queue', 'in_consultation'] }
      });
      return { doctor, workload: count };
    });

    const workloads = await Promise.all(workloadPromises);
    workloads.sort((a, b) => a.workload - b.workload);

    const selectedDoctor = workloads[0].doctor;

    await Appointment.findByIdAndUpdate(appointmentId, {
      doctorId: selectedDoctor._id,
      doctorName: selectedDoctor.name
    });

    return selectedDoctor;
  }

  async addToQueue(appointmentData) {
    const session = await Appointment.startSession();
    session.startTransaction();

    try {
      const appointment = await Appointment.create([{ ...appointmentData, _version: 1 }], { session });
      
      if (!appointmentData.doctorId) {
        await this.assignDoctorByWorkload(appointment[0]._id);
      }

      await this.calculateQueuePositions();
      await session.commitTransaction();

      const updatedAppointment = await Appointment.findById(appointment[0]._id);
      
      emitToDoctor(updatedAppointment.doctorId, 'queue:update', updatedAppointment);
      emitToPatient(updatedAppointment.patientId, 'appointment:update', updatedAppointment);
      
      return updatedAppointment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async updateAppointmentStatus(appointmentId, status) {
    const session = await Appointment.startSession();
    session.startTransaction();

    try {
      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { 
          status,
          $inc: { _version: 1 }
        },
        { new: true, session }
      );

      if (status === 'completed' || status === 'cancelled') {
        await this.calculateQueuePositions();
      }

      await session.commitTransaction();

      emitToDoctor(appointment.doctorId, 'appointment:update', appointment);
      emitToPatient(appointment.patientId, 'appointment:update', appointment);
      emitToAll('queue:recalculated', {});

      return appointment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async reassignDoctor(appointmentId, newDoctorId) {
    const session = await Appointment.startSession();
    session.startTransaction();

    try {
      const doctor = await User.findById(newDoctorId);
      if (!doctor || doctor.role !== 'doctor') {
        throw new Error('Invalid doctor');
      }

      const appointment = await Appointment.findByIdAndUpdate(
        appointmentId,
        { 
          doctorId: newDoctorId,
          doctorName: doctor.name,
          $inc: { _version: 1 }
        },
        { new: true, session }
      );

      await this.calculateQueuePositions();
      await session.commitTransaction();

      emitToDoctor(newDoctorId, 'queue:update', appointment);
      emitToPatient(appointment.patientId, 'appointment:update', appointment);

      return appointment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getQueueByDoctor(doctorId) {
    return await Appointment.find({
      doctorId,
      status: { $in: ['scheduled', 'in_queue'] }
    }).sort({ queuePosition: 1 });
  }

  async getPatientPosition(patientId) {
    const appointment = await Appointment.findOne({
      patientId,
      status: { $in: ['scheduled', 'in_queue'] }
    });

    if (!appointment) return null;

    const ahead = await Appointment.countDocuments({
      doctorId: appointment.doctorId,
      status: { $in: ['scheduled', 'in_queue'] },
      queuePosition: { $lt: appointment.queuePosition }
    });

    return {
      position: appointment.queuePosition,
      ahead,
      estimatedWait: appointment.waitTime
    };
  }

  async handleDoctorUnavailable(doctorId) {
    const session = await Appointment.startSession();
    session.startTransaction();

    try {
      const affectedAppointments = await Appointment.find({
        doctorId,
        status: { $in: ['scheduled', 'in_queue'] }
      });

      for (const apt of affectedAppointments) {
        await this.assignDoctorByWorkload(apt._id, apt.specialty);
      }

      await this.calculateQueuePositions();
      await session.commitTransaction();

      emitToAll('queue:recalculated', {});
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new QueueService();
