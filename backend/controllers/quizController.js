const { query, getClient } = require('../config/db');

/**
 * @desc    Create a new Quiz with Questions and Options
 * @route   POST /api/quizzes
 * @access  Private (Instructor or Admin)
 */
const createQuiz = async (req, res, next) => {
  const client = await getClient();

  try {
    const {
      course_id,
      section_id,
      title,
      description,
      duration = 15,
      passing_score = 70,
      questions = [],
    } = req.body;

    if (!course_id || !title) {
      return res.status(400).json({ status: 'fail', message: 'Course ID and quiz title are required.' });
    }

    await client.query('BEGIN');

    const quizRes = await client.query(
      `INSERT INTO quizzes (course_id, section_id, title, description, duration, passing_score)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [course_id, section_id || null, title.trim(), description || null, duration, passing_score]
    );

    const quiz = quizRes.rows[0];

    // Insert Questions and Options
    for (const q of questions) {
      const qRes = await client.query(
        `INSERT INTO questions (quiz_id, question_text, question_type, marks)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [quiz.id, q.question_text.trim(), q.question_type || 'multiple_choice', q.marks || 1]
      );
      const questionId = qRes.rows[0].id;

      if (q.options && Array.isArray(q.options)) {
        for (const opt of q.options) {
          await client.query(
            `INSERT INTO question_options (question_id, option_text, is_correct)
             VALUES ($1, $2, $3)`,
            [questionId, opt.option_text.trim(), !!opt.is_correct]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      message: 'Quiz and question bank created successfully.',
      data: { quiz },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * @desc    Get Quiz by ID (Student mode strips is_correct to prevent inspect cheating)
 * @route   GET /api/quizzes/:id
 * @access  Private (Authenticated)
 */
const getQuizById = async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.id, 10);
    const isInstructorOrAdmin = req.user.role === 'instructor' || req.user.role === 'admin';

    const quizRes = await query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (quizRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Quiz not found.' });
    }

    const quiz = quizRes.rows[0];

    // Fetch Questions with Options
    const questionsRes = await query(
      `SELECT q.id, q.question_text, q.question_type, q.marks
       FROM questions q
       WHERE q.quiz_id = $1
       ORDER BY q.id ASC`,
      [quizId]
    );

    const questions = [];
    for (const q of questionsRes.rows) {
      const optionsRes = await query(
        isInstructorOrAdmin
          ? 'SELECT id, option_text, is_correct FROM question_options WHERE question_id = $1 ORDER BY id ASC'
          : 'SELECT id, option_text FROM question_options WHERE question_id = $1 ORDER BY id ASC',
        [q.id]
      );
      questions.push({
        ...q,
        options: optionsRes.rows,
      });
    }

    quiz.questions = questions;

    res.status(200).json({
      status: 'success',
      data: { quiz },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Start a quiz attempt
 * @route   POST /api/quizzes/:id/attempts
 * @access  Private (Student)
 */
const startQuizAttempt = async (req, res, next) => {
  try {
    const quizId = parseInt(req.params.id, 10);
    const studentId = req.user.id;

    // Calculate total marks available for this quiz
    const marksRes = await query(
      'SELECT COALESCE(SUM(marks), 0) AS total_marks FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    const totalMarks = parseInt(marksRes.rows[0].total_marks, 10);

    const attemptRes = await query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, score, total_marks, status, started_at)
       VALUES ($1, $2, 0, $3, 'in_progress', CURRENT_TIMESTAMP)
       RETURNING *`,
      [quizId, studentId, totalMarks]
    );

    res.status(201).json({
      status: 'success',
      data: {
        attempt: attemptRes.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit Quiz attempt & evaluate answers server-side
 * @route   POST /api/quiz-attempts/:id/submit
 * @access  Private (Student)
 */
const submitQuizAttempt = async (req, res, next) => {
  const client = await getClient();

  try {
    const attemptId = parseInt(req.params.id, 10);
    const { answers = [] } = req.body; // array of { question_id, selected_option_id }

    // 1. Fetch Attempt & Quiz Info
    const attemptRes = await client.query(
      `SELECT qa.*, q.passing_score, q.course_id
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.id = $1`,
      [attemptId]
    );

    if (attemptRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Quiz attempt not found.' });
    }

    const attempt = attemptRes.rows[0];
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ status: 'fail', message: 'This attempt has already been evaluated and submitted.' });
    }

    await client.query('BEGIN');

    let totalScore = 0;
    let earnedMarks = 0;
    let totalPossibleMarks = 0;

    // 2. Fetch all questions and correct answers for this quiz
    const questionsRes = await client.query(
      `SELECT q.id, q.marks, qo.id AS correct_option_id
       FROM questions q
       LEFT JOIN question_options qo ON qo.question_id = q.id AND qo.is_correct = true
       WHERE q.quiz_id = $1`,
      [attempt.quiz_id]
    );

    const answerMap = new Map();
    answers.forEach((ans) => {
      answerMap.set(ans.question_id, ans.selected_option_id);
    });

    for (const q of questionsRes.rows) {
      const qMarks = parseInt(q.marks, 10);
      totalPossibleMarks += qMarks;

      const selectedOptionId = answerMap.get(q.id) || null;
      const isCorrect = selectedOptionId && selectedOptionId === q.correct_option_id;

      if (isCorrect) {
        earnedMarks += qMarks;
      }

      // Record answer in database
      await client.query(
        `INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, q.id, selectedOptionId, !!isCorrect]
      );
    }

    // 3. Calculate percentage score
    const finalPercentage = totalPossibleMarks > 0
      ? Math.round((earnedMarks / totalPossibleMarks) * 100)
      : 100;

    const isPassed = finalPercentage >= attempt.passing_score;
    const finalStatus = isPassed ? 'passed' : 'failed';

    // 4. Update Quiz Attempt record
    const updatedAttemptRes = await client.query(
      `UPDATE quiz_attempts
       SET score = $1, total_marks = $2, status = $3, completed_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [finalPercentage, totalPossibleMarks, finalStatus, attemptId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: isPassed ? 'Congratulations! You passed the quiz!' : 'Quiz evaluation complete. Passing score not reached.',
      data: {
        attempt: updatedAttemptRes.rows[0],
        earned_marks: earnedMarks,
        total_marks: totalPossibleMarks,
        score_percentage: finalPercentage,
        passing_score: attempt.passing_score,
        is_passed: isPassed,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * @desc    Get detailed results for an attempt with correct answers and explanations
 * @route   GET /api/quiz-attempts/:id/results
 * @access  Private (Student)
 */
const getAttemptResults = async (req, res, next) => {
  try {
    const attemptId = parseInt(req.params.id, 10);

    const attemptRes = await query(
      `SELECT qa.*, q.title AS quiz_title, q.passing_score, q.course_id
       FROM quiz_attempts qa
       JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.id = $1`,
      [attemptId]
    );

    if (attemptRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Attempt not found.' });
    }

    const attempt = attemptRes.rows[0];

    // Detailed answers
    const answersRes = await query(
      `SELECT 
        qa.question_id,
        q.question_text,
        q.marks,
        qa.selected_option_id,
        qa.is_correct,
        so.option_text AS selected_option_text,
        co.id AS correct_option_id,
        co.option_text AS correct_option_text
       FROM quiz_answers qa
       JOIN questions q ON q.id = qa.question_id
       LEFT JOIN question_options so ON so.id = qa.selected_option_id
       LEFT JOIN question_options co ON co.question_id = q.id AND co.is_correct = true
       WHERE qa.attempt_id = $1
       ORDER BY q.id ASC`,
      [attemptId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        attempt,
        questions_breakdown: answersRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuiz,
  getQuizById,
  startQuizAttempt,
  submitQuizAttempt,
  getAttemptResults,
};

