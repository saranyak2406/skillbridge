const { query, getClient } = require('../config/db');

/**
 * @desc    Simulate payment intent order creation
 * @route   POST /api/payments/create-order
 * @access  Private (Student)
 */
const createOrder = async (req, res, next) => {
  try {
    const { course_id } = req.body;
    const studentId = req.user.id;

    const courseRes = await query('SELECT id, title, price FROM courses WHERE id = $1', [course_id]);
    if (courseRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }
    const course = courseRes.rows[0];

    const orderId = `ORDER-${Date.now()}-${Math.round(Math.random() * 10000)}`;

    res.status(200).json({
      status: 'success',
      data: {
        order_id: orderId,
        course_id: course.id,
        course_title: course.title,
        amount: course.price,
        currency: 'USD',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify payment and finalize course enrollment
 * @route   POST /api/payments/verify
 * @access  Private (Student)
 */
const verifyPayment = async (req, res, next) => {
  const client = await getClient();

  try {
    const studentId = req.user.id;
    const { course_id, payment_provider = 'SkillBridge Pay', transaction_id } = req.body;

    const courseId = parseInt(course_id, 10);
    const courseRes = await client.query('SELECT * FROM courses WHERE id = $1', [courseId]);
    if (courseRes.rowCount === 0) {
      return res.status(404).json({ status: 'fail', message: 'Course not found.' });
    }
    const course = courseRes.rows[0];

    await client.query('BEGIN');

    const txnId = transaction_id || `TXN-${Date.now()}-${Math.round(Math.random() * 10000)}`;

    // 1. Insert Payment
    const paymentRes = await client.query(
      `INSERT INTO payments (student_id, course_id, amount, payment_provider, transaction_id, payment_status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       RETURNING *`,
      [studentId, courseId, course.price, payment_provider, txnId]
    );

    // 2. Insert or update Enrollment
    const enrollRes = await client.query(
      `INSERT INTO enrollments (student_id, course_id, payment_status, status)
       VALUES ($1, $2, 'completed', 'active')
       ON CONFLICT (student_id, course_id) DO UPDATE SET
         payment_status = 'completed',
         status = 'active'
       RETURNING *`,
      [studentId, courseId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Payment verified and enrollment confirmed!',
      data: {
        payment: paymentRes.rows[0],
        enrollment: enrollRes.rows[0],
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
 * @desc    Get user's payment transaction history
 * @route   GET /api/payments/history
 * @access  Private (Authenticated)
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    let historyQuery = `
      SELECT 
        p.*,
        c.title AS course_title,
        c.thumbnail AS course_thumbnail,
        u.full_name AS student_name,
        u.email AS student_email
      FROM payments p
      JOIN courses c ON c.id = p.course_id
      JOIN users u ON u.id = p.student_id
    `;
    const params = [];

    if (!isAdmin) {
      params.push(userId);
      historyQuery += ` WHERE p.student_id = $1`;
    }

    historyQuery += ` ORDER BY p.created_at DESC`;

    const historyRes = await query(historyQuery, params);

    res.status(200).json({
      status: 'success',
      data: {
        payments: historyRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
};

