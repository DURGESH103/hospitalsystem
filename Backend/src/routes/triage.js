const express = require('express');
const { calculateSeverity, getSymptoms, getConditions } = require('../controllers/triageController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/calculate', auth, calculateSeverity);
router.get('/symptoms', auth, getSymptoms);
router.get('/conditions', auth, getConditions);

module.exports = router;
