/**
 * Design Toolbar Component
 * Right sidebar for editing selected object properties
 */

import { useState, useEffect } from 'react';
import {
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  Lock,
  Unlock,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Palette,
  Square,
  Circle,
} from 'lucide-react';

const colorPalette = [
  '#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#ffffff',
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
  '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16', '#06b6d4', '#6366f1',
];

const fontFamilies = [
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
];

const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 128];

const DesignToolbar = ({
  selectedObject,
  fabric,
  onUpdate,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
}) => {
  const [objectProps, setObjectProps] = useState({});
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorType, setActiveColorType] = useState('fill');

  useEffect(() => {
    if (selectedObject) {
      setObjectProps({
        type: selectedObject.type,
        fill: selectedObject.fill || '#000000',
        stroke: selectedObject.stroke || '',
        strokeWidth: selectedObject.strokeWidth || 0,
        opacity: (selectedObject.opacity || 1) * 100,
        angle: selectedObject.angle || 0,
        // Text properties
        fontFamily: selectedObject.fontFamily || 'Arial',
        fontSize: selectedObject.fontSize || 16,
        fontWeight: selectedObject.fontWeight || 'normal',
        fontStyle: selectedObject.fontStyle || 'normal',
        textAlign: selectedObject.textAlign || 'left',
        underline: selectedObject.underline || false,
        linethrough: selectedObject.linethrough || false,
      });
    }
  }, [selectedObject]);

  const updateObject = (prop, value) => {
    if (!selectedObject) return;
    
    selectedObject.set(prop, value);
    setObjectProps(prev => ({ ...prev, [prop]: value }));
    onUpdate();
  };

  const handleRotate = (degrees) => {
    const currentAngle = selectedObject.angle || 0;
    updateObject('angle', (currentAngle + degrees) % 360);
  };

  const handleFlip = (direction) => {
    if (direction === 'horizontal') {
      updateObject('flipX', !selectedObject.flipX);
    } else {
      updateObject('flipY', !selectedObject.flipY);
    }
  };

  const isTextObject = selectedObject?.type === 'i-text' || selectedObject?.type === 'text' || selectedObject?.type === 'textbox';

  return (
    <div className="w-64 bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-800 h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-surface-900 p-4 border-b border-surface-200 dark:border-surface-800 z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
            {isTextObject ? 'Text' : 'Element'} Properties
          </h3>
          <div className="flex gap-1">
            <button
              onClick={onDuplicate}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Text-specific controls */}
        {isTextObject && (
          <>
            {/* Font Family */}
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
                Font
              </label>
              <select
                value={objectProps.fontFamily}
                onChange={(e) => updateObject('fontFamily', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm focus:ring-2 focus:ring-primary-500"
                style={{ fontFamily: objectProps.fontFamily }}
              >
                {fontFamilies.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
                Size
              </label>
              <select
                value={objectProps.fontSize}
                onChange={(e) => updateObject('fontSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm focus:ring-2 focus:ring-primary-500"
              >
                {fontSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            {/* Text Style */}
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
                Style
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => updateObject('fontWeight', objectProps.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`flex-1 p-2 rounded-lg ${
                    objectProps.fontWeight === 'bold'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  <Bold className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => updateObject('fontStyle', objectProps.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`flex-1 p-2 rounded-lg ${
                    objectProps.fontStyle === 'italic'
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  <Italic className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => updateObject('underline', !objectProps.underline)}
                  className={`flex-1 p-2 rounded-lg ${
                    objectProps.underline
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                      : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                  }`}
                >
                  <Underline className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>

            {/* Text Alignment */}
            <div>
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
                Alignment
              </label>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map((align) => {
                  const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                  return (
                    <button
                      key={align}
                      onClick={() => updateObject('textAlign', align)}
                      className={`flex-1 p-2 rounded-lg ${
                        objectProps.textAlign === align
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mx-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Color */}
        <div>
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
            {isTextObject ? 'Text Color' : 'Fill Color'}
          </label>
          <div className="flex gap-2 mb-2">
            <div
              className="w-10 h-10 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer"
              style={{ backgroundColor: objectProps.fill }}
              onClick={() => {
                setActiveColorType('fill');
                setShowColorPicker(!showColorPicker);
              }}
            />
            <input
              type="text"
              value={objectProps.fill}
              onChange={(e) => updateObject('fill', e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm uppercase"
            />
          </div>
          {showColorPicker && activeColorType === 'fill' && (
            <div className="grid grid-cols-6 gap-1.5 p-2 rounded-lg bg-surface-50 dark:bg-surface-800">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    updateObject('fill', color);
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded border border-surface-200 dark:border-surface-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stroke (for shapes) */}
        {!isTextObject && (
          <div>
            <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
              Stroke
            </label>
            <div className="flex gap-2 items-center">
              <div
                className="w-10 h-10 rounded-lg border border-surface-200 dark:border-surface-700 cursor-pointer"
                style={{ backgroundColor: objectProps.stroke || 'transparent' }}
                onClick={() => {
                  setActiveColorType('stroke');
                  setShowColorPicker(!showColorPicker);
                }}
              />
              <input
                type="number"
                value={objectProps.strokeWidth}
                onChange={(e) => updateObject('strokeWidth', parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm"
                placeholder="Width"
                min="0"
                max="50"
              />
              <span className="text-xs text-surface-500">px</span>
            </div>
            {showColorPicker && activeColorType === 'stroke' && (
              <div className="grid grid-cols-6 gap-1.5 p-2 rounded-lg bg-surface-50 dark:bg-surface-800 mt-2">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      updateObject('stroke', color);
                      setShowColorPicker(false);
                    }}
                    className="w-6 h-6 rounded border border-surface-200 dark:border-surface-700 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Opacity */}
        <div>
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
            Opacity: {Math.round(objectProps.opacity)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={objectProps.opacity}
            onChange={(e) => updateObject('opacity', parseInt(e.target.value) / 100)}
            className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>

        {/* Transform */}
        <div>
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
            Transform
          </label>
          <div className="flex gap-1">
            <button
              onClick={() => handleRotate(90)}
              className="flex-1 p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => handleFlip('horizontal')}
              className="flex-1 p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={() => handleFlip('vertical')}
              className="flex-1 p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700"
              title="Flip Vertical"
            >
              <FlipVertical className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>

        {/* Layering */}
        <div>
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
            Layer Order
          </label>
          <div className="flex gap-1">
            <button
              onClick={onBringToFront}
              className="flex-1 p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 flex items-center justify-center gap-1"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="text-xs">Front</span>
            </button>
            <button
              onClick={onSendToBack}
              className="flex-1 p-2 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700 flex items-center justify-center gap-1"
            >
              <ArrowDown className="w-4 h-4" />
              <span className="text-xs">Back</span>
            </button>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
            Rotation: {Math.round(objectProps.angle)}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={objectProps.angle || 0}
            onChange={(e) => updateObject('angle', parseInt(e.target.value))}
            className="w-full h-2 bg-surface-200 dark:bg-surface-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
          />
        </div>
      </div>
    </div>
  );
};

export default DesignToolbar;
