const { query } = require('../config/db');

/**
 * @desc    Submit a course review & star rating
 * @route   POST /api/reviews
 * @access  Private (Student)
 */
const createReview = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { course_id, rating, review_text } = req.body;

    if (!course_id || !rating) {
      return res.status(400).json({ status: 'fail', message: 'Course ID and rating (1-5) are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ status: 'fail', message: 'Rating must be an integer between 1 and 5.' });
    }

    // Verify enrollment
    const enrollRes = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, course_id]
    );

    if (enrollRes.rowCount === 0) {
      return res.status(403).json({
        status: 'fail',
        message: 'You must be enrolled in this course to submit a review.',
      });
    }

    const reviewRes = await query(
      `INSERT INTO reviews (student_id, course_id, rating, review_text)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (student_id, course_id) DO UPDATE SET
         rating = EXCLUDED.rating,
         review_text = EXCLUDED.review_text
       RETURNING *`,
      [studentId, course_id, numRating, review_text ? review_text.trim() : null]
    );

    res.status(201).json({
      status: 'success',
      message: 'Review submitted successfully!',
      data: { review: reviewRes.rows[0] },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for a course
 * @route   GET /api/courses/:id/reviews
 * @access  Public
 */
const getCourseReviews = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    const reviewsRes = await query(
      `SELECT 
        r.*,
        u.full_name AS student_name,
        u.profile_image AS student_image
       FROM reviews r
       JOIN users u ON u.id = r.student_id
       WHERE r.course_id = $1
       ORDER BY r.created_at DESC`,
      [courseId]
    );

    res.status(200).json({
      status: 'success',
      data: { reviews: reviewsRes.rows },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getCourseReviews,
};

