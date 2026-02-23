import { CheckCircle, AlertCircle, Calendar, Award } from 'lucide-react';

const ComplianceFrameworkDetail = ({ framework }) => {
  const statusColors = {
    'Compliant': 'text-green-600',
    'In Progress': 'text-yellow-600',
    'Non-Compliant': 'text-red-600'
  };

  const priorityColors = {
    'High': 'bg-red-100 text-red-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{framework.name}</h3>
          <p className="text-sm text-gray-600">Last updated: {framework.lastUpdated}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900 mb-1">{framework.score}%</div>
          {framework.certificate !== 'PENDING' && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <Award className="w-4 h-4" />
              <span>{framework.certificate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${
              framework.score >= 90 ? 'bg-green-600' : framework.score >= 80 ? 'bg-blue-600' : 'bg-yellow-600'
            }`}
            style={{ width: `${framework.score}%` }}
          ></div>
        </div>
      </div>

      {/* Requirements */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Requirements</h4>
        <div className="space-y-2">
          {framework.requirements.map((req, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2 flex-1">
                <CheckCircle className={`w-4 h-4 ${statusColors[req.status]}`} />
                <span className="text-sm text-gray-700">{req.name}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`text-xs font-semibold ${statusColors[req.status]}`}>
                  {req.status}
                </span>
                <span className="text-xs text-gray-600">{req.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      {framework.actionItems.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <span>Action Items</span>
          </h4>
          <div className="space-y-2">
            {framework.actionItems.map((item, index) => (
              <div key={index} className="flex items-start justify-between p-2 bg-orange-50 border border-orange-200 rounded">
                <p className="text-sm text-gray-700 flex-1">{item.task}</p>
                <div className="flex items-center space-x-2 ml-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${priorityColors[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-gray-600 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{item.dueDate}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Review */}
      <div className="mt-4 text-sm text-gray-600 flex items-center space-x-2">
        <Calendar className="w-4 h-4" />
        <span>Next review: {framework.nextReview}</span>
      </div>
    </div>
  );
};

export default ComplianceFrameworkDetail;
