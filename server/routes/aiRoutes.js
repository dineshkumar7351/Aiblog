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
    getSEOAnalysis,
    generateBlogFromVoice,
    generateCoverImage
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

const voiceValidation = [
    body('transcript')
        .trim()
        .notEmpty().withMessage('Voice transcript is required for blog generation')
];

// Routes
router.post('/suggest-title', contentValidation, getSuggestedTitles);
router.post('/improve-content', contentValidation, getImprovedContent);
router.post('/seo-check', contentValidation, getSEOAnalysis);
router.post('/voice-to-blog', voiceValidation, generateBlogFromVoice);
router.post('/generate-cover-image', generateCoverImage);

module.exports = router;
