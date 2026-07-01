/**
 * Authentication Controller
 * Handles user registration and login
 */

const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { validationResult } = require('express-validator');

const DEFAULT_SETTINGS = {
    notifications: {
        emailNotifications: true,
        pushNotifications: false,
        blogUpdates: true,
        weeklyDigest: true,
        marketingEmails: false
    },
    privacy: {
        profilePublic: true,
        showEmail: false,
        allowMessages: true,
        indexInSearch: true
    },
    security: {
        twoFactorEnabled: false,
        loginAlerts: true,
        suspiciousActivityAlerts: true,
        deviceTrusted: false
    }
};

const serializeUser = (user) => ({
    id: user._id,
    clerkId: user.clerkId,
    name: user.name,
    email: user.email,
    image: user.image,
    bio: user.bio || '',
    phone: user.phone || '',
    location: user.location || '',
    website: user.website || '',
    settings: {
        ...DEFAULT_SETTINGS,
        ...(user.settings || {}),
        notifications: {
            ...DEFAULT_SETTINGS.notifications,
            ...((user.settings || {}).notifications || {})
        },
        privacy: {
            ...DEFAULT_SETTINGS.privacy,
            ...((user.settings || {}).privacy || {})
        },
        security: {
            ...DEFAULT_SETTINGS.security,
            ...((user.settings || {}).security || {})
        }
    },
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please login.'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                user: serializeUser(user)
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update current logged in user profile
 * @route   PUT /api/auth/me
 * @access  Private
 */
const updateMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const {
            name,
            bio,
            phone,
            location,
            website,
            image,
            settings
        } = req.body;

        if (typeof name === 'string' && name.trim()) {
            user.name = name.trim();
        }

        if (typeof bio === 'string') {
            user.bio = bio.trim().slice(0, 500);
        }

        if (typeof phone === 'string') {
            user.phone = phone.trim();
        }

        if (typeof location === 'string') {
            user.location = location.trim();
        }

        if (typeof website === 'string') {
            user.website = website.trim();
        }

        if (typeof image === 'string' || image === null) {
            user.image = image || null;
        }

        if (settings && typeof settings === 'object') {
            user.settings = {
                ...DEFAULT_SETTINGS,
                ...(user.settings || {}),
                ...settings,
                notifications: {
                    ...DEFAULT_SETTINGS.notifications,
                    ...((user.settings || {}).notifications || {}),
                    ...(settings.notifications || {})
                },
                privacy: {
                    ...DEFAULT_SETTINGS.privacy,
                    ...((user.settings || {}).privacy || {}),
                    ...(settings.privacy || {})
                },
                security: {
                    ...DEFAULT_SETTINGS.security,
                    ...((user.settings || {}).security || {}),
                    ...(settings.security || {})
                }
            };
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: serializeUser(user)
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateMe
};
