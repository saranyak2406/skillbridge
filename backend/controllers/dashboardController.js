const { query } = require('../config/db');

/**
 * @desc    Get aggregated stats for Student Dashboard
 * @route   GET /api/dashboard/student
 * @access  Private (Student)
 */
const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // 1. Enrolled courses with progress
    const coursesRes = await query(
      `SELECT 
        e.id AS enrollment_id,
        e.enrollment_date,
        e.status AS enrollment_status,
        c.id AS course_id,
        c.title,
        c.thumbnail,
        c.difficulty_level,
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

    const enrolledCourses = coursesRes.rows;
    const totalEnrolled = enrolledCourses.length;
    const completedCoursesCount = enrolledCourses.filter((c) => parseFloat(c.progress_percentage) >= 100).length;
    const inProgressCount = totalEnrolled - completedCoursesCount;

    // 2. Average Quiz Score
    const quizStatsRes = await query(
      `SELECT 
        COUNT(id) AS total_attempts,
        COALESCE(AVG(score), 0) AS average_score,
        COUNT(id) FILTER (WHERE status = 'passed') AS passed_attempts
       FROM quiz_attempts
       WHERE student_id = $1`,
      [studentId]
    );

    // 3. Certificates Count
    const certCountRes = await query(
      'SELECT COUNT(id) AS total_certificates FROM certificates WHERE student_id = $1',
      [studentId]
    );

    // 4. Pending assignments for enrolled courses
    const upcomingAssignmentsRes = await query(
      `SELECT a.id, a.title, a.due_date, a.total_marks, c.title AS course_title,
        sub.id AS submission_id, sub.status AS submission_status
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       JOIN enrollments e ON e.course_id = c.id
       LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = $1
       WHERE e.student_id = $1
       ORDER BY a.due_date ASC
       LIMIT 5`,
      [studentId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        total_enrolled: totalEnrolled,
        in_progress_count: inProgressCount,
        completed_count: completedCoursesCount,
        average_quiz_score: Math.round(parseFloat(quizStatsRes.rows[0].average_score)),
        passed_quizzes_count: parseInt(quizStatsRes.rows[0].passed_attempts, 10),
        certificates_count: parseInt(certCountRes.rows[0].total_certificates, 10),
        enrolled_courses: enrolledCourses,
        upcoming_assignments: upcomingAssignmentsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated stats for Instructor Dashboard
 * @route   GET /api/dashboard/instructor
 * @access  Private (Instructor)
 */
const getInstructorDashboard = async (req, res, next) => {
  try {
    const instructorId = req.user.id;

    // 1. Instructor Courses
    const coursesRes = await query(
      `SELECT 
        c.id, 
        c.title, 
        c.status, 
        c.price, 
        c.difficulty_level,
        c.created_at,
        cat.category_name,
        COUNT(DISTINCT e.id) AS enrolled_students,
        COALESCE(AVG(r.rating), 0) AS average_rating
       FROM courses c
       LEFT JOIN categories cat ON cat.id = c.category_id
       LEFT JOIN enrollments e ON e.course_id = c.id
       LEFT JOIN reviews r ON r.course_id = c.id
       WHERE c.instructor_id = $1
       GROUP BY c.id, cat.category_name
       ORDER BY c.created_at DESC`,
      [instructorId]
    );

    const courses = coursesRes.rows;
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.status === 'published').length;
    const pendingCourses = courses.filter((c) => c.status === 'pending').length;

    // 2. Total Enrolled Students
    const totalStudents = courses.reduce((sum, c) => sum + parseInt(c.enrolled_students, 10), 0);

    // 3. Total Revenue earned
    const revenueRes = await query(
      `SELECT COALESCE(SUM(p.amount), 0) AS total_revenue
       FROM payments p
       JOIN courses c ON c.id = p.course_id
       WHERE c.instructor_id = $1 AND p.payment_status = 'completed'`,
      [instructorId]
    );
    const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue);

    // 4. Pending Assignment Submissions requiring review
    const pendingSubmissionsRes = await query(
      `SELECT 
        s.id, 
        s.submitted_at, 
        s.status,
        a.title AS assignment_title,
        c.title AS course_title,
        u.full_name AS student_name
       FROM assignment_submissions s
       JOIN assignments a ON a.id = s.assignment_id
       JOIN courses c ON c.id = a.course_id
       JOIN users u ON u.id = s.student_id
       WHERE a.instructor_id = $1 AND s.status IN ('submitted', 'resubmitted')
       ORDER BY s.submitted_at ASC
       LIMIT 10`,
      [instructorId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        total_courses: totalCourses,
        published_courses: publishedCourses,
        pending_courses: pendingCourses,
        total_students: totalStudents,
        total_revenue: totalRevenue,
        pending_submissions_count: pendingSubmissionsRes.rowCount,
        courses,
        pending_submissions: pendingSubmissionsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get platform stats for Admin Dashboard
 * @route   GET /api/dashboard/admin
 * @access  Private (Admin)
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. User counts by role
    const usersCountRes = await query(
      `SELECT 
        COUNT(id) AS total_users,
        COUNT(id) FILTER (WHERE role = 'student') AS total_students,
        COUNT(id) FILTER (WHERE role = 'instructor') AS total_instructors,
        COUNT(id) FILTER (WHERE role = 'admin') AS total_admins
       FROM users`
    );

    // 2. Course counts
    const coursesCountRes = await query(
      `SELECT 
        COUNT(id) AS total_courses,
        COUNT(id) FILTER (WHERE status = 'published') AS published_courses,
        COUNT(id) FILTER (WHERE status = 'pending') AS pending_approvals
       FROM courses`
    );

    // 3. Platform Revenue & Total Enrollments
    const enrollmentsCountRes = await query('SELECT COUNT(id) AS total_enrollments FROM enrollments');
    const revenueRes = await query(
      `SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payments WHERE payment_status = 'completed'`
    );

    // 4. Pending courses requiring approval
    const pendingCoursesRes = await query(
      `SELECT 
        c.id, 
        c.title, 
        c.price, 
        c.difficulty_level, 
        c.created_at,
        u.full_name AS instructor_name,
        u.email AS instructor_email,
        cat.category_name
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       LEFT JOIN categories cat ON cat.id = c.category_id
       WHERE c.status = 'pending'
       ORDER BY c.created_at ASC`
    );

    // 5. Recent transactions
    const recentTxnsRes = await query(
      `SELECT 
        p.id, 
        p.transaction_id, 
        p.amount, 
        p.created_at,
        c.title AS course_title,
        u.full_name AS student_name
       FROM payments p
       JOIN courses c ON c.id = p.course_id
       JOIN users u ON u.id = p.student_id
       ORDER BY p.created_at DESC
       LIMIT 6`
    );

    res.status(200).json({
      status: 'success',
      data: {
        users: usersCountRes.rows[0],
        courses: coursesCountRes.rows[0],
        total_enrollments: parseInt(enrollmentsCountRes.rows[0].total_enrollments, 10),
        total_revenue: parseFloat(revenueRes.rows[0].total_revenue),
        pending_course_approvals: pendingCoursesRes.rows,
        recent_transactions: recentTxnsRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard,
  getInstructorDashboard,
  getAdminDashboard,
};

