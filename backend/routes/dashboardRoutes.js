const express = require('express');
const router = express.Router();
const {
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/student', protect, getStudentDashboard);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
