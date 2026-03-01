const Appointment = require('../models/Appointment');
const User = require('../models/User');

exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    
    const appointments = await Appointment.find({ createdAt: { $gte: todayStart } });
    const queue = await Appointment.find({ status: { $in: ['scheduled', 'in_queue'] } });
    
    const avgWaitTime = queue.length > 0 
      ? queue.reduce((sum, apt) => sum + (apt.waitTime || 0), 0) / queue.length 
      : 0;
    
    const severityDistribution = {
      critical: queue.filter(q => q.severity === 'critical').length,
      high: queue.filter(q => q.severity === 'high').length,
      medium: queue.filter(q => q.severity === 'medium').length,
      low: queue.filter(q => q.severity === 'low').length,
    };
    
    const waitTimeHistory = Array.from({ length: 6 }, (_, i) => {
      const hour = 9 + i;
      return {
        time: `${hour}:00`,
        wait: Math.floor(Math.random() * 20) + 10
      };
    });
    
    res.json({
      avgWaitTime: Math.round(avgWaitTime),
      totalAppointments: appointments.length,
      activeQueue: queue.length,
      severityDistribution,
      waitTimeHistory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
