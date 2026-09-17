/**
 * Templates Panel Component
 * Shows design templates with categories and styles
 */

import { useState } from 'react';
import { Search, Sparkles, ChevronRight } from 'lucide-react';

// Template categories
const categories = [
  'All',
  'LinkedIn Banners',
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
    id: 'li-1',
    name: 'AI & Cloud Systems Architect',
    category: 'LinkedIn Banners',
    width: 1584,
    height: 396,
    presetName: 'LinkedIn Banner',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=200&fit=crop',
    backgroundColor: '#090d16',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1584,
        height: 396,
        fill: '#090d16',
        selectable: false,
      },
      {
        type: 'rect',
        left: 80,
        top: 55,
        width: 320,
        height: 34,
        rx: 17,
        ry: 17,
        fill: '#1e293b',
        selectable: true,
      },
      {
        type: 'text',
        text: '⚡ AI SYSTEMS & CLOUD ARCHITECTURE',
        left: 98,
        top: 63,
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#38bdf8',
      },
      {
        type: 'text',
        text: 'Building Scalable AI Platforms & Web Apps',
        left: 80,
        top: 110,
        fontSize: 52,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'LLMs • Distributed Systems • React • Node.js • Cloud Architecture',
        left: 80,
        top: 185,
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        fill: '#94a3b8',
      },
      {
        type: 'rect',
        left: 80,
        top: 280,
        width: 440,
        height: 48,
        rx: 24,
        ry: 24,
        fill: '#0f172a',
        selectable: true,
      },
      {
        type: 'text',
        text: '🚀 Available for Advisory & Engineering Leadership',
        left: 105,
        top: 294,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#22c55e',
      },
      {
        type: 'circle',
        left: 1300,
        top: 60,
        radius: 120,
        fill: '#3b82f620',
        selectable: true,
      },
      {
        type: 'circle',
        left: 1400,
        top: 100,
        radius: 90,
        fill: '#8b5cf625',
        selectable: true,
      }
    ],
  },
  {
    id: 'li-2',
    name: 'Full Stack & Software Lead',
    category: 'LinkedIn Banners',
    width: 1584,
    height: 396,
    presetName: 'LinkedIn Banner',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=200&fit=crop',
    backgroundColor: '#030712',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1584,
        height: 396,
        fill: '#030712',
        selectable: false,
      },
      {
        type: 'rect',
        left: 80,
        top: 50,
        width: 260,
        height: 32,
        rx: 16,
        ry: 16,
        fill: '#052e16',
        selectable: true,
      },
      {
        type: 'text',
        text: '💻 SENIOR FULL STACK DEV',
        left: 98,
        top: 58,
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#4ade80',
      },
      {
        type: 'text',
        text: 'Code. Ship. Scale. Iterate.',
        left: 80,
        top: 105,
        fontSize: 56,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'Transforming ideas into resilient high-throughput production software',
        left: 80,
        top: 185,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#cbd5e1',
      },
      {
        type: 'text',
        text: 'TypeScript • Next.js • Python • PostgreSQL • Docker • AWS',
        left: 80,
        top: 270,
        fontSize: 20,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#38bdf8',
      }
    ],
  },
  {
    id: 'li-3',
    name: 'B2B SaaS Founder & Strategist',
    category: 'LinkedIn Banners',
    width: 1584,
    height: 396,
    presetName: 'LinkedIn Banner',
    thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=200&fit=crop',
    backgroundColor: '#0c1a30',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1584,
        height: 396,
        fill: '#0c1a30',
        selectable: false,
      },
      {
        type: 'text',
        text: 'FOUNDER & TECH STRATEGIST',
        left: 80,
        top: 60,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#f59e0b',
      },
      {
        type: 'text',
        text: 'Scaling SaaS from Zero to Market Leader',
        left: 80,
        top: 105,
        fontSize: 50,
        fontFamily: 'Georgia',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'Product-Led Growth • AI Workflows • Enterprise Architecture • Retention',
        left: 80,
        top: 185,
        fontSize: 22,
        fontFamily: 'Arial',
        fill: '#93c5fd',
      },
      {
        type: 'rect',
        left: 80,
        top: 260,
        width: 380,
        height: 48,
        rx: 12,
        ry: 12,
        fill: '#2563eb',
        selectable: true,
      },
      {
        type: 'text',
        text: 'Connect to talk AI & SaaS Growth →',
        left: 105,
        top: 274,
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      }
    ],
  },
  {
    id: 'li-4',
    name: 'AI Writer & Thought Leader',
    category: 'LinkedIn Banners',
    width: 1584,
    height: 396,
    presetName: 'LinkedIn Banner',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=200&fit=crop',
    backgroundColor: '#170f2e',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1584,
        height: 396,
        fill: '#170f2e',
        selectable: false,
      },
      {
        type: 'text',
        text: '✨ TECH JOURNALIST & THOUGHT LEADER',
        left: 80,
        top: 60,
        fontSize: 15,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#c084fc',
      },
      {
        type: 'text',
        text: 'Making Sense of the AI Revolution',
        left: 80,
        top: 105,
        fontSize: 52,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'Deep Dives on Generative AI • Engineering Culture • High-Growth Startups',
        left: 80,
        top: 185,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#e9d5ff',
      },
      {
        type: 'text',
        text: 'Read weekly articles on BlogAI • 50k+ readers worldwide',
        left: 80,
        top: 260,
        fontSize: 18,
        fontFamily: 'Arial',
        fill: '#a855f7',
      }
    ],
  },
  {
    id: 'li-5',
    name: 'Data Science & Deep Learning',
    category: 'LinkedIn Banners',
    width: 1584,
    height: 396,
    presetName: 'LinkedIn Banner',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=200&fit=crop',
    backgroundColor: '#0a101f',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1584,
        height: 396,
        fill: '#0a101f',
        selectable: false,
      },
      {
        type: 'text',
        text: '📊 DATA SCIENTIST & ML RESEARCHER',
        left: 80,
        top: 60,
        fontSize: 15,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#2dd4bf',
      },
      {
        type: 'text',
        text: 'Turning Complex Data Into Actionable Intelligence',
        left: 80,
        top: 105,
        fontSize: 48,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'Deep Learning • Predictive Analytics • PyTorch • Big Data Architecture',
        left: 80,
        top: 185,
        fontSize: 22,
        fontFamily: 'Arial',
        fill: '#94a3b8',
      }
    ],
  },
  {
    id: 'li-6',
    name: 'LinkedIn Post Cover - Tech Guide',
    category: 'LinkedIn Banners',
    width: 1200,
    height: 627,
    presetName: 'LinkedIn Post / Article Cover',
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=314&fit=crop',
    backgroundColor: '#0f172a',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1200,
        height: 627,
        fill: '#0f172a',
        selectable: false,
      },
      {
        type: 'rect',
        left: 60,
        top: 60,
        width: 220,
        height: 36,
        rx: 18,
        ry: 18,
        fill: '#1e293b',
        selectable: true,
      },
      {
        type: 'text',
        text: '🔥 MUST READ ARTICLE',
        left: 80,
        top: 70,
        fontSize: 14,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#f43f5e',
      },
      {
        type: 'text',
        text: 'Mastering Modern Tech:',
        left: 60,
        top: 130,
        fontSize: 60,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'A Complete Architectural Guide',
        left: 60,
        top: 215,
        fontSize: 52,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#60a5fa',
      },
      {
        type: 'text',
        text: 'How high-growth tech teams build, deploy, and scale modern AI web applications in 2026.',
        left: 60,
        top: 310,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#94a3b8',
      },
      {
        type: 'rect',
        left: 60,
        top: 480,
        width: 320,
        height: 52,
        rx: 14,
        ry: 14,
        fill: '#2563eb',
        selectable: true,
      },
      {
        type: 'text',
        text: 'Read Article on BlogAI →',
        left: 85,
        top: 494,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      }
    ],
  },
  {
    id: 'li-7',
    name: 'LinkedIn Post Cover - AI Future',
    category: 'LinkedIn Banners',
    width: 1200,
    height: 627,
    presetName: 'LinkedIn Post / Article Cover',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=314&fit=crop',
    backgroundColor: '#130d24',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1200,
        height: 627,
        fill: '#130d24',
        selectable: false,
      },
      {
        type: 'text',
        text: 'THE AI REVOLUTION',
        left: 60,
        top: 80,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#a855f7',
      },
      {
        type: 'text',
        text: 'The Future of Autonomous Code',
        left: 60,
        top: 140,
        fontSize: 58,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'Autonomous agents, self-healing codebases, and the new paradigm of software development.',
        left: 60,
        top: 240,
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#d8b4fe',
      }
    ],
  },
  {
    id: 'li-8',
    name: 'Cybersecurity & DevSecOps Lead',
    category: 'LinkedIn Banners',
    width: 1584,
    height: 396,
    presetName: 'LinkedIn Banner',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=200&fit=crop',
    backgroundColor: '#021e14',
    objects: [
      {
        type: 'rect',
        left: 0,
        top: 0,
        width: 1584,
        height: 396,
        fill: '#021e14',
        selectable: false,
      },
      {
        type: 'text',
        text: '🛡️ CLOUD SECURITY & ZERO TRUST',
        left: 80,
        top: 60,
        fontSize: 15,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#34d399',
      },
      {
        type: 'text',
        text: 'Securing Mission-Critical Cloud Infrastructure',
        left: 80,
        top: 105,
        fontSize: 50,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fill: '#ffffff',
      },
      {
        type: 'text',
        text: 'DevSecOps • Incident Response • Zero Trust Security • Kubernetes Hardening',
        left: 80,
        top: 185,
        fontSize: 22,
        fontFamily: 'Arial',
        fill: '#a7f3d0',
      }
    ],
  },
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
          {filteredTemplates.map((template) => {
            const isLinkedIn = template.category === 'LinkedIn Banners';
            return (
              <button
                key={template.id}
                onClick={() => onApplyTemplate(template)}
                className={`group relative rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 hover:ring-2 hover:ring-primary-500 transition-all text-left ${
                  isLinkedIn ? 'col-span-2 aspect-[3.8/1] shadow-sm' : 'aspect-[4/5]'
                }`}
              >
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs text-white font-semibold truncate">{template.name}</p>
                    {isLinkedIn && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0A66C2] text-white font-bold shrink-0">
                        {template.width}×{template.height}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
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
