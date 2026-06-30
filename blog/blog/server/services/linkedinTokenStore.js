/**
 * LinkedIn OAuth state and token cache helpers.
 */

const cache = require('./cache/inMemoryCache');

const OAUTH_STATE_PREFIX = 'linkedin:oauth:state:';
const TOKEN_PREFIX = 'linkedin:token:user:';

const OAUTH_STATE_TTL_SECONDS = Number(process.env.LINKEDIN_OAUTH_STATE_TTL_SECONDS || 600);
const TOKEN_EXPIRY_SKEW_SECONDS = Number(process.env.LINKEDIN_TOKEN_EXPIRY_SKEW_SECONDS || 60);

const stateKey = (state) => `${OAUTH_STATE_PREFIX}${state}`;
const tokenKey = (userId) => `${TOKEN_PREFIX}${userId}`;

const saveOAuthState = ({ state, userId, returnTo, blogId, blogUrl }) => {
    cache.set(
        stateKey(state),
        {
            userId,
            returnTo,
            blogId: blogId || null,
            blogUrl: blogUrl || null,
            createdAt: new Date().toISOString()
        },
        OAUTH_STATE_TTL_SECONDS
    );
};

const consumeOAuthState = (state) => {
    const key = stateKey(state);
    const value = cache.get(key);
    cache.del(key);
    return value;
};

const saveLinkedInToken = ({ userId, accessToken, expiresIn, personId, scope }) => {
    const normalizedExpiresIn = Number(expiresIn || 0);
    const effectiveTtlSeconds = Math.max(normalizedExpiresIn - TOKEN_EXPIRY_SKEW_SECONDS, 1);
    const expiresAt = new Date(Date.now() + (normalizedExpiresIn * 1000)).toISOString();

    cache.set(
        tokenKey(userId),
        {
            accessToken,
            personId,
            scope,
            expiresAt
        },
        effectiveTtlSeconds
    );

    return {
        expiresAt
    };
};

const getLinkedInToken = (userId) => {
    return cache.get(tokenKey(userId));
};

const clearLinkedInToken = (userId) => {
    cache.del(tokenKey(userId));
};

const isLinkedInConnected = (userId) => {
    const token = getLinkedInToken(userId);
    return Boolean(token && token.accessToken && token.personId);
};

module.exports = {
    saveOAuthState,
    consumeOAuthState,
    saveLinkedInToken,
    getLinkedInToken,
    clearLinkedInToken,
    isLinkedInConnected
};
