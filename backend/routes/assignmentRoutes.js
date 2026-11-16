const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignmentById,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/', protect, authorize('instructor', 'admin'), createAssignment);
router.get('/:id', protect, getAssignmentById);
router.post('/:id/submit', protect, upload.single('submission_file'), submitAssignment);
router.get('/:id/submissions', protect, authorize('instructor', 'admin'), getAssignmentSubmissions);
router.patch('/submissions/:id/grade', protect, authorize('instructor', 'admin'), gradeSubmission);

module.exports = router;

