import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

const AlertCard = ({ alert }) => {
  const icons = {
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };

  const colors = {
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const iconColors = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  const Icon = icons[alert.type] || Info;

  return (
    <div className={`${colors[alert.type]} border rounded-lg p-4`}>
      <div className="flex items-start space-x-3">
        <Icon className={`w-5 h-5 ${iconColors[alert.type]} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">{alert.title}</h4>
          <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
          <p className="text-xs text-gray-500">{alert.timestamp}</p>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;
