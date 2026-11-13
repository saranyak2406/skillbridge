const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

/**
 * Middleware to protect routes and verify JWT authentication token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'You are not logged in. Please provide a valid authentication token.',
    });
  }

  try {
    // 1. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillbridge_default_jwt_secret');

    // 2. Check if user still exists in database
    const userRes = await query(
      `SELECT id, full_name, email, role, profile_image, is_active, created_at
       FROM users
       WHERE id = $1`,
      [decoded.id]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    const currentUser = userRes.rows[0];

    // 3. Check if user is active
    if (!currentUser.is_active) {
      return res.status(403).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact platform support.',
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid authentication token. Authorization denied.',
    });
  }
};

/**
 * Middleware for Role-Based Access Control (RBAC)
 * @param  {...string} roles - e.g. 'admin', 'instructor', 'student'
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: `Forbidden: You do not have permission to perform this action. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};

