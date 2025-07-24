const User = require('../models/User');
const Blog = require('../models/Blog');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const { validationResult } = require('express-validator');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    const filter = {};
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's blogs
    await Blog.deleteMany({ author: userId });
    
    // Delete user's comments
    await Comment.deleteMany({ author: userId });
    
    // Delete reports by this user
    await Report.deleteMany({ reporter: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: 'User and associated content deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const { role } = req.body;

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error while updating user role' });
  }
};

// Get all blogs for admin management
const getAllBlogsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const status = req.query.status;

    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      filter.published = status === 'published';
    }

    const blogs = await Blog.find(filter)
      .populate('author', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments(filter);

    res.json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    console.error('Get blogs admin error:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
};

// Delete blog (admin only)
const deleteBlogAdmin = async (req, res) => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Delete all comments on this blog
    await Comment.deleteMany({ blog: blogId });
    
    // Delete reports related to this blog
    await Report.deleteMany({ reportedItem: blogId, type: 'blog' });
    
    // Delete the blog
    await Blog.findByIdAndDelete(blogId);

    res.json({ message: 'Blog and associated content deleted successfully' });
  } catch (error) {
    console.error('Delete blog admin error:', error);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
};

// Get all comments for admin management
const getAllCommentsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const blogId = req.query.blogId;

    const filter = {};
    if (search) {
      filter.content = { $regex: search, $options: 'i' };
    }
    if (blogId) {
      filter.blog = blogId;
    }

    const comments = await Comment.find(filter)
      .populate('author', 'username email avatar')
      .populate('blog', 'title slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(filter);

    res.json({
      comments,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalComments: total
    });
  } catch (error) {
    console.error('Get comments admin error:', error);
    res.status(500).json({ message: 'Server error while fetching comments' });
  }
};

// Delete comment (admin only)
const deleteCommentAdmin = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Delete all replies to this comment
    await Comment.deleteMany({ parentComment: commentId });
    
    // Delete reports related to this comment
    await Report.deleteMany({ reportedItem: commentId, type: 'comment' });
    
    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    res.json({ message: 'Comment and replies deleted successfully' });
  } catch (error) {
    console.error('Delete comment admin error:', error);
    res.status(500).json({ message: 'Server error while deleting comment' });
  }
};

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Get counts with error handling for each
    const [totalUsers, totalBlogs, totalComments, totalReports, pendingReports] = await Promise.all([
      User.countDocuments().catch(err => {
        console.error('Error counting users:', err);
        return 0;
      }),
      Blog.countDocuments().catch(err => {
        console.error('Error counting blogs:', err);
        return 0;
      }),
      Comment.countDocuments().catch(err => {
        console.error('Error counting comments:', err);
        return 0;
      }),
      Report.countDocuments().catch(err => {
        console.error('Error counting reports:', err);
        return 0;
      }),
      Report.countDocuments({ status: 'pending' }).catch(err => {
        console.error('Error counting pending reports:', err);
        return 0;
      })
    ]);

    console.log('Stats:', { totalUsers, totalBlogs, totalComments, totalReports, pendingReports });

    // Recent activity with error handling
    const [recentUsers, recentBlogs, recentReports] = await Promise.all([
      User.find()
        .select('username email createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .catch(err => {
          console.error('Error fetching recent users:', err);
          return [];
        }),
      Blog.find()
        .populate('author', 'username')
        .select('title author createdAt published')
        .sort({ createdAt: -1 })
        .limit(5)
        .catch(err => {
          console.error('Error fetching recent blogs:', err);
          return [];
        }),
      Report.find()
        .populate('reporter', 'username')
        .select('type reason status reporter createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .catch(err => {
          console.error('Error fetching recent reports:', err);
          return [];
        })
    ]);

    console.log('Recent activity:', {
      users: recentUsers?.length || 0,
      blogs: recentBlogs?.length || 0,
      reports: recentReports?.length || 0
    });

    const response = {
      stats: {
        totalUsers,
        totalBlogs,
        totalComments,
        totalReports,
        pendingReports
      },
      recentActivity: {
        users: recentUsers || [],
        blogs: recentBlogs || [],
        reports: recentReports || []
      }
    };

    console.log('Sending dashboard response:', response);
    res.json(response);
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching dashboard statistics',
      error: error.message 
    });
  }
};

// Get all reports for admin management
const getAllReportsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const type = req.query.type;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    console.log('Fetching reports with filter:', filter);

    const reports = await Report.find(filter)
      .populate('reporter', 'username email avatar')
      .populate({
        path: 'reportedItem',
        refPath: 'reportedItemModel'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${reports.length} reports`);

    // Manually populate additional data and create display information
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const reportObj = report.toObject();
        
        // Handle different report types
        if (report.type === 'general') {
          // General complaints don't have a specific reported item
          reportObj.displayTitle = 'General Complaint';
          reportObj.displayAuthor = 'N/A';
          reportObj.displayContent = report.description || 'No description provided';
        } else if (report.type === 'comment' && report.reportedItem) {
          try {
            // Manually populate comment with author and blog info
            const comment = await Comment.findById(report.reportedItem._id)
              .populate('blog', 'title slug')
              .populate('author', 'username');
            
            if (comment) {
              reportObj.reportedItem.author = comment.author;
              if (comment.blog) {
                reportObj.reportedItem.blog = comment.blog;
              }
              reportObj.displayTitle = comment.blog ? `Comment on "${comment.blog.title}"` : 'Comment';
              reportObj.displayAuthor = comment.author?.username || 'Unknown Author';
              reportObj.displayContent = comment.content?.substring(0, 100) + '...' || '';
            } else {
              reportObj.displayTitle = 'Comment (Deleted)';
              reportObj.displayAuthor = 'Unknown';
              reportObj.displayContent = 'Comment may have been deleted';
            }
          } catch (err) {
            console.error('Error populating comment:', err);
            reportObj.displayTitle = 'Comment (Error)';
            reportObj.displayAuthor = 'Unknown';
            reportObj.displayContent = 'Error loading comment data';
          }
        } else if (report.type === 'article' && report.reportedItem) {
          try {
            // Manually populate blog with author info
            const blog = await Blog.findById(report.reportedItem._id)
              .populate('author', 'username');
            
            if (blog) {
              reportObj.reportedItem.author = blog.author;
              reportObj.displayTitle = blog.title || 'Unknown Blog';
              reportObj.displayAuthor = blog.author?.username || 'Unknown Author';
              reportObj.displayContent = blog.excerpt || blog.content?.substring(0, 100) + '...' || '';
            } else {
              reportObj.displayTitle = 'Blog Post (Deleted)';
              reportObj.displayAuthor = 'Unknown';
              reportObj.displayContent = 'Blog post may have been deleted';
            }
          } catch (err) {
            console.error('Error populating blog:', err);
            reportObj.displayTitle = 'Blog Post (Error)';
            reportObj.displayAuthor = 'Unknown';
            reportObj.displayContent = 'Error loading blog data';
          }
        } else if (report.type === 'user' && report.reportedItem) {
          try {
            const user = await User.findById(report.reportedItem._id);
            if (user) {
              reportObj.displayTitle = 'User Profile';
              reportObj.displayAuthor = user.username || 'Unknown User';
              reportObj.displayContent = user.bio || 'No bio available';
            } else {
              reportObj.displayTitle = 'User Profile (Deleted)';
              reportObj.displayAuthor = 'Unknown';
              reportObj.displayContent = 'User may have been deleted';
            }
          } catch (err) {
            console.error('Error populating user:', err);
            reportObj.displayTitle = 'User Profile (Error)';
            reportObj.displayAuthor = 'Unknown';
            reportObj.displayContent = 'Error loading user data';
          }
        } else {
          reportObj.displayTitle = 'Unknown Item';
          reportObj.displayAuthor = 'Unknown';
          reportObj.displayContent = 'Item may have been deleted';
        }
        
        return reportObj;
      })
    );

    const total = await Report.countDocuments(filter);

    res.json({
      reports: populatedReports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total
    });
  } catch (error) {
    console.error('Get reports admin error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching reports',
      error: error.message 
    });
  }
};

// Update report status (admin only)
const updateReportStatusAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reportId = req.params.id;
    const { status } = req.body;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    if (status === 'resolved') {
      report.resolvedAt = new Date();
    }
    await report.save();

    await report.populate('reporter', 'username email');

    res.json({
      message: 'Report status updated successfully',
      report
    });
  } catch (error) {
    console.error('Update report status admin error:', error);
    res.status(500).json({ message: 'Server error while updating report status' });
  }
};

// Delete report (admin only)
const deleteReportAdmin = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.findByIdAndDelete(reportId);

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report admin error:', error);
    res.status(500).json({ message: 'Server error while deleting report' });
  }
};

module.exports = {
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
};