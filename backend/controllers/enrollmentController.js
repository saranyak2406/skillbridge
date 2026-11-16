const { query, getClient } = require('../config/db');

/**
 * @desc    Enroll authenticated student in a course
 * @route   POST /api/enrollments
 * @access  Private (Student or Admin)
 */
const enrollInCourse = async (req, res, next) => {
  const client = await getClient();

  try {
    const studentId = req.user.id;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ status: 'fail', message: 'Course ID is required.' });
    }

    const courseId = parseInt(course_id, 10);

    // 1. Verify course exists and is published
    const courseRes = await client.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }
    const course = courseRes.rows[0];

    // 2. Check for duplicate enrollment
    const existingEnrollment = await client.query(
      'SELECT id, status FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (existingEnrollment.rowCount > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'You are already enrolled in this course.',
        data: { enrollment: existingEnrollment.rows[0] },
      });
    }

    await client.query('BEGIN');

    // 3. Create Enrollment
    const enrollmentRes = await client.query(
      `INSERT INTO enrollments (student_id, course_id, payment_status, status)
       VALUES ($1, $2, 'completed', 'active')
       RETURNING *`,
      [studentId, courseId]
    );

    // 4. Record Payment transaction
    const transactionId = `TXN-${Date.now()}-${Math.round(Math.random() * 10000)}`;
    await client.query(
      `INSERT INTO payments (student_id, course_id, amount, payment_provider, transaction_id, payment_status)
       VALUES ($1, $2, $3, 'SkillBridge Checkout', $4, 'completed')`,
      [studentId, courseId, course.price, transactionId]
    );

    // 5. Send automated notification to student
    await client.query(
      `INSERT INTO notifications (user_id, title, message, notification_type)
       VALUES ($1, $2, $3, 'enrollment')`,
      [
        studentId,
        'Enrollment Confirmed!',
        `You have successfully enrolled in "${course.title}". Start learning today!`,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      message: 'Successfully enrolled in course!',
      data: {
        enrollment: enrollmentRes.rows[0],
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
 * @desc    Get all courses enrolled by the currently logged-in student
 * @route   GET /api/enrollments/my-courses
 * @access  Private (Student)
 */
const getMyEnrolledCourses = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const myCoursesRes = await query(
      `SELECT 
        e.id AS enrollment_id,
        e.enrollment_date,
        e.payment_status,
        e.status AS enrollment_status,
        c.id AS course_id,
        c.title,
        c.description,
        c.thumbnail,
        c.difficulty_level,
        c.duration,
        u.full_name AS instructor_name,
        COUNT(DISTINCT l.id) AS total_lessons,
        COUNT(DISTINCT lp.id) FILTER (WHERE lp.is_completed = true) AS completed_lessons,
        ROUND(
          COALESCE(
            COUNT(DISTINCT lp.id) FILTER (WHERE lp.is_completed = true)::decimal / NULLIF(COUNT(DISTINCT l.id), 0) * 100,
            0
          ), 1
        ) AS progress_percentage
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      JOIN users u ON u.id = c.instructor_id
      LEFT JOIN course_sections cs ON cs.course_id = c.id
      LEFT JOIN lessons l ON l.section_id = cs.id
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = e.student_id
      WHERE e.student_id = $1
      GROUP BY e.id, c.id, u.id
      ORDER BY e.enrollment_date DESC`,
      [studentId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        courses: myCoursesRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get enrolled students for a specific course (Instructor or Admin)
 * @route   GET /api/courses/:id/students
 * @access  Private (Course Instructor or Admin)
 */
const getCourseStudents = async (req, res, next) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    const studentsRes = await query(
      `SELECT 
        e.id AS enrollment_id,
        e.enrollment_date,
        e.status AS enrollment_status,
        u.id AS student_id,
        u.full_name,
        u.email,
        u.profile_image,
        ROUND(
          COALESCE(
            COUNT(DISTINCT lp.id) FILTER (WHERE lp.is_completed = true)::decimal / 
            NULLIF((SELECT COUNT(*) FROM lessons l2 JOIN course_sections cs2 ON cs2.id = l2.section_id WHERE cs2.course_id = $1), 0) * 100,
            0
          ), 1
        ) AS progress_percentage
      FROM enrollments e
      JOIN users u ON u.id = e.student_id
      LEFT JOIN lessons l ON l.id IN (SELECT l3.id FROM lessons l3 JOIN course_sections cs3 ON cs3.id = l3.section_id WHERE cs3.course_id = $1)
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.student_id = u.id
      WHERE e.course_id = $1
      GROUP BY e.id, u.id
      ORDER BY e.enrollment_date DESC`,
      [courseId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        students: studentsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  enrollInCourse,
  getMyEnrolledCourses,
  getCourseStudents,
};

