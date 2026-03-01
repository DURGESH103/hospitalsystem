const express = require('express');
const { getAppointments, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointmentController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getAppointments);
router.post('/', auth, authorize('patient', 'admin'), createAppointment);
router.patch('/:id', auth, authorize('doctor', 'admin'), updateAppointment);
router.delete('/:id', auth, authorize('admin'), deleteAppointment);

module.exports = router;
