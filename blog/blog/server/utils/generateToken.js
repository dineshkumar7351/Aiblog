/**
 * JWT Token Generator Utility
 * Creates signed JWT tokens for authentication
 */

const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {string} userId - The user's MongoDB _id
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = generateToken;
