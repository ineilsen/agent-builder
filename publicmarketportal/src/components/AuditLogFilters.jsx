import { Calendar, Download } from 'lucide-react';

const AuditLogFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-5 gap-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          <select
            value={filters.department}
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Departments</option>
            <option value="MHCLG">MHCLG</option>
            <option value="HMRC">HMRC</option>
            <option value="NHS">NHS</option>
            <option value="MOJ">MOJ</option>
            <option value="Home Office">Home Office</option>
          </select>
        </div>

        {/* Action Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
          <select
            value={filters.actionType}
            onChange={(e) => onFilterChange('actionType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="Review">Review</option>
            <option value="Assessment">Assessment</option>
            <option value="Audit">Audit</option>
            <option value="Compliance">Compliance</option>
            <option value="Security">Security</option>
            <option value="Testing">Testing</option>
            <option value="Deployment">Deployment</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Review">Under Review</option>
          </select>
        </div>

        {/* Export Button */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
          <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogFilters;
