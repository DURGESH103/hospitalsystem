const severityService = require('../services/severityService');

exports.calculateSeverity = async (req, res) => {
  try {
    const validation = severityService.validateTriageData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        error: 'Invalid triage data',
        details: validation.errors 
      });
    }

    const result = severityService.calculateSeverity(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSymptoms = async (req, res) => {
  try {
    const symptoms = severityService.getAvailableSymptoms();
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getConditions = async (req, res) => {
  try {
    const conditions = severityService.getAvailableConditions();
    res.json(conditions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
