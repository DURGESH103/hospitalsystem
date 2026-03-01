const Appointment = require('../models/Appointment');
const { getIO } = require('../services/socket');

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    getIO().emit('appointment:update', appointment);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    getIO().emit('appointment:update', appointment);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    getIO().emit('appointment:delete', { id: req.params.id });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
