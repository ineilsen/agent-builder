export const riskSummary = {
  critical: 2,
  high: 5,
  medium: 12,
  low: 28
};

export const riskSystems = [
  {
    id: 1,
    name: 'Tax Fraud Detector',
    department: 'HMRC',
    riskLevel: 'High',
    riskScore: 7.8,
    likelihood: 'High',
    impact: 'High',
    category: 'Bias',
    status: 'Under Review',
    lastAssessed: '2025-01-10',
    mitigationStatus: 'In Progress'
  },
  {
    id: 2,
    name: 'Housing Allocation Engine',
    department: 'MHCLG',
    riskLevel: 'Critical',
    riskScore: 8.5,
    likelihood: 'High',
    impact: 'Critical',
    category: 'Fairness',
    status: 'Mitigation Required',
    lastAssessed: '2025-01-12',
    mitigationStatus: 'Planned'
  },
  {
    id: 3,
    name: 'Augmented Planning Decisions',
    department: 'MHCLG',
    riskLevel: 'Medium',
    riskScore: 4.2,
    likelihood: 'Medium',
    impact: 'Medium',
    category: 'Transparency',
    status: 'Approved',
    lastAssessed: '2025-01-15',
    mitigationStatus: 'Completed'
  },
  {
    id: 4,
    name: 'NHS Triage Bot',
    department: 'NHS',
    riskLevel: 'High',
    riskScore: 7.1,
    likelihood: 'Medium',
    impact: 'Critical',
    category: 'Safety',
    status: 'Under Review',
    lastAssessed: '2025-01-08',
    mitigationStatus: 'In Progress'
  },
  {
    id: 5,
    name: 'Document Classifier',
    department: 'MOJ',
    riskLevel: 'Medium',
    riskScore: 5.3,
    likelihood: 'Medium',
    impact: 'Medium',
    category: 'Data Privacy',
    status: 'Approved',
    lastAssessed: '2025-01-14',
    mitigationStatus: 'Completed'
  },
  {
    id: 6,
    name: 'Citizen Query Assistant',
    department: 'MHCLG',
    riskLevel: 'Low',
    riskScore: 2.8,
    likelihood: 'Low',
    impact: 'Low',
    category: 'Transparency',
    status: 'Approved',
    lastAssessed: '2025-01-13',
    mitigationStatus: 'Not Required'
  },
  {
    id: 7,
    name: 'Border Security Scanner',
    department: 'Home Office',
    riskLevel: 'Critical',
    riskScore: 9.2,
    likelihood: 'High',
    impact: 'Critical',
    category: 'Bias',
    status: 'Mitigation Required',
    lastAssessed: '2025-01-11',
    mitigationStatus: 'Planned'
  },
  {
    id: 8,
    name: 'Benefits Calculator',
    department: 'HMRC',
    riskLevel: 'Medium',
    riskScore: 4.7,
    likelihood: 'Medium',
    impact: 'Medium',
    category: 'Accuracy',
    status: 'Approved',
    lastAssessed: '2025-01-09',
    mitigationStatus: 'Completed'
  }
];

export const riskCategories = [
  { name: 'Data Privacy', count: 3, avgRisk: 4.5 },
  { name: 'Bias & Fairness', count: 8, avgRisk: 6.8 },
  { name: 'Security', count: 2, avgRisk: 3.2 },
  { name: 'Transparency', count: 6, avgRisk: 4.1 },
  { name: 'Safety', count: 4, avgRisk: 7.3 },
  { name: 'Accuracy', count: 5, avgRisk: 5.2 }
];

export const matrixData = [
  // Format: [likelihood, impact, count]
  { likelihood: 'Low', impact: 'Low', count: 15, systems: ['Citizen Query Assistant', 'Local Plan Generator', 'Community Insight Analyzer'] },
  { likelihood: 'Low', impact: 'Medium', count: 8, systems: ['Council Performance Dashboard'] },
  { likelihood: 'Low', impact: 'High', count: 3, systems: [] },
  { likelihood: 'Low', impact: 'Critical', count: 0, systems: [] },
  
  { likelihood: 'Medium', impact: 'Low', count: 5, systems: [] },
  { likelihood: 'Medium', impact: 'Medium', count: 12, systems: ['Augmented Planning Decisions', 'Document Classifier', 'Benefits Calculator'] },
  { likelihood: 'Medium', impact: 'High', count: 4, systems: [] },
  { likelihood: 'Medium', impact: 'Critical', count: 1, systems: ['NHS Triage Bot'] },
  
  { likelihood: 'High', impact: 'Low', count: 0, systems: [] },
  { likelihood: 'High', impact: 'Medium', count: 2, systems: [] },
  { likelihood: 'High', impact: 'High', count: 5, systems: ['Tax Fraud Detector'] },
  { likelihood: 'High', impact: 'Critical', count: 2, systems: ['Housing Allocation Engine', 'Border Security Scanner'] }
];
