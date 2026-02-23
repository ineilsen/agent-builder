import { Sparkles, TrendingUp, Star, Building } from 'lucide-react';
import { stats } from '../data/mockData';

const StatsCards = () => {
  const statsData = [
    {
      ...stats.totalApps,
      icon: Sparkles,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      ...stats.activeDeployments,
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      ...stats.userSatisfaction,
      icon: Star,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      ...stats.departments,
      icon: Building,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <section className="py-12 bg-white">
      <div className="w-full px-6">
        <div className="grid grid-cols-4 gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <div className="flex items-center space-x-2">
                  {stat.trend && (
                    <span className="text-sm font-semibold text-green-600 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">{stat.trendLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCards;
