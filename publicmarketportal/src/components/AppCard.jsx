import { CheckCircle, Users, Star, Info, ArrowRight } from 'lucide-react';

const AppCard = ({ app, variant = "default" }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 ${app.iconBg} rounded-lg flex items-center justify-center`}>
            <app.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{app.name}</h3>
            <span className="text-sm text-gray-600">{app.category}</span>
          </div>
        </div>
        <span className={`${app.providerBadge} px-3 py-1 rounded-full text-xs font-semibold`}>
          {app.provider}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4">{app.description}</p>

      {/* Features */}
      <div className="flex flex-wrap gap-2 mb-4">
        {app.features.map((feature, index) => (
          <div
            key={index}
            className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full"
          >
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-xs text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      {/* Responsible AI Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Responsible AI Score</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{app.responsibleAIScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${app.responsibleAIScore}%` }}
          ></div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{app.users}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span>{app.rating}</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-green-600">{app.status}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 mt-4">
        {app.externalUrl ? (
          <a
            href={app.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>View App</span>
          </a>
        ) : app.route ? (
          <a
            href={app.route}
            className="flex-1 flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <Info className="w-4 h-4" />
            <span>View App</span>
          </a>
        ) : (
          <button className="flex-1 flex items-center justify-center space-x-2 border-2 border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            <Info className="w-4 h-4" />
            <span>View App</span>
          </button>
        )}
        <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          <span>Deploy</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AppCard;
