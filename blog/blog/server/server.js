/**
 * AI Blog Platform - Backend Server
 * Main entry point for the Express.js application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const aiRoutes = require('./routes/aiRoutes');
const linkedinRoutes = require('./routes/linkedinRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/linkedin', linkedinRoutes);

// Backward-compatible LinkedIn callback path.
app.get('/auth/linkedin/callback', (req, res) => {
    const query = new URLSearchParams(req.query).toString();
    const target = `/api/linkedin/callback${query ? `?${query}` : ''}`;
    res.redirect(target);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'AI Blog Platform API is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 AI Blog Platform Server                          ║
║   ─────────────────────────────────────────────────   ║
║   🌐 Server:  http://localhost:${PORT}                  ║
║   📦 Mode:    ${process.env.NODE_ENV || 'development'}                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});

module.exports = app;
