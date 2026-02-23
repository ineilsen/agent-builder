import { AlertTriangle } from 'lucide-react';

const RiskSystemCard = ({ system }) => {
  const riskColors = {
    'Critical': 'bg-red-100 text-red-700 border-red-300',
    'High': 'bg-orange-100 text-orange-700 border-orange-300',
    'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    'Low': 'bg-green-100 text-green-700 border-green-300'
  };

  const statusColors = {
    'Mitigation Required': 'bg-red-100 text-red-700',
    'Under Review': 'bg-yellow-100 text-yellow-700',
    'Approved': 'bg-green-100 text-green-700'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${riskColors[system.riskLevel]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{system.name}</h4>
          <p className="text-sm text-gray-600">{system.department}</p>
        </div>
        <AlertTriangle className="w-5 h-5" />
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-xs text-gray-600">Risk Score</p>
          <p className="text-lg font-bold">{system.riskScore}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">Category</p>
          <p className="text-sm font-semibold">{system.category}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-1 rounded-full font-semibold ${statusColors[system.status]}`}>
          {system.status}
        </span>
        <span className="text-gray-600">Last assessed: {system.lastAssessed}</span>
      </div>
    </div>
  );
};

export default RiskSystemCard;
