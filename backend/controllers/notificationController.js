const { query } = require('../config/db');

/**
 * @desc    Get current user's notifications & unread count
 * @route   GET /api/notifications
 * @access  Private (Authenticated)
 */
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const notifsRes = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );

    const unreadCountRes = await query(
      `SELECT COUNT(id) AS unread_count 
       FROM notifications 
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        notifications: notifsRes.rows,
        unread_count: parseInt(unreadCountRes.rows[0].unread_count, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark single notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (Authenticated)
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    res.status(200).json({ status: 'success', message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark all user notifications as read
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private (Authenticated)
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await query(
      `UPDATE notifications 
       SET is_read = true 
       WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json({ status: 'success', message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
