/**
 * AI Controller
 * Handles AI-powered features for blog assistance
 * 
 * IMPORTANT: AI is ASSISTIVE ONLY
 * - No auto-publish
 * - No auto-save
 * - User always controls final content
 */

const { 
    suggestTitles, 
    improveContent, 
    checkSEO, 
    generateBlogFromVoice,
    generateCoverImage,
    generateBlogFromImage
} = require('../services/groqService');
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

/**
 * @desc    Generate full blog post from voice transcript
 * @route   POST /api/ai/voice-to-blog
 * @access  Private
 */
const generateBlogFromVoiceController = async (req, res, next) => {
    try {
        const { transcript, tone, language, length } = req.body;

        if (!transcript || transcript.trim().length < 15) {
            return res.status(400).json({
                success: false,
                message: 'Please speak or provide at least a few words (15+ characters) for AI generation.'
            });
        }

        const blogData = await generateBlogFromVoice(transcript, {
            tone,
            language,
            length
        });

        res.status(200).json({
            success: true,
            message: 'Blog generated successfully from your voice recording!',
            data: blogData
        });
    } catch (error) {
        console.error('AI Voice to Blog Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate blog from voice'
        });
    }
};

/**
 * @desc    Generate AI cover image based on blog title/content
 * @route   POST /api/ai/generate-cover-image
 * @access  Private
 */
const generateCoverImageController = async (req, res, next) => {
    try {
        const { title, content } = req.body;

        if (!title && !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title or content for cover image generation.'
            });
        }

        const imageData = await generateCoverImage(title || 'Technology Blog', content || '');

        res.status(200).json({
            success: true,
            message: 'Cover image generated successfully!',
            data: imageData
        });
    } catch (error) {
        console.error('AI Cover Image Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate cover image'
        });
    }
};

/**
 * @desc    Generate full blog post from uploaded image (screenshot, certificate, code, etc.)
 * @route   POST /api/ai/image-to-content
 * @access  Private
 */
const generateBlogFromImageController = async (req, res, next) => {
    try {
        const { image, userPrompt, tone } = req.body;

        if (!image && !userPrompt) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image or description for AI content generation.'
            });
        }

        const blogData = await generateBlogFromImage(image, userPrompt || '', tone || 'engaging');

        res.status(200).json({
            success: true,
            message: 'Blog generated successfully from your image!',
            data: {
                ...blogData,
                coverImage: image || null
            }
        });
    } catch (error) {
        console.error('AI Image to Content Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate content from image'
        });
    }
};

module.exports = {
    getSuggestedTitles,
    getImprovedContent,
    getSEOAnalysis,
    generateBlogFromVoice: generateBlogFromVoiceController,
    generateCoverImage: generateCoverImageController,
    generateBlogFromImage: generateBlogFromImageController
};
