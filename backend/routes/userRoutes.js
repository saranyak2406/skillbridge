const express = require('express');
const router = express.Router();
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// User profile routes
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);

// Admin-only user management routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.post('/', protect, authorize('admin'), createUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;

