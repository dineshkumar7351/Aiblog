/**
 * Dashboard Page
 * Main dashboard with stats and recent blogs
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { blogAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import BlogCard from '../components/BlogCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FileText, 
  Send, 
  FileEdit, 
  BarChart2,
  PenSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await blogAPI.getStats();
      setStats(response.data.data.stats);
      setRecentBlogs(response.data.data.recentBlogs);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await blogAPI.delete(id);
      toast.success('Blog deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-surface-100">
            Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Here's what's happening with your blog today.
          </p>
        </div>
        <Link to="/write" className="btn-primary">
          <PenSquare className="w-5 h-5" />
          Write New Blog
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Blogs"
          value={stats?.totalBlogs || 0}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Published"
          value={stats?.publishedBlogs || 0}
          icon={Send}
          color="success"
        />
        <StatsCard
          title="Drafts"
          value={stats?.draftBlogs || 0}
          icon={FileEdit}
          color="warning"
        />
        <StatsCard
          title="Avg SEO Score"
          value={stats?.avgSeoScore || '-'}
          icon={BarChart2}
          color="secondary"
        />
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/write" 
            className="group p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PenSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">Write New Blog</p>
                <p className="text-sm text-surface-500">Start a new post</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/blogs" 
            className="group p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-secondary-300 dark:hover:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-900/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">View All Blogs</p>
                <p className="text-sm text-surface-500">Manage your content</p>
              </div>
            </div>
          </Link>

          <Link 
            to="/analytics" 
            className="group p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-accent-300 dark:hover:border-accent-700 hover:bg-accent-50 dark:hover:bg-accent-900/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart2 className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <p className="font-medium text-surface-900 dark:text-surface-100">Analytics</p>
                <p className="text-sm text-surface-500">View insights</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Blogs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            Recent Blogs
          </h2>
          <Link 
            to="/blogs" 
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBlogs.map((blog) => (
              <BlogCard 
                key={blog._id} 
                blog={blog} 
                onDelete={handleDeleteBlog}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-medium text-surface-900 dark:text-surface-100 mb-2">
              No blogs yet
            </h3>
            <p className="text-surface-500 mb-6">
              Start writing your first blog post with AI assistance!
            </p>
            <Link to="/write" className="btn-primary">
              <PenSquare className="w-5 h-5" />
              Write Your First Blog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
