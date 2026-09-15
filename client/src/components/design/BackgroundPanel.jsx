/**
 * Background Panel Component
 * Background colors and patterns for the design canvas
 */

import { useState } from 'react';
import { Search, Droplet, Grid3X3, Image } from 'lucide-react';

const solidColors = [
  '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1',
  '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b',
  '#0f172a', '#000000',
  '#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171',
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  '#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c',
  '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
  '#fefce8', '#fef9c3', '#fef08a', '#fde047', '#facc15',
  '#eab308', '#ca8a04', '#a16207', '#854d0e', '#713f12',
  '#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80',
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d',
  '#ecfeff', '#cffafe', '#a5f3fc', '#67e8f9', '#22d3ee',
  '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
  '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
  '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
  '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
  '#fdf4ff', '#fae8ff', '#f5d0fe', '#f0abfc', '#e879f9',
  '#d946ef', '#c026d3', '#a21caf', '#86198f', '#701a75',
  '#fdf2f8', '#fce7f3', '#fbcfe8', '#f9a8d4', '#f472b6',
  '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843',
];

const gradients = [
  { id: 1, name: 'Sunset', colors: ['#ff6b6b', '#feca57'] },
  { id: 2, name: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { id: 3, name: 'Forest', colors: ['#11998e', '#38ef7d'] },
  { id: 4, name: 'Fire', colors: ['#f12711', '#f5af19'] },
  { id: 5, name: 'Purple Rain', colors: ['#7f00ff', '#e100ff'] },
  { id: 6, name: 'Midnight', colors: ['#232526', '#414345'] },
  { id: 7, name: 'Sky', colors: ['#2980B9', '#6DD5FA', '#FFFFFF'] },
  { id: 8, name: 'Neon', colors: ['#00f260', '#0575e6'] },
  { id: 9, name: 'Rose', colors: ['#ee9ca7', '#ffdde1'] },
  { id: 10, name: 'Aqua', colors: ['#00cdac', '#8ddad5'] },
  { id: 11, name: 'Passion', colors: ['#e53935', '#e35d5b'] },
  { id: 12, name: 'Cool', colors: ['#2193b0', '#6dd5ed'] },
];

const patterns = [
  { id: 1, name: 'Dots', type: 'dots', color: '#00000020', spacing: 20, size: 3 },
  { id: 2, name: 'Lines', type: 'lines', color: '#00000015', spacing: 12, lineWidth: 1 },
  { id: 3, name: 'Grid', type: 'grid', color: '#00000015', spacing: 25, lineWidth: 1 },
  { id: 4, name: 'Diagonal', type: 'diagonal', color: '#00000015', spacing: 15, lineWidth: 1 },
];

const BackgroundPanel = ({ onSetBackground }) => {
  const [activeTab, setActiveTab] = useState('solid');
  const [customColor, setCustomColor] = useState('#ffffff');

  const handleSolidColor = (color) => {
    onSetBackground(color);
  };

  const handleGradient = (gradient) => {
    // For gradients, we'll use the first color since fabric.js backgroundColor doesn't support gradients
    // In a more advanced implementation, you'd create a gradient rect as background
    onSetBackground(gradient.colors[0]);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Background
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800">
        <button
          onClick={() => setActiveTab('solid')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'solid'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          <Droplet className="w-4 h-4" />
          Solid
        </button>
        <button
          onClick={() => setActiveTab('gradient')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'gradient'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          <Image className="w-4 h-4" />
          Gradient
        </button>
        <button
          onClick={() => setActiveTab('pattern')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'pattern'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          Pattern
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'solid' && (
          <>
            {/* Custom Color Picker */}
            <div className="mb-4">
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2 block">
                Custom Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-surface-200 dark:border-surface-700"
                />
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm uppercase"
                />
                <button
                  onClick={() => handleSolidColor(customColor)}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Color Grid */}
            <div className="grid grid-cols-6 gap-2">
              {solidColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleSolidColor(color)}
                  className="aspect-square rounded-lg border border-surface-200 dark:border-surface-700 hover:scale-110 transition-transform hover:ring-2 hover:ring-primary-500"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </>
        )}

        {activeTab === 'gradient' && (
          <div className="grid grid-cols-2 gap-3">
            {gradients.map((gradient) => (
              <button
                key={gradient.id}
                onClick={() => handleGradient(gradient)}
                className="aspect-[3/2] rounded-xl overflow-hidden hover:ring-2 hover:ring-primary-500 transition-all"
                style={{
                  background: `linear-gradient(135deg, ${gradient.colors.join(', ')})`,
                }}
              >
                <div className="w-full h-full flex items-end p-2 bg-gradient-to-t from-black/30 to-transparent">
                  <span className="text-xs text-white font-medium">{gradient.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'pattern' && (
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => onSetBackground({ type: 'pattern', pattern })}
                className="w-full aspect-[3/1] rounded-xl border border-surface-200 dark:border-surface-700 hover:ring-2 hover:ring-primary-500 transition-all flex items-center justify-center"
                style={{
                  background: pattern.type === 'dots' 
                    ? `radial-gradient(circle, ${pattern.color} ${pattern.size}px, transparent ${pattern.size}px)`
                    : pattern.type === 'lines'
                    ? `repeating-linear-gradient(0deg, ${pattern.color}, ${pattern.color} ${pattern.lineWidth}px, transparent ${pattern.lineWidth}px, transparent ${pattern.spacing}px)`
                    : pattern.type === 'grid'
                    ? `linear-gradient(${pattern.color} ${pattern.lineWidth}px, transparent ${pattern.lineWidth}px), linear-gradient(90deg, ${pattern.color} ${pattern.lineWidth}px, transparent ${pattern.lineWidth}px)`
                    : `repeating-linear-gradient(45deg, ${pattern.color}, ${pattern.color} ${pattern.lineWidth}px, transparent ${pattern.lineWidth}px, transparent ${pattern.spacing}px)`,
                  backgroundSize: pattern.type === 'dots' 
                    ? `${pattern.spacing}px ${pattern.spacing}px`
                    : pattern.type === 'grid'
                    ? `${pattern.spacing}px ${pattern.spacing}px`
                    : undefined,
                  backgroundColor: '#ffffff',
                }}
              >
                <span className="text-sm text-surface-600 dark:text-surface-400 font-medium bg-white/80 dark:bg-surface-800/80 px-3 py-1 rounded">
                  {pattern.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackgroundPanel;
