/**
 * AI Routes
 * Handles AI-powered features for blog assistance
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getSuggestedTitles,
    getImprovedContent,
    getSEOAnalysis
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All AI routes require authentication
router.use(protect);

// Validation rules
const contentValidation = [
    body('content')
        .trim()
        .notEmpty().withMessage('Content is required for AI analysis')
];

// Routes
router.post('/suggest-title', contentValidation, getSuggestedTitles);
router.post('/improve-content', contentValidation, getImprovedContent);
router.post('/seo-check', contentValidation, getSEOAnalysis);

module.exports = router;
