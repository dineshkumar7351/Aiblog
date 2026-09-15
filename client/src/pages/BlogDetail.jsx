/**
 * Blog Detail Page
 * View a single blog post
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { blogAPI, linkedinAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Edit3, 
  Trash2,
  BarChart2,
  Share2,
  Linkedin,
  Instagram,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const linkedInAuthState = params.get('linkedinAuth');

    if (!linkedInAuthState) {
      return;
    }

    if (linkedInAuthState === 'success') {
      toast.success('LinkedIn connected successfully');
      resumePendingLinkedInShare();
    } else if (linkedInAuthState === 'denied') {
      toast.error('LinkedIn authorization was denied');
    } else {
      toast.error('LinkedIn authorization failed. Please try again.');
    }

    params.delete('linkedinAuth');
    params.delete('linkedinError');

    const nextSearch = params.toString();
    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : ''
      },
      { replace: true }
    );
  }, [location.search]);

  const fetchBlog = async () => {
    try {
      const response = await blogAPI.getOne(id);
      setBlog(response.data.data.blog);
    } catch (error) {
      toast.error('Failed to load blog');
      navigate('/blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await blogAPI.delete(id);
      toast.success('Blog deleted successfully');
      navigate('/blogs');
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const performShareToSocial = async (platforms, blogUrl = window.location.href) => {
    if (!blog || blog.status !== 'published') {
      toast.error('Publish the blog before posting to social media');
      return;
    }

    setSharing(true);
    try {
      const response = await blogAPI.shareToSocial(blog._id, {
        platforms,
        blogUrl
      });

      const results = response.data?.data?.results || [];
      const successCount = results.filter((item) => item.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0 && failCount === 0) {
        toast.success(`Posted to ${successCount} platform${successCount > 1 ? 's' : ''}`);
        return;
      }

      if (successCount > 0) {
        toast.success(`Posted to ${successCount} platform${successCount > 1 ? 's' : ''}. ${failCount} failed.`);
        return;
      }

      toast.error(response.data?.message || 'Social posting failed');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to share blog';
      toast.error(message);
    } finally {
      setSharing(false);
    }
  };

  const resumePendingLinkedInShare = async () => {
    const rawPending = sessionStorage.getItem('pendingLinkedInShare');
    if (!rawPending) {
      return;
    }

    try {
      const pending = JSON.parse(rawPending);
      if (pending.blogId !== id) {
        return;
      }

      sessionStorage.removeItem('pendingLinkedInShare');
      await performShareToSocial(pending.platforms || ['linkedin'], pending.blogUrl || window.location.href);
    } catch (error) {
      sessionStorage.removeItem('pendingLinkedInShare');
    }
  };

  const handleShareToSocial = async (platforms) => {
    if (platforms.includes('linkedin')) {
      try {
        const statusResponse = await linkedinAPI.getStatus();
        const connected = Boolean(statusResponse.data?.data?.connected);

        if (!connected) {
          sessionStorage.setItem('pendingLinkedInShare', JSON.stringify({
            blogId: id,
            platforms,
            blogUrl: window.location.href
          }));

          const authResponse = await linkedinAPI.getAuthUrl(window.location.href);
          const authUrl = authResponse.data?.data?.authUrl;

          if (!authUrl) {
            throw new Error('LinkedIn authorization URL was not returned');
          }

          window.location.href = authUrl;
          return;
        }
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to start LinkedIn authorization';
        toast.error(message);
        return;
      }
    }

    await performShareToSocial(platforms);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-green-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-surface-500">Blog not found</p>
      </div>
    );
  }

  const isAuthor = user?.id === blog.author?._id;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="btn-ghost btn-sm"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            {isAuthor && blog.status === 'published' && (
              <>
                <button
                  onClick={() => handleShareToSocial(['linkedin'])}
                  disabled={sharing}
                  className="btn-outline btn-sm"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </button>
                <button
                  onClick={() => handleShareToSocial(['instagram'])}
                  disabled={sharing}
                  className="btn-outline btn-sm"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </button>
                <button
                  onClick={() => handleShareToSocial(['linkedin', 'instagram'])}
                  disabled={sharing}
                  className="btn-primary btn-sm"
                >
                  <Share2 className="w-4 h-4" />
                  {sharing ? 'Posting...' : 'Post Both'}
                </button>
              </>
            )}
            
            {isAuthor && (
              <>
                <Link
                  to={`/edit/${blog._id}`}
                  className="btn-outline btn-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn-danger btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Blog Content */}
        <article className="card p-8 lg:p-12">
          {/* Status Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`badge ${blog.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
              {blog.status === 'published' ? 'Published' : 'Draft'}
            </span>
            {blog.seoScore !== null && (
              <span className="flex items-center gap-1 text-sm">
                <BarChart2 className="w-4 h-4" />
                <span className={getScoreColor(blog.seoScore)}>
                  SEO Score: {blog.seoScore}
                </span>
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-surface-900 dark:text-surface-100 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 pb-6 mb-8 border-b border-surface-200 dark:border-surface-800">
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <User className="w-4 h-4" />
              <span>{blog.author?.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
            <div className="text-sm text-surface-500">
              {blog.content.split(/\s+/).filter(w => w.length > 0).length} words
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {blog.content.split('\n').map((paragraph, index) => (
              paragraph.trim() ? (
                <p key={index} className="text-surface-700 dark:text-surface-300 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ) : <br key={index} />
            ))}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-surface-200 dark:border-surface-800">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-sm text-surface-600 dark:text-surface-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Author Card */}
        <div className="mt-8 card p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {blog.author?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-sm text-surface-500">Written by</p>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {blog.author?.name || 'Anonymous'}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
