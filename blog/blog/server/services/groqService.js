/**
 * Groq AI Service
 * Handles all AI-powered features using Groq API with LLaMA/Mixtral models
 * 
 * IMPORTANT: AI is ASSISTIVE ONLY - User controls final content
 */

const { Groq } = require('groq-sdk');

// Initialize Groq client
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Model configuration - Using LLaMA 3.3 for best results
const MODEL = 'llama-3.3-70b-versatile';
const MAX_TOKENS = 1024;

/**
 * Generate SEO-friendly title suggestions for blog content
 * @param {string} content - The blog content
 * @returns {Promise<string[]>} Array of 3 title suggestions
 */
const suggestTitles = async (content) => {
    try {
        // Truncate content to avoid token limits
        const truncatedContent = content.substring(0, 2000);

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an SEO expert assistant. Your ONLY task is to suggest blog titles.
RULES:
- Generate exactly 3 SEO-friendly title suggestions
- Each title should be compelling and clickable
- Keep titles under 60 characters for SEO
- Do NOT add any explanations or extra text
- Return ONLY the 3 titles, each on a new line
- Number each title (1. 2. 3.)`
                },
                {
                    role: 'user',
                    content: `Based on this blog content, suggest 3 SEO-friendly titles:\n\n${truncatedContent}`
                }
            ],
            model: MODEL,
            max_tokens: 256,
            temperature: 0.7
        });

        // Parse the response into an array of titles
        const responseText = completion.choices[0]?.message?.content || '';
        const titles = responseText
            .split('\n')
            .filter(line => line.trim())
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(title => title.length > 0)
            .slice(0, 3);

        return titles.length > 0 ? titles : ['Unable to generate title suggestions'];
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
        const completion = await groq.chat.completions.create({
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
            model: MODEL,
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

        const completion = await groq.chat.completions.create({
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
            model: MODEL,
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

module.exports = {
    suggestTitles,
    improveContent,
    checkSEO
};
