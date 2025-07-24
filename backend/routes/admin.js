const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllBlogsAdmin,
  deleteBlogAdmin,
  getAllCommentsAdmin,
  deleteCommentAdmin,
  getDashboardStats,
  getAllReportsAdmin,
  updateReportStatusAdmin,
  deleteReportAdmin
} = require('../controllers/adminController');

// Admin middleware with better error handling
const adminAuth = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error in admin authentication' });
  }
};

// Validation middleware
const validateUserRole = [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Role must be user or admin')
];

const validateReportStatus = [
  body('status')
    .isIn(['pending', 'resolved', 'dismissed'])
    .withMessage('Status must be pending, resolved, or dismissed')
];

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', auth, adminAuth, getDashboardStats);

// User Management Routes
// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, adminAuth, getAllUsers);

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Private (Admin)
router.delete('/users/:id', auth, adminAuth, deleteUser);

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin)
router.put('/users/:id/role', auth, adminAuth, validateUserRole, updateUserRole);

// Blog Management Routes
// @route   GET /api/admin/blogs
// @desc    Get all blogs for admin management
// @access  Private (Admin)
router.get('/blogs', auth, adminAuth, getAllBlogsAdmin);

// @route   DELETE /api/admin/blogs/:id
// @desc    Delete a blog
// @access  Private (Admin)
router.delete('/blogs/:id', auth, adminAuth, deleteBlogAdmin);

// Comment Management Routes
// @route   GET /api/admin/comments
// @desc    Get all comments for admin management
// @access  Private (Admin)
router.get('/comments', auth, adminAuth, getAllCommentsAdmin);

// @route   DELETE /api/admin/comments/:id
// @desc    Delete a comment
// @access  Private (Admin)
router.delete('/comments/:id', auth, adminAuth, deleteCommentAdmin);

// Report Management Routes
// @route   GET /api/admin/reports
// @desc    Get all reports for admin management
// @access  Private (Admin)
router.get('/reports', auth, adminAuth, getAllReportsAdmin);

// @route   PUT /api/admin/reports/:id/status
// @desc    Update report status
// @access  Private (Admin)
router.put('/reports/:id/status', auth, adminAuth, validateReportStatus, updateReportStatusAdmin);

// @route   DELETE /api/admin/reports/:id
// @desc    Delete a report
// @access  Private (Admin)
router.delete('/reports/:id', auth, adminAuth, deleteReportAdmin);

module.exports = router;