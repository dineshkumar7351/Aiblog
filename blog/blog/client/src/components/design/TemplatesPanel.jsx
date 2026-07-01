/**
 * Templates Panel Component
 * Shows design templates with categories and styles
 */

import { useState } from 'react';
import { Search, Sparkles, ChevronRight } from 'lucide-react';

// Template categories
const categories = [
  'All',
  'Social Media',
  'Marketing',
  'Business',
  'Education',
  'Personal',
  'Events',
];

// Sample templates (in production, these would come from an API)
const templates = [
  {
    id: 1,
    name: 'Creative Portfolio',
    category: 'Personal',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=400&fit=crop',
    backgroundColor: '#1a1a2e',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#1a1a2e',
        selectable: false,
      },
      {
        type: 'text',
        text: 'Creative',
        left: 50,
        top: 200,
        fontSize: 72,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'Portfolio',
        left: 50,
        top: 280,
        fontSize: 72,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#f472b6',
      },
    ],
  },
  {
    id: 2,
    name: 'Gala of Hope',
    category: 'Events',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop',
    backgroundColor: '#0f172a',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#0f172a',
        selectable: false,
      },
      {
        type: 'text',
        text: 'Gala of Hope',
        left: 200,
        top: 250,
        fontSize: 56,
        fontFamily: 'Georgia',
        fontStyle: 'italic',
        fill: '#fcd34d',
      },
    ],
  },
  {
    id: 3,
    name: 'Legal Services',
    category: 'Business',
    thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=400&fit=crop',
    backgroundColor: '#065f46',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#065f46',
        selectable: false,
      },
      {
        type: 'text',
        text: 'Top-notch',
        left: 50,
        top: 150,
        fontSize: 32,
        fontFamily: 'Arial',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'Legal Services',
        left: 50,
        top: 190,
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
    ],
  },
  {
    id: 4,
    name: 'Nature Wellness',
    category: 'Personal',
    thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=400&fit=crop',
    backgroundColor: '#14532d',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
        selectable: false,
      },
    ],
  },
  {
    id: 5,
    name: 'Modern Minimal',
    category: 'Business',
    thumbnail: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=400&fit=crop',
    backgroundColor: '#f8fafc',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#f8fafc',
        selectable: false,
      },
      {
        type: 'rect',
        left: 50,
        top: 50,
        width: 200,
        height: 200,
        fill: '#3b82f6',
      },
    ],
  },
  {
    id: 6,
    name: 'Patty Moore Director',
    category: 'Business',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    backgroundColor: '#fef3c7',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#fef3c7',
        selectable: false,
      },
      {
        type: 'text',
        text: 'Patty Moore',
        left: 50,
        top: 400,
        fontSize: 36,
        fontFamily: 'Georgia',
        fontWeight: 'bold',
        fill: '#1e293b',
      },
      {
        type: 'text',
        text: 'Director',
        left: 50,
        top: 450,
        fontSize: 24,
        fontFamily: 'Georgia',
        fill: '#64748b',
      },
    ],
  },
  {
    id: 7,
    name: 'Daily Updates',
    category: 'Social Media',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop',
    backgroundColor: '#fce7f3',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#fce7f3',
        selectable: false,
      },
      {
        type: 'text',
        text: 'Daily',
        left: 300,
        top: 200,
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#be185d',
      },
      {
        type: 'text',
        text: 'Updates',
        left: 280,
        top: 260,
        fontSize: 48,
        fontFamily: 'Arial',
        fill: '#1e293b',
      },
    ],
  },
  {
    id: 8,
    name: 'Portfolio',
    category: 'Personal',
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop',
    backgroundColor: '#1e293b',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#1e293b',
        selectable: false,
      },
      {
        type: 'text',
        text: 'PORTFOLIO',
        left: 250,
        top: 300,
        fontSize: 56,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
        letterSpacing: 400,
      },
    ],
  },
  {
    id: 9,
    name: 'Vista Suites',
    category: 'Business',
    thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop',
    backgroundColor: '#0c4a6e',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        fill: '#0c4a6e',
        selectable: false,
      },
      {
        type: 'text',
        text: 'VISTA',
        left: 280,
        top: 220,
        fontSize: 64,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
        letterSpacing: 200,
      },
      {
        type: 'text',
        text: 'SUITES',
        left: 270,
        top: 300,
        fontSize: 56,
        fontFamily: 'Arial',
        fill: '#7dd3fc',
        letterSpacing: 300,
      },
    ],
  },
];

const TemplatesPanel = ({ onApplyTemplate, canvasSize }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('templates');

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || template.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Describe your ideal design"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-200 dark:border-surface-700">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 pb-2 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`flex-1 pb-2 text-sm font-medium transition-colors ${
              activeTab === 'styles'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
            }`}
          >
            Styles
          </button>
        </div>
      </div>

      {/* AI Generate Button */}
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-medium hover:opacity-90 transition-opacity">
          <Sparkles className="w-4 h-4" />
          Generate design
        </button>
      </div>

      {/* Categories (horizontal scroll) */}
      <div className="px-4 pb-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => onApplyTemplate(template)}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 hover:ring-2 hover:ring-primary-500 transition-all"
            >
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs text-white font-medium truncate">{template.name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <p className="text-surface-500 text-sm">No templates found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPanel;
