const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  symptoms: { type: String, required: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  triageScore: { type: Number },
  age: { type: Number },
  chronicConditions: [{ type: String }],
  status: { type: String, enum: ['scheduled', 'in_queue', 'in_consultation', 'completed', 'cancelled'], default: 'scheduled' },
  scheduledTime: { type: Date, required: true },
  queuePosition: { type: Number },
  waitTime: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
