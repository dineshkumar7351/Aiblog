/**
 * Voice Studio Modal Component
 * Real-time Speech-to-Text dictation and Voice-to-Full-Article AI generation
 */

import { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  X, 
  RotateCcw, 
  Copy, 
  Check, 
  Loader2, 
  Globe, 
  Sliders, 
  FileText, 
  Tag, 
  Volume2, 
  Zap, 
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { aiAPI } from '../services/api';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-IN', label: 'English (India)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'ta-IN', label: 'Tamil (தமிழ்)' },
  { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
  { code: 'es-ES', label: 'Spanish' },
  { code: 'fr-FR', label: 'French' },
  { code: 'de-DE', label: 'German' }
];

const TONES = [
  { id: 'engaging', label: '🔥 Engaging & Viral', desc: 'Storytelling hook with punchy paragraphs' },
  { id: 'professional', label: '💼 Professional & Technical', desc: 'Authoritative, clear, and structured' },
  { id: 'casual', label: '☕ Casual & Conversational', desc: 'Friendly, relatable, easy to read' },
  { id: 'guide', label: '📚 Step-by-Step Guide', desc: 'Tutorial style with actionable steps' }
];

const LENGTHS = [
  { id: 'short', label: 'Quick Read (~400 words)' },
  { id: 'medium', label: 'Standard (~650 words)' },
  { id: 'detailed', label: 'In-Depth (~1000 words)' }
];

const VoiceStudioModal = ({ isOpen, onClose, onApplyBlog }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechLang, setSpeechLang] = useState('en-IN');
  const [tone, setTone] = useState('engaging');
  const [length, setLength] = useState('medium');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  
  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showPunctuationHelp, setShowPunctuationHelp] = useState(false);

  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const timerRef = useRef(null);
  const accumulatedTranscriptRef = useRef('');

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setGeneratedBlog(null);
      setTranscript('');
      setInterimTranscript('');
      setRecordingSeconds(0);
    }
  }, [isOpen]);

  // Handle timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Process voice punctuation
  const formatVoicePunctuation = (text) => {
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

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      accumulatedTranscriptRef.current = transcript;

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
        toast.success('Microphone active — speak your thoughts naturally!', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';
          if (result.isFinal) {
            currentFinal += text + ' ';
          } else {
            currentInterim += text;
          }
        }

        if (currentFinal) {
          const formatted = formatVoicePunctuation(currentFinal);
          const updated = (accumulatedTranscriptRef.current ? accumulatedTranscriptRef.current + ' ' : '') + formatted.trim();
          accumulatedTranscriptRef.current = updated;
          setTranscript(updated);
        }

        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please allow microphone access in your browser address bar.');
          stopRecording();
        } else if (event.error === 'network') {
          toast.error('Network error during speech recognition. Please check your internet.');
          stopRecording();
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Restart recognition failed', e);
            setIsRecording(false);
          }
        } else {
          setIsRecording(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start error:', err);
      toast.error('Could not start microphone: ' + err.message);
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    setInterimTranscript('');
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleGenerateBlog = async () => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText || fullText.length < 15) {
      toast.error('Please record or speak at least a sentence before generating!');
      return;
    }

    stopRecording();
    setIsGenerating(true);
    setGenerationStep('Analyzing spoken thoughts & removing fillers...');

    try {
      setTimeout(() => setGenerationStep('Structuring article outline and markdown headings...'), 1200);
      setTimeout(() => setGenerationStep('Drafting engaging content and SEO tags...'), 2600);

      const response = await aiAPI.voiceToBlog({
        transcript: fullText,
        tone,
        length,
        language: LANGUAGES.find(l => l.code === speechLang)?.label || 'English'
      });

      if (response.data?.success && response.data?.data) {
        setGeneratedBlog(response.data.data);
        toast.success('🎉 Full article generated from your voice!', { icon: '✨' });
      } else {
        throw new Error(response.data?.message || 'Failed to generate blog');
      }
    } catch (err) {
      console.error('Voice to blog generation error:', err);
      toast.error(err.response?.data?.message || err.message || 'AI generation failed');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApply = () => {
    if (!generatedBlog) return;
    if (onApplyBlog) {
      onApplyBlog({
        title: generatedBlog.title,
        content: generatedBlog.content,
        tags: generatedBlog.tags || []
      });
    }
    toast.success('Applied to editor!');
    onClose();
  };

  const handleCopyMarkdown = () => {
    if (!generatedBlog) return;
    const fullMarkdown = `# ${generatedBlog.title}\n\n${generatedBlog.content}`;
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    toast.success('Markdown copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100">
                  Voice-to-Blog AI Studio
                </h2>
                <span className="badge badge-primary text-[10px] px-2 py-0.5 uppercase tracking-wide font-semibold">
                  Real-Time
                </span>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                Speak your ideas freely $\rightarrow$ AI crafts a structured publication-ready article
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Controls Bar: Language, Tone, Length */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
            <div>
              <label className="text-xs font-semibold text-surface-600 dark:text-surface-300 flex items-center gap-1.5 mb-1.5">
                <Globe className="w-3.5 h-3.5 text-primary-500" />
                Spoken Language
              </label>
              <select
                value={speechLang}
                onChange={(e) => {
                  setSpeechLang(e.target.value);
                  if (isRecording) stopRecording();
                }}
                disabled={isRecording || isGenerating}
                className="select select-sm w-full text-xs font-medium"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-surface-600 dark:text-surface-300 flex items-center gap-1.5 mb-1.5">
                <Sliders className="w-3.5 h-3.5 text-secondary-500" />
                Article Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isGenerating}
                className="select select-sm w-full text-xs font-medium"
              >
                {TONES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-surface-600 dark:text-surface-300 flex items-center gap-1.5 mb-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                Target Length
              </label>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={isGenerating}
                className="select select-sm w-full text-xs font-medium"
              >
                {LENGTHS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recording & Dictation Section */}
          <div className="relative rounded-2xl p-5 border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/40">
            
            {/* Center Mic Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 mb-4 border-b border-surface-200 dark:border-surface-700/60">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isGenerating}
                  className={`
                    relative group flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 shadow-xl
                    ${isRecording 
                      ? 'bg-red-500 hover:bg-red-600 text-white ring-4 ring-red-500/30 animate-pulse' 
                      : 'bg-gradient-to-tr from-primary-600 to-secondary-600 hover:scale-105 text-white shadow-primary-500/30'
                    }
                  `}
                  title={isRecording ? 'Click to stop recording' : 'Click to start speaking'}
                >
                  {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-surface-400'}`} />
                    <span className="text-sm font-bold text-surface-900 dark:text-surface-100">
                      {isRecording ? 'Listening live...' : transcript ? 'Voice recorded' : 'Ready to record'}
                    </span>
                    {isRecording && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold">
                        {formatTimer(recordingSeconds)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">
                    {isRecording 
                      ? 'Speak your thoughts, story, or article outline...' 
                      : 'Click the microphone button to start dictating'}
                  </p>
                </div>
              </div>

              {/* Status Counters & Tools */}
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-surface-200/70 dark:bg-surface-700/70 text-surface-700 dark:text-surface-300 font-medium">
                  {wordCount} words
                </span>
                
                <button
                  type="button"
                  onClick={() => setShowPunctuationHelp(!showPunctuationHelp)}
                  className="px-2.5 py-1 rounded-lg text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 font-medium flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Voice Commands
                </button>

                {transcript && (
                  <button
                    type="button"
                    onClick={() => {
                      setTranscript('');
                      setInterimTranscript('');
                      setGeneratedBlog(null);
                      setRecordingSeconds(0);
                    }}
                    className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition"
                    title="Clear transcript"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Voice Punctuation Cheat Sheet */}
            {showPunctuationHelp && (
              <div className="mb-4 p-3 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/50 text-xs text-primary-900 dark:text-primary-200 space-y-1.5 animate-slide-down">
                <p className="font-semibold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  Spoken Voice Shortcuts (automatically converts as you speak):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div>• Say <strong>"period"</strong> $\rightarrow$ <code>.</code></div>
                  <div>• Say <strong>"comma"</strong> $\rightarrow$ <code>,</code></div>
                  <div>• Say <strong>"new line"</strong> $\rightarrow$ ↵</div>
                  <div>• Say <strong>"new paragraph"</strong> $\rightarrow$ ↵↵</div>
                </div>
              </div>
            )}

            {/* Spoken Transcript Area */}
            <div className="relative">
              <textarea
                value={transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '')}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  accumulatedTranscriptRef.current = e.target.value;
                }}
                placeholder="Your spoken words will appear here in real time... You can also edit or type directly here anytime."
                rows={4}
                className="textarea w-full text-sm leading-relaxed font-sans resize-none"
              />
              
              {isRecording && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1 text-red-500 text-xs font-semibold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Transcribing...
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-surface-500">
                Tip: Speak naturally for 30–60 seconds for rich, detailed blog output.
              </p>

              <button
                type="button"
                onClick={handleGenerateBlog}
                disabled={isGenerating || (!transcript.trim() && !interimTranscript.trim())}
                className="btn-primary btn-md gap-2 shadow-lg shadow-primary-500/25 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Full Article...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Transform into Full Blog with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Generating Indicator */}
          {isGenerating && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-transparent border border-primary-200 dark:border-primary-800 text-center space-y-3 animate-pulse">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30 animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-surface-900 dark:text-surface-100">
                {generationStep || 'AI is transforming your voice into a full article...'}
              </h3>
              <p className="text-xs text-surface-500 max-w-md mx-auto">
                Formatting headings, cleaning verbal fillers, writing markdown, and creating SEO tags.
              </p>
            </div>
          )}

          {/* Generated Result Preview */}
          {generatedBlog && !isGenerating && (
            <div className="space-y-4 rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20 animate-slide-up">
              <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-700/60 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-surface-900 dark:text-surface-100 text-sm sm:text-base">
                    Generated Article Preview
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyMarkdown}
                    className="btn-outline btn-sm gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="text-xs">{copied ? 'Copied' : 'Copy MD'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="btn-primary btn-sm gap-1.5 shadow-md shadow-primary-500/20"
                  >
                    <span>Apply to Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title Preview */}
              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={generatedBlog.title}
                  onChange={(e) => setGeneratedBlog({ ...generatedBlog, title: e.target.value })}
                  className="input input-sm w-full font-bold text-surface-900 dark:text-surface-100"
                />
              </div>

              {/* Content Preview */}
              <div>
                <label className="text-xs font-semibold text-surface-500 uppercase tracking-wider block mb-1">
                  Markdown Content
                </label>
                <textarea
                  value={generatedBlog.content}
                  onChange={(e) => setGeneratedBlog({ ...generatedBlog, content: e.target.value })}
                  rows={8}
                  className="textarea w-full font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Tags Preview */}
              {generatedBlog.tags && generatedBlog.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <Tag className="w-3.5 h-3.5 text-surface-400" />
                  {generatedBlog.tags.map((tag, idx) => (
                    <span key={idx} className="badge badge-secondary text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost btn-sm"
          >
            Close
          </button>

          {generatedBlog && (
            <button
              type="button"
              onClick={handleApply}
              className="btn-primary btn-sm gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Use this in My Blog</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default VoiceStudioModal;
