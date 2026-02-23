import { useState } from 'react';
import { Shield, Activity, Clock, AlertTriangle, TrendingUp, CheckCircle, Filter, Search } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import AlertCard from '../components/AlertCard';
import AuditTable from '../components/AuditTable';
import RiskMatrixGrid from '../components/RiskMatrixGrid';
import RiskSystemCard from '../components/RiskSystemCard';
import ComplianceFrameworkDetail from '../components/ComplianceFrameworkDetail';
import AuditLogFilters from '../components/AuditLogFilters';
import ResourceCard from '../components/ResourceCard';
import { alerts, complianceFrameworks, auditLogs, stats } from '../data/responsibleAIData';
import { riskSummary, riskSystems, matrixData, riskCategories } from '../data/riskMatrixData';
import { detailedCompliance } from '../data/complianceDetailData';
import { extendedAuditLogs } from '../data/extendedAuditLogs';
import { resources, resourceCategories } from '../data/resourcesData';

const ResponsibleAI = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [auditFilters, setAuditFilters] = useState({
    dateRange: 'all',
    department: 'all',
    actionType: 'all',
    status: 'all'
  });
  const [resourceCategory, setResourceCategory] = useState('All Resources');
  const [resourceSearch, setResourceSearch] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'risk-matrix', label: 'Risk Matrix' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'audit-log', label: 'Audit Log' },
    { id: 'resources', label: 'Resources' }
  ];

  const statsCards = [
    {
      icon: Activity,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      ...stats.aiSystemsDeployed
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      ...stats.complianceScore,
      hasTrend: true
    },
    {
      icon: Clock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      ...stats.activeRiskAssessments
    },
    {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      ...stats.pendingReviews
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-12">
        <div className="w-full px-6">
          <Breadcrumb items={[{ label: 'Responsible AI Dashboard' }]} />

          <div className="flex items-start space-x-6">
            <div className="w-20 h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-3">Responsible AI Dashboard</h1>
              <p className="text-lg text-blue-50">
                Monitor AI system compliance, governance, and risk assessments across all UK government departments.
                Ensure responsible AI deployment and operation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="w-full px-6 -mt-8 mb-8">
        <div className="grid grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <div className={`w-10 h-10 ${stat.iconBg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              {stat.hasTrend ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-green-600 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.trend}
                  </span>
                  <span className="text-sm text-gray-500">{stat.sublabel}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-500">{stat.sublabel}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full px-6">
        <div className="border-b border-gray-200 mb-8">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 font-semibold transition-colors ${activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Two Column Layout */}
            <div className="grid grid-cols-5 gap-6">
              {/* Alerts - Left Column */}
              <div className="col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
                    </div>
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                      {alerts.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {alerts.map((alert, index) => (
                      <AlertCard key={index} alert={alert} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Compliance Frameworks - Right Column */}
              <div className="col-span-3">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Compliance Frameworks</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">Track compliance progress across key regulatory frameworks</p>
                  <div className="space-y-4">
                    {complianceFrameworks.map((framework, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">{framework.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-900">{framework.score}%</span>
                            <CheckCircle className={`w-4 h-4 ${framework.status === 'excellent' ? 'text-green-600' :
                              framework.status === 'good' ? 'text-blue-600' :
                                'text-yellow-600'
                              }`} />
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${framework.status === 'excellent' ? 'bg-green-600' :
                              framework.status === 'good' ? 'bg-blue-600' :
                                'bg-yellow-600'
                              }`}
                            style={{ width: `${framework.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Audit Activity Table */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Recent Audit Activity</h3>
              </div>
              <AuditTable audits={auditLogs} />
            </div>
          </div>
        )}

        {/* Risk Matrix Tab */}
        {activeTab === 'risk-matrix' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border-2 border-red-300 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Critical Risk</span>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-600">{riskSummary.critical}</p>
                <p className="text-xs text-gray-600">systems</p>
              </div>
              <div className="bg-white rounded-xl border-2 border-orange-300 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">High Risk</span>
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600">{riskSummary.high}</p>
                <p className="text-xs text-gray-600">systems</p>
              </div>
              <div className="bg-white rounded-xl border-2 border-yellow-300 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Medium Risk</span>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600">{riskSummary.medium}</p>
                <p className="text-xs text-gray-600">systems</p>
              </div>
              <div className="bg-white rounded-xl border-2 border-green-300 p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Low Risk</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600">{riskSummary.low}</p>
                <p className="text-xs text-gray-600">systems</p>
              </div>
            </div>

            {/* Risk Matrix */}
            <RiskMatrixGrid matrixData={matrixData} />

            {/* Systems at Risk */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Systems Requiring Attention</h3>
              <div className="grid grid-cols-2 gap-4">
                {riskSystems.filter(s => s.riskLevel === 'Critical' || s.riskLevel === 'High').map(system => (
                  <RiskSystemCard key={system.id} system={system} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {detailedCompliance.map(framework => (
              <ComplianceFrameworkDetail key={framework.id} framework={framework} />
            ))}
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit-log' && (
          <div className="space-y-6">
            <AuditLogFilters
              filters={auditFilters}
              onFilterChange={(key, value) => setAuditFilters(prev => ({ ...prev, [key]: value }))}
            />
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Complete Audit Trail</h3>
                <p className="text-sm text-gray-600">
                  Showing {extendedAuditLogs.filter(log => {
                    if (auditFilters.department !== 'all' && log.department !== auditFilters.department) return false;
                    if (auditFilters.actionType !== 'all' && log.actionType !== auditFilters.actionType) return false;
                    if (auditFilters.status !== 'all' && log.status !== auditFilters.status) return false;
                    return true;
                  }).length} of {extendedAuditLogs.length} entries
                </p>
              </div>
              <AuditTable audits={extendedAuditLogs.filter(log => {
                if (auditFilters.department !== 'all' && log.department !== auditFilters.department) return false;
                if (auditFilters.actionType !== 'all' && log.actionType !== auditFilters.actionType) return false;
                if (auditFilters.status !== 'all' && log.status !== auditFilters.status) return false;
                return true;
              })} />
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Category Tabs */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {resourceCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setResourceCategory(category)}
                  className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${resourceCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={resourceSearch}
                onChange={(e) => setResourceSearch(e.target.value)}
                className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Featured Resources */}
            {resourceCategory === 'All Resources' && resourceSearch === '' && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Featured Resources</h3>
                <div className="grid grid-cols-3 gap-6">
                  {resources.filter(r => r.featured).map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </div>
            )}

            {/* All Resources Grid */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {resourceCategory === 'All Resources' ? 'All Resources' : resourceCategory}
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {resources
                  .filter(r => {
                    if (resourceCategory !== 'All Resources' && r.category !== resourceCategory) return false;
                    if (resourceSearch && !r.title.toLowerCase().includes(resourceSearch.toLowerCase()) &&
                      !r.description.toLowerCase().includes(resourceSearch.toLowerCase())) return false;
                    return true;
                  })
                  .map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsibleAI;
