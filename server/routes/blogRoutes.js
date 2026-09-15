/**
 * Blog Routes
 * Handles blog CRUD operations
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    createBlog,
    getBlogs,
    getPublicBlogs,
    getBlog,
    updateBlog,
    deleteBlog,
    getBlogStats,
    shareBlogToSocial
} = require('../controllers/blogController');
const { protect } = require('../middleware/auth');

// Validation rules
const blogValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required')
        .isLength({ min: 50 }).withMessage('Content must be at least 50 characters')
];

const blogUpdateValidation = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
    body('content')
        .optional()
        .trim()
        .isLength({ min: 50 }).withMessage('Content must be at least 50 characters')
];

// Public routes
router.get('/public', getPublicBlogs);

// Protected routes (require authentication)
router.use(protect);

router.route('/')
    .get(getBlogs)
    .post(blogValidation, createBlog);

router.get('/stats', getBlogStats);

router.post(
    '/:id/share',
    [
        body('platforms')
            .optional()
            .isArray({ min: 1 }).withMessage('platforms must be a non-empty array')
    ],
    shareBlogToSocial
);

router.route('/:id')
    .get(getBlog)
    .put(blogUpdateValidation, updateBlog)
    .delete(deleteBlog);

module.exports = router;
