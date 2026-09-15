/**
 * Blog Model
 * Defines the schema for blog posts with author relationship
 */

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Blog content is required'],
        minlength: [50, 'Content must be at least 50 characters']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    seoScore: {
        type: Number,
        default: null,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Index for better query performance
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
