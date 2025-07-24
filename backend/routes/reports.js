const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReport,
  getReportStats
} = require('../controllers/reportController');

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// @route   POST /api/reports
// @desc    Create a new report
// @access  Private
router.post('/',
  auth,
  [
    body('type')
      .isIn(['article', 'comment', 'user', 'general'])
      .withMessage('Type must be article, comment, user, or general'),
    body('reason')
      .isIn(['spam', 'harassment', 'inappropriate_content', 'copyright_violation', 'misinformation', 'hate_speech', 'other'])
      .withMessage('Invalid reason'),
    body('reportedItemId')
      .optional()
      .custom((value, { req }) => {
        // reportedItemId is required for all types except 'general'
        if (req.body.type !== 'general') {
          if (!value) {
            throw new Error('Reported item ID is required for this report type');
          }
          if (!value.match(/^[0-9a-fA-F]{24}$/)) {
            throw new Error('Invalid reported item ID');
          }
        }
        return true;
      }),
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters')
  ],
  createReport
);

// @route   GET /api/reports
// @desc    Get all reports (admin only)
// @access  Private (Admin)
router.get('/', auth, adminAuth, getAllReports);

// @route   PUT /api/reports/:id
// @desc    Update report status (admin only)
// @access  Private (Admin)
router.put('/:id', 
  auth, 
  adminAuth,
  [
    body('status')
      .isIn(['pending', 'reviewed', 'resolved', 'dismissed'])
      .withMessage('Invalid status'),
    body('adminNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Admin notes must be less than 1000 characters')
  ],
  updateReportStatus
);

// @route   DELETE /api/reports/:id
// @desc    Delete a report (admin only)
// @access  Private (Admin)
router.delete('/:id', auth, adminAuth, deleteReport);

// @route   GET /api/reports/stats
// @desc    Get report statistics (admin only)
// @access  Private (Admin)
router.get('/stats', auth, adminAuth, getReportStats);

module.exports = router;