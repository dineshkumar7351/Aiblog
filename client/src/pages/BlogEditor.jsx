/**
 * Blog Editor Page
 * Main editor with AI assistance panel and LinkedIn sharing
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { blogAPI, aiAPI, linkedinAPI } from '../services/api';
import AIPanel from '../components/AIPanel';
import VoiceStudioModal from '../components/VoiceStudioModal';
import ImageToContentModal from '../components/ImageToContentModal';
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
  Loader2, 
  Mic, 
  MicOff,
  Image as ImageIcon,
  Upload,
  RefreshCw,
  X as XIcon,
  Link2
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
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [seoScore, setSeoScore] = useState(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [imageUrlDraft, setImageUrlDraft] = useState('');
  const fileInputRef = useRef(null);

  // LinkedIn state
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [linkedinToggle, setLinkedinToggle] = useState(true);
  const [checkingLinkedin, setCheckingLinkedin] = useState(true);

  // AI Panel state
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiLoadingType, setAiLoadingType] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [seoAnalysis, setSeoAnalysis] = useState(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [listeningTarget, setListeningTarget] = useState(null); // 'title' or 'content'
  const [speechLang, setSpeechLang] = useState('en-IN'); // 'en-IN', 'en-US', 'ta-IN', 'hi-IN'
  const [recognitionInstance, setRecognitionInstance] = useState(null);
  
  const baselineTextRef = useRef('');
  const finalTranscriptRef = useRef('');
  const isListeningRef = useRef(false);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const contentTextareaRef = useRef(null);

  // Sync state to refs to prevent closure issues in speech callbacks
  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Handle toggling Speech Recognition
  const toggleListening = (target) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      isListeningRef.current = false;
      if (recognitionInstance) {
        try {
          recognitionInstance.stop();
        } catch {}
      }
      setIsListening(false);
      setListeningTarget(null);
      finalTranscriptRef.current = '';
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      // Set the initial baseline text right before starting recognition
      baselineTextRef.current = target === 'title' ? titleRef.current : contentRef.current;
      finalTranscriptRef.current = '';
      isListeningRef.current = true;

      recognition.onstart = () => {
        setIsListening(true);
        setListeningTarget(target);
        const langName = speechLang === 'ta-IN' ? 'Tamil' : speechLang === 'hi-IN' ? 'Hindi' : 'English';
        toast.success(`Microphone active in ${langName} - speak now!`, { icon: '🎙️' });
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition status/error:', event.error);
        if (event.error === 'no-speech') {
          // Normal pause in speaking - do not abort or stop listening!
          return;
        }
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please click the camera/mic icon in your address bar to allow microphone access.');
          isListeningRef.current = false;
          setIsListening(false);
          setListeningTarget(null);
          finalTranscriptRef.current = '';
          return;
        }
        if (event.error === 'network') {
          toast.error('Speech recognition network timeout. Reconnecting...');
          return;
        }
        if (event.error !== 'aborted') {
          console.error(`Speech recognition error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        // If user is still in listening mode, smoothly restart recognition after short delay
        if (isListeningRef.current) {
          baselineTextRef.current = target === 'title' ? titleRef.current : contentRef.current;
          finalTranscriptRef.current = '';
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch (e) {
                // If already active or starting, ignore error
                console.log('Recognition restart status:', e.message);
              }
            }
          }, 150);
        } else {
          setIsListening(false);
          setListeningTarget(null);
          finalTranscriptRef.current = '';
        }
      };

      const formatPunctuation = (text) => {
        return text
          .replace(/\b(full stop|period|dot)\b/gi, '.')
          .replace(/\bcomma\b/gi, ',')
          .replace(/\b(question mark)\b/gi, '?')
          .replace(/\b(exclamation mark|exclamation point)\b/gi, '!')
          .replace(/\b(new line)\b/gi, '\n')
          .replace(/\b(new paragraph)\b/gi, '\n\n')
          .replace(/\b(colon)\b/gi, ':')
          .replace(/\b(semicolon)\b/gi, ';');
      };

      recognition.onresult = (event) => {
        try {
          let interimText = '';
          let newFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0]?.transcript || '';
            if (result.isFinal) {
              newFinal += text + ' ';
            } else {
              interimText += text;
            }
          }

          if (newFinal) {
            finalTranscriptRef.current += formatPunctuation(newFinal);
          }

          const currentSpoken = (finalTranscriptRef.current + interimText).trim();
          const base = baselineTextRef.current || '';
          const separator = base && currentSpoken && !base.endsWith('\n') && !base.endsWith(' ') ? ' ' : '';
          const fullResult = base + separator + currentSpoken;

          if (target === 'title') {
            setTitle(fullResult);
          } else if (target === 'content') {
            setContent(fullResult);
            if (contentTextareaRef.current) {
              contentTextareaRef.current.scrollTop = contentTextareaRef.current.scrollHeight;
            }
          }
        } catch (err) {
          console.error("Error transcribing result:", err);
        }
      };

      recognition.start();
      setRecognitionInstance(recognition);
    }
  };

  // Handle applying a full blog generated from Voice Studio
  const handleApplyVoiceBlog = ({ title: newTitle, content: newContent, coverImage: newCover }) => {
    if (newTitle) setTitle(newTitle);
    if (newContent) setContent(newContent);
    if (newCover) setCoverImage(newCover);
    toast.success('Voice article imported! Analyzing SEO...', { icon: '✨' });

    setTimeout(() => {
      if (newContent) {
        aiAPI.seoCheck(newContent, newTitle || title)
          .then(res => {
            if (res.data?.success && res.data?.data) {
              setSeoAnalysis(res.data.data);
              setSeoScore(res.data.data.score);
            }
          })
          .catch(() => {});
      }
    }, 600);
  };

  // Generate AI Cover Image
  const handleGenerateCoverImage = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error('Please enter a title or content first to generate an AI cover image!');
      return;
    }
    setImageGenerating(true);
    try {
      const response = await aiAPI.generateCoverImage({
        title: title.trim() || 'Modern Technology',
        content: content.trim()
      });
      if (response.data?.success && response.data?.data?.imageUrl) {
        setCoverImage(response.data.data.imageUrl);
        toast.success('🎨 AI Cover image generated successfully!');
      }
    } catch (err) {
      toast.error('Failed to generate image. Please try again or paste an image URL.');
    } finally {
      setImageGenerating(false);
    }
  };

  // Handle local image file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result);
      toast.success('Cover image attached!');
    };
    reader.readAsDataURL(file);
  };

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
      setCoverImage(blog.coverImage || '');
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
        coverImage: coverImage || null,
        status: publishStatus,
        seoScore
      };

      let response;

      if (isEditing) {
        response = await blogAPI.update(id, blogData);
        toast.success(publishStatus === 'published' ? 'Blog published with image & content!' : 'Blog updated!');
      } else {
        response = await blogAPI.create(blogData);
        toast.success(publishStatus === 'published' ? 'Blog published with image & content!' : 'Blog saved as draft!');
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



  // Apply image-generated blog with cover image
  const handleApplyImageBlog = ({ title: newTitle, content: newContent, coverImage: newCover }) => {
    if (newTitle) setTitle(newTitle);
    if (newContent) setContent(newContent);
    if (newCover) setCoverImage(newCover);
    setShowImageStudio(false);
    toast.success('Image blog & cover applied to editor!');
  };

  // AI: Suggest Titles
  const handleSuggestTitle = async () => {
    if (content.trim().length < 50) {
      toast.error('Please write at least 50 characters of content first');
      return;
    }

    setShowAIPanel(true);
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

    setShowAIPanel(true);
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

    setShowAIPanel(true);
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
    <div className="flex h-full w-full max-w-full min-w-0 overflow-hidden relative">
      {/* Editor Panel */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 gap-2 min-w-0 w-full shrink-0">
          {/* Left: Back + Title & Status */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 sm:p-2 rounded-lg text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0 truncate">
              <h1 className="text-sm sm:text-base font-bold text-surface-900 dark:text-surface-100 truncate leading-tight">
                {isEditing ? 'Edit Blog' : 'Write New Blog'}
              </h1>
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-surface-500 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1 font-medium ${status === 'published' ? 'text-emerald-600' : 'text-surface-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'published' ? 'bg-emerald-500' : 'bg-surface-400'}`} />
                  {status === 'published' ? 'Published' : 'Draft'}
                </span>
                {seoScore && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-primary-600 dark:text-primary-400">SEO: {seoScore}/100</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions Toolbar */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Studios (Image & Voice) */}
            <div className="flex items-center gap-1 sm:gap-1.5 pr-1 sm:pr-1.5 border-r border-surface-200 dark:border-surface-700">
              <button
                type="button"
                onClick={() => setShowImageStudio(true)}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 transition shadow-sm whitespace-nowrap cursor-pointer h-8"
                title="Upload an image/screenshot and let AI write a full blog post"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Image AI</span>
              </button>
              <button
                type="button"
                onClick={() => setShowVoiceStudio(true)}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-primary-500/15 via-secondary-500/15 to-primary-500/15 text-primary-600 dark:text-primary-400 border border-primary-500/30 hover:bg-primary-500/25 transition shadow-sm whitespace-nowrap cursor-pointer h-8"
                title="Speak your thoughts to generate complete article"
              >
                <Mic className="w-3.5 h-3.5 text-primary-500 animate-pulse" />
                <span className="hidden sm:inline">Voice</span>
              </button>
            </div>

            {/* AI Assistant Quick Actions */}
            <div className="flex items-center gap-1 pr-1 sm:pr-1.5 border-r border-surface-200 dark:border-surface-700">
              <button
                onClick={handleSuggestTitle}
                disabled={aiLoading}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition whitespace-nowrap h-8 cursor-pointer disabled:opacity-50"
                title="Get AI title suggestions"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden 2xl:inline">Titles</span>
              </button>
              <button
                onClick={handleImproveContent}
                disabled={aiLoading}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition whitespace-nowrap h-8 cursor-pointer disabled:opacity-50"
                title="Improve content with AI"
              >
                <Wand2 className="w-3.5 h-3.5 text-secondary-500" />
                <span className="hidden 2xl:inline">Improve</span>
              </button>
              <button
                onClick={handleSEOCheck}
                disabled={aiLoading}
                className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-lg text-xs font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition whitespace-nowrap h-8 cursor-pointer disabled:opacity-50"
                title="Check SEO score"
              >
                <Search className="w-3.5 h-3.5 text-primary-500" />
                <span className="hidden 2xl:inline">SEO</span>
              </button>
            </div>

            {/* LinkedIn Toggle */}
            <button
              onClick={handleLinkedinToggle}
              disabled={checkingLinkedin}
              className={`
                inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap
                transition-all duration-200 cursor-pointer h-8 shrink-0
                ${linkedinToggle 
                  ? linkedinConnected
                    ? 'bg-[#0A66C2]/10 text-[#0A66C2] border border-[#0A66C2]/30 hover:bg-[#0A66C2]/20' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                  : 'bg-surface-100 text-surface-500 border border-surface-200 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:border-surface-700'
                }
              `}
              title={linkedinToggle ? (linkedinConnected ? 'LinkedIn Connected' : 'LinkedIn Not Connected') : 'Turn LinkedIn sharing ON'}
            >
              {checkingLinkedin ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Linkedin className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {checkingLinkedin ? 'Checking' : linkedinToggle ? (linkedinConnected ? 'LinkedIn ✓' : 'LinkedIn') : 'LinkedIn Off'}
              </span>
            </button>

            {/* Save Draft */}
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition whitespace-nowrap shrink-0 h-8 cursor-pointer disabled:opacity-50"
              title="Save Draft"
            >
              <Save className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Draft</span>
            </button>

            {/* Publish */}
            <button
              onClick={() => handleSave('published')}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-md shadow-primary-500/20 transition whitespace-nowrap shrink-0 h-8 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Publish</span>
            </button>

            {/* Toggle AI Panel Button */}
            <button
              onClick={() => setShowAIPanel(!showAIPanel)}
              className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap shrink-0 h-8 cursor-pointer ${
                showAIPanel
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-sm'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 border border-surface-200 dark:border-surface-700'
              }`}
              title={showAIPanel ? "Close AI Copilot Panel" : "Open AI Copilot Panel"}
            >
              {showAIPanel ? (
                <PanelRightClose className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
              <span className="hidden lg:inline">{showAIPanel ? 'Hide AI' : 'AI Copilot'}</span>
            </button>
          </div>
        </div>

        {/* Mobile AI Tools + LinkedIn Toggle */}
        <div className="md:hidden flex items-center gap-2 p-3 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50 overflow-x-auto">
          <button
            type="button"
            onClick={() => setShowVoiceStudio(true)}
            className="btn-primary btn-sm shrink-0 gap-1 text-xs"
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Studio
          </button>
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 bg-surface-50 dark:bg-surface-950">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-5">
            {/* LinkedIn Info Banner */}
            {linkedinToggle && !linkedinConnected && !checkingLinkedin && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0A66C2]/5 border border-[#0A66C2]/20">
                <Linkedin className="w-4 h-4 text-[#0A66C2] shrink-0" />
                <p className="text-xs sm:text-sm text-[#0A66C2] dark:text-blue-300">
                  <strong>LinkedIn sharing enabled.</strong> When you click Publish, you'll be redirected to LinkedIn to login and authorize. Your blog will be posted automatically after that.
                </p>
              </div>
            )}

            {/* Featured / Cover Image Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="label flex items-center gap-2 mb-0">
                  <ImageIcon className="w-4 h-4 text-primary-500" />
                  <span>Cover / Featured Image</span>
                </label>
                
                {coverImage && (
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium transition cursor-pointer"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                    Remove Image
                  </button>
                )}
              </div>

              {coverImage ? (
                <div className="relative group rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800 shadow-md">
                  <img
                    src={coverImage}
                    alt="Blog Cover"
                    className="w-full h-36 sm:h-44 md:h-48 max-h-52 object-cover object-center transition-transform duration-300 group-hover:scale-[1.01]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                    <span className="text-xs text-white/90 font-medium">Cover image will be published with content</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleGenerateCoverImage}
                        disabled={imageGenerating}
                        className="btn-sm btn-primary text-xs flex items-center gap-1.5 shadow-lg"
                      >
                        {imageGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span>Regenerate AI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-sm btn-outline bg-white/90 dark:bg-surface-900/90 text-xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-2xl p-4 sm:p-5 text-center bg-surface-50/50 dark:bg-surface-800/30 hover:border-primary-500/50 transition">
                  <div className="max-w-md mx-auto space-y-2.5">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-tr from-primary-500/10 to-secondary-500/10 text-primary-500 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                        Post Content & Image Together
                      </h4>
                      <p className="text-xs text-surface-500 mt-0.5">
                        Generate a banner with AI or upload your own photo.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleGenerateCoverImage}
                        disabled={imageGenerating}
                        className="btn-primary btn-sm gap-1.5 shadow-md shadow-primary-500/20 text-xs cursor-pointer"
                      >
                        {imageGenerating ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating Image...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>✨ AI Generate Cover</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-outline btn-sm gap-1.5 text-xs cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="btn-ghost btn-sm gap-1.5 text-xs text-surface-600 dark:text-surface-400 cursor-pointer"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Paste URL</span>
                      </button>
                    </div>

                    {showUrlInput && (
                      <div className="flex items-center gap-2 pt-2 animate-slide-down">
                        <input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrlDraft}
                          onChange={(e) => setImageUrlDraft(e.target.value)}
                          className="input input-sm text-xs flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (imageUrlDraft.trim()) {
                              setCoverImage(imageUrlDraft.trim());
                              setImageUrlDraft('');
                              setShowUrlInput(false);
                              toast.success('Cover image set!');
                            }
                          }}
                          className="btn-primary btn-sm text-xs"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="label flex items-center gap-2">
                Blog Title
                {title && <span className="text-xs text-surface-400">({title.length}/200)</span>}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input text-xl font-semibold w-full pr-24"
                  placeholder="Enter your blog title..."
                  maxLength={200}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-white dark:bg-surface-900 px-1.5 py-1 rounded-md border border-surface-200/60 dark:border-surface-800 shadow-sm">
                  {isListening && listeningTarget === 'title' && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                  <select
                    value={speechLang}
                    onChange={(e) => setSpeechLang(e.target.value)}
                    className="text-[10px] uppercase font-bold tracking-wider bg-surface-50 dark:bg-surface-800 border-none rounded px-1.5 py-0.5 text-surface-500 dark:text-surface-400 cursor-pointer focus:ring-0"
                    title="Select Dictation Language"
                  >
                    <option value="en-IN">EN (IN)</option>
                    <option value="en-US">EN (US)</option>
                    <option value="ta-IN">TA (தமிழ்)</option>
                    <option value="hi-IN">HI (हिन्दी)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleListening('title')}
                    disabled={isListening && listeningTarget !== 'title'}
                    className={`p-1.5 rounded-md transition-all duration-200 ${
                      isListening && listeningTarget === 'title'
                        ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:text-surface-300'
                    }`}
                    title={isListening && listeningTarget === 'title' ? 'Stop Listening' : 'Dictate Title'}
                  >
                    {isListening && listeningTarget === 'title' ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label flex items-center gap-2 mb-0">
                  <span>Content</span>
                  <span className="text-xs text-surface-400">
                    ({content.split(/\s+/).filter(w => w.length > 0).length} words)
                  </span>
                </label>

                {isListening && listeningTarget === 'content' && (
                  <span className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    <span>Dictating Live... Speak now</span>
                  </span>
                )}
              </div>

              <div className="relative">
                <textarea
                  ref={contentTextareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`textarea min-h-[220px] sm:min-h-[280px] font-mono text-sm w-full pb-14 resize-y transition-all duration-200 ${
                    isListening && listeningTarget === 'content'
                      ? 'ring-2 ring-rose-500/40 border-rose-500 shadow-lg shadow-rose-500/5'
                      : ''
                  }`}
                  placeholder="Start writing or speaking your blog content here...

You can write in plain text, use markdown, or click the mic to speak!

Spoken Shortcuts:
• Say 'period' or 'full stop' for .
• Say 'comma' for ,
• Say 'new line' or 'new paragraph' to start new sections"
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-white/95 dark:bg-surface-900/95 backdrop-blur border border-surface-200 dark:border-surface-800 shadow-md rounded-lg px-2.5 py-1.5">
                  {isListening && listeningTarget === 'content' && (
                    <span className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-pulse mr-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                      Recording
                    </span>
                  )}
                  <select
                    value={speechLang}
                    onChange={(e) => setSpeechLang(e.target.value)}
                    className="text-[10px] uppercase font-bold tracking-wider bg-surface-50 dark:bg-surface-800 border-none rounded px-1.5 py-0.5 text-surface-500 dark:text-surface-400 cursor-pointer focus:ring-0"
                    title="Select Dictation Language"
                  >
                    <option value="en-IN">EN (IN)</option>
                    <option value="en-US">EN (US)</option>
                    <option value="ta-IN">TA (தமிழ்)</option>
                    <option value="hi-IN">HI (हिन्दी)</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => toggleListening('content')}
                    disabled={isListening && listeningTarget !== 'content'}
                    className={`p-1.5 rounded-md transition-all duration-200 cursor-pointer ${
                      isListening && listeningTarget === 'content'
                        ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/20 animate-pulse'
                        : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 hover:text-surface-600 dark:text-surface-300'
                    }`}
                    title={isListening && listeningTarget === 'content' ? 'Stop Listening' : 'Click to Speak into Content'}
                  >
                    {isListening && listeningTarget === 'content' ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Helper text */}
            <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-500 shrink-0" />
              <p className="text-xs sm:text-sm text-secondary-700 dark:text-secondary-300">
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
        fixed lg:relative right-0 top-0 h-full z-40
        w-72 lg:w-80 shrink-0
        bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 shadow-2xl lg:shadow-none
        transition-all duration-200
      `}>
        <AIPanel
          suggestions={suggestions}
          seoAnalysis={seoAnalysis}
          isLoading={aiLoading}
          loadingType={aiLoadingType}
          onAcceptTitle={handleAcceptTitle}
          onAcceptContent={handleAcceptContent}
          onRejectSuggestion={handleRejectSuggestion}
          onOpenVoiceStudio={() => setShowVoiceStudio(true)}
          onClose={() => setShowAIPanel(false)}
        />
      </div>

      {/* Screen Overlay when AI panel is open on screens < lg */}
      {showAIPanel && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-30 lg:hidden"
          onClick={() => setShowAIPanel(false)}
        />
      )}

      {/* Voice-to-Article AI Studio Modal */}
      <VoiceStudioModal
        isOpen={showVoiceStudio}
        onClose={() => setShowVoiceStudio(false)}
        onApplyBlog={handleApplyVoiceBlog}
      />

      {/* Image-to-Article AI Studio Modal */}
      <ImageToContentModal
        isOpen={showImageStudio}
        onClose={() => setShowImageStudio(false)}
        onApplyBlog={handleApplyImageBlog}
      />
    </div>
  );
};

export default BlogEditor;
