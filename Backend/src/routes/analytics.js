const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, authorize('admin', 'doctor'), getAnalytics);

module.exports = router;
