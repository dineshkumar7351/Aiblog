/**
 * Blog Card Component
 * Card display for blog posts in list view
 */

import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Edit3, 
  Trash2, 
  Eye,
  BarChart2,
  MoreVertical
} from 'lucide-react';
import { useState } from 'react';

const BlogCard = ({ blog, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getScoreBadgeClass = (score) => {
    if (!score) return 'badge-warning';
    if (score >= 80) return 'badge-success';
    if (score >= 60) return 'badge bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (score >= 40) return 'badge-warning';
    return 'badge-danger';
  };

  return (
    <div className="card-hover p-5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${blog.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
            {blog.status === 'published' ? 'Published' : 'Draft'}
          </span>
          {blog.seoScore !== null && (
            <span className={getScoreBadgeClass(blog.seoScore)}>
              <BarChart2 className="w-3 h-3 mr-1" />
              SEO: {blog.seoScore}
            </span>
          )}
        </div>

        {/* Actions dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-surface-500" />
          </button>

          {menuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-36 py-1 bg-white dark:bg-surface-800 rounded-lg shadow-lg border border-surface-200 dark:border-surface-700 z-50">
                <Link
                  to={`/edit/${blog._id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Link>
                <Link
                  to={`/blog/${blog._id}`}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                >
                  <Eye className="w-4 h-4" />
                  View
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete && onDelete(blog._id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Link to={`/blog/${blog._id}`}>
        <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2">
          {blog.title}
        </h3>
      </Link>

      <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 line-clamp-3">
        {truncateContent(blog.content)}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-1.5 text-xs text-surface-500">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(blog.createdAt)}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/edit/${blog._id}`}
            className="btn-sm btn-ghost"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
