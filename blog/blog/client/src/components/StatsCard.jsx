/**
 * Stats Card Component
 * Dashboard statistics display card
 */

const StatsCard = ({ title, value, icon: Icon, trend, trendLabel, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-accent-500 to-accent-600',
    success: 'from-emerald-500 to-emerald-600',
    warning: 'from-amber-500 to-amber-600',
  };

  const bgClasses = {
    primary: 'bg-primary-50 dark:bg-primary-900/20',
    secondary: 'bg-secondary-50 dark:bg-secondary-900/20',
    accent: 'bg-accent-50 dark:bg-accent-900/20',
    success: 'bg-emerald-50 dark:bg-emerald-900/20',
    warning: 'bg-amber-50 dark:bg-amber-900/20',
  };

  const iconClasses = {
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    accent: 'text-accent-500',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgClasses[color]}`}>
          <Icon className={`w-6 h-6 ${iconClasses[color]}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trend >= 0 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-1">
        {value ?? '-'}
      </h3>
      <p className="text-sm text-surface-500">
        {title}
      </p>
      {trendLabel && (
        <p className="text-xs text-surface-400 mt-2">{trendLabel}</p>
      )}
    </div>
  );
};

export default StatsCard;
