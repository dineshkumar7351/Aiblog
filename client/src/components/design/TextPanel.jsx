/**
 * Text Panel Component
 * Text styles, fonts, and text boxes for the design canvas
 */

import { useState } from 'react';
import { Search, Type, Heading1, Heading2, AlignLeft } from 'lucide-react';

const textStyles = [
  {
    id: 'heading',
    label: 'Add a heading',
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    preview: 'Add a heading',
  },
  {
    id: 'subheading',
    label: 'Add a subheading',
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Inter',
    preview: 'Add a subheading',
  },
  {
    id: 'body',
    label: 'Add a little bit of body text',
    fontSize: 16,
    fontWeight: 'normal',
    fontFamily: 'Inter',
    preview: 'Add a little bit of body text',
  },
];

const fontCombinations = [
  {
    id: 1,
    heading: { text: 'BOLD MODERN', fontFamily: 'Arial Black', fontSize: 36, fontWeight: 'bold' },
    body: { text: 'Clean and minimal description', fontFamily: 'Arial', fontSize: 14 },
  },
  {
    id: 2,
    heading: { text: 'Elegant Script', fontFamily: 'Georgia', fontSize: 36, fontStyle: 'italic' },
    body: { text: 'Sophisticated and timeless', fontFamily: 'Georgia', fontSize: 14 },
  },
  {
    id: 3,
    heading: { text: 'TECH FUTURE', fontFamily: 'Courier New', fontSize: 32, fontWeight: 'bold' },
    body: { text: 'Innovation meets design', fontFamily: 'Courier New', fontSize: 12 },
  },
  {
    id: 4,
    heading: { text: 'Creative Mix', fontFamily: 'Verdana', fontSize: 36, fontWeight: 'bold' },
    body: { text: 'Express your unique style', fontFamily: 'Tahoma', fontSize: 14 },
  },
];

const fonts = [
  'Inter',
  'Arial',
  'Arial Black',
  'Georgia',
  'Times New Roman',
  'Verdana',
  'Courier New',
  'Tahoma',
  'Trebuchet MS',
  'Impact',
  'Comic Sans MS',
  'Palatino Linotype',
  'Lucida Console',
  'Lucida Sans Unicode',
];

const TextPanel = ({ onAddText }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('default');

  const handleAddTextStyle = (style) => {
    onAddText({
      text: style.preview,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
    });
  };

  const handleAddFontCombination = (combo) => {
    // Add heading
    onAddText({
      text: combo.heading.text,
      fontSize: combo.heading.fontSize,
      fontWeight: combo.heading.fontWeight || 'normal',
      fontFamily: combo.heading.fontFamily,
      fontStyle: combo.heading.fontStyle || 'normal',
      top: 200,
    });
    // Add body text slightly below
    setTimeout(() => {
      onAddText({
        text: combo.body.text,
        fontSize: combo.body.fontSize,
        fontWeight: 'normal',
        fontFamily: combo.body.fontFamily,
        top: 260,
      });
    }, 100);
  };

  const filteredFonts = fonts.filter((font) =>
    font.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Text
        </h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search fonts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 dark:border-surface-800 px-4">
        <button
          onClick={() => setActiveTab('default')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'default'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          Text Styles
        </button>
        <button
          onClick={() => setActiveTab('fonts')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'fonts'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
          }`}
        >
          Fonts
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'default' && (
          <>
            {/* Quick Add Text */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                Click text to add to page
              </h4>
              <div className="space-y-2">
                {textStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleAddTextStyle(style)}
                    className="w-full p-4 rounded-xl bg-surface-100 dark:bg-surface-800 text-left hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    <span
                      style={{
                        fontFamily: style.fontFamily,
                        fontSize: `${Math.min(style.fontSize, 24)}px`,
                        fontWeight: style.fontWeight,
                      }}
                      className="text-surface-900 dark:text-surface-100"
                    >
                      {style.preview}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Combinations */}
            <div>
              <h4 className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-3">
                Font Combinations
              </h4>
              <div className="space-y-3">
                {fontCombinations.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() => handleAddFontCombination(combo)}
                    className="w-full p-4 rounded-xl bg-surface-100 dark:bg-surface-800 text-left hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    <p
                      style={{
                        fontFamily: combo.heading.fontFamily,
                        fontSize: `${Math.min(combo.heading.fontSize, 20)}px`,
                        fontWeight: combo.heading.fontWeight || 'normal',
                        fontStyle: combo.heading.fontStyle || 'normal',
                      }}
                      className="text-surface-900 dark:text-surface-100 mb-1"
                    >
                      {combo.heading.text}
                    </p>
                    <p
                      style={{
                        fontFamily: combo.body.fontFamily,
                        fontSize: `${combo.body.fontSize}px`,
                      }}
                      className="text-surface-500"
                    >
                      {combo.body.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'fonts' && (
          <div className="space-y-2">
            {filteredFonts.map((font) => (
              <button
                key={font}
                onClick={() => onAddText({ text: font, fontFamily: font, fontSize: 32 })}
                className="w-full p-3 rounded-lg bg-surface-100 dark:bg-surface-800 text-left hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <span
                  style={{ fontFamily: font }}
                  className="text-lg text-surface-900 dark:text-surface-100"
                >
                  {font}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextPanel;
