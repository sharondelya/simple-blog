const Report = require('../models/Report');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Create a report
const createReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, reason, description, reportedItemId } = req.body;

    // Prevent admin users from submitting reports
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admin users cannot submit reports or complaints' });
    }

    let reportedItem = null;
    let reportData = {
      type,
      reason,
      description,
      reporter: req.user._id
    };

    // Handle different report types
    if (type === 'general') {
      // General complaints don't need a specific reported item
      // No additional validation needed for general complaints
    } else {
      // Verify the reported item exists for specific item reports
      switch (type) {
        case 'article':
          reportedItem = await Blog.findById(reportedItemId);
          break;
        case 'comment':
          reportedItem = await Comment.findById(reportedItemId);
          break;
        case 'user':
          reportedItem = await User.findById(reportedItemId);
          break;
        default:
          return res.status(400).json({ message: 'Invalid report type' });
      }

      if (!reportedItem) {
        return res.status(404).json({ message: 'Reported item not found' });
      }

      // Prevent users from reporting their own content
      if (type === 'article' && reportedItem.author.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot report your own article' });
      }
      
      if (type === 'comment' && reportedItem.author.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot report your own comment' });
      }
      
      if (type === 'user' && reportedItemId === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot report yourself' });
      }

      // Check if user has already reported this item
      const existingReport = await Report.findOne({
        reporter: req.user._id,
        reportedItem: reportedItemId,
        type: type
      });

      if (existingReport) {
        return res.status(400).json({ message: 'You have already reported this item' });
      }

      // Map type to model name
      const modelMap = {
        'article': 'Blog',
        'comment': 'Comment',
        'user': 'User'
      };

      // Add reported item data
      reportData.reportedItem = reportedItemId;
      reportData.reportedItemModel = modelMap[type];
    }

    const report = new Report(reportData);

    await report.save();

    res.status(201).json({
      message: 'Report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error while creating report' });
  }
};

// Get all reports (admin only)
const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const reports = await Report.find(filter)
      .populate('reporter', 'username email')
      .populate({
        path: 'reportedItem',
        select: 'title content username email', // Different fields based on type
      })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

// Update report status (admin only)
const updateReportStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();

    await report.save();
    await report.populate('reporter', 'username email');
    await report.populate('reviewedBy', 'username');

    res.json({
      message: 'Report status updated successfully',
      report
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error while updating report' });
  }
};

// Delete report (admin only)
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error while deleting report' });
  }
};

// Get report statistics (admin only)
const getReportStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Report.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const reasonStats = await Report.aggregate([
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      statusStats: stats,
      typeStats,
      reasonStats
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({ message: 'Server error while fetching report statistics' });
  }
};

module.exports = {
  createReport,
  getAllReports,
  updateReportStatus,
  deleteReport,
  getReportStats
};