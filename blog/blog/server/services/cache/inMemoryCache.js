/**
 * In-memory cache provider with TTL support.
 * Swap this file for a Redis-backed provider without changing callers.
 */

const cacheStore = new Map();

const now = () => Date.now();

const set = (key, value, ttlSeconds = 0) => {
    const expiresAt = ttlSeconds > 0 ? now() + (ttlSeconds * 1000) : null;
    cacheStore.set(key, { value, expiresAt });
};

const get = (key) => {
    const entry = cacheStore.get(key);

    if (!entry) {
        return null;
    }

    if (entry.expiresAt && entry.expiresAt <= now()) {
        cacheStore.delete(key);
        return null;
    }

    return entry.value;
};

const del = (key) => {
    cacheStore.delete(key);
};

const clear = () => {
    cacheStore.clear();
};

module.exports = {
    set,
    get,
    del,
    clear
};
