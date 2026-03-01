const express = require('express');
const { getQueue, updateQueuePosition, reassignDoctor } = require('../controllers/queueController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getQueue);
router.patch('/:id', auth, authorize('admin', 'doctor'), updateQueuePosition);
router.post('/:id/reassign', auth, authorize('admin'), reassignDoctor);

module.exports = router;
