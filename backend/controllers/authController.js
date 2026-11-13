const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/db');
const { validateRegisterInput, validateLoginInput, validateEmail } = require('../validators/authValidator');

// Helper to sign JWT tokens
const signToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'skillbridge_default_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * @desc    Register a new user (Student or Instructor)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  const client = await getClient();

  try {
    const {
      full_name,
      email,
      password,
      role = 'student',
      // Student specific profile data
      bio,
      education,
      interests,
      // Instructor specific profile data
      expertise,
      qualifications,
      experience,
    } = req.body;

    // 1. Validate payload
    const { isValid, errors } = validateRegisterInput({ full_name, email, password, role });
    if (!isValid) {
      return res.status(400).json({ status: 'fail', errors });
    }

    // 2. Check if email already registered
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        status: 'fail',
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Begin transaction for user and profile creation
    await client.query('BEGIN');

    const userInsertRes = await client.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, profile_image, is_active, created_at`,
      [full_name.trim(), email.toLowerCase().trim(), password_hash, role]
    );

    const newUser = userInsertRes.rows[0];

    // Create role-specific profile
    if (role === 'instructor') {
      await client.query(
        `INSERT INTO instructor_profiles (user_id, expertise, qualifications, experience, bio)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          newUser.id,
          expertise || 'General Instruction',
          qualifications || null,
          experience || null,
          bio || null,
        ]
      );
    } else {
      // Default to student profile
      await client.query(
        `INSERT INTO student_profiles (user_id, bio, education, interests)
         VALUES ($1, $2, $3, $4)`,
        [
          newUser.id,
          bio || null,
          education || null,
          interests || null,
        ]
      );
    }

    await client.query('COMMIT');

    // 5. Generate authentication token
    const token = signToken(newUser.id, newUser.role);

    res.status(201).json({
      status: 'success',
      message: 'Registration successful! Welcome to SkillBridge.',
      token,
      data: {
        user: newUser,
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
 * @desc    Authenticate user & get JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    const { isValid, errors } = validateLoginInput({ email, password });
    if (!isValid) {
      return res.status(400).json({ status: 'fail', errors });
    }

    // 2. Query user by email
    const userRes = await query(
      `SELECT id, full_name, email, password_hash, role, profile_image, is_active, created_at
       FROM users
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (userRes.rowCount === 0) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    const user = userRes.rows[0];

    // 3. Verify active status
    if (!user.is_active) {
      return res.status(403).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // 4. Verify password with bcrypt
    const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password. Please verify your credentials.',
      });
    }

    // 5. Fetch associated profile details
    let profile = null;
    if (user.role === 'instructor') {
      const pRes = await query(
        'SELECT expertise, qualifications, experience, bio FROM instructor_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = pRes.rows[0] || null;
    } else if (user.role === 'student') {
      const pRes = await query(
        'SELECT bio, education, interests FROM student_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = pRes.rows[0] || null;
    }

    // 6. Issue JWT
    const token = signToken(user.id, user.role);

    // Remove password_hash from response
    delete user.password_hash;

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      token,
      data: {
        user: {
          ...user,
          profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently logged in user info with full profile
 * @route   GET /api/auth/me
 * @access  Private (Requires JWT)
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'instructor') {
      const pRes = await query(
        'SELECT expertise, qualifications, experience, bio FROM instructor_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = pRes.rows[0] || null;
    } else if (user.role === 'student') {
      const pRes = await query(
        'SELECT bio, education, interests FROM student_profiles WHERE user_id = $1',
        [user.id]
      );
      profile = pRes.rows[0] || null;
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          ...user,
          profile,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request password reset token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'A valid email address is required',
      });
    }

    const userRes = await query('SELECT id, full_name, email FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    
    // For security reasons, don't leak whether email exists
    if (userRes.rowCount === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists for this email, you will receive password reset instructions.',
      });
    }

    const user = userRes.rows[0];

    // Generate a temporary reset token valid for 15 minutes
    const resetToken = jwt.sign(
      { id: user.id, purpose: 'password_reset' },
      process.env.JWT_SECRET || 'skillbridge_default_jwt_secret',
      { expiresIn: '15m' }
    );

    res.status(200).json({
      status: 'success',
      message: 'If an account exists for this email, you will receive password reset instructions.',
      // Return resetToken in response for development convenience
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using reset token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Valid reset token and new password (min 6 characters) are required.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'skillbridge_default_jwt_secret');
    } catch (err) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired password reset token.',
      });
    }

    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid token purpose.',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update user password
    await query(
      `UPDATE users 
       SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [password_hash, decoded.id]
    );

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
};

