/**
 * AI Controller
 * Handles AI-powered features for blog assistance
 * 
 * IMPORTANT: AI is ASSISTIVE ONLY
 * - No auto-publish
 * - No auto-save
 * - User always controls final content
 */

const { suggestTitles, improveContent, checkSEO } = require('../services/groqService');
const { validationResult } = require('express-validator');

/**
 * @desc    Get AI-generated title suggestions
 * @route   POST /api/ai/suggest-title
 * @access  Private
 */
const getSuggestedTitles = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { content } = req.body;

        if (!content || content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least 50 characters of content for title suggestions'
            });
        }

        const titles = await suggestTitles(content);

        res.status(200).json({
            success: true,
            message: 'Title suggestions generated successfully',
            data: {
                titles,
                note: 'These are AI suggestions. Please review and choose or modify as needed.'
            }
        });
    } catch (error) {
        console.error('AI Suggest Title Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate title suggestions'
        });
    }
};

/**
 * @desc    Get AI-improved content
 * @route   POST /api/ai/improve-content
 * @access  Private
 */
const getImprovedContent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { content } = req.body;

        if (!content || content.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least 20 characters of content to improve'
            });
        }

        const improvedContent = await improveContent(content);

        res.status(200).json({
            success: true,
            message: 'Content improved successfully',
            data: {
                originalContent: content,
                improvedContent,
                note: 'This is an AI suggestion. The meaning has been preserved. Please review before accepting.'
            }
        });
    } catch (error) {
        console.error('AI Improve Content Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to improve content'
        });
    }
};

/**
 * @desc    Get SEO analysis for content
 * @route   POST /api/ai/seo-check
 * @access  Private
 */
const getSEOAnalysis = async (req, res, next) => {
    try {
        const { content, title } = req.body;

        if (!content || content.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least 20 characters of content for SEO analysis'
            });
        }

        const analysis = await checkSEO(content, title);

        res.status(200).json({
            success: true,
            message: 'SEO analysis completed',
            data: {
                ...analysis,
                note: 'This is an AI-powered analysis. Use these suggestions to improve your content.'
            }
        });
    } catch (error) {
        console.error('AI SEO Check Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to analyze SEO'
        });
    }
};

module.exports = {
    getSuggestedTitles,
    getImprovedContent,
    getSEOAnalysis
};
