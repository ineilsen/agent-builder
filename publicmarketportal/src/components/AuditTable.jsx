import { CheckCircle, XCircle, Clock, MoreVertical } from 'lucide-react';

const AuditTable = ({ audits }) => {
  const statusIcons = {
    Passed: <CheckCircle className="w-4 h-4 text-green-600" />,
    Failed: <XCircle className="w-4 h-4 text-red-600" />,
    Review: <Clock className="w-4 h-4 text-yellow-600" />
  };

  const statusColors = {
    Passed: 'bg-green-100 text-green-700',
    Failed: 'bg-red-100 text-red-700',
    Review: 'bg-yellow-100 text-yellow-700'
  };

  const departmentColors = {
    MHCLG: 'bg-cyan-100 text-cyan-700',
    HMRC: 'bg-orange-100 text-orange-700',
    MOJ: 'bg-purple-100 text-purple-700',
    'Home Office': 'bg-pink-100 text-pink-700',
    NHS: 'bg-blue-100 text-blue-700'
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              AI System
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {audits.map((audit, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {audit.system}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`${departmentColors[audit.department]} px-2 py-1 rounded-full text-xs font-semibold`}>
                  {audit.department}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {audit.action}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`${statusColors[audit.status]} px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit`}>
                  {statusIcons[audit.status]}
                  <span>{audit.status}</span>
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {audit.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button className="hover:text-gray-700">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTable;
