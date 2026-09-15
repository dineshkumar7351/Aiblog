/**
 * Blog List Page
 * Display all user's blogs with filtering and pagination
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';
import BlogCard from '../components/BlogCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  PenSquare, 
  Search,
  Filter,
  FileText,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchBlogs();
  }, [filter]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = { page: 1, limit: 20 };
      if (filter !== 'all') {
        params.status = filter;
      }
      
      const response = await blogAPI.getAll(params);
      setBlogs(response.data.data.blogs);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await blogAPI.delete(id);
      toast.success('Blog deleted successfully');
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  // Filter blogs by search query
  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-surface-100">
            My Blogs
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Manage and edit your blog posts
          </p>
        </div>
        <Link to="/write" className="btn-primary">
          <PenSquare className="w-5 h-5" />
          Write New Blog
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12"
            placeholder="Search blogs..."
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-surface-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Blogs</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-surface-600 dark:text-surface-400">
        <span className="flex items-center gap-1">
          <FileText className="w-4 h-4" />
          {pagination.total} {pagination.total === 1 ? 'blog' : 'blogs'}
        </span>
        {searchQuery && (
          <span>
            · {filteredBlogs.length} result{filteredBlogs.length !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="xl" />
        </div>
      ) : filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBlogs.map((blog) => (
            <BlogCard 
              key={blog._id} 
              blog={blog} 
              onDelete={handleDeleteBlog}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            {searchQuery ? (
              <Search className="w-10 h-10 text-surface-400" />
            ) : (
              <Sparkles className="w-10 h-10 text-surface-400" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
            {searchQuery ? 'No blogs found' : 'No blogs yet'}
          </h3>
          <p className="text-surface-500 mb-8 max-w-md mx-auto">
            {searchQuery 
              ? `No blogs match "${searchQuery}". Try a different search term.`
              : 'Start creating your first blog post with AI assistance!'
            }
          </p>
          {!searchQuery && (
            <Link to="/write" className="btn-primary">
              <PenSquare className="w-5 h-5" />
              Write Your First Blog
            </Link>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => {
                setPagination(prev => ({ ...prev, page }));
                // Would trigger refetch in real pagination
              }}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                page === pagination.page
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;
