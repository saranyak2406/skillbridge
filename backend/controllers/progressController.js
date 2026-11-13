const { query } = require('../config/db');

/**
 * @desc    Mark a lesson as completed (or toggle completed status)
 * @route   POST /api/progress/lessons/:id/complete
 * @access  Private (Student)
 */
const completeLesson = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const lessonId = parseInt(req.params.id, 10);
    const { is_completed = true } = req.body;

    const progressRes = await query(
      `INSERT INTO lesson_progress (student_id, lesson_id, is_completed, completed_at)
       VALUES ($1, $2, $3, CASE WHEN $3 = true THEN CURRENT_TIMESTAMP ELSE NULL END)
       ON CONFLICT (student_id, lesson_id) DO UPDATE SET
         is_completed = EXCLUDED.is_completed,
         completed_at = CASE WHEN EXCLUDED.is_completed = true THEN CURRENT_TIMESTAMP ELSE NULL END
       RETURNING *`,
      [studentId, lessonId, is_completed]
    );

    res.status(200).json({
      status: 'success',
      message: is_completed ? 'Lesson marked as completed!' : 'Lesson marked as incomplete.',
      data: {
        progress: progressRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed progress for a course (completed lesson IDs, percentage, quiz status)
 * @route   GET /api/progress/courses/:id
 * @access  Private (Student)
 */
const getCourseProgress = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const courseId = parseInt(req.params.id, 10);

    // 1. Get total lessons in this course
    const lessonsRes = await query(
      `SELECT l.id, l.title, l.section_id, l.duration
       FROM lessons l
       JOIN course_sections cs ON cs.id = l.section_id
       WHERE cs.course_id = $1
       ORDER BY cs.section_order ASC, l.lesson_order ASC`,
      [courseId]
    );

    const totalLessons = lessonsRes.rows.length;

    // 2. Get completed lessons for this student
    const completedRes = await query(
      `SELECT lp.lesson_id, lp.completed_at
       FROM lesson_progress lp
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN course_sections cs ON cs.id = l.section_id
       WHERE cs.course_id = $1 AND lp.student_id = $2 AND lp.is_completed = true`,
      [courseId, studentId]
    );

    const completedLessonIds = completedRes.rows.map((r) => r.lesson_id);
    const completedCount = completedLessonIds.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    // 3. Check if any quizzes exist and are passed
    const quizRes = await query(
      `SELECT q.id, q.title, q.passing_score, qa.score, qa.status
       FROM quizzes q
       LEFT JOIN quiz_attempts qa ON qa.quiz_id = q.id AND qa.student_id = $2 AND qa.status = 'passed'
       WHERE q.course_id = $1`,
      [courseId, studentId]
    );

    // 4. Check if certificate exists
    const certRes = await query(
      'SELECT id, certificate_number, issued_at FROM certificates WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        course_id: courseId,
        total_lessons: totalLessons,
        completed_lessons_count: completedCount,
        completed_lesson_ids: completedLessonIds,
        percentage,
        is_fully_completed: percentage === 100,
        quizzes: quizRes.rows,
        certificate: certRes.rows[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  completeLesson,
  getCourseProgress,
};
