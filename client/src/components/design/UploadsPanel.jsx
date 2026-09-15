/**
 * Uploads Panel Component
 * Upload and manage images for the design canvas
 */

import { useState, useRef } from 'react';
import { Upload, Image, Folder, Trash2, Plus, Cloud, X } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadsPanel = ({ onAddImage }) => {
  const [uploads, setUploads] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newUpload = {
          id: Date.now() + Math.random(),
          name: file.name,
          url: e.target.result,
          size: file.size,
          type: file.type,
        };
        setUploads((prev) => [...prev, newUpload]);
        toast.success(`Uploaded ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
    toast.success('Image removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Uploads
        </h3>

        {/* Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`mx-4 mt-4 p-6 rounded-xl border-2 border-dashed transition-colors ${
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-surface-300 dark:border-surface-600'
        }`}
      >
        <div className="text-center">
          <Cloud className={`w-10 h-10 mx-auto mb-2 ${isDragging ? 'text-primary-500' : 'text-surface-400'}`} />
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Drag & drop images here
          </p>
          <p className="text-xs text-surface-400 mt-1">
            or click the button above
          </p>
        </div>
      </div>

      {/* Uploads Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {uploads.length === 0 ? (
          <div className="text-center py-8">
            <Image className="w-12 h-12 mx-auto mb-3 text-surface-300 dark:text-surface-600" />
            <p className="text-sm text-surface-500">No uploads yet</p>
            <p className="text-xs text-surface-400 mt-1">
              Upload images to use in your design
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                onClick={() => onAddImage(upload.url)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
              >
                <img
                  src={upload.url}
                  alt={upload.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <button
                    onClick={(e) => handleDelete(upload.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* File info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{upload.name}</p>
                  <p className="text-[10px] text-white/70">{formatFileSize(upload.size)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage Info */}
      {uploads.length > 0 && (
        <div className="p-4 border-t border-surface-200 dark:border-surface-800">
          <div className="flex items-center justify-between text-xs text-surface-500">
            <span>{uploads.length} file(s)</span>
            <span>
              {formatFileSize(uploads.reduce((acc, u) => acc + u.size, 0))} used
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadsPanel;
