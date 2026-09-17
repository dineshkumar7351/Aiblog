/**
 * Image-to-Content AI Modal Component
 * Studio modal that transforms screenshots/images into complete articles with cover image
 */

import { useState, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Sparkles, 
  X, 
  Upload, 
  RefreshCw, 
  Check, 
  Loader2, 
  ArrowRight,
  FileText,
  Tag,
  Link2,
  CheckCircle2
} from 'lucide-react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const TONES = [
  { id: 'engaging', label: '🔥 Engaging & Storytelling', desc: 'Punchy hook, journey, key lessons' },
  { id: 'professional', label: '💼 Professional & Technical', desc: 'Structured, analytical, case-study style' },
  { id: 'casual', label: '☕ Casual & Conversational', desc: 'Relatable, friendly, personal vibe' }
];

const ImageToContentModal = ({ isOpen, onClose, onApplyBlog }) => {
  const [image, setImage] = useState('');
  const [userPrompt, setUserPrompt] = useState('');
  const [tone, setTone] = useState('engaging');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setGeneratedData(null);
      toast.success('Image loaded! Ready to generate content.');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlDraft.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }
    setImage(urlDraft.trim());
    setUrlDraft('');
    setShowUrlInput(false);
    setGeneratedData(null);
    toast.success('Image URL set!');
  };

  const handleGenerate = async () => {
    if (!image && !userPrompt.trim()) {
      toast.error('Please upload an image or provide some notes');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await aiAPI.imageToContent({
        image: image || null,
        userPrompt: userPrompt.trim(),
        tone
      });

      if (response.data?.data) {
        setGeneratedData({
          ...response.data.data,
          coverImage: image || response.data.data.coverImage
        });
        toast.success('✨ Blog post generated successfully!');
      } else {
        toast.error('No content returned from AI model');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to generate content from image';
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (!generatedData) return;

    onApplyBlog({
      title: generatedData.title,
      content: generatedData.content,
      tags: generatedData.tags || [],
      coverImage: image || generatedData.coverImage
    });

    toast.success('Applied to blog editor with cover image!');
    handleClose();
  };

  const handleClose = () => {
    setGeneratedData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 flex flex-col h-[90vh] max-h-[820px] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-800/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-md shadow-primary-500/20 text-white shrink-0">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                Image-to-Content Studio
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  Multimodal AI
                </span>
              </h2>
              <p className="text-xs text-surface-500 hidden sm:block">
                Upload a screenshot, logo, or photo. AI reads the details and writes your complete article!
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 sm:p-6 overflow-y-auto flex-1 items-stretch">
          
          {/* LEFT COLUMN: Controls & Upload (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-0 lg:pr-1">
            
            {/* Step 1: Image Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider">
                  1. Image / Screenshot
                </label>
                {image && (
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Clear Image
                  </button>
                )}
              </div>

              {image ? (
                <div className="relative rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 group h-44 bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                  <img 
                    src={image} 
                    alt="Preview" 
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-surface-900 hover:bg-surface-100 transition flex items-center gap-1.5 shadow"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-1.5 shadow"
                    >
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-xl p-5 text-center hover:border-primary-500 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition cursor-pointer group flex flex-col items-center justify-center min-h-[140px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-400 group-hover:text-primary-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 flex items-center justify-center mb-2 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">
                    Click to browse or drop image here
                  </p>
                  <p className="text-[11px] text-surface-500 mt-0.5">
                    Screenshots, stats, logos, or achievements (PNG, JPG, WebP)
                  </p>
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUrlInput(!showUrlInput);
                      }}
                      className="text-[11px] text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Link2 className="w-3 h-3" /> Or enter image URL
                    </button>
                  </div>
                </div>
              )}

              <input 
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />

              {showUrlInput && !image && (
                <div className="mt-2 flex items-center gap-2 animate-fade-in">
                  <input 
                    type="url"
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="flex-1 w-full px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="btn-primary text-xs px-3.5 py-2 shrink-0 cursor-pointer"
                  >
                    Load
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: User Notes */}
            <div className="w-full">
              <label className="block text-xs font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider mb-1.5">
                2. Optional Notes / Highlights
              </label>
              <textarea
                rows={2}
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="e.g., Explain automotive logo design concepts, or share story of solving 200 DSA problems."
                className="w-full block px-3.5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-700 bg-surface-50/80 dark:bg-surface-800/80 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition resize-y"
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            {/* Step 3: Tone Selector */}
            <div>
              <label className="block text-xs font-bold text-surface-800 dark:text-surface-200 uppercase tracking-wider mb-1.5">
                3. Writing Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      tone === t.id
                        ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                        : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-surface-900 dark:text-surface-100">{t.label}</p>
                    <p className="text-[10px] text-surface-500 leading-tight mt-1 line-clamp-2">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-1 mt-auto">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || (!image && !userPrompt.trim())}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg shadow-primary-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>AI Analyzing Image & Crafting Article...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Article from Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Output Preview & Apply (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full bg-surface-50/60 dark:bg-surface-800/40 rounded-2xl border border-surface-200 dark:border-surface-700/60 p-5 overflow-y-auto">
            {generatedData ? (
              <div className="flex flex-col h-full space-y-4 animate-fade-in">
                {/* Header info */}
                <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Generated Article Ready
                    </span>
                  </div>
                  <span className="text-xs text-surface-500 font-medium">
                    {generatedData.content?.split(/\s+/).filter(Boolean).length || 0} words
                  </span>
                </div>

                {/* Title */}
                <div className="w-full space-y-1">
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300">
                    Blog Title
                  </label>
                  <input
                    type="text"
                    value={generatedData.title}
                    onChange={(e) => setGeneratedData({ ...generatedData, title: e.target.value })}
                    className="w-full block px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Content */}
                <div className="w-full flex-1 flex flex-col space-y-1 min-h-[220px]">
                  <label className="block text-xs font-bold text-surface-700 dark:text-surface-300">
                    Article Body (Markdown)
                  </label>
                  <textarea
                    value={generatedData.content}
                    onChange={(e) => setGeneratedData({ ...generatedData, content: e.target.value })}
                    className="w-full flex-1 block px-4 py-3 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm resize-y"
                    style={{ width: '100%', minHeight: '220px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Tags */}
                {generatedData.tags && generatedData.tags.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="block text-xs font-bold text-surface-600 dark:text-surface-400">
                      Hashtags & Tags
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                      {generatedData.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium shadow-2xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleApply}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer text-sm"
                  >
                    <span>Apply to Editor with Cover Image</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* Empty state placeholder */
              <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-3 my-auto">
                <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 text-primary-500 flex items-center justify-center mb-1">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-surface-800 dark:text-surface-200">
                  Live Article Preview
                </h3>
                <p className="text-xs text-surface-500 max-w-sm leading-relaxed">
                  Upload an image on the left and click <strong>"Generate Article from Image"</strong>. The full article, title, and hashtags will appear here in real-time.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-surface-400 pt-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Automatic cover image attachment</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ImageToContentModal;
