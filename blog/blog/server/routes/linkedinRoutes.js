/**
 * LinkedIn OAuth Routes
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getLinkedInStatus,
    getLinkedInAuthUrl,
    handleLinkedInCallback,
    disconnectLinkedIn
} = require('../controllers/linkedinController');

// Public callback route for LinkedIn OAuth redirect.
router.get('/callback', handleLinkedInCallback);

// Authenticated LinkedIn management routes.
router.use(protect);

router.get('/status', getLinkedInStatus);
router.get('/auth-url', getLinkedInAuthUrl);
router.post('/disconnect', disconnectLinkedIn);

module.exports = router;
