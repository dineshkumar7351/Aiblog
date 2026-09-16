/**
 * Groq AI Service
 * Handles all AI-powered features using Groq API with LLaMA/GPT-OSS models
 * 
 * IMPORTANT: AI is ASSISTIVE ONLY - User controls final content
 */

const { Groq } = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Model configuration - Using high capability models available on Groq
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const FALLBACK_MODEL = 'qwen/qwen3.8-27b';
const MAX_TOKENS = 1024;

const callGroqWithFallback = async (params) => {
    try {
        return await groq.chat.completions.create({
            ...params,
            model: params.model || MODEL
        });
    } catch (primaryError) {
        if (params.model !== FALLBACK_MODEL) {
            console.warn(`Groq primary model failed (${primaryError.message}), trying fallback: ${FALLBACK_MODEL}`);
            return await groq.chat.completions.create({
                ...params,
                model: FALLBACK_MODEL
            });
        }
        throw primaryError;
    }
};

/**
 * Generate SEO-friendly title suggestions for blog content
 * @param {string} content - The blog content
 * @returns {Promise<string[]>} Array of 3 title suggestions
 */
const suggestTitles = async (content) => {
    try {
        // Truncate content to avoid token limits
        const truncatedContent = content.substring(0, 2000);

        const completion = await callGroqWithFallback({
            messages: [
                {
                    role: 'system',
                    content: `You are an SEO expert assistant. Your ONLY task is to suggest 3 blog titles.
RULES:
- Return ONLY 3 clean title suggestions.
- Do NOT include quotes, asterisks, bullet points, numbering, or explanations.
- Each title must be on a separate line.
- Keep each title under 65 characters.`
                },
                {
                    role: 'user',
                    content: `Based on this blog content, suggest 3 SEO-friendly titles:\n\n${truncatedContent}`
                }
            ],
            max_tokens: 256,
            temperature: 0.7
        });

        // Parse the response into an array of titles
        const responseText = completion.choices[0]?.message?.content || '';
        const titles = responseText
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^(\d+[\.\)]\s*|[-*•]\s*|["'“”«»])/g, '').replace(/["'“”«»]$/g, '').replace(/\*\*/g, '').trim())
            .filter(title => title.length > 5 && !title.toLowerCase().startsWith('here are') && !title.toLowerCase().startsWith('targets:'))
            .slice(0, 3);

        return titles.length > 0 ? titles : [
            'Mastering Modern Tech: A Complete Guide',
            'Essential Insights for Success and Growth',
            'How to Build Scalable Solutions Efficiently'
        ];
    } catch (error) {
        console.error('Groq suggestTitles Error:', error.message);
        throw new Error('Failed to generate title suggestions. Please try again.');
    }
};

/**
 * Improve blog content for grammar and readability
 * @param {string} content - The original blog content
 * @returns {Promise<string>} Improved content
 */
const improveContent = async (content) => {
    try {
        const completion = await callGroqWithFallback({
            messages: [
                {
                    role: 'system',
                    content: `You are a professional editor assistant. Your ONLY task is to improve text.
STRICT RULES:
- Improve grammar, spelling, and punctuation
- Enhance readability and flow
- Maintain the EXACT same meaning
- Do NOT add new information
- Do NOT change facts or data
- Do NOT add opinions or commentary
- Do NOT include any explanations or notes
- Return ONLY the improved text
- Keep the same length approximately`
                },
                {
                    role: 'user',
                    content: `Improve the following blog content for grammar and clarity. Do not add new information. Do not change the meaning:\n\n${content}`
                }
            ],
            max_tokens: MAX_TOKENS,
            temperature: 0.3 // Lower temperature for more consistent editing
        });

        return completion.choices[0]?.message?.content || content;
    } catch (error) {
        console.error('Groq improveContent Error:', error.message);
        throw new Error('Failed to improve content. Please try again.');
    }
};

/**
 * Analyze content for SEO and provide score with suggestions
 * @param {string} content - The blog content
 * @param {string} title - The blog title
 * @returns {Promise<Object>} SEO analysis results
 */
const checkSEO = async (content, title = '') => {
    try {
        // Calculate basic metrics
        const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
        const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
        const paragraphCount = content.split(/\n\n+/).filter(p => p.trim().length > 0).length;
        const hasHeadings = /#{1,6}\s|<h[1-6]>/i.test(content);

        const completion = await callGroqWithFallback({
            messages: [
                {
                    role: 'system',
                    content: `You are an SEO analyst. Analyze blog content and provide a JSON response.
RULES:
- Return ONLY valid JSON, no markdown code blocks
- Calculate a realistic SEO score from 0-100
- Provide exactly 3-5 specific, actionable suggestions
- Be constructive and helpful

JSON FORMAT (return exactly this structure):
{
  "score": <number 0-100>,
  "strengths": ["strength1", "strength2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "readabilityLevel": "<easy|moderate|difficult>"
}`
                },
                {
                    role: 'user',
                    content: `Analyze this blog for SEO:

TITLE: ${title || 'No title provided'}
WORD COUNT: ${wordCount}
CONTENT:
${content.substring(0, 1500)}`
                }
            ],
            max_tokens: 512,
            temperature: 0.3
        });

        const responseText = completion.choices[0]?.message?.content || '';

        // Try to parse JSON from response
        try {
            // Remove potential markdown code blocks
            const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
            const analysis = JSON.parse(cleanJson);

            return {
                score: Math.min(100, Math.max(0, analysis.score || 50)),
                strengths: analysis.strengths || [],
                suggestions: analysis.suggestions || [],
                readabilityLevel: analysis.readabilityLevel || 'moderate',
                metrics: {
                    wordCount,
                    sentenceCount,
                    avgWordsPerSentence,
                    paragraphCount,
                    hasHeadings
                }
            };
        } catch (parseError) {
            // Fallback to basic analysis if parsing fails
            console.warn('SEO JSON parse failed, using fallback');
            return {
                score: calculateBasicSEOScore(wordCount, paragraphCount, hasHeadings, title),
                strengths: [],
                suggestions: [
                    wordCount < 300 ? 'Add more content (aim for 300+ words)' : null,
                    !hasHeadings ? 'Add headings to structure your content' : null,
                    paragraphCount < 3 ? 'Break content into more paragraphs' : null,
                    !title ? 'Add a compelling title' : null
                ].filter(Boolean),
                readabilityLevel: avgWordsPerSentence > 20 ? 'difficult' : avgWordsPerSentence > 15 ? 'moderate' : 'easy',
                metrics: {
                    wordCount,
                    sentenceCount,
                    avgWordsPerSentence,
                    paragraphCount,
                    hasHeadings
                }
            };
        }
    } catch (error) {
        console.error('Groq checkSEO Error:', error.message);
        throw new Error('Failed to analyze SEO. Please try again.');
    }
};

/**
 * Calculate a basic SEO score based on metrics
 */
const calculateBasicSEOScore = (wordCount, paragraphCount, hasHeadings, title) => {
    let score = 50; // Base score

    // Word count scoring
    if (wordCount >= 1000) score += 20;
    else if (wordCount >= 500) score += 15;
    else if (wordCount >= 300) score += 10;
    else if (wordCount < 100) score -= 15;

    // Structure scoring
    if (hasHeadings) score += 10;
    if (paragraphCount >= 3) score += 5;
    if (paragraphCount >= 5) score += 5;

    // Title scoring
    if (title && title.length >= 10 && title.length <= 60) score += 10;

    return Math.min(100, Math.max(0, score));
};

/**
 * Generate a complete, formatted blog post from spoken voice transcript
 * @param {string} transcript - The raw speech-to-text transcript
 * @param {Object} options - Tone, language, length options
 * @returns {Promise<Object>} { title, content, tags, summary }
 */
const generateBlogFromVoice = async (transcript, options = {}) => {
    try {
        const { tone = 'engaging', language = 'English', length = 'medium' } = options;

        const completion = await callGroqWithFallback({
            messages: [
                {
                    role: 'system',
                    content: `You are an elite AI ghostwriter and content creator.
Your job is to take a raw, unstructured speech-to-text voice transcript spoken by a human and transform it into a publication-ready, beautifully formatted Markdown blog post.

REQUIREMENTS:
1. Extract the core ideas, arguments, and insights from the voice recording.
2. Clean up verbal filler words ("um", "uh", "you know", "like", repetition, false starts).
3. Structure the post logically:
   - Catchy, SEO-optimized title (H1)
   - Engaging introduction hook
   - Multiple sections with markdown headings (##, ###)
   - Key insights, bullet points, callout takeaways, or code blocks where applicable
   - Smooth conclusion and discussion question for readers
4. Tone: ${tone}
5. Language: ${language}
6. Length: ${length === 'short' ? '300-500 words' : length === 'detailed' ? '800-1200 words' : '500-800 words'}

OUTPUT FORMAT: Return ONLY valid JSON without markdown code blocks around the JSON itself.
JSON Schema:
{
  "title": "<Catchy SEO Title Under 65 chars>",
  "content": "<Full Markdown Formatted Article Body>",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "summary": "<Compelling 1-2 sentence meta summary>"
}`
                },
                {
                    role: 'user',
                    content: `Here is the spoken voice transcript from the author:\n\n"""\n${transcript}\n"""\n\nGenerate the complete blog post JSON:`
                }
            ],
            max_tokens: 2048,
            temperature: 0.6
        });

        const responseText = completion.choices[0]?.message?.content || '';

        try {
            const cleanJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            return {
                title: parsed.title || 'Insights from Voice Recording',
                content: parsed.content || transcript,
                tags: Array.isArray(parsed.tags) ? parsed.tags : ['AI', 'Tech', 'Article'],
                summary: parsed.summary || ''
            };
        } catch (parseErr) {
            console.warn('Voice-to-blog JSON parsing failed, formatting raw content');
            const lines = responseText.split('\n').map(l => l.trim()).filter(Boolean);
            const firstLine = lines[0]?.replace(/^#*\s*/, '') || 'Insights from Voice Notes';
            return {
                title: firstLine.substring(0, 65),
                content: responseText,
                tags: ['Voice-Note', 'AI-Generated', 'Blog'],
                summary: lines[1] || ''
            };
        }
    } catch (error) {
        console.error('Groq generateBlogFromVoice Error:', error.message);
        throw new Error('Failed to convert voice recording to blog post. Please try again.');
    }
};

/**
 * Generate an AI cover image prompt and image URL based on title/content
 * @param {string} title - Blog title
 * @param {string} content - Blog content
 * @returns {Promise<Object>} { imageUrl, prompt }
 */
const generateCoverImage = async (title, content = '') => {
    try {
        const completion = await callGroqWithFallback({
            messages: [
                {
                    role: 'system',
                    content: `You are a professional digital artist and art director.
Generate a visually stunning, vivid, detailed text-to-image prompt (under 30 words) for a blog cover banner image based on the article's topic.
STRICT RULES:
- Focus on photorealistic, high-end 3D render, cinematic lighting, 8k resolution, vibrant colors.
- Do NOT include words like "text", "words", "letters", "watermark", "font", "typography".
- Output ONLY the prompt itself, nothing else.`
                },
                {
                    role: 'user',
                    content: `Create a captivating blog cover image prompt for:
TITLE: ${title}
EXCERPT: ${content.substring(0, 250)}`
                }
            ],
            max_tokens: 100,
            temperature: 0.7
        });

        const imagePrompt = (completion.choices[0]?.message?.content || title)
            .replace(/["'“”«»]/g, '')
            .trim();

        const cleanPrompt = encodeURIComponent(imagePrompt.substring(0, 150));
        const seed = Math.floor(Math.random() * 999999);
        const imageUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1200&height=630&model=flux&nologo=true&seed=${seed}`;

        return {
            imageUrl,
            prompt: imagePrompt
        };
    } catch (error) {
        console.error('Groq generateCoverImage Error:', error.message);
        const fallbackPrompt = encodeURIComponent((title || 'modern aesthetic technology blog').replace(/[^a-zA-Z0-9 ]/g, ' '));
        return {
            imageUrl: `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1200&height=630&model=flux&nologo=true`,
            prompt: title
        };
    }
};

module.exports = {
    suggestTitles,
    improveContent,
    checkSEO,
    generateBlogFromVoice,
    generateCoverImage
};
