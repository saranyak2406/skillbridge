const express = require('express');
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrolledCourses,
  getCourseStudents,
} = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, enrollInCourse);
router.get('/my-courses', protect, getMyEnrolledCourses);
router.get('/course/:id/students', protect, authorize('instructor', 'admin'), getCourseStudents);

module.exports = router;

