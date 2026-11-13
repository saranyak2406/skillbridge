const { query, getClient } = require('../config/db');

/**
 * @desc    Get all users (Admin only) with pagination and filters
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { role, search, is_active } = req.query;

    let baseQuery = `
      SELECT id, full_name, email, role, profile_image, is_active, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role) {
      params.push(role);
      baseQuery += ` AND role = $${params.length}`;
    }

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      baseQuery += ` AND is_active = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      baseQuery += ` AND (LOWER(full_name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length})`;
    }

    // Count total matching
    const countRes = await query(
      baseQuery.replace(
        'SELECT id, full_name, email, role, profile_image, is_active, created_at, updated_at',
        'SELECT COUNT(*) AS total'
      ),
      params
    );
    const totalUsers = parseInt(countRes.rows[0].total, 10);

    // Apply pagination and sorting
    params.push(limit);
    baseQuery += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    params.push(offset);
    baseQuery += ` OFFSET $${params.length}`;

    const usersRes = await query(baseQuery, params);

    res.status(200).json({
      status: 'success',
      total: totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      data: {
        users: usersRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private (Self or Admin)
 */
const getUserById = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id, 10);

    // Ensure only the user themselves or an Admin can access detailed user profile
    if (req.user.role !== 'admin' && req.user.id !== targetId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to view another user’s account details.',
      });
    }

    const userRes = await query(
      `SELECT id, full_name, email, role, profile_image, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [targetId]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.',
      });
    }

    const user = userRes.rows[0];

    // Fetch related profile details
    let profile = null;
    if (user.role === 'instructor') {
      const pRes = await query(
        'SELECT expertise, qualifications, experience, bio FROM instructor_profiles WHERE user_id = $1',
        [targetId]
      );
      profile = pRes.rows[0] || null;
    } else if (user.role === 'student') {
      const pRes = await query(
        'SELECT bio, education, interests FROM student_profiles WHERE user_id = $1',
        [targetId]
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
 * @desc    Update user profile
 * @route   PUT /api/users/:id
 * @access  Private (Self or Admin)
 */
const updateUser = async (req, res, next) => {
  const client = await getClient();

  try {
    const targetId = parseInt(req.params.id, 10);

    if (req.user.role !== 'admin' && req.user.id !== targetId) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to update another user’s profile.',
      });
    }

    const {
      full_name,
      profile_image,
      is_active,
      // Student details
      bio,
      education,
      interests,
      // Instructor details
      expertise,
      qualifications,
      experience,
    } = req.body;

    await client.query('BEGIN');

    // 1. Check existing user
    const existingRes = await client.query('SELECT role FROM users WHERE id = $1', [targetId]);
    if (existingRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }
    const userRole = existingRes.rows[0].role;

    // 2. Build user update query
    let userUpdateFields = [];
    let userParams = [];

    if (full_name) {
      userParams.push(full_name.trim());
      userUpdateFields.push(`full_name = $${userParams.length}`);
    }

    if (profile_image !== undefined) {
      userParams.push(profile_image);
      userUpdateFields.push(`profile_image = $${userParams.length}`);
    }

    // Only Admin can update active status
    if (is_active !== undefined && req.user.role === 'admin') {
      userParams.push(is_active);
      userUpdateFields.push(`is_active = $${userParams.length}`);
    }

    userUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    userParams.push(targetId);

    const updatedUserRes = await client.query(
      `UPDATE users 
       SET ${userUpdateFields.join(', ')} 
       WHERE id = $${userParams.length}
       RETURNING id, full_name, email, role, profile_image, is_active, created_at, updated_at`,
      userParams
    );

    // 3. Update corresponding profile
    if (userRole === 'instructor') {
      await client.query(
        `INSERT INTO instructor_profiles (user_id, expertise, qualifications, experience, bio)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id) DO UPDATE SET
           expertise = COALESCE($2, instructor_profiles.expertise),
           qualifications = COALESCE($3, instructor_profiles.qualifications),
           experience = COALESCE($4, instructor_profiles.experience),
           bio = COALESCE($5, instructor_profiles.bio)`,
        [targetId, expertise, qualifications, experience, bio]
      );
    } else if (userRole === 'student') {
      await client.query(
        `INSERT INTO student_profiles (user_id, bio, education, interests)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id) DO UPDATE SET
           bio = COALESCE($2, student_profiles.bio),
           education = COALESCE($3, student_profiles.education),
           interests = COALESCE($4, student_profiles.interests)`,
        [targetId, bio, education, interests]
      );
    }

    await client.query('COMMIT');

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully.',
      data: {
        user: updatedUserRes.rows[0],
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
 * @desc    Delete a user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const targetId = parseInt(req.params.id, 10);

    // Prevent Admin from deleting themselves
    if (req.user.id === targetId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Administrators cannot delete their own active account.',
      });
    }

    const deleteRes = await query('DELETE FROM users WHERE id = $1 RETURNING id', [targetId]);

    if (deleteRes.rowCount === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User has been permanently deleted from the platform.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
