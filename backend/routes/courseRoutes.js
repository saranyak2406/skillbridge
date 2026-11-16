const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseStatus,
  createSection,
  getSectionsByCourse,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

// Public endpoints
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected endpoints (Instructor or Admin)
router.post('/', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), upload.single('thumbnail'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

// Admin-only status change (approve / reject)
router.patch('/:id/status', protect, authorize('admin'), updateCourseStatus);

// Nested Section routes under /api/courses/:id/sections
router.get('/:id/sections', getSectionsByCourse);
router.post('/:id/sections', protect, authorize('instructor', 'admin'), createSection);

module.exports = router;

