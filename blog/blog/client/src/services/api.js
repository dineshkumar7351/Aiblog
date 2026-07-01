/**
 * API Service
 * Centralized API calls using Axios with Clerk authentication
 */

import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Store reference to token setter
let getTokenFn = null;
let getClerkUserFn = null;

// Set the token getter function (called from AuthContext)
export const setTokenGetter = (fn) => {
    getTokenFn = fn;
};

// Set the Clerk user getter function (called from AuthContext)
export const setClerkUserGetter = (fn) => {
    getClerkUserFn = fn;
};

// Request interceptor - adds Clerk auth token and profile headers
api.interceptors.request.use(
    async (config) => {
        try {
            if (getTokenFn) {
                const token = await getTokenFn();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            if (getClerkUserFn) {
                const clerkUser = getClerkUserFn();
                if (clerkUser) {
                    const email = clerkUser.primaryEmailAddress?.emailAddress || '';
                    const name = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();
                    if (email) {
                        config.headers['X-Clerk-Email'] = email;
                    }
                    if (name) {
                        config.headers['X-Clerk-Name'] = name;
                    }
                }
            }
        } catch (error) {
            console.error('Error getting Clerk token or user info:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 - Unauthorized
        if (error.response?.status === 401) {
            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateMe: (data) => api.put('/auth/me', data)
};

// Blog API
export const blogAPI = {
    create: (data) => api.post('/blogs', data),
    getAll: (params) => api.get('/blogs', { params }),
    getPublic: (params) => api.get('/blogs/public', { params }),
    getOne: (id) => api.get(`/blogs/${id}`),
    update: (id, data) => api.put(`/blogs/${id}`, data),
    delete: (id) => api.delete(`/blogs/${id}`),
    getStats: () => api.get('/blogs/stats'),
    shareToSocial: (id, data) => api.post(`/blogs/${id}/share`, data)
};

// LinkedIn API
export const linkedinAPI = {
    getStatus: () => api.get('/linkedin/status'),
    getAuthUrl: ({ returnTo, blogId, blogUrl } = {}) => api.get('/linkedin/auth-url', {
        params: {
            returnTo,
            blogId,
            blogUrl
        }
    }),
    disconnect: () => api.post('/linkedin/disconnect')
};

// AI API
export const aiAPI = {
    suggestTitle: (content) => api.post('/ai/suggest-title', { content }),
    improveContent: (content) => api.post('/ai/improve-content', { content }),
    seoCheck: (content, title) => api.post('/ai/seo-check', { content, title })
};

export default api;
