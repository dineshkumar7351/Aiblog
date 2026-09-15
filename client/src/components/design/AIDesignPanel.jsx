/**
 * AI Design Panel Component
 * AI-powered design generation using Groq/AI service
 */

import { useState } from 'react';
import { Sparkles, Loader2, Wand2, RefreshCw, Image, Type, Palette } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiAPI } from '../../services/api';

const promptSuggestions = [
  'Modern tech startup landing page with blue gradient',
  'Elegant wedding invitation with floral borders',
  'Bold social media post for a fitness brand',
  'Minimalist portfolio layout with geometric shapes',
  'Festive holiday card with snow and presents',
  'Professional business card design',
  'Retro 80s neon aesthetic poster',
  'Clean and modern food menu layout',
];

const stylePresets = [
  { id: 'modern', label: 'Modern', icon: '🎨' },
  { id: 'minimal', label: 'Minimal', icon: '⬜' },
  { id: 'bold', label: 'Bold', icon: '💪' },
  { id: 'elegant', label: 'Elegant', icon: '✨' },
  { id: 'playful', label: 'Playful', icon: '🎉' },
  { id: 'professional', label: 'Professional', icon: '💼' },
];

const colorSchemes = [
  { id: 'vibrant', label: 'Vibrant', colors: ['#ff6b6b', '#feca57', '#48dbfb'] },
  { id: 'pastel', label: 'Pastel', colors: ['#ffeaa7', '#dfe6e9', '#fab1a0'] },
  { id: 'dark', label: 'Dark', colors: ['#2d3436', '#636e72', '#b2bec3'] },
  { id: 'nature', label: 'Nature', colors: ['#00b894', '#00cec9', '#a29bfe'] },
  { id: 'warm', label: 'Warm', colors: ['#e17055', '#fdcb6e', '#e84393'] },
  { id: 'cool', label: 'Cool', colors: ['#74b9ff', '#0984e3', '#6c5ce7'] },
];

const AIDesignPanel = ({ onApplyTemplate, onAddText, onAddImage, canvasSize }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  const [selectedColorScheme, setSelectedColorScheme] = useState('vibrant');
  const [generatedDesigns, setGeneratedDesigns] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a design description');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI design generation (in production, call actual AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedColors = colorSchemes.find(c => c.id === selectedColorScheme)?.colors || [];
      
      // Generate design based on prompt and style
      const designObject = {
        id: Date.now(),
        name: prompt.slice(0, 30),
        backgroundColor: selectedColors[0] || '#ffffff',
        objects: [
          {
            type: 'rect',
            left: 0,
            top: 0,
            width: canvasSize.width,
            height: canvasSize.height,
            fill: `linear-gradient(135deg, ${selectedColors[0]} 0%, ${selectedColors[1]} 100%)`,
            selectable: false,
          },
          {
            type: 'text',
            text: 'AI Generated Design',
            left: canvasSize.width / 2 - 150,
            top: canvasSize.height / 2 - 20,
            fontSize: 36,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            fill: '#ffffff',
          },
        ],
      };

      setGeneratedDesigns(prev => [designObject, ...prev].slice(0, 6));
      
      // Auto-apply the generated design
      onApplyTemplate(designObject);
      
      toast.success('Design generated!');
    } catch (error) {
      toast.error('Failed to generate design');
      console.error('AI generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setPrompt(suggestion);
  };

  const shuffleSuggestion = () => {
    const randomIndex = Math.floor(Math.random() * promptSuggestions.length);
    setPrompt(promptSuggestions[randomIndex]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
              AI Design Generator
            </h3>
            <p className="text-xs text-surface-500">Powered by AI</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Prompt Input */}
        <div className="mb-4">
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2 block">
            Describe your design
          </label>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A colorful poster for a summer music festival..."
              className="w-full h-24 px-3 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 border-none text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500 resize-none"
            />
            <button
              onClick={shuffleSuggestion}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600"
              title="Random suggestion"
            >
              <RefreshCw className="w-4 h-4 text-surface-500" />
            </button>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mb-4">
          <p className="text-xs text-surface-500 mb-2">Try these:</p>
          <div className="flex flex-wrap gap-1.5">
            {promptSuggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-[10px] text-surface-600 dark:text-surface-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
              >
                {suggestion.slice(0, 25)}...
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div className="mb-4">
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2 block">
            Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {stylePresets.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`p-2 rounded-lg text-center transition-colors ${
                  selectedStyle === style.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 ring-2 ring-primary-500'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                <span className="text-xl">{style.icon}</span>
                <p className="text-[10px] font-medium mt-1">{style.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color Scheme */}
        <div className="mb-6">
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2 block">
            Color Scheme
          </label>
          <div className="grid grid-cols-2 gap-2">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setSelectedColorScheme(scheme.id)}
                className={`p-2 rounded-lg flex items-center gap-2 transition-colors ${
                  selectedColorScheme === scheme.id
                    ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                    : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700'
                }`}
              >
                <div className="flex">
                  {scheme.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full -ml-1 first:ml-0 border border-white"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-surface-700 dark:text-surface-300">
                  {scheme.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              Generate Design
            </>
          )}
        </button>

        {/* Generated Designs History */}
        {generatedDesigns.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              Recent Generations
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {generatedDesigns.map((design) => (
                <button
                  key={design.id}
                  onClick={() => onApplyTemplate(design)}
                  className="aspect-[4/3] rounded-lg overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
                  style={{ background: design.backgroundColor }}
                >
                  <div className="w-full h-full flex items-center justify-center text-white/80 text-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIDesignPanel;
