/**
 * Blog Controller
 * Handles CRUD operations for blog posts
 */

const Blog = require('../models/Blog');
const { validationResult } = require('express-validator');
const { postToLinkedIn, postToInstagram } = require('../services/socialService');

const buildDefaultBlogUrl = (blogId) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return `${clientUrl}/blog/${blogId}`;
};

const tryAutoLinkedInPost = async ({ blog, userId }) => {
    const blogUrl = buildDefaultBlogUrl(blog._id.toString());

    try {
        await postToLinkedIn({
            blog,
            authorName: blog.author?.name,
            blogUrl,
            userId
        });

        return {
            attempted: true,
            success: true,
            message: 'Blog posted to LinkedIn successfully',
            reauthRequired: false
        };
    } catch (error) {
        return {
            attempted: true,
            success: false,
            message: error.message || 'LinkedIn auto-post failed',
            reauthRequired: Boolean(error.reauthRequired),
            code: error.code || 'LINKEDIN_POST_FAILED'
        };
    }
};

/**
 * @desc    Create a new blog post
 * @route   POST /api/blogs
 * @access  Private
 */
const createBlog = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { title, content, tags, status } = req.body;

        const blog = await Blog.create({
            title,
            content,
            tags: tags || [],
            status: status || 'draft',
            author: req.user._id
        });

        await blog.populate('author', 'name email');

        let socialPosting = {
            attempted: false,
            success: false,
            message: null,
            reauthRequired: false
        };

        if (blog.status === 'published') {
            socialPosting = await tryAutoLinkedInPost({
                blog,
                userId: req.user._id.toString()
            });
        }

        res.status(201).json({
            success: true,
            message: 'Blog created successfully!',
            data: {
                blog,
                socialPosting
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all blogs (with pagination)
 * @route   GET /api/blogs
 * @access  Private
 */
const getBlogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Filter by author (current user)
        const filter = { author: req.user._id };

        // Optional status filter
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const [blogs, total] = await Promise.all([
            Blog.find(filter)
                .populate('author', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Blog.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                blogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all published blogs (public)
 * @route   GET /api/blogs/public
 * @access  Public
 */
const getPublicBlogs = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = { status: 'published' };

        const [blogs, total] = await Promise.all([
            Blog.find(filter)
                .populate('author', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-__v'),
            Blog.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: {
                blogs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single blog by ID
 * @route   GET /api/blogs/:id
 * @access  Private
 */
const getBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name email');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check if user is the author (for drafts) or if it's published
        if (blog.status === 'draft' && blog.author._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view this blog'
            });
        }

        res.status(200).json({
            success: true,
            data: { blog }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update blog
 * @route   PUT /api/blogs/:id
 * @access  Private (Author only)
 */
const updateBlog = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check ownership
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own blogs'
            });
        }

        const { title, content, tags, status, seoScore } = req.body;
        const wasPublished = blog.status === 'published';

        blog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                title: title || blog.title,
                content: content || blog.content,
                tags: tags !== undefined ? tags : blog.tags,
                status: status || blog.status,
                seoScore: seoScore !== undefined ? seoScore : blog.seoScore
            },
            { new: true, runValidators: true }
        ).populate('author', 'name email');

        let socialPosting = {
            attempted: false,
            success: false,
            message: null,
            reauthRequired: false
        };

        if (!wasPublished && blog.status === 'published') {
            socialPosting = await tryAutoLinkedInPost({
                blog,
                userId: req.user._id.toString()
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog updated successfully!',
            data: {
                blog,
                socialPosting
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete blog
 * @route   DELETE /api/blogs/:id
 * @access  Private (Author only)
 */
const deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check ownership
        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own blogs'
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully!'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get user's blog statistics
 * @route   GET /api/blogs/stats
 * @access  Private
 */
const getBlogStats = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const [totalBlogs, publishedBlogs, draftBlogs, avgSeoScore] = await Promise.all([
            Blog.countDocuments({ author: userId }),
            Blog.countDocuments({ author: userId, status: 'published' }),
            Blog.countDocuments({ author: userId, status: 'draft' }),
            Blog.aggregate([
                { $match: { author: userId, seoScore: { $ne: null } } },
                { $group: { _id: null, avgScore: { $avg: '$seoScore' } } }
            ])
        ]);

        // Get recent blogs
        const recentBlogs = await Blog.find({ author: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title status seoScore createdAt');

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalBlogs,
                    publishedBlogs,
                    draftBlogs,
                    avgSeoScore: avgSeoScore[0]?.avgScore ? Math.round(avgSeoScore[0].avgScore) : null
                },
                recentBlogs
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Share blog to LinkedIn and/or Instagram
 * @route   POST /api/blogs/:id/share
 * @access  Private (Author only)
 */
const shareBlogToSocial = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const blog = await Blog.findById(req.params.id).populate('author', 'name email');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        if (blog.author._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only share your own blogs'
            });
        }

        if (blog.status !== 'published') {
            return res.status(400).json({
                success: false,
                message: 'Only published blogs can be shared to social platforms'
            });
        }

        const requestedPlatforms = Array.isArray(req.body.platforms) ? req.body.platforms : ['linkedin', 'instagram'];
        const normalizedPlatforms = [...new Set(requestedPlatforms.map((item) => String(item).toLowerCase()))]
            .filter((item) => ['linkedin', 'instagram'].includes(item));

        if (normalizedPlatforms.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one valid platform: linkedin or instagram'
            });
        }

        const socialPayload = {
            blog,
            authorName: blog.author?.name,
            blogUrl: req.body.blogUrl,
            imageUrl: req.body.imageUrl,
            userId: req.user._id.toString()
        };

        const results = [];

        for (const platform of normalizedPlatforms) {
            try {
                console.log(`\n=== Sharing to ${platform.toUpperCase()} ===`);
                
                if (platform === 'linkedin') {
                    const response = await postToLinkedIn(socialPayload);
                    results.push(response);
                    console.log(`✓ ${platform} share successful`);
                    continue;
                }

                if (platform === 'instagram') {
                    const response = await postToInstagram(socialPayload);
                    results.push(response);
                    console.log(`✓ ${platform} share successful`);
                }
            } catch (error) {
                console.error(`✗ ${platform} share failed:`, error.message);
                console.error(`Full error:`, error);
                
                results.push({
                    platform,
                    success: false,
                    error: error.message,
                    code: error.code || 'SOCIAL_POST_FAILED',
                    reauthRequired: Boolean(error.reauthRequired)
                });
            }
        }

        const successful = results.filter((item) => item.success);
        const failed = results.filter((item) => !item.success);

        res.status(successful.length > 0 ? 200 : 400).json({
            success: successful.length > 0,
            message: failed.length === 0
                ? 'Blog shared successfully'
                : successful.length === 0
                    ? 'Failed to share blog to selected platforms'
                    : 'Blog shared partially. Some platforms failed.',
            data: {
                results
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createBlog,
    getBlogs,
    getPublicBlogs,
    getBlog,
    updateBlog,
    deleteBlog,
    getBlogStats,
    shareBlogToSocial
};
