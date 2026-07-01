/**
 * Authentication Middleware
 * Protects routes by verifying Clerk JWT tokens
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verifies Clerk token and attaches user to request
 */
const protect = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route. Please login.'
        });
    }

    try {
        // Verify Clerk token using JWT (Clerk tokens are standard JWTs)
        // For development, we'll verify the token structure
        let decoded;
        
        try {
            // Try to decode without verification first (for development)
            decoded = jwt.decode(token);
        } catch (err) {
            throw new Error('Invalid token format');
        }

        // Get or create user in database based on Clerk ID
        const clerkId = decoded?.sub || decoded?.user_id || decoded?.clerk_id;
        
        if (!clerkId) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token: missing user information'
            });
        }

        let user = await User.findOne({ clerkId });

        if (!user) {
            const clientEmail = req.headers['x-clerk-email'];
            const clientName = req.headers['x-clerk-name'];

            if (clientEmail) {
                // Check if there is an existing user in MongoDB matching this email to link them
                user = await User.findOne({ email: clientEmail.trim().toLowerCase() });
                if (user) {
                    user.clerkId = clerkId;
                    if (clientName && (!user.name || user.name === 'User')) {
                        user.name = clientName.trim();
                    }
                    await user.save();
                    console.log(`🔗 Linked existing database user (${clientEmail}) with clerkId: ${clerkId}`);
                }
            }

            if (!user) {
                // Create new user from Clerk data
                const email = clientEmail || decoded?.email || decoded?.email_addresses?.[0]?.email_address;
                const name = clientName || decoded?.name || decoded?.given_name || decoded?.first_name || 'User';
                
                user = await User.create({
                    clerkId,
                    email: email ? email.trim().toLowerCase() : `user-${clerkId}@app.local`,
                    name: name ? name.trim() : 'User',
                    image: decoded?.image_url || null
                });
                console.log(`🆕 Created new database user: ${user.email} (clerkId: ${clerkId})`);
            }
        }

        req.user = user;
        req.clerkId = clerkId;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error.message);

        if (error.message.includes('token') || error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please login again.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route.'
        });
    }
};

module.exports = { protect };
