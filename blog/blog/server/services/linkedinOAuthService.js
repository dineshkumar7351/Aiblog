/**
 * LinkedIn OAuth service for auth URL generation and token exchange.
 */

const crypto = require('crypto');

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

const getRequiredConfig = () => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        const error = new Error('LinkedIn OAuth is not fully configured. Set LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, and LINKEDIN_REDIRECT_URI.');
        error.statusCode = 500;
        throw error;
    }

    return {
        clientId,
        clientSecret,
        redirectUri
    };
};

const getLinkedInScopes = () => {
    return process.env.LINKEDIN_SCOPES || 'openid profile w_member_social';
};

const createOAuthState = () => {
    return crypto.randomBytes(24).toString('hex');
};

const buildAuthUrl = ({ state }) => {
    const { clientId, redirectUri } = getRequiredConfig();
    const scopes = getLinkedInScopes();

    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        scope: scopes,
        state
    });

    return `${LINKEDIN_AUTH_URL}?${params.toString()}`;
};

const exchangeCodeForToken = async (code) => {
    const { clientId, clientSecret, redirectUri } = getRequiredConfig();

    const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
    });

    const response = await fetch(LINKEDIN_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody.toString()
    });

    const payload = await response.json();

    if (!response.ok) {
        const message = payload?.error_description || payload?.error || 'Failed to exchange LinkedIn OAuth code for token';
        const error = new Error(message);
        error.statusCode = response.status;
        throw error;
    }

    return {
        accessToken: payload.access_token,
        expiresIn: payload.expires_in,
        scope: payload.scope
    };
};

const fetchLinkedInProfile = async (accessToken) => {
    const response = await fetch(LINKEDIN_USERINFO_URL, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const payload = await response.json();

    if (!response.ok) {
        const message = payload?.message || payload?.error_description || payload?.error || 'Failed to fetch LinkedIn profile';
        const error = new Error(message);
        error.statusCode = response.status;
        throw error;
    }

    // OpenID userinfo returns `sub` as user identifier.
    const personId = payload?.sub;

    if (!personId) {
        const error = new Error('LinkedIn profile response did not include a person identifier.');
        error.statusCode = 500;
        throw error;
    }

    return {
        personId,
        profile: payload
    };
};

module.exports = {
    createOAuthState,
    buildAuthUrl,
    exchangeCodeForToken,
    fetchLinkedInProfile
};
