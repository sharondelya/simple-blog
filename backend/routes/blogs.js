const express = require('express');
const {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleLike,
  getUserBlogs
} = require('../controllers/blogController');
const { validateBlog } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs
// @access  Public
router.get('/', getAllBlogs);

// @route   GET /api/blogs/my-blogs
// @desc    Get current user's blogs
// @access  Private
router.get('/my-blogs', auth, getUserBlogs);

// @route   GET /api/blogs/edit/:id
// @desc    Get single blog by ID for editing
// @access  Private
router.get('/edit/:id', auth, getBlog);

// @route   GET /api/blogs/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/:slug', getBlog);

// @route   POST /api/blogs
// @desc    Create new blog
// @access  Private
router.post('/', auth, validateBlog, createBlog);

// @route   PUT /api/blogs/:id
// @desc    Update blog
// @access  Private
router.put('/:id', auth, validateBlog, updateBlog);

// @route   DELETE /api/blogs/:id
// @desc    Delete blog
// @access  Private
router.delete('/:id', auth, deleteBlog);

// @route   POST /api/blogs/:id/like
// @desc    Toggle like on blog
// @access  Private
router.post('/:id/like', auth, toggleLike);

module.exports = router;