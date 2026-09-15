/**
 * Design Studio Page
 * Canva-like design editor with canvas, templates, elements, and AI design generation
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { fabric } from 'fabric';
import { 
  Undo2, 
  Redo2, 
  Download, 
  Save, 
  ZoomIn, 
  ZoomOut,
  Move,
  MousePointer,
  Trash2,
  Copy,
  Clipboard,
  Layers,
  ChevronDown,
  Plus,
  Settings,
  Eye,
  Grid3X3,
  ArrowLeft,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DesignSidebar from '../components/design/DesignSidebar';
import DesignToolbar from '../components/design/DesignToolbar';

const CANVAS_PRESETS = [
  { name: 'Custom', width: 800, height: 600 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'Facebook Post', width: 1200, height: 630 },
  { name: 'Twitter Post', width: 1200, height: 675 },
  { name: 'YouTube Thumbnail', width: 1280, height: 720 },
  { name: 'LinkedIn Banner', width: 1584, height: 396 },
  { name: 'Presentation', width: 1920, height: 1080 },
  { name: 'A4 Document', width: 595, height: 842 },
  { name: 'Business Card', width: 1050, height: 600 },
  { name: 'Website', width: 1440, height: 900 },
];

const DesignStudio = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const containerRef = useRef(null);
  
  const [activePanel, setActivePanel] = useState('templates');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [selectedPreset, setSelectedPreset] = useState('Custom');
  const [zoom, setZoom] = useState(1);
  const [selectedObject, setSelectedObject] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showGrid, setShowGrid] = useState(false);
  const [pages, setPages] = useState([{ id: 1, name: 'Page 1' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [clipboardObject, setClipboardObject] = useState(null);
  const [isCanvasReady, setIsCanvasReady] = useState(false);

  // Save to history function
  const saveToHistory = useCallback(() => {
    if (!fabricRef.current) return;
    
    const json = JSON.stringify(fabricRef.current.toJSON());
    setHistory(prev => {
      const newHistory = [...prev];
      newHistory.push(json);
      return newHistory.slice(-50);
    });
    setHistoryIndex(prev => prev + 1);
  }, []);

  // Initialize Fabric canvas
  useEffect(() => {
    if (canvasRef.current && !fabricRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });

      fabricRef.current = canvas;
      setIsCanvasReady(true);

      // Event listeners
      canvas.on('selection:created', (e) => {
        setSelectedObject(e.selected[0]);
      });

      canvas.on('selection:updated', (e) => {
        setSelectedObject(e.selected[0]);
      });

      canvas.on('selection:cleared', () => {
        setSelectedObject(null);
      });

      canvas.on('object:modified', () => {
        saveToHistory();
      });

      // Initial history state
      const initialJson = JSON.stringify(canvas.toJSON());
      setHistory([initialJson]);
      setHistoryIndex(0);
    }

    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
        fabricRef.current = null;
      }
    };
  }, [saveToHistory]);

  // Update canvas size
  useEffect(() => {
    if (fabricRef.current) {
      fabricRef.current.setWidth(canvasSize.width);
      fabricRef.current.setHeight(canvasSize.height);
      fabricRef.current.renderAll();
    }
  }, [canvasSize]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0 && fabricRef.current) {
      const newIndex = historyIndex - 1;
      fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
        fabricRef.current.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1 && fabricRef.current) {
      const newIndex = historyIndex + 1;
      fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
        fabricRef.current.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  }, [history, historyIndex]);

  // Zoom controls
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 0.1, 3);
    setZoom(newZoom);
    if (fabricRef.current) {
      fabricRef.current.setZoom(newZoom);
      fabricRef.current.setWidth(canvasSize.width * newZoom);
      fabricRef.current.setHeight(canvasSize.height * newZoom);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 0.1, 0.1);
    setZoom(newZoom);
    if (fabricRef.current) {
      fabricRef.current.setZoom(newZoom);
      fabricRef.current.setWidth(canvasSize.width * newZoom);
      fabricRef.current.setHeight(canvasSize.height * newZoom);
    }
  };

  const handleZoomReset = () => {
    setZoom(1);
    if (fabricRef.current) {
      fabricRef.current.setZoom(1);
      fabricRef.current.setWidth(canvasSize.width);
      fabricRef.current.setHeight(canvasSize.height);
    }
  };

  // Delete selected object
  const handleDelete = () => {
    if (fabricRef.current && selectedObject) {
      fabricRef.current.remove(selectedObject);
      fabricRef.current.renderAll();
      setSelectedObject(null);
      saveToHistory();
    }
  };

  // Copy object
  const handleCopy = () => {
    if (selectedObject) {
      selectedObject.clone((cloned) => {
        setClipboardObject(cloned);
        toast.success('Copied to clipboard');
      });
    }
  };

  // Paste object
  const handlePaste = () => {
    if (clipboardObject && fabricRef.current) {
      clipboardObject.clone((cloned) => {
        cloned.set({
          left: cloned.left + 20,
          top: cloned.top + 20,
          evented: true,
        });
        fabricRef.current.add(cloned);
        fabricRef.current.setActiveObject(cloned);
        fabricRef.current.renderAll();
        toast.success('Pasted');
      });
    }
  };

  // Duplicate object
  const handleDuplicate = () => {
    if (selectedObject && fabricRef.current) {
      selectedObject.clone((cloned) => {
        cloned.set({
          left: selectedObject.left + 20,
          top: selectedObject.top + 20,
          evented: true,
        });
        fabricRef.current.add(cloned);
        fabricRef.current.setActiveObject(cloned);
        fabricRef.current.renderAll();
        saveToHistory();
      });
    }
  };

  // Bring to front
  const handleBringToFront = () => {
    if (selectedObject && fabricRef.current) {
      fabricRef.current.bringToFront(selectedObject);
      fabricRef.current.renderAll();
      saveToHistory();
    }
  };

  // Send to back
  const handleSendToBack = () => {
    if (selectedObject && fabricRef.current) {
      fabricRef.current.sendToBack(selectedObject);
      fabricRef.current.renderAll();
      saveToHistory();
    }
  };

  // Export as image
  const handleExport = (format = 'png') => {
    if (fabricRef.current) {
      const dataURL = fabricRef.current.toDataURL({
        format: format,
        quality: 1,
        multiplier: 2,
      });
      
      const link = document.createElement('a');
      link.download = `design-${Date.now()}.${format}`;
      link.href = dataURL;
      link.click();
      toast.success(`Exported as ${format.toUpperCase()}`);
    }
  };

  // Save design as JSON
  const handleSave = () => {
    if (fabricRef.current) {
      const json = JSON.stringify(fabricRef.current.toJSON());
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `design-${Date.now()}.json`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Design saved');
    }
  };

  // Load design from JSON
  const handleLoad = (jsonString) => {
    if (fabricRef.current) {
      try {
        fabricRef.current.loadFromJSON(JSON.parse(jsonString), () => {
          fabricRef.current.renderAll();
          saveToHistory();
          toast.success('Design loaded');
        });
      } catch (error) {
        toast.error('Failed to load design');
      }
    }
  };

  // Clear canvas
  const handleClear = () => {
    if (fabricRef.current) {
      fabricRef.current.clear();
      fabricRef.current.backgroundColor = '#ffffff';
      fabricRef.current.renderAll();
      saveToHistory();
      toast.success('Canvas cleared');
    }
  };

  // Add text
  const handleAddText = (options = {}) => {
    if (fabricRef.current) {
      const text = new fabric.IText(options.text || 'Double click to edit', {
        left: canvasSize.width / 2 - 100,
        top: canvasSize.height / 2 - 20,
        fontFamily: options.fontFamily || 'Arial',
        fontSize: options.fontSize || 32,
        fill: options.fill || '#000000',
        fontWeight: options.fontWeight || 'normal',
        fontStyle: options.fontStyle || 'normal',
        textAlign: options.textAlign || 'left',
        ...options,
      });
      fabricRef.current.add(text);
      fabricRef.current.setActiveObject(text);
      fabricRef.current.renderAll();
    }
  };

  // Add shape
  const handleAddShape = (shapeType, options = {}) => {
    if (!fabricRef.current) return;

    let shape;
    const centerX = canvasSize.width / 2 - 50;
    const centerY = canvasSize.height / 2 - 50;
    const defaultOptions = {
      left: centerX,
      top: centerY,
      fill: options.fill || '#8b5cf6',
      stroke: options.stroke || '',
      strokeWidth: options.strokeWidth || 0,
      ...options,
    };

    // Helper function to create polygon points
    const createPolygonPoints = (sides, radius = 50) => {
      const points = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        points.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
        });
      }
      return points;
    };

    switch (shapeType) {
      case 'rect':
        shape = new fabric.Rect({
          ...defaultOptions,
          width: 100,
          height: 100,
          rx: 0,
          ry: 0,
        });
        break;
        
      case 'rounded-rect':
        shape = new fabric.Rect({
          ...defaultOptions,
          width: 100,
          height: 100,
          rx: 15,
          ry: 15,
        });
        break;
        
      case 'circle':
        shape = new fabric.Circle({
          ...defaultOptions,
          radius: 50,
        });
        break;
        
      case 'ellipse':
        shape = new fabric.Ellipse({
          ...defaultOptions,
          rx: 60,
          ry: 40,
        });
        break;
        
      case 'triangle':
        shape = new fabric.Triangle({
          ...defaultOptions,
          width: 100,
          height: 100,
        });
        break;
        
      case 'right-triangle':
        shape = new fabric.Polygon([
          { x: 0, y: 0 },
          { x: 0, y: 100 },
          { x: 100, y: 100 },
        ], defaultOptions);
        break;
        
      case 'diamond':
        shape = new fabric.Polygon([
          { x: 50, y: 0 },
          { x: 100, y: 50 },
          { x: 50, y: 100 },
          { x: 0, y: 50 },
        ], defaultOptions);
        break;
        
      case 'heart':
        // Create a heart using a path
        shape = new fabric.Path(
          'M 50 88 C 10 60 10 20 50 35 C 90 20 90 60 50 88 Z',
          {
            ...defaultOptions,
            left: centerX,
            top: centerY,
            scaleX: 1.2,
            scaleY: 1.2,
          }
        );
        break;
        
      case 'cross':
        shape = new fabric.Polygon([
          { x: 35, y: 0 }, { x: 65, y: 0 },
          { x: 65, y: 35 }, { x: 100, y: 35 },
          { x: 100, y: 65 }, { x: 65, y: 65 },
          { x: 65, y: 100 }, { x: 35, y: 100 },
          { x: 35, y: 65 }, { x: 0, y: 65 },
          { x: 0, y: 35 }, { x: 35, y: 35 },
        ], defaultOptions);
        break;
        
      case 'polygon':
        shape = new fabric.Polygon(
          createPolygonPoints(options.sides || 6),
          defaultOptions
        );
        break;
        
      case 'parallelogram':
        shape = new fabric.Polygon([
          { x: 25, y: 0 },
          { x: 100, y: 0 },
          { x: 75, y: 80 },
          { x: 0, y: 80 },
        ], defaultOptions);
        break;
        
      case 'trapezoid':
        shape = new fabric.Polygon([
          { x: 20, y: 0 },
          { x: 80, y: 0 },
          { x: 100, y: 70 },
          { x: 0, y: 70 },
        ], defaultOptions);
        break;
        
      case 'star':
        const starPoints = [];
        const outerRadius = 50;
        const innerRadius = 25;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          starPoints.push({
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
          });
        }
        shape = new fabric.Polygon(starPoints, defaultOptions);
        break;
        
      // Arrow shapes
      case 'arrow-right':
        shape = new fabric.Polygon([
          { x: 0, y: 30 },
          { x: 60, y: 30 },
          { x: 60, y: 10 },
          { x: 100, y: 50 },
          { x: 60, y: 90 },
          { x: 60, y: 70 },
          { x: 0, y: 70 },
        ], defaultOptions);
        break;
        
      case 'arrow-left':
        shape = new fabric.Polygon([
          { x: 100, y: 30 },
          { x: 40, y: 30 },
          { x: 40, y: 10 },
          { x: 0, y: 50 },
          { x: 40, y: 90 },
          { x: 40, y: 70 },
          { x: 100, y: 70 },
        ], defaultOptions);
        break;
        
      case 'arrow-up':
        shape = new fabric.Polygon([
          { x: 30, y: 100 },
          { x: 30, y: 40 },
          { x: 10, y: 40 },
          { x: 50, y: 0 },
          { x: 90, y: 40 },
          { x: 70, y: 40 },
          { x: 70, y: 100 },
        ], defaultOptions);
        break;
        
      case 'arrow-down':
        shape = new fabric.Polygon([
          { x: 30, y: 0 },
          { x: 30, y: 60 },
          { x: 10, y: 60 },
          { x: 50, y: 100 },
          { x: 90, y: 60 },
          { x: 70, y: 60 },
          { x: 70, y: 0 },
        ], defaultOptions);
        break;
        
      case 'chevron-right':
        shape = new fabric.Polyline([
          { x: 20, y: 10 },
          { x: 70, y: 50 },
          { x: 20, y: 90 },
        ], {
          ...defaultOptions,
          fill: 'transparent',
          stroke: options.fill || '#8b5cf6',
          strokeWidth: 8,
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
        });
        break;
        
      case 'double-arrow':
        shape = new fabric.Polygon([
          { x: 0, y: 50 },
          { x: 25, y: 20 },
          { x: 25, y: 35 },
          { x: 75, y: 35 },
          { x: 75, y: 20 },
          { x: 100, y: 50 },
          { x: 75, y: 80 },
          { x: 75, y: 65 },
          { x: 25, y: 65 },
          { x: 25, y: 80 },
        ], defaultOptions);
        break;
        
      // Callout shapes
      case 'speech-bubble':
        shape = new fabric.Path(
          'M 10 10 L 90 10 Q 100 10 100 20 L 100 60 Q 100 70 90 70 L 40 70 L 25 90 L 25 70 L 10 70 Q 0 70 0 60 L 0 20 Q 0 10 10 10 Z',
          {
            ...defaultOptions,
            scaleX: 1.2,
            scaleY: 1.2,
          }
        );
        break;
        
      case 'thought-bubble':
        // Create thought bubble as a group with ellipse and circles
        const mainBubble = new fabric.Ellipse({
          rx: 50,
          ry: 35,
          fill: options.fill || '#8b5cf6',
          left: 0,
          top: 0,
        });
        const smallCircle1 = new fabric.Circle({
          radius: 8,
          fill: options.fill || '#8b5cf6',
          left: -30,
          top: 55,
        });
        const smallCircle2 = new fabric.Circle({
          radius: 5,
          fill: options.fill || '#8b5cf6',
          left: -40,
          top: 70,
        });
        shape = new fabric.Group([mainBubble, smallCircle1, smallCircle2], {
          left: centerX,
          top: centerY,
        });
        break;
        
      case 'rounded-speech':
        shape = new fabric.Path(
          'M 50 90 L 40 75 L 15 75 Q 0 75 0 60 L 0 15 Q 0 0 15 0 L 85 0 Q 100 0 100 15 L 100 60 Q 100 75 85 75 L 60 75 Z',
          {
            ...defaultOptions,
            scaleX: 1.2,
            scaleY: 1.0,
          }
        );
        break;
        
      // Lines
      case 'line':
        shape = new fabric.Line([0, 0, 150, 0], {
          stroke: options.fill || '#8b5cf6',
          strokeWidth: options.strokeWidth || 3,
          left: centerX,
          top: centerY + 50,
          strokeLineCap: 'round',
        });
        break;
        
      case 'line-dashed':
        shape = new fabric.Line([0, 0, 150, 0], {
          stroke: options.fill || '#8b5cf6',
          strokeWidth: options.strokeWidth || 3,
          strokeDashArray: [12, 8],
          left: centerX,
          top: centerY + 50,
          strokeLineCap: 'round',
        });
        break;
        
      case 'line-dotted':
        shape = new fabric.Line([0, 0, 150, 0], {
          stroke: options.fill || '#8b5cf6',
          strokeWidth: options.strokeWidth || 3,
          strokeDashArray: [3, 6],
          left: centerX,
          top: centerY + 50,
          strokeLineCap: 'round',
        });
        break;
        
      case 'line-arrow':
        // Line with arrow head
        const arrowLine = new fabric.Line([0, 25, 120, 25], {
          stroke: options.fill || '#8b5cf6',
          strokeWidth: 3,
          strokeLineCap: 'round',
        });
        const arrowHead = new fabric.Triangle({
          width: 15,
          height: 18,
          fill: options.fill || '#8b5cf6',
          left: 120,
          top: 16,
          angle: 90,
        });
        shape = new fabric.Group([arrowLine, arrowHead], {
          left: centerX,
          top: centerY + 50,
        });
        break;
        
      case 'line-double-arrow':
        const doubleLine = new fabric.Line([20, 25, 130, 25], {
          stroke: options.fill || '#8b5cf6',
          strokeWidth: 3,
        });
        const arrowHeadRight = new fabric.Triangle({
          width: 15,
          height: 18,
          fill: options.fill || '#8b5cf6',
          left: 130,
          top: 16,
          angle: 90,
        });
        const arrowHeadLeft = new fabric.Triangle({
          width: 15,
          height: 18,
          fill: options.fill || '#8b5cf6',
          left: 5,
          top: 34,
          angle: -90,
        });
        shape = new fabric.Group([doubleLine, arrowHeadRight, arrowHeadLeft], {
          left: centerX,
          top: centerY + 50,
        });
        break;
        
      case 'curved-line':
        shape = new fabric.Path('M 0 60 Q 75 0 150 60', {
          fill: 'transparent',
          stroke: options.fill || '#8b5cf6',
          strokeWidth: options.strokeWidth || 3,
          left: centerX,
          top: centerY + 30,
          strokeLineCap: 'round',
        });
        break;
        
      default:
        return;
    }

    fabricRef.current.add(shape);
    fabricRef.current.setActiveObject(shape);
    fabricRef.current.renderAll();
  };

  // Add image
  const handleAddImage = (url) => {
    if (fabricRef.current) {
      fabric.Image.fromURL(url, (img) => {
        const scale = Math.min(
          (canvasSize.width * 0.8) / img.width,
          (canvasSize.height * 0.8) / img.height,
          1
        );
        img.set({
          left: canvasSize.width / 2 - (img.width * scale) / 2,
          top: canvasSize.height / 2 - (img.height * scale) / 2,
          scaleX: scale,
          scaleY: scale,
        });
        fabricRef.current.add(img);
        fabricRef.current.setActiveObject(img);
        fabricRef.current.renderAll();
      }, { crossOrigin: 'anonymous' });
    }
  };

  // Apply template
  const handleApplyTemplate = (template) => {
    if (!fabricRef.current) return;
    
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = template.backgroundColor || '#ffffff';
    
    // Create objects from template
    template.objects?.forEach((obj) => {
      let fabricObj = null;
      
      switch (obj.type) {
        case 'rect':
          fabricObj = new fabric.Rect({
            left: obj.left || 0,
            top: obj.top || 0,
            width: obj.width || 100,
            height: obj.height || 100,
            fill: obj.fill || '#ffffff',
            selectable: obj.selectable !== false,
            rx: obj.rx || 0,
            ry: obj.ry || 0,
          });
          break;
        case 'circle':
          fabricObj = new fabric.Circle({
            left: obj.left || 0,
            top: obj.top || 0,
            radius: obj.radius || 50,
            fill: obj.fill || '#ffffff',
            selectable: obj.selectable !== false,
          });
          break;
        case 'text':
          fabricObj = new fabric.IText(obj.text || '', {
            left: obj.left || 0,
            top: obj.top || 0,
            fontSize: obj.fontSize || 32,
            fontFamily: obj.fontFamily || 'Arial',
            fontWeight: obj.fontWeight || 'normal',
            fontStyle: obj.fontStyle || 'normal',
            fill: obj.fill || '#000000',
            selectable: obj.selectable !== false,
          });
          break;
        case 'triangle':
          fabricObj = new fabric.Triangle({
            left: obj.left || 0,
            top: obj.top || 0,
            width: obj.width || 100,
            height: obj.height || 100,
            fill: obj.fill || '#ffffff',
            selectable: obj.selectable !== false,
          });
          break;
        default:
          break;
      }
      
      if (fabricObj) {
        fabricRef.current.add(fabricObj);
      }
    });
    
    fabricRef.current.renderAll();
    saveToHistory();
    toast.success('Template applied');
  };

  // Set background color or pattern (without clearing canvas)
  const handleSetBackground = (value) => {
    if (!fabricRef.current) return;
    
    // Find and remove any full-canvas background rectangles from templates or patterns
    const objects = fabricRef.current.getObjects();
    const bgRects = objects.filter(obj => 
      obj.type === 'rect' && 
      obj.left === 0 && 
      obj.top === 0 &&
      obj.width >= canvasSize.width - 10 &&
      obj.height >= canvasSize.height - 10 &&
      obj.selectable === false
    );
    
    bgRects.forEach(rect => {
      fabricRef.current.remove(rect);
    });
    
    // Handle pattern backgrounds
    if (typeof value === 'object' && value.type === 'pattern') {
      const pattern = value.pattern;
      const patternCanvas = document.createElement('canvas');
      const ctx = patternCanvas.getContext('2d');
      const spacing = pattern.spacing || 20;
      
      patternCanvas.width = spacing;
      patternCanvas.height = spacing;
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, spacing, spacing);
      
      // Draw pattern based on type
      ctx.fillStyle = pattern.color || '#00000020';
      ctx.strokeStyle = pattern.color || '#00000020';
      ctx.lineWidth = pattern.lineWidth || 1;
      
      if (pattern.type === 'dots') {
        ctx.beginPath();
        ctx.arc(spacing / 2, spacing / 2, pattern.size || 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (pattern.type === 'lines') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(spacing, 0);
        ctx.stroke();
      } else if (pattern.type === 'grid') {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(spacing, 0);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, spacing);
        ctx.stroke();
      } else if (pattern.type === 'diagonal') {
        ctx.beginPath();
        ctx.moveTo(0, spacing);
        ctx.lineTo(spacing, 0);
        ctx.stroke();
      }
      
      // Create fabric pattern
      const fabricPattern = new fabric.Pattern({
        source: patternCanvas,
        repeat: 'repeat'
      });
      
      // Create background rect with pattern
      const bgRect = new fabric.Rect({
        left: 0,
        top: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        fill: fabricPattern,
        selectable: false,
        evented: false,
        excludeFromExport: false
      });
      
      fabricRef.current.backgroundColor = '#ffffff';
      fabricRef.current.add(bgRect);
      fabricRef.current.sendToBack(bgRect);
    } else {
      // Handle solid color
      fabricRef.current.backgroundColor = value;
    }
    
    fabricRef.current.renderAll();
    saveToHistory();
  };

  // Handle preset change
  const handlePresetChange = (preset) => {
    setSelectedPreset(preset.name);
    setCanvasSize({ width: preset.width, height: preset.height });
    setShowSizeDropdown(false);
    if (fabricRef.current) {
      fabricRef.current.setWidth(preset.width);
      fabricRef.current.setHeight(preset.height);
      fabricRef.current.renderAll();
    }
  };

  // Add page
  const handleAddPage = () => {
    const newPage = { id: pages.length + 1, name: `Page ${pages.length + 1}` };
    setPages([...pages, newPage]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        handlePaste();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        handleDuplicate();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedObject) {
          e.preventDefault();
          handleDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObject, clipboardObject, handleUndo, handleRedo]);

  return (
    <div className="h-screen flex flex-col bg-surface-100 dark:bg-surface-950 overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between px-4 shrink-0">
        {/* Left section */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 hidden sm:block">Design Studio</span>
          </div>

          <div className="w-px h-6 bg-surface-200 dark:bg-surface-700" />

          {/* Canvas Size Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSizeDropdown(!showSizeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
            >
              <Settings className="w-4 h-4" />
              {selectedPreset} ({canvasSize.width} × {canvasSize.height})
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showSizeDropdown && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-surface-800 rounded-lg shadow-xl border border-surface-200 dark:border-surface-700 z-50 max-h-80 overflow-y-auto">
                {CANVAS_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetChange(preset)}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-surface-100 dark:hover:bg-surface-700 flex justify-between items-center ${
                      selectedPreset === preset.name ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'
                    }`}
                  >
                    <span>{preset.name}</span>
                    <span className="text-xs text-surface-500">{preset.width} × {preset.height}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-2" />

          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed text-surface-600 dark:text-surface-400"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed text-surface-600 dark:text-surface-400"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center section - Zoom */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-3 py-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-sm text-surface-600 dark:text-surface-400 min-w-[60px]"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-surface-200 dark:bg-surface-700 mx-2" />
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-lg ${showGrid ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-600 dark:text-surface-400'}`}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {/* Right section - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          
          <div className="relative group">
            <button
              onClick={() => handleExport('png')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-white dark:bg-surface-800 rounded-lg shadow-xl border border-surface-200 dark:border-surface-700 overflow-hidden min-w-[120px]">
              <button
                onClick={() => handleExport('png')}
                className="w-full px-4 py-2 text-left text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
              >
                PNG
              </button>
              <button
                onClick={() => handleExport('jpeg')}
                className="w-full px-4 py-2 text-left text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
              >
                JPEG
              </button>
              <button
                onClick={() => handleExport('svg')}
                className="w-full px-4 py-2 text-left text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
              >
                SVG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <DesignSidebar
          activePanel={activePanel}
          setActivePanel={setActivePanel}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          onApplyTemplate={handleApplyTemplate}
          onSetBackground={handleSetBackground}
          canvasSize={canvasSize}
        />

        {/* Canvas Area */}
        <div 
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center bg-surface-200 dark:bg-surface-800"
          style={{
            backgroundImage: showGrid 
              ? 'linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)'
              : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto',
            backgroundPosition: showGrid ? '0 0, 0 10px, 10px -10px, -10px 0px' : 'auto',
          }}
        >
          <div 
            className="shadow-2xl rounded-sm"
            style={{
              width: canvasSize.width * zoom,
              height: canvasSize.height * zoom,
              minWidth: canvasSize.width * zoom,
              minHeight: canvasSize.height * zoom,
            }}
          >
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Right Sidebar - Object Properties */}
        {selectedObject && (
          <DesignToolbar
            selectedObject={selectedObject}
            fabric={fabricRef.current}
            onUpdate={() => {
              fabricRef.current?.renderAll();
              saveToHistory();
            }}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
          />
        )}
      </div>

      {/* Bottom Page Bar */}
      <div className="h-16 bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 flex items-center justify-center gap-4 px-4 shrink-0">
        <div className="flex items-center gap-2">
          {pages.map((page) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`w-24 h-10 rounded-lg border-2 flex items-center justify-center text-xs transition-all ${
                currentPage === page.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-surface-300 dark:hover:border-surface-600'
              }`}
            >
              <Layers className="w-3 h-3 mr-1" />
              {page.id}
            </button>
          ))}
          <button
            onClick={handleAddPage}
            className="w-10 h-10 rounded-lg border-2 border-dashed border-surface-300 dark:border-surface-600 flex items-center justify-center hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <Plus className="w-4 h-4 text-surface-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignStudio;
