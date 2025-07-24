const express = require('express');
const { register, login, getCurrentUser, updateProfile, getUserProfile, upload } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', upload.single('avatar'), validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('avatar'), updateProfile);

// @route   GET /api/auth/user/:id
// @desc    Get user profile by ID
// @access  Public
router.get('/user/:id', getUserProfile);

module.exports = router;