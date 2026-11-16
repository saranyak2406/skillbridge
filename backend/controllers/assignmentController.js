const { query } = require('../config/db');

/**
 * @desc    Create a new assignment for a course
 * @route   POST /api/assignments
 * @access  Private (Instructor or Admin)
 */
const createAssignment = async (req, res, next) => {
  try {
    const { course_id, title, description, due_date, total_marks = 100 } = req.body;
    const instructorId = req.user.id;

    if (!course_id || !title || !description || !due_date) {
      return res.status(400).json({
        status: 'fail',
        message: 'Course ID, title, description, and due date are required.',
      });
    }

    const insertRes = await query(
      `INSERT INTO assignments (course_id, instructor_id, title, description, due_date, total_marks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [course_id, instructorId, title.trim(), description.trim(), due_date, total_marks]
    );

    res.status(201).json({
      status: 'success',
      message: 'Assignment created successfully.',
      data: { assignment: insertRes.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get assignment details + student submission state
 * @route   GET /api/assignments/:id
 * @access  Private (Authenticated)
 */
const getAssignmentById = async (req, res, next) => {
  try {
    const assignmentId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    const assignmentRes = await query(
      `SELECT a.*, c.title AS course_title, u.full_name AS instructor_name
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       JOIN users u ON u.id = a.instructor_id
       WHERE a.id = $1`,
      [assignmentId]
    );

    if (assignmentRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Assignment not found.' });
    }

    const assignment = assignmentRes.rows[0];

    // If student, attach their specific submission if exists
    if (req.user.role === 'student') {
      const subRes = await query(
        `SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2`,
        [assignmentId, userId]
      );
      assignment.my_submission = subRes.rows[0] || null;
    }

    res.status(200).json({
      status: 'success',
      data: { assignment },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit assignment file (PDF, ZIP, DOCX, etc.)
 * @route   POST /api/assignments/:id/submit
 * @access  Private (Student)
 */
const submitAssignment = async (req, res, next) => {
  try {
    const assignmentId = parseInt(req.params.id, 10);
    const studentId = req.user.id;

    let fileUrl = req.body.file_url;
    if (req.file) {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    if (!fileUrl) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please upload an assignment file or provide a valid resource URL.',
      });
    }

    const submissionRes = await query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, status)
       VALUES ($1, $2, $3, 'submitted')
       ON CONFLICT (assignment_id, student_id) DO UPDATE SET
         file_url = EXCLUDED.file_url,
         submitted_at = CURRENT_TIMESTAMP,
         status = 'resubmitted'
       RETURNING *`,
      [assignmentId, studentId, fileUrl]
    );

    res.status(200).json({
      status: 'success',
      message: 'Assignment submitted successfully!',
      data: { submission: submissionRes.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all submissions for an assignment (Instructor)
 * @route   GET /api/assignments/:id/submissions
 * @access  Private (Instructor or Admin)
 */
const getAssignmentSubmissions = async (req, res, next) => {
  try {
    const assignmentId = parseInt(req.params.id, 10);

    const submissionsRes = await query(
      `SELECT 
        s.*,
        u.full_name AS student_name,
        u.email AS student_email,
        u.profile_image AS student_image
       FROM assignment_submissions s
       JOIN users u ON u.id = s.student_id
       WHERE s.assignment_id = $1
       ORDER BY s.submitted_at DESC`,
      [assignmentId]
    );

    res.status(200).json({
      status: 'success',
      data: { submissions: submissionsRes.rows },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Grade student submission & provide feedback
 * @route   PATCH /api/assignments/submissions/:id/grade
 * @access  Private (Instructor or Admin)
 */
const gradeSubmission = async (req, res, next) => {
  try {
    const submissionId = parseInt(req.params.id, 10);
    const { marks, feedback } = req.body;

    if (marks === undefined) {
      return res.status(400).json({ status: 'fail', message: 'Marks are required for grading.' });
    }

    const updateRes = await query(
      `UPDATE assignment_submissions
       SET marks = $1, feedback = $2, status = 'graded'
       WHERE id = $3
       RETURNING *`,
      [parseFloat(marks), feedback || null, submissionId]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Submission not found.' });
    }

    const gradedSubmission = updateRes.rows[0];

    // Notify student
    await query(
      `INSERT INTO notifications (user_id, title, message, notification_type)
       VALUES ($1, 'Assignment Graded', $2, 'assignment')`,
      [
        gradedSubmission.student_id,
        `Your submission has been evaluated. Score: ${gradedSubmission.marks} marks.`,
      ]
    );

    res.status(200).json({
      status: 'success',
      message: 'Submission graded successfully.',
      data: { submission: gradedSubmission },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignmentById,
  submitAssignment,
  getAssignmentSubmissions,
  gradeSubmission,
};

