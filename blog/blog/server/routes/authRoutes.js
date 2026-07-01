/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
<<<<<<< HEAD
const { register, login, getMe, updateMe } = require('../controllers/authController');
=======
const { register, login, getMe } = require('../controllers/authController');
>>>>>>> 5bf6ab570f0a17d0204b2dda4629df6c3cb3b4c2
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
<<<<<<< HEAD
router.put('/me', protect, updateMe);
=======
>>>>>>> 5bf6ab570f0a17d0204b2dda4629df6c3cb3b4c2

module.exports = router;
