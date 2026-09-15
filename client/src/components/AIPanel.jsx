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
  onAcceptContent
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
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary-500 to-primary-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-surface-900 dark:text-surface-100">AI Assistant</h2>
            <p className="text-xs text-surface-500">Here to help, you decide</p>
          </div>
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
                    <Check className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => onRejectSuggestion && onRejectSuggestion(index)}
                    className="btn-sm btn-ghost flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content Improvement */}
      {suggestions.length > 0 && suggestions[0]?.type === 'content' && (
        <div className="p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 className="w-4 h-4 text-secondary-500" />
            <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100">Improved Content</h3>
          </div>
          {suggestions.filter(s => s.type === 'content').map((suggestion, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-gradient-to-br from-secondary-50 to-primary-50 dark:from-secondary-900/20 dark:to-primary-900/20 border border-secondary-200 dark:border-secondary-800 animate-slide-up"
            >
              <div className="flex items-start gap-2 mb-3 text-xs text-secondary-600 dark:text-secondary-400">
                <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>AI has preserved your meaning. Review before accepting.</span>
              </div>
              <div className="max-h-60 overflow-y-auto mb-4 p-3 bg-white dark:bg-surface-900 rounded-lg text-sm text-surface-700 dark:text-surface-300">
                {suggestion.content}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onAcceptContent && onAcceptContent(suggestion.content)}
                  className="flex-1 btn-sm btn-success flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  Accept Changes
                </button>
                <button
                  onClick={() => onRejectSuggestion && onRejectSuggestion(index)}
                  className="btn-sm btn-ghost flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEO Analysis */}
      {seoAnalysis && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-primary-500" />
            <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100">SEO Analysis</h3>
          </div>

          {/* Score Circle */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-surface-200 dark:text-surface-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(seoAnalysis.score / 100) * 352} 352`}
                  strokeLinecap="round"
                  className={getScoreColor(seoAnalysis.score)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(seoAnalysis.score)}`}>
                  {seoAnalysis.score}
                </span>
                <span className="text-xs text-surface-500">{getScoreLabel(seoAnalysis.score)}</span>
              </div>
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

      {/* Empty State */}
      {!isLoading && suggestions.length === 0 && !seoAnalysis && (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="text-sm font-medium text-surface-900 dark:text-surface-100 mb-2">
            AI Assistant Ready
          </h3>
          <p className="text-xs text-surface-500">
            Use the buttons in the editor to get AI suggestions for your content.
          </p>
        </div>
      )}
    </aside>
  );
};

export default AIPanel;
