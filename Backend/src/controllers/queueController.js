const Appointment = require('../models/Appointment');
const queueService = require('../services/queueService');

exports.getQueue = async (req, res) => {
  try {
    let queue;
    
    if (req.user.role === 'doctor') {
      queue = await queueService.getQueueByDoctor(req.user.id);
    } else if (req.user.role === 'patient') {
      const position = await queueService.getPatientPosition(req.user.id);
      return res.json(position);
    } else {
      queue = await Appointment.find({ 
        status: { $in: ['scheduled', 'in_queue'] } 
      }).sort({ queuePosition: 1 });
    }
    
    res.json(queue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateQueuePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { queuePosition } = req.body;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { queuePosition, status: 'in_queue' },
      { new: true }
    );
    
    await queueService.calculateQueuePositions();
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.reassignDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId } = req.body;
    
    const appointment = await queueService.reassignDoctor(id, doctorId);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
