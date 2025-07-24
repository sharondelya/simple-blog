const express = require('express');
const {
  getBlogComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike
} = require('../controllers/commentController');
const { validateComment } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/comments/blog/:blogId
// @desc    Get comments for a blog
// @access  Public
router.get('/blog/:blogId', getBlogComments);

// @route   POST /api/comments/blog/:blogId
// @desc    Create comment for a blog
// @access  Private
router.post('/blog/:blogId', auth, validateComment, createComment);

// @route   PUT /api/comments/:id
// @desc    Update comment
// @access  Private
router.put('/:id', auth, validateComment, updateComment);

// @route   DELETE /api/comments/:id
// @desc    Delete comment
// @access  Private
router.delete('/:id', auth, deleteComment);

// @route   POST /api/comments/:id/like
// @desc    Toggle like on comment
// @access  Private
router.post('/:id/like', auth, toggleCommentLike);

module.exports = router;