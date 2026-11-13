const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuizById,
  startQuizAttempt,
  submitQuizAttempt,
  getAttemptResults,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('instructor', 'admin'), createQuiz);
router.get('/:id', protect, getQuizById);
router.post('/:id/attempts', protect, startQuizAttempt);
router.post('/attempts/:id/submit', protect, submitQuizAttempt);
router.get('/attempts/:id/results', protect, getAttemptResults);

module.exports = router;
