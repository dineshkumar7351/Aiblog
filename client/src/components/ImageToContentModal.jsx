/**
 * Image-to-Content AI Modal Component
 * Turns uploaded images/screenshots into complete, formatted blog posts with cover image
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
  Link2
} from 'lucide-react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const TONES = [
  { id: 'engaging', label: '🔥 Engaging & Storytelling', desc: 'Punchy hook, journey, key lessons' },
  { id: 'professional', label: '💼 Professional & Technical', desc: 'Structured, analytical, metrics-focused' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200 dark:border-surface-800 bg-gradient-to-r from-primary-500/5 to-indigo-500/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-md shadow-primary-500/20 text-white">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                Image to Content AI
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  Multimodal
                </span>
              </h2>
              <p className="text-xs text-surface-500">
                Upload a screenshot or photo. AI reads the metrics & writes your blog post!
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-2">
              1. Upload Screenshot or Image
            </label>

            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 group max-h-56 bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <img 
                  src={image} 
                  alt="Uploaded preview" 
                  className="w-full max-h-56 object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/90 text-surface-900 hover:bg-white transition flex items-center gap-1.5 shadow"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Change Image
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
                className="border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-xl p-6 text-center hover:border-primary-500 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 transition cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-800 text-surface-400 group-hover:text-primary-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 flex items-center justify-center mx-auto mb-2 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                  Click or drag image here
                </p>
                <p className="text-xs text-surface-500 mt-1">
                  LeetCode stats, code, certificates, graphs, or milestones (PNG, JPG, WebP up to 5MB)
                </p>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUrlInput(!showUrlInput);
                    }}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    <Link2 className="w-3 h-3" /> Or paste image link
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
                  placeholder="https://example.com/screenshot.png"
                  className="flex-1 px-3 py-2 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="btn-primary text-xs px-3.5 py-2 shrink-0"
                >
                  Load
                </button>
              </div>
            )}
          </div>

          {/* User Guidance / Context Input */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
              2. Optional Notes / Highlights
            </label>
            <textarea
              rows={2}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="e.g., Solved 200 DSA problems in 100 days. Emphasize consistency, problem-solving mindset, and Java solutions."
              className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 placeholder:text-surface-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition shadow-sm resize-y"
            />
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300 uppercase tracking-wider mb-1.5">
              3. Select Writing Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    tone === t.id
                      ? 'border-primary-500 bg-primary-50/40 dark:bg-primary-900/20 ring-1 ring-primary-500'
                      : 'border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-800'
                  }`}
                >
                  <p className="text-xs font-bold text-surface-900 dark:text-surface-100">{t.label}</p>
                  <p className="text-[10px] text-surface-500 leading-tight mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || (!image && !userPrompt.trim())}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary-600 via-indigo-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 shadow-lg shadow-primary-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI Analyzing Image & Crafting Post...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate Article from Image</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview */}
          {generatedData && (
            <div className="mt-4 p-5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/25 space-y-4 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60 dark:border-emerald-900/50">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Ready to Apply
                </span>
                <span className="text-xs font-medium text-surface-500">
                  {generatedData.content?.split(/\s+/).filter(Boolean).length || 0} words
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                  Title:
                </label>
                <input
                  type="text"
                  value={generatedData.title}
                  onChange={(e) => setGeneratedData({ ...generatedData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm"
                  placeholder="Blog post title"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
                  Content Preview:
                </label>
                <textarea
                  rows={8}
                  value={generatedData.content}
                  onChange={(e) => setGeneratedData({ ...generatedData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition shadow-sm resize-y"
                  placeholder="Generated article content..."
                />
              </div>

              {generatedData.tags && generatedData.tags.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="block text-xs font-semibold text-surface-600 dark:text-surface-400">
                    Hashtags:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3.5 h-3.5 text-surface-400" />
                    {generatedData.tags.map((tag, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 font-medium shadow-2xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 cursor-pointer text-sm"
                >
                  <span>Apply to Editor with Cover Image</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToContentModal;
