/**
 * AI Assistant Panel Component
 * Right sidebar panel for AI suggestions with Accept/Reject buttons
 */

import { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Wand2, 
  Search,
  Check,
  X,
  Loader2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const AIPanel = ({ 
  suggestions = [],
  seoAnalysis = null,
  isLoading = false,
  loadingType = '',
  onAcceptSuggestion,
  onRejectSuggestion,
  onAcceptTitle,
  onAcceptContent,
  onOpenVoiceStudio
}) => {
  const [expandedSection, setExpandedSection] = useState('suggestions');

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Work';
  };

  return (
    <aside className="w-80 bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-surface-900 p-4 border-b border-surface-200 dark:border-surface-800 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-surface-900 dark:text-surface-100">AI Assistant</h2>
              <p className="text-xs text-surface-500">Writing & SEO Copilot</p>
            </div>
          </div>

          {onOpenVoiceStudio && (
            <button
              onClick={onOpenVoiceStudio}
              className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition cursor-pointer"
              title="Launch Voice Studio"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-4">
          <div className="ai-suggestion">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100">
                  {loadingType === 'title' && 'Generating title suggestions...'}
                  {loadingType === 'content' && 'Improving your content...'}
                  {loadingType === 'seo' && 'Analyzing SEO...'}
                  {!loadingType && 'Processing...'}
                </p>
                <p className="text-xs text-surface-500">This may take a few seconds</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title Suggestions */}
      {suggestions.length > 0 && suggestions[0]?.type === 'title' && (
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100">Title Suggestions</h3>
          </div>
          <div className="space-y-2">
            {suggestions.filter(s => s.type === 'title').map((suggestion, index) => (
              <div 
                key={index}
                className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <p className="text-sm text-surface-800 dark:text-surface-200 mb-3">
                  {suggestion.content}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onAcceptTitle && onAcceptTitle(suggestion.content)}
                    className="flex-1 btn-sm btn-success flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Accept
                  </button>
                  <button
                    onClick={() => onRejectSuggestion && onRejectSuggestion(index)}
                    className="btn-sm btn-ghost p-1.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improved Content Suggestion */}
      {suggestions.length > 0 && suggestions[0]?.type === 'content' && (
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-secondary-500" />
            <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100">Improved Version</h3>
          </div>
          <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 animate-slide-up">
            <div className="max-h-60 overflow-y-auto mb-3">
              <p className="text-xs font-mono text-surface-800 dark:text-surface-200 whitespace-pre-wrap">
                {suggestions[0].content}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onAcceptContent && onAcceptContent(suggestions[0].content)}
                className="flex-1 btn-sm btn-success flex items-center justify-center gap-1"
              >
                <Check className="w-3 h-3" />
                Apply Improvement
              </button>
              <button
                onClick={() => onRejectSuggestion && onRejectSuggestion(0)}
                className="btn-sm btn-ghost p-1.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO Analysis */}
      {seoAnalysis && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-primary-500" />
              <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100">SEO Analysis</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getScoreColor(seoAnalysis.score)}`}>
                {seoAnalysis.score}
              </span>
              <span className="text-xs text-surface-400">/100</span>
            </div>
          </div>

          {/* Metrics */}
          {seoAnalysis.metrics && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 text-center">
                <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {seoAnalysis.metrics.wordCount}
                </p>
                <p className="text-xs text-surface-500">Words</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 text-center">
                <p className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  {seoAnalysis.metrics.paragraphCount}
                </p>
                <p className="text-xs text-surface-500">Paragraphs</p>
              </div>
            </div>
          )}

          {/* Readability */}
          {seoAnalysis.readabilityLevel && (
            <div className="mb-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-800">
              <p className="text-xs text-surface-500 mb-1">Readability</p>
              <p className="text-sm font-medium text-surface-900 dark:text-surface-100 capitalize">
                {seoAnalysis.readabilityLevel}
              </p>
            </div>
          )}

          {/* Strengths */}
          {seoAnalysis.strengths && seoAnalysis.strengths.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-2">Strengths</p>
              <ul className="space-y-1">
                {seoAnalysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {seoAnalysis.suggestions && seoAnalysis.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2">Suggestions</p>
              <ul className="space-y-1">
                {seoAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-surface-600 dark:text-surface-400">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Empty State / Feature Discovery */}
      {!isLoading && suggestions.length === 0 && !seoAnalysis && (
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-transparent border border-primary-500/20 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-surface-900 dark:text-surface-100">
                AI Voice & Writing Assistant
              </h3>
              <p className="text-xs text-surface-500 mt-1">
                Speak your thoughts to generate a complete article, or request title ideas & grammar fixes.
              </p>
            </div>

            {onOpenVoiceStudio && (
              <button
                type="button"
                onClick={onOpenVoiceStudio}
                className="w-full btn-primary btn-sm gap-2 shadow-sm"
              >
                <span>🎙️ Launch Voice Studio</span>
              </button>
            )}
          </div>

          <div className="text-xs text-surface-400 dark:text-surface-500 space-y-2 px-1">
            <p className="font-semibold text-surface-600 dark:text-surface-300">Quick AI Shortcuts:</p>
            <p>• Click <strong>Suggest Title</strong> to generate 3 SEO headlines.</p>
            <p>• Click <strong>Improve</strong> to polish writing and tone.</p>
            <p>• Click <strong>SEO Check</strong> for score and keyword tips.</p>
          </div>
        </div>
      )}
    </aside>
  );
};

export default AIPanel;
