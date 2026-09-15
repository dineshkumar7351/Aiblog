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

// CORS Configuration
const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5000',
    'https://aiblog-six-puce.vercel.app'
];

const envOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''))
    : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...envOrigins]));

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        try {
            const originUrl = new URL(origin);
            const isAllowed =
                allowedOrigins.includes(origin) ||
                allowedOrigins.includes('*') ||
                originUrl.hostname.endsWith('.vercel.app') ||
                originUrl.hostname === 'localhost' ||
                originUrl.hostname === '127.0.0.1';

            if (isAllowed) {
                return callback(null, true);
            }
        } catch (e) {
            // Invalid origin URL format
        }

        console.warn(`[CORS] Origin rejected: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Clerk-Email', 'X-Clerk-Name', 'Accept'],
    optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
