/**
 * LinkedIn OAuth Controller
 */

const {
    createOAuthState,
    buildAuthUrl,
    exchangeCodeForToken,
    fetchLinkedInProfile
} = require('../services/linkedinOAuthService');
const Blog = require('../models/Blog');
const {
    saveOAuthState,
    consumeOAuthState,
    saveLinkedInToken,
    getLinkedInToken,
    clearLinkedInToken,
    isLinkedInConnected
} = require('../services/linkedinTokenStore');
const { postToLinkedIn } = require('../services/socialService');

const getClientBaseUrl = () => {
    return process.env.CLIENT_URL || 'http://localhost:5173';
};

const sanitizeReturnTo = (candidateUrl) => {
    const fallback = `${getClientBaseUrl()}/blogs`;

    if (!candidateUrl) {
        return fallback;
    }

    try {
        const target = new URL(candidateUrl);
        const allowedBase = new URL(getClientBaseUrl());

        if (target.origin !== allowedBase.origin) {
            return fallback;
        }

        return target.toString();
    } catch (error) {
        return fallback;
    }
};

const appendQueryParam = (baseUrl, key, value) => {
    const nextUrl = new URL(baseUrl);
    nextUrl.searchParams.set(key, value);
    return nextUrl.toString();
};

const getLinkedInStatus = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const connected = isLinkedInConnected(userId);
        const tokenInfo = connected ? getLinkedInToken(userId) : null;

        res.status(200).json({
            success: true,
            data: {
                connected,
                expiresAt: tokenInfo?.expiresAt || null,
                scope: tokenInfo?.scope || null
            }
        });
    } catch (error) {
        next(error);
    }
};

const getLinkedInAuthUrl = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const returnTo = sanitizeReturnTo(req.query.returnTo);
        const blogId = req.query.blogId ? String(req.query.blogId) : null;
        const blogUrl = req.query.blogUrl ? sanitizeReturnTo(req.query.blogUrl) : null;
        const state = createOAuthState();

        saveOAuthState({
            state,
            userId,
            returnTo,
            blogId,
            blogUrl
        });

        const authUrl = buildAuthUrl({ state });

        res.status(200).json({
            success: true,
            data: {
                authUrl
            }
        });
    } catch (error) {
        next(error);
    }
};

const handleLinkedInCallback = async (req, res) => {
    const fallbackReturnTo = `${getClientBaseUrl()}/blogs`;

    try {
        const { code, state, error: oauthError, error_description: errorDescription } = req.query;

        if (!state) {
            return res.redirect(appendQueryParam(fallbackReturnTo, 'linkedinAuth', 'state_missing'));
        }

        const statePayload = consumeOAuthState(state);

        if (!statePayload) {
            return res.redirect(appendQueryParam(fallbackReturnTo, 'linkedinAuth', 'state_invalid'));
        }

        const returnTo = sanitizeReturnTo(statePayload.returnTo);

        if (oauthError) {
            let redirectUrl = appendQueryParam(returnTo, 'linkedinAuth', 'denied');
            if (errorDescription) {
                redirectUrl = appendQueryParam(redirectUrl, 'linkedinError', String(errorDescription));
            }
            return res.redirect(redirectUrl);
        }

        if (!code) {
            return res.redirect(appendQueryParam(returnTo, 'linkedinAuth', 'code_missing'));
        }

        const tokenResult = await exchangeCodeForToken(code);
        const profileResult = await fetchLinkedInProfile(tokenResult.accessToken);

        saveLinkedInToken({
            userId: statePayload.userId,
            accessToken: tokenResult.accessToken,
            expiresIn: tokenResult.expiresIn,
            personId: profileResult.personId,
            scope: tokenResult.scope
        });

        let redirectUrl = appendQueryParam(returnTo, 'linkedinAuth', 'success');

        if (statePayload.blogId) {
            const blog = await Blog.findById(statePayload.blogId).populate('author', 'name email');

            if (blog && blog.author && blog.author._id.toString() === statePayload.userId) {
                try {
                    await postToLinkedIn({
                        blog,
                        authorName: blog.author?.name,
                        blogUrl: statePayload.blogUrl || `${getClientBaseUrl()}/blog/${blog._id.toString()}`,
                        userId: statePayload.userId
                    });

                    redirectUrl = appendQueryParam(redirectUrl, 'linkedinPost', 'success');
                } catch (postError) {
                    console.error('LinkedIn post after OAuth failed:', postError.message);
                    redirectUrl = appendQueryParam(redirectUrl, 'linkedinPost', 'failed');
                    redirectUrl = appendQueryParam(redirectUrl, 'linkedinError', postError.message || 'LinkedIn post failed');
                }
            }
        }

        return res.redirect(redirectUrl);
    } catch (error) {
        console.error('LinkedIn callback error:', error.message);
        return res.redirect(appendQueryParam(fallbackReturnTo, 'linkedinAuth', 'failed'));
    }
};

const disconnectLinkedIn = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        clearLinkedInToken(userId);

        res.status(200).json({
            success: true,
            message: 'LinkedIn disconnected successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLinkedInStatus,
    getLinkedInAuthUrl,
    handleLinkedInCallback,
    disconnectLinkedIn
};
