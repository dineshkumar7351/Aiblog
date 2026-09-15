/**
 * Design Sidebar Component
 * Left navigation panel for the design studio with panels for templates, elements, text, uploads, etc.
 */

import { useState } from 'react';
import {
  LayoutGrid,
  Shapes,
  Type,
  Upload,
  Image,
  Palette,
  Sparkles,
  FolderOpen,
  Wand2,
  Grid3X3,
  Box,
  Search,
} from 'lucide-react';
import TemplatesPanel from './TemplatesPanel';
import ElementsPanel from './ElementsPanel';
import TextPanel from './TextPanel';
import UploadsPanel from './UploadsPanel';
import AIDesignPanel from './AIDesignPanel';
import PhotosPanel from './PhotosPanel';
import BackgroundPanel from './BackgroundPanel';

const sidebarItems = [
  { id: 'templates', icon: LayoutGrid, label: 'Design' },
  { id: 'elements', icon: Shapes, label: 'Elements' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'uploads', icon: Upload, label: 'Uploads' },
  { id: 'photos', icon: Image, label: 'Photos' },
  { id: 'background', icon: Palette, label: 'Background' },
  { id: 'ai', icon: Sparkles, label: 'AI Generate' },
];

const DesignSidebar = ({
  activePanel,
  setActivePanel,
  onAddText,
  onAddShape,
  onAddImage,
  onApplyTemplate,
  onSetBackground,
  canvasSize,
}) => {
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);

  const renderPanel = () => {
    switch (activePanel) {
      case 'templates':
        return (
          <TemplatesPanel
            onApplyTemplate={onApplyTemplate}
            canvasSize={canvasSize}
          />
        );
      case 'elements':
        return (
          <ElementsPanel
            onAddShape={onAddShape}
            onAddImage={onAddImage}
          />
        );
      case 'text':
        return <TextPanel onAddText={onAddText} />;
      case 'uploads':
        return <UploadsPanel onAddImage={onAddImage} />;
      case 'photos':
        return <PhotosPanel onAddImage={onAddImage} />;
      case 'background':
        return <BackgroundPanel onSetBackground={onSetBackground} />;
      case 'ai':
        return (
          <AIDesignPanel
            onApplyTemplate={onApplyTemplate}
            onAddText={onAddText}
            onAddImage={onAddImage}
            canvasSize={canvasSize}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full shrink-0">
      {/* Icon Bar */}
      <div className="w-[72px] bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col items-center py-2 shrink-0">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActivePanel(item.id);
                setIsPanelExpanded(true);
              }}
              className={`w-full py-3 flex flex-col items-center gap-1.5 transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Panel Content */}
      {isPanelExpanded && (
        <div className="w-[280px] bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 overflow-y-auto shrink-0">
          {renderPanel()}
        </div>
      )}
    </div>
  );
};

export default DesignSidebar;
