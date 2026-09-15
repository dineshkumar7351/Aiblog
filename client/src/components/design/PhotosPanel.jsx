/**
 * Photos Panel Component
 * Stock photos and images for the design canvas
 */

import { useState } from 'react';
import { Search, Image, Loader2 } from 'lucide-react';

// Sample stock photos (in production, these would come from an API like Unsplash)
const stockPhotos = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=200&h=200&fit=crop',
    category: 'nature',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    category: 'nature',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&h=200&fit=crop',
    category: 'nature',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=200&h=200&fit=crop',
    category: 'nature',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=200&h=200&fit=crop',
    category: 'nature',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    category: 'people',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    category: 'people',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    category: 'people',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=200&h=200&fit=crop',
    category: 'business',
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=200&fit=crop',
    category: 'business',
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200&h=200&fit=crop',
    category: 'business',
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
    category: 'food',
  },
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&h=200&fit=crop',
    category: 'food',
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
    category: 'food',
  },
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop',
    category: 'abstract',
  },
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&h=400&fit=crop',
    thumb: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&h=200&fit=crop',
    category: 'abstract',
  },
];

const categories = ['All', 'Nature', 'People', 'Business', 'Food', 'Abstract'];

const PhotosPanel = ({ onAddImage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  const filteredPhotos = stockPhotos.filter((photo) => {
    const matchesCategory =
      activeCategory === 'All' || photo.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesCategory;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-surface-200 dark:border-surface-800">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">
          Photos
        </h3>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 border-none text-sm placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2 overflow-x-auto border-b border-surface-200 dark:border-surface-800">
        <div className="flex gap-2">
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

      {/* Photos Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => onAddImage(photo.url)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800 hover:ring-2 hover:ring-primary-500 transition-all"
              >
                <img
                  src={photo.thumb}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {filteredPhotos.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <Image className="w-12 h-12 mx-auto mb-3 text-surface-300 dark:text-surface-600" />
            <p className="text-sm text-surface-500">No photos found</p>
          </div>
        )}
      </div>

      {/* Attribution */}
      <div className="p-4 border-t border-surface-200 dark:border-surface-800">
        <p className="text-xs text-surface-400 text-center">
          Photos from Unsplash
        </p>
      </div>
    </div>
  );
};

export default PhotosPanel;
