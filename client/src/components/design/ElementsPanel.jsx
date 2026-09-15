/**
 * Elements Panel Component
 * Enhanced shapes, lines, graphics, and frames for the design canvas
 */

import { useState } from 'react';
import { Search } from 'lucide-react';

const shapeCategories = [
  { id: 'all', label: 'All' },
  { id: 'basic', label: 'Basic' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'arrows', label: 'Arrows' },
  { id: 'callouts', label: 'Callouts' },
  { id: 'lines', label: 'Lines' },
];

// SVG Shape Components for visual preview
const ShapePreview = ({ type, color = '#8b5cf6', size = 40 }) => {
  const shapes = {
    rect: (
      <rect x="4" y="4" width={size - 8} height={size - 8} fill={color} rx="0" />
    ),
    'rounded-rect': (
      <rect x="4" y="4" width={size - 8} height={size - 8} fill={color} rx="6" />
    ),
    circle: (
      <circle cx={size / 2} cy={size / 2} r={(size - 8) / 2} fill={color} />
    ),
    ellipse: (
      <ellipse cx={size / 2} cy={size / 2} rx={(size - 8) / 2} ry={(size - 12) / 2.5} fill={color} />
    ),
    triangle: (
      <polygon points={`${size / 2},4 ${size - 4},${size - 4} 4,${size - 4}`} fill={color} />
    ),
    'right-triangle': (
      <polygon points={`4,4 4,${size - 4} ${size - 4},${size - 4}`} fill={color} />
    ),
    diamond: (
      <polygon points={`${size / 2},4 ${size - 4},${size / 2} ${size / 2},${size - 4} 4,${size / 2}`} fill={color} />
    ),
    pentagon: (
      <polygon points={`${size / 2},4 ${size - 4},${size * 0.38} ${size - 8},${size - 4} 8,${size - 4} 4,${size * 0.38}`} fill={color} />
    ),
    hexagon: (
      <polygon points={`${size / 2},4 ${size - 6},${size * 0.25} ${size - 6},${size * 0.75} ${size / 2},${size - 4} 6,${size * 0.75} 6,${size * 0.25}`} fill={color} />
    ),
    octagon: (
      <polygon points={`${size * 0.3},4 ${size * 0.7},4 ${size - 4},${size * 0.3} ${size - 4},${size * 0.7} ${size * 0.7},${size - 4} ${size * 0.3},${size - 4} 4,${size * 0.7} 4,${size * 0.3}`} fill={color} />
    ),
    star: (
      <polygon points={`${size / 2},4 ${size * 0.62},${size * 0.38} ${size - 4},${size * 0.38} ${size * 0.68},${size * 0.58} ${size * 0.78},${size - 4} ${size / 2},${size * 0.7} ${size * 0.22},${size - 4} ${size * 0.32},${size * 0.58} 4,${size * 0.38} ${size * 0.38},${size * 0.38}`} fill={color} />
    ),
    heart: (
      <path d={`M${size / 2},${size - 6} C4,${size * 0.6} 4,${size * 0.25} ${size / 2},${size * 0.35} C${size - 4},${size * 0.25} ${size - 4},${size * 0.6} ${size / 2},${size - 6}Z`} fill={color} />
    ),
    cross: (
      <path d={`M${size * 0.35},4 h${size * 0.3} v${size * 0.28} h${size * 0.28} v${size * 0.3} h-${size * 0.28} v${size * 0.28} h-${size * 0.3} v-${size * 0.28} h-${size * 0.28} v-${size * 0.3} h${size * 0.28}Z`} fill={color} />
    ),
    'arrow-right': (
      <polygon points={`4,${size * 0.35} ${size * 0.6},${size * 0.35} ${size * 0.6},${size * 0.2} ${size - 4},${size / 2} ${size * 0.6},${size * 0.8} ${size * 0.6},${size * 0.65} 4,${size * 0.65}`} fill={color} />
    ),
    'arrow-left': (
      <polygon points={`${size - 4},${size * 0.35} ${size * 0.4},${size * 0.35} ${size * 0.4},${size * 0.2} 4,${size / 2} ${size * 0.4},${size * 0.8} ${size * 0.4},${size * 0.65} ${size - 4},${size * 0.65}`} fill={color} />
    ),
    'arrow-up': (
      <polygon points={`${size * 0.35},${size - 4} ${size * 0.35},${size * 0.4} ${size * 0.2},${size * 0.4} ${size / 2},4 ${size * 0.8},${size * 0.4} ${size * 0.65},${size * 0.4} ${size * 0.65},${size - 4}`} fill={color} />
    ),
    'arrow-down': (
      <polygon points={`${size * 0.35},4 ${size * 0.35},${size * 0.6} ${size * 0.2},${size * 0.6} ${size / 2},${size - 4} ${size * 0.8},${size * 0.6} ${size * 0.65},${size * 0.6} ${size * 0.65},4`} fill={color} />
    ),
    'chevron-right': (
      <polyline points={`${size * 0.3},${size * 0.15} ${size * 0.7},${size / 2} ${size * 0.3},${size * 0.85}`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    ),
    'double-arrow': (
      <polygon points={`4,${size / 2} ${size * 0.25},${size * 0.25} ${size * 0.25},${size * 0.4} ${size * 0.75},${size * 0.4} ${size * 0.75},${size * 0.25} ${size - 4},${size / 2} ${size * 0.75},${size * 0.75} ${size * 0.75},${size * 0.6} ${size * 0.25},${size * 0.6} ${size * 0.25},${size * 0.75}`} fill={color} />
    ),
    'speech-bubble': (
      <path d={`M6,6 h${size - 12} q4,0 4,4 v${size * 0.4} q0,4 -4,4 h-${size * 0.4} l-${size * 0.15},${size * 0.2} v-${size * 0.2} h-${size * 0.2} q-4,0 -4,-4 v-${size * 0.4} q0,-4 4,-4Z`} fill={color} />
    ),
    'thought-bubble': (
      <g>
        <ellipse cx={size / 2} cy={size * 0.4} rx={size * 0.4} ry={size * 0.3} fill={color} />
        <circle cx={size * 0.25} cy={size * 0.75} r={size * 0.08} fill={color} />
        <circle cx={size * 0.15} cy={size * 0.88} r={size * 0.05} fill={color} />
      </g>
    ),
    'rounded-speech': (
      <path d={`M${size * 0.5},${size - 6} l-${size * 0.1},-${size * 0.15} h-${size * 0.2} q-${size * 0.12},0 -${size * 0.12},-${size * 0.12} v-${size * 0.45} q0,-${size * 0.12} ${size * 0.12},-${size * 0.12} h${size * 0.6} q${size * 0.12},0 ${size * 0.12},${size * 0.12} v${size * 0.45} q0,${size * 0.12} -${size * 0.12},${size * 0.12} h-${size * 0.2}Z`} fill={color} />
    ),
    parallelogram: (
      <polygon points={`${size * 0.2},4 ${size - 4},4 ${size * 0.8},${size - 4} 4,${size - 4}`} fill={color} />
    ),
    trapezoid: (
      <polygon points={`${size * 0.2},4 ${size * 0.8},4 ${size - 4},${size - 4} 4,${size - 4}`} fill={color} />
    ),
    line: (
      <line x1="6" y1={size / 2} x2={size - 6} y2={size / 2} stroke={color} strokeWidth="3" strokeLinecap="round" />
    ),
    'line-dashed': (
      <line x1="6" y1={size / 2} x2={size - 6} y2={size / 2} stroke={color} strokeWidth="3" strokeDasharray="6,4" strokeLinecap="round" />
    ),
    'line-dotted': (
      <line x1="6" y1={size / 2} x2={size - 6} y2={size / 2} stroke={color} strokeWidth="3" strokeDasharray="2,4" strokeLinecap="round" />
    ),
    'line-arrow': (
      <g>
        <line x1="6" y1={size / 2} x2={size - 10} y2={size / 2} stroke={color} strokeWidth="3" strokeLinecap="round" />
        <polygon points={`${size - 6},${size / 2} ${size - 14},${size / 2 - 6} ${size - 14},${size / 2 + 6}`} fill={color} />
      </g>
    ),
    'line-double-arrow': (
      <g>
        <line x1="14" y1={size / 2} x2={size - 14} y2={size / 2} stroke={color} strokeWidth="3" />
        <polygon points={`${size - 6},${size / 2} ${size - 14},${size / 2 - 6} ${size - 14},${size / 2 + 6}`} fill={color} />
        <polygon points={`6,${size / 2} 14,${size / 2 - 6} 14,${size / 2 + 6}`} fill={color} />
      </g>
    ),
    'curved-line': (
      <path d={`M6,${size * 0.7} Q${size / 2},${size * 0.2} ${size - 6},${size * 0.7}`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    ),
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {shapes[type] || shapes.rect}
    </svg>
  );
};

// Shape definitions with categories
const shapeDefinitions = [
  // Basic shapes
  { id: 'rect', category: 'basic', label: 'Rectangle', type: 'rect' },
  { id: 'rounded-rect', category: 'basic', label: 'Rounded', type: 'rounded-rect' },
  { id: 'circle', category: 'basic', label: 'Circle', type: 'circle' },
  { id: 'ellipse', category: 'basic', label: 'Ellipse', type: 'ellipse' },
  { id: 'triangle', category: 'basic', label: 'Triangle', type: 'triangle' },
  { id: 'right-triangle', category: 'basic', label: 'Right Triangle', type: 'right-triangle' },
  { id: 'diamond', category: 'basic', label: 'Diamond', type: 'diamond' },
  { id: 'star', category: 'basic', label: 'Star', type: 'star' },
  { id: 'heart', category: 'basic', label: 'Heart', type: 'heart' },
  { id: 'cross', category: 'basic', label: 'Cross', type: 'cross' },
  
  // Geometric shapes
  { id: 'pentagon', category: 'geometric', label: 'Pentagon', type: 'polygon', sides: 5 },
  { id: 'hexagon', category: 'geometric', label: 'Hexagon', type: 'polygon', sides: 6 },
  { id: 'octagon', category: 'geometric', label: 'Octagon', type: 'polygon', sides: 8 },
  { id: 'parallelogram', category: 'geometric', label: 'Parallelogram', type: 'parallelogram' },
  { id: 'trapezoid', category: 'geometric', label: 'Trapezoid', type: 'trapezoid' },
  
  // Arrows
  { id: 'arrow-right', category: 'arrows', label: 'Right', type: 'arrow-right' },
  { id: 'arrow-left', category: 'arrows', label: 'Left', type: 'arrow-left' },
  { id: 'arrow-up', category: 'arrows', label: 'Up', type: 'arrow-up' },
  { id: 'arrow-down', category: 'arrows', label: 'Down', type: 'arrow-down' },
  { id: 'chevron-right', category: 'arrows', label: 'Chevron', type: 'chevron-right' },
  { id: 'double-arrow', category: 'arrows', label: 'Double', type: 'double-arrow' },
  
  // Callouts
  { id: 'speech-bubble', category: 'callouts', label: 'Speech', type: 'speech-bubble' },
  { id: 'thought-bubble', category: 'callouts', label: 'Thought', type: 'thought-bubble' },
  { id: 'rounded-speech', category: 'callouts', label: 'Rounded', type: 'rounded-speech' },
  
  // Lines
  { id: 'line', category: 'lines', label: 'Solid', type: 'line' },
  { id: 'line-dashed', category: 'lines', label: 'Dashed', type: 'line-dashed' },
  { id: 'line-dotted', category: 'lines', label: 'Dotted', type: 'line-dotted' },
  { id: 'line-arrow', category: 'lines', label: 'Arrow', type: 'line-arrow' },
  { id: 'line-double-arrow', category: 'lines', label: 'Both Ends', type: 'line-double-arrow' },
  { id: 'curved-line', category: 'lines', label: 'Curved', type: 'curved-line' },
];

const colorPalette = [
  '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6',
  '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444',
  '#ec4899', '#d946ef', '#000000', '#6b7280', '#ffffff',
];

const ElementsPanel = ({ onAddShape, onAddImage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedColor, setSelectedColor] = useState('#8b5cf6');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(0);

  const filteredShapes = shapeDefinitions.filter((shape) => {
    const matchesSearch = shape.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || shape.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group shapes by category for display
  const groupedShapes = filteredShapes.reduce((acc, shape) => {
    if (!acc[shape.category]) {
      acc[shape.category] = [];
    }
    acc[shape.category].push(shape);
    return acc;
  }, {});

  const categoryLabels = {
    basic: 'Basic Shapes',
    geometric: 'Geometric',
    arrows: 'Arrows',
    callouts: 'Callouts & Bubbles',
    lines: 'Lines & Connectors',
  };

  const handleAddShape = (shape) => {
    onAddShape(shape.type, {
      fill: selectedColor,
      stroke: strokeWidth > 0 ? strokeColor : '',
      strokeWidth: strokeWidth,
      sides: shape.sides,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Elements
        </h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search shapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2 overflow-x-auto border-b border-surface-200 dark:border-surface-800 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {shapeCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color Settings */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800 space-y-3">
        {/* Fill Color */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
              Fill Color
            </span>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-surface-300"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {colorPalette.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-5 h-5 rounded-md transition-transform hover:scale-110 ${
                  selectedColor === color
                    ? 'ring-2 ring-primary-500 ring-offset-1'
                    : 'border border-surface-200 dark:border-surface-600'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Stroke Settings */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-surface-600 dark:text-surface-400">
              Stroke
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border border-surface-300"
              />
              <input
                type="number"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-14 px-2 py-1 text-xs rounded bg-surface-100 dark:bg-surface-800 border-none text-center"
                min="0"
                max="20"
                placeholder="0"
              />
              <span className="text-xs text-surface-500">px</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shapes Grid */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {Object.entries(groupedShapes).map(([category, shapes]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
              {categoryLabels[category] || category}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {shapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => handleAddShape(shape)}
                  className="aspect-square rounded-xl bg-surface-100 dark:bg-surface-800 flex flex-col items-center justify-center gap-1.5 hover:bg-surface-200 dark:hover:bg-surface-700 transition-all hover:scale-105 group border border-transparent hover:border-primary-300 dark:hover:border-primary-700"
                >
                  <ShapePreview 
                    type={shape.id} 
                    color={selectedColor} 
                    size={36}
                  />
                  <span className="text-[9px] text-surface-500 group-hover:text-surface-700 dark:group-hover:text-surface-300 font-medium">
                    {shape.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredShapes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-surface-500">No shapes found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementsPanel;
