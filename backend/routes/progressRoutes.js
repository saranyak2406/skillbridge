const express = require('express');
const router = express.Router();
const {
  completeLesson,
  getCourseProgress,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.post('/lessons/:id/complete', protect, completeLesson);
router.get('/courses/:id', protect, getCourseProgress);

module.exports = router;
