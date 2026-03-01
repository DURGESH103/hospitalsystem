const Appointment = require('../models/Appointment');
const queueService = require('../services/queueService');
const severityService = require('../services/severityService');

exports.getAppointments = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'patient') {
      filter.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user.id;
    }
    
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const appointmentData = { ...req.body };
    
    // Calculate severity if symptoms provided
    if (appointmentData.symptoms) {
      const triageData = {
        symptoms: Array.isArray(appointmentData.symptoms) 
          ? appointmentData.symptoms 
          : [appointmentData.symptoms],
        age: appointmentData.age,
        chronicConditions: appointmentData.chronicConditions,
        vitals: appointmentData.vitals
      };
      
      const severityResult = severityService.calculateSeverity(triageData);
      appointmentData.severity = severityResult.severity;
      appointmentData.triageScore = severityResult.score;
    }
    
    const appointment = await queueService.addToQueue(appointmentData);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await queueService.updateAppointmentStatus(req.params.id, status);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await queueService.updateAppointmentStatus(req.params.id, 'cancelled');
    res.json({ message: 'Appointment cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
