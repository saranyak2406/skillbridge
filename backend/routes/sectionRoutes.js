const express = require('express');
const router = express.Router();
const {
  updateSection,
  deleteSection,
  createLesson,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.put('/:id', protect, authorize('instructor', 'admin'), updateSection);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteSection);
router.post('/:id/lessons', protect, authorize('instructor', 'admin'), createLesson);

module.exports = router;

