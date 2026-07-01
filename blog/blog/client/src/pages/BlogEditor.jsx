/**
 * Blog Editor Page
 * Main editor with AI assistance panel and LinkedIn sharing
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { blogAPI, aiAPI, linkedinAPI } from '../services/api';
import AIPanel from '../components/AIPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Lightbulb, 
  Wand2, 
  Search, 
  Save, 
  Send,
  ArrowLeft,
  Sparkles,
  PanelRightOpen,
  PanelRightClose,
  Linkedin,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);

  // Blog state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [seoScore, setSeoScore] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // LinkedIn state
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinToggle, setLinkedinToggle] = useState(true);
  const [checkingLinkedin, setCheckingLinkedin] = useState(true);

  // AI Panel state
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingType, setAiLoadingType] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [seoAnalysis, setSeoAnalysis] = useState(null);

  // Load existing blog if editing
  useEffect(() => {
    if (isEditing) {
      fetchBlog();
    }
  }, [id]);

  // Check LinkedIn connection status on mount
  useEffect(() => {
    checkLinkedInStatus();
  }, []);

  // Handle LinkedIn OAuth callback query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const linkedInAuthState = params.get('linkedinAuth');
    const linkedInPostState = params.get('linkedinPost');
    const linkedInError = params.get('linkedinError');

    if (!linkedInAuthState) {
      return;
    }

    if (linkedInAuthState === 'success') {
      toast.success('LinkedIn connected successfully!', { icon: '🔗', duration: 3000 });
      setLinkedinConnected(true);

      if (linkedInPostState === 'success') {
        toast.success('🎉 Blog posted to LinkedIn successfully!', { duration: 5000 });
      } else if (linkedInPostState === 'failed') {
        toast.error(linkedInError || 'LinkedIn post failed after authorization');
      }
    } else if (linkedInAuthState === 'denied') {
      toast.error('LinkedIn authorization was denied');
    } else {
      toast.error('LinkedIn authorization failed. Please try again.');
    }

    params.delete('linkedinAuth');
    params.delete('linkedinError');
    params.delete('linkedinPost');

    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : ''
      },
      { replace: true }
    );
  }, [location.search]);

  const checkLinkedInStatus = async () => {
    setCheckingLinkedin(true);
    try {
      const response = await linkedinAPI.getStatus();
      const connected = Boolean(response.data?.data?.connected);
      setLinkedinConnected(connected);
      setLinkedinToggle(connected);
    } catch (error) {
      setLinkedinConnected(false);
      setLinkedinToggle(false);
    } finally {
      setCheckingLinkedin(false);
    }
  };

  const startLinkedInAuthorization = async (blogId) => {
    const authResponse = await linkedinAPI.getAuthUrl({
      returnTo: `${window.location.origin}/edit/${blogId}`,
      blogId,
      blogUrl: `${window.location.origin}/blog/${blogId}`
    });
    const authUrl = authResponse.data?.data?.authUrl;

    if (!authUrl) {
      throw new Error('LinkedIn authorization URL was not returned');
    }

    window.location.href = authUrl;
  };

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getOne(id);
      const blog = response.data.data.blog;
      setTitle(blog.title);
      setContent(blog.content);
      setStatus(blog.status);
      setSeoScore(blog.seoScore);
    } catch (error) {
      toast.error('Failed to load blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  // Save/Update blog
  const handleSave = async (publishStatus = status) => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (content.trim().length < 50) {
      toast.error('Content must be at least 50 characters');
      return;
    }

    setSaving(true);
    try {
      const blogData = {
        title: title.trim(),
        content: content.trim(),
        status: publishStatus,
        seoScore
      };

      let response;

      if (isEditing) {
        response = await blogAPI.update(id, blogData);
        toast.success(publishStatus === 'published' ? 'Blog published!' : 'Blog updated!');
      } else {
        response = await blogAPI.create(blogData);
        toast.success(publishStatus === 'published' ? 'Blog published!' : 'Blog saved as draft!');
      }

      const blogId = response?.data?.data?.blog?._id || id;
      const socialPosting = response?.data?.data?.socialPosting;

      // If publishing with LinkedIn toggle ON
      if (publishStatus === 'published' && linkedinToggle) {
        // If auto-post needs re-auth, redirect to LinkedIn OAuth
        if (socialPosting?.attempted && socialPosting.reauthRequired) {
          toast('Redirecting to LinkedIn for authorization...', { icon: '🔗', duration: 3000 });
          await startLinkedInAuthorization(blogId);
          return;
        }

        // If not connected at all, redirect to LinkedIn OAuth
        if (!linkedinConnected) {
          toast('Connecting to LinkedIn...', { icon: '🔗', duration: 3000 });
          await startLinkedInAuthorization(blogId);
          return;
        }

        // If auto-post succeeded
        if (socialPosting?.attempted && socialPosting.success) {
          toast.success('🎉 Blog also posted to LinkedIn!', { duration: 5000 });
        }

        // If auto-post failed for non-auth reasons
        if (socialPosting?.attempted && !socialPosting.success && !socialPosting.reauthRequired) {
          toast.error(socialPosting.message || 'Blog published, but LinkedIn post failed.');
        }
      }

      if (!isEditing && blogId) {
        navigate(`/edit/${blogId}`);
      }

      // If published without LinkedIn toggle, show any social posting warnings
      if (publishStatus === 'published' && !linkedinToggle) {
        // No LinkedIn action needed
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save blog';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Handle LinkedIn toggle click
  const handleLinkedinToggle = async () => {
    if (!linkedinConnected && !linkedinToggle) {
      // User wants to turn ON LinkedIn but not connected — just toggle ON
      // Actual auth will happen on Publish
      setLinkedinToggle(true);
    } else {
      setLinkedinToggle(!linkedinToggle);
    }
  };

  // AI: Suggest Titles
  const handleSuggestTitle = async () => {
    if (content.trim().length < 50) {
      toast.error('Please write at least 50 characters of content first');
      return;
    }

    setAiLoading(true);
    setAiLoadingType('title');
    setSuggestions([]);
    setSeoAnalysis(null);

    try {
      const response = await aiAPI.suggestTitle(content);
      const titles = response.data.data.titles;
      setSuggestions(titles.map(t => ({ type: 'title', content: t })));
      toast.success('Title suggestions ready!');
    } catch (error) {
      toast.error('Failed to generate title suggestions');
    } finally {
      setAiLoading(false);
      setAiLoadingType('');
    }
  };

  // AI: Improve Content
  const handleImproveContent = async () => {
    if (content.trim().length < 20) {
      toast.error('Please write at least 20 characters of content first');
      return;
    }

    setAiLoading(true);
    setAiLoadingType('content');
    setSuggestions([]);
    setSeoAnalysis(null);

    try {
      const response = await aiAPI.improveContent(content);
      const improved = response.data.data.improvedContent;
      setSuggestions([{ type: 'content', content: improved }]);
      toast.success('Content improvement ready!');
    } catch (error) {
      toast.error('Failed to improve content');
    } finally {
      setAiLoading(false);
      setAiLoadingType('');
    }
  };

  // AI: SEO Check
  const handleSEOCheck = async () => {
    if (content.trim().length < 20) {
      toast.error('Please write at least 20 characters of content first');
      return;
    }

    setAiLoading(true);
    setAiLoadingType('seo');
    setSuggestions([]);
    setSeoAnalysis(null);

    try {
      const response = await aiAPI.seoCheck(content, title);
      const analysis = response.data.data;
      setSeoAnalysis(analysis);
      setSeoScore(analysis.score);
      toast.success('SEO analysis complete!');
    } catch (error) {
      toast.error('Failed to analyze SEO');
    } finally {
      setAiLoading(false);
      setAiLoadingType('');
    }
  };

  // Accept title suggestion
  const handleAcceptTitle = (newTitle) => {
    setTitle(newTitle);
    setSuggestions([]);
    toast.success('Title applied!');
  };

  // Accept content improvement
  const handleAcceptContent = (newContent) => {
    setContent(newContent);
    setSuggestions([]);
    toast.success('Content updated!');
  };

  // Reject suggestion
  const handleRejectSuggestion = (index) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
    if (suggestions.length === 1) {
      toast('Suggestion dismissed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-73px)]">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="btn-ghost btn-icon"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {isEditing ? 'Edit Blog' : 'Write New Blog'}
              </h1>
              <p className="text-xs text-surface-500">
                {status === 'published' ? 'Published' : 'Draft'} 
                {seoScore && ` • SEO Score: ${seoScore}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Tools */}
            <div className="hidden md:flex items-center gap-2 mr-2 pr-4 border-r border-surface-200 dark:border-surface-700">
              <button
                onClick={handleSuggestTitle}
                disabled={aiLoading}
                className="btn-ghost btn-sm"
                title="Get AI title suggestions"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden lg:inline">Suggest Title</span>
              </button>
              <button
                onClick={handleImproveContent}
                disabled={aiLoading}
                className="btn-ghost btn-sm"
                title="Improve content with AI"
              >
                <Wand2 className="w-4 h-4" />
                <span className="hidden lg:inline">Improve</span>
              </button>
              <button
                onClick={handleSEOCheck}
                disabled={aiLoading}
                className="btn-ghost btn-sm"
                title="Check SEO score"
              >
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">SEO Check</span>
              </button>
            </div>

            {/* LinkedIn Toggle */}
            <div className="hidden sm:flex items-center gap-2 mr-2 pr-4 border-r border-surface-200 dark:border-surface-700">
              <button
                onClick={handleLinkedinToggle}
                disabled={checkingLinkedin}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                  transition-all duration-200 cursor-pointer
                  ${linkedinToggle 
                    ? linkedinConnected
                      ? 'bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/30 hover:bg-[#0A66C2]/20' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                    : 'bg-surface-100 text-surface-500 border border-surface-200 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700'
                  }
                `}
                title={
                  checkingLinkedin ? 'Checking LinkedIn status...' :
                  linkedinToggle 
                    ? linkedinConnected 
                      ? 'LinkedIn connected — will post on publish' 
                      : 'LinkedIn not connected — will prompt login on publish'
                    : 'Click to enable LinkedIn sharing'
                }
              >
                {checkingLinkedin ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Linkedin className="w-4 h-4" />
                )}
                <span className="hidden lg:inline">
                  {checkingLinkedin ? 'Checking...' :
                   linkedinToggle 
                    ? linkedinConnected ? 'LinkedIn ✓' : 'LinkedIn (login on publish)'
                    : 'LinkedIn Off'}
                </span>
                {!checkingLinkedin && linkedinToggle && (
                  linkedinConnected 
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : <AlertCircle className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Save/Publish Buttons */}
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="btn-outline btn-sm"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="btn-primary btn-sm"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {saving ? 'Publishing...' : linkedinToggle ? 'Publish + LinkedIn' : 'Publish'}
              </span>
            </button>

            {/* Toggle AI Panel */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className="btn-ghost btn-icon lg:hidden"
              title="Toggle AI Panel"
            >
              {showAIPanel ? (
                <PanelRightClose className="w-5 h-5" />
              ) : (
                <PanelRightOpen className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile AI Tools + LinkedIn Toggle */}
        <div className="md:hidden flex items-center gap-2 p-3 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 overflow-x-auto">
          <span className="text-xs text-surface-500 shrink-0">AI:</span>
          <button
            onClick={handleSuggestTitle}
            disabled={aiLoading}
            className="btn-ghost btn-sm shrink-0"
          >
            <Lightbulb className="w-4 h-4" />
            Title
          </button>
          <button
            onClick={handleImproveContent}
            disabled={aiLoading}
            className="btn-ghost btn-sm shrink-0"
          >
            <Wand2 className="w-4 h-4" />
            Improve
          </button>
          <button
            onClick={handleSEOCheck}
            disabled={aiLoading}
            className="btn-ghost btn-sm shrink-0"
          >
            <Search className="w-4 h-4" />
            SEO
          </button>
          <div className="w-px h-5 bg-surface-300 dark:bg-surface-600 shrink-0"></div>
          <button
            onClick={handleLinkedinToggle}
            disabled={checkingLinkedin}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium shrink-0
              transition-all duration-200
              ${linkedinToggle 
                ? 'bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/30' 
                : 'bg-surface-100 text-surface-500 border border-surface-200 dark:bg-surface-800 dark:border-surface-700'
              }
            `}
          >
            <Linkedin className="w-3.5 h-3.5" />
            {linkedinToggle ? 'LinkedIn ✓' : 'LinkedIn'}
          </button>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-surface-50 dark:bg-surface-950">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* LinkedIn Info Banner */}
            {linkedinToggle && !linkedinConnected && !checkingLinkedin && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-[#0A66C2]/5 border border-[#0A66C2]/20">
                <Linkedin className="w-5 h-5 text-[#0A66C2] shrink-0" />
                <p className="text-sm text-[#0A66C2] dark:text-blue-300">
                  <strong>LinkedIn sharing enabled.</strong> When you click Publish, you'll be redirected to LinkedIn to login and authorize. Your blog will be posted automatically after that.
                </p>
              </div>
            )}

            {/* Title Input */}
            <div>
              <label className="label flex items-center gap-2">
                Blog Title
                {title && <span className="text-xs text-surface-400">({title.length}/200)</span>}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-xl font-semibold"
                placeholder="Enter your blog title..."
                maxLength={200}
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="label flex items-center gap-2">
                Content
                <span className="text-xs text-surface-400">
                  ({content.split(/\s+/).filter(w => w.length > 0).length} words)
                </span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="textarea min-h-[400px] font-mono text-sm"
                placeholder="Start writing your blog content here...

You can write in plain text or use markdown formatting.

Tips:
• Use the AI buttons above to get title suggestions
• Click 'Improve' to enhance your writing
• Run 'SEO Check' to optimize for search engines

Remember: AI assists, but you control the final content!"
              />
            </div>

            {/* Helper text */}
            <div className="flex items-center gap-2 p-4 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800">
              <Sparkles className="w-5 h-5 text-secondary-500 shrink-0" />
              <p className="text-sm text-secondary-700 dark:text-secondary-300">
                <strong>AI Assistant:</strong> Use the buttons above to get title suggestions, 
                improve your content, or check SEO. Review all suggestions before accepting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <div className={`
        ${showAIPanel ? 'block' : 'hidden'} 
        lg:block
        fixed lg:relative right-0 top-0 h-full z-40
        bg-white dark:bg-surface-900
      `}>
        <AIPanel
          suggestions={suggestions}
          seoAnalysis={seoAnalysis}
          isLoading={aiLoading}
          loadingType={aiLoadingType}
          onAcceptTitle={handleAcceptTitle}
          onAcceptContent={handleAcceptContent}
          onRejectSuggestion={handleRejectSuggestion}
        />
      </div>

      {/* Mobile AI Panel Overlay */}
      {showAIPanel && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setShowAIPanel(false)}
        />
      )}
    </div>
  );
};

export default BlogEditor;
