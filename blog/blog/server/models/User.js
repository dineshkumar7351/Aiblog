/**
 * User Model
 * Defines the schema for user accounts with password hashing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    clerkId: {
        type: String,
        unique: true,
        sparse: true, // Allow null values for non-Clerk users
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't include password in queries by default
        required: function() {
            // Only required if no clerkId (backward compatibility)
            return !this.clerkId;
        }
    },
    image: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    settings: {
        type: {
            notifications: {
                emailNotifications: { type: Boolean, default: true },
                pushNotifications: { type: Boolean, default: false },
                blogUpdates: { type: Boolean, default: true },
                weeklyDigest: { type: Boolean, default: true },
                marketingEmails: { type: Boolean, default: false }
            },
            privacy: {
                profilePublic: { type: Boolean, default: true },
                showEmail: { type: Boolean, default: false },
                allowMessages: { type: Boolean, default: true },
                indexInSearch: { type: Boolean, default: true }
            },
            security: {
                twoFactorEnabled: { type: Boolean, default: false },
                loginAlerts: { type: Boolean, default: true },
                suspiciousActivityAlerts: { type: Boolean, default: true },
                deviceTrusted: { type: Boolean, default: false }
            }
        },
        default: () => ({
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
        })
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return next();
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
