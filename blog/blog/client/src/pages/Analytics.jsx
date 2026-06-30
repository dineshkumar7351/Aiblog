/**
 * Analytics Page
 * Display blog performance analytics
 */

import { useState, useEffect } from 'react';
import { blogAPI } from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FileText, 
  Send, 
  FileEdit, 
  BarChart2,
  TrendingUp,
  Award,
  Target,
  Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, blogsRes] = await Promise.all([
        blogAPI.getStats(),
        blogAPI.getAll({ limit: 100 })
      ]);
      
      setStats(statsRes.data.data.stats);
      setBlogs(blogsRes.data.data.blogs);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Calculate additional analytics
  const getAnalytics = () => {
    if (!blogs.length) return null;

    const publishedBlogs = blogs.filter(b => b.status === 'published');
    const blogsWithSEO = blogs.filter(b => b.seoScore !== null);
    const totalWords = blogs.reduce((acc, blog) => {
      return acc + blog.content.split(/\s+/).filter(w => w.length > 0).length;
    }, 0);

    const seoDistribution = {
      excellent: blogsWithSEO.filter(b => b.seoScore >= 80).length,
      good: blogsWithSEO.filter(b => b.seoScore >= 60 && b.seoScore < 80).length,
      average: blogsWithSEO.filter(b => b.seoScore >= 40 && b.seoScore < 60).length,
      needsWork: blogsWithSEO.filter(b => b.seoScore < 40).length,
    };

    return {
      totalWords,
      avgWordsPerBlog: Math.round(totalWords / blogs.length),
      publishRate: Math.round((publishedBlogs.length / blogs.length) * 100),
      seoDistribution,
      topBlogs: [...blogsWithSEO].sort((a, b) => b.seoScore - a.seoScore).slice(0, 5)
    };
  };

  const analytics = getAnalytics();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-surface-100">
          Analytics
        </h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">
          Track your blog performance and insights
        </p>
      </div>

      {/* Main Stats */}
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

      {analytics && blogs.length > 0 ? (
        <>
          {/* Additional Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <TrendingUp className="w-5 h-5 text-primary-500" />
                </div>
                <span className="text-sm text-surface-500">Total Words</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {analytics.totalWords.toLocaleString()}
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-900/30">
                  <Target className="w-5 h-5 text-secondary-500" />
                </div>
                <span className="text-sm text-surface-500">Avg Words/Blog</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {analytics.avgWordsPerBlog.toLocaleString()}
              </p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30">
                  <Award className="w-5 h-5 text-accent-500" />
                </div>
                <span className="text-sm text-surface-500">Publish Rate</span>
              </div>
              <p className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {analytics.publishRate}%
              </p>
            </div>
          </div>

          {/* SEO Distribution */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
              SEO Score Distribution
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {analytics.seoDistribution.excellent}
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">Excellent (80+)</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {analytics.seoDistribution.good}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Good (60-79)</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {analytics.seoDistribution.average}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">Average (40-59)</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {analytics.seoDistribution.needsWork}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">Needs Work (&lt;40)</p>
              </div>
            </div>
          </div>

          {/* Top Performing Blogs */}
          {analytics.topBlogs.length > 0 && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-6">
                Top Performing Blogs (by SEO Score)
              </h2>
              <div className="space-y-4">
                {analytics.topBlogs.map((blog, index) => (
                  <div 
                    key={blog._id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                  >
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center font-bold
                      ${index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                      ${index === 1 ? 'bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-300' : ''}
                      ${index === 2 ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                      ${index > 2 ? 'bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400' : ''}
                    `}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-surface-900 dark:text-surface-100 truncate">
                        {blog.title}
                      </h3>
                      <p className="text-sm text-surface-500">
                        {blog.content.split(/\s+/).filter(w => w.length > 0).length} words
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        blog.seoScore >= 80 ? 'text-emerald-500' :
                        blog.seoScore >= 60 ? 'text-green-500' :
                        blog.seoScore >= 40 ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        {blog.seoScore}
                      </p>
                      <p className="text-xs text-surface-500">SEO Score</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-surface-400" />
          </div>
          <h3 className="text-xl font-semibold text-surface-900 dark:text-surface-100 mb-2">
            No Analytics Yet
          </h3>
          <p className="text-surface-500 max-w-md mx-auto">
            Start writing blogs and use the AI SEO checker to see your performance analytics here.
          </p>
        </div>
      )}
    </div>
  );
};

export default Analytics;
