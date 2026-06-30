/**
 * Social Publishing Service
 * Posts blog content to LinkedIn and Instagram.
 */

const { getLinkedInToken, clearLinkedInToken } = require('./linkedinTokenStore');

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2/ugcPosts';
const INSTAGRAM_API_BASE = 'https://graph.facebook.com/v19.0';

class SocialPublishError extends Error {
    constructor(message, options = {}) {
        super(message);
        this.name = 'SocialPublishError';
        this.code = options.code || 'SOCIAL_PUBLISH_ERROR';
        this.statusCode = options.statusCode || 500;
        this.reauthRequired = Boolean(options.reauthRequired);
    }
}

const truncateText = (value, max) => {
    if (!value) return '';
    if (value.length <= max) return value;
    return `${value.slice(0, max - 3)}...`;
};

const buildPostText = (blog, authorName, blogUrl, maxLength) => {
    const headline = `${blog.title}`;
    const byline = authorName ? `By ${authorName}` : '';
    const summary = truncateText(blog.content.replace(/\s+/g, ' ').trim(), 700);
    const readMore = blogUrl ? `Read more: ${blogUrl}` : '';

    const text = [headline, byline, '', summary, '', readMore]
        .filter(Boolean)
        .join('\n')
        .trim();

    return truncateText(text, maxLength);
};

const parseApiError = async (response) => {
    try {
        const json = await response.json();

        if (json?.error?.message) {
            return `${json.error.message} (Status: ${response.status})`;
        }

        if (json?.message) {
            return `${json.message} (Status: ${response.status})`;
        }

        // Generic format
        return `${JSON.stringify(json)} (Status: ${response.status})`;
    } catch (error) {
        return `${response.statusText || 'Unknown error'} (Status: ${response.status})`;
    }
};

const isLinkedInAuthError = (status, message = '') => {
    const normalizedMessage = message.toLowerCase();
    return status === 401
        || status === 403
        || normalizedMessage.includes('expired')
        || normalizedMessage.includes('invalid access token')
        || normalizedMessage.includes('not enough permissions')
        || normalizedMessage.includes('scope');
};

const postToLinkedIn = async ({ blog, authorName, blogUrl, userId }) => {
    const tokenInfo = getLinkedInToken(userId);

    if (!tokenInfo?.accessToken || !tokenInfo?.personId) {
        throw new SocialPublishError('LinkedIn authorization required. Connect LinkedIn and try again.', {
            code: 'LINKEDIN_AUTH_REQUIRED',
            statusCode: 401,
            reauthRequired: true
        });
    }

    const accessToken = tokenInfo.accessToken;
    const personId = tokenInfo.personId;

    const text = buildPostText(blog, authorName, blogUrl, 2900);

    const requestPayload = {
        author: `urn:li:person:${personId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text
                },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };

    const response = await fetch(LINKEDIN_API_URL, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify(requestPayload)
    });

    if (!response.ok) {
        const message = await parseApiError(response);

        if (isLinkedInAuthError(response.status, message)) {
            clearLinkedInToken(userId);
            throw new SocialPublishError(`LinkedIn authorization expired or invalid: ${message}`, {
                code: 'LINKEDIN_AUTH_REQUIRED',
                statusCode: 401,
                reauthRequired: true
            });
        }

        throw new SocialPublishError(`LinkedIn post failed: ${message}`, {
            code: 'LINKEDIN_POST_FAILED',
            statusCode: response.status,
            reauthRequired: false
        });
    }

    const linkedInId = response.headers.get('x-linkedin-id');

    return {
        platform: 'linkedin',
        success: true,
        postId: linkedInId || null
    };
};

const postToInstagram = async ({ blog, authorName, blogUrl, imageUrl }) => {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_USER_ID;

    console.log('Instagram Configuration Check:');
    console.log('- Access Token Present:', !!accessToken);
    console.log('- Access Token Length:', accessToken?.length);
    console.log('- User ID:', igUserId);

    if (!accessToken || !igUserId) {
        throw new Error('Instagram is not configured. Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_USER_ID in .env');
    }

    const finalImageUrl = imageUrl || process.env.INSTAGRAM_DEFAULT_IMAGE_URL;
    if (!finalImageUrl) {
        throw new Error('Instagram posting requires an image URL. Provide imageUrl or set INSTAGRAM_DEFAULT_IMAGE_URL.');
    }

    const caption = buildPostText(blog, authorName, blogUrl, 2200);

    // Step 1: Create media
    console.log('Instagram Step 1: Creating media...');
    const createMediaUrl = `${INSTAGRAM_API_BASE}/${igUserId}/media`;
    console.log('Instagram Media Creation URL:', createMediaUrl);
    
    const createPayload = {
        image_url: finalImageUrl,
        caption,
        access_token: accessToken
    };
    
    console.log('Instagram Media Creation Payload:', {
        image_url: finalImageUrl.substring(0, 50) + '...',
        caption: caption.substring(0, 100) + '...',
        access_token: accessToken.substring(0, 20) + '...'
    });

    const createMediaResponse = await fetch(createMediaUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(createPayload)
    });

    console.log('Instagram Media Creation Response Status:', createMediaResponse.status);

    if (!createMediaResponse.ok) {
        const message = await parseApiError(createMediaResponse);
        console.error(`Instagram media creation failed with status ${createMediaResponse.status}: ${message}`);
        throw new Error(`Instagram media creation failed: ${message}`);
    }

    const createResponse = await createMediaResponse.json();
    console.log('Instagram Media Creation Success:', createResponse);

    // Step 2: Publish media
    console.log('Instagram Step 2: Publishing media...');
    const publishUrl = `${INSTAGRAM_API_BASE}/${igUserId}/media_publish`;
    console.log('Instagram Publish URL:', publishUrl);
    
    const publishPayload = {
        creation_id: createResponse.id,
        access_token: accessToken
    };
    
    console.log('Instagram Publish Payload:', {
        creation_id: createResponse.id,
        access_token: accessToken.substring(0, 20) + '...'
    });

    const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishPayload)
    });

    console.log('Instagram Publish Response Status:', publishResponse.status);

    if (!publishResponse.ok) {
        const message = await parseApiError(publishResponse);
        console.error(`Instagram publish failed with status ${publishResponse.status}: ${message}`);
        throw new Error(`Instagram publish failed: ${message}`);
    }

    const publishResponse_data = await publishResponse.json();
    console.log('Instagram Publish Success:', publishResponse_data);

    return {
        platform: 'instagram',
        success: true,
        postId: publishResponse_data.id || null
    };
};

module.exports = {
    postToLinkedIn,
    postToInstagram,
    SocialPublishError
};
