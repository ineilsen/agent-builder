export const alerts = [
  {
    type: 'error',
    title: 'NHS Triage Bot Review Required',
    description: 'Quarterly compliance review is overdue by 3 days.',
    timestamp: '2 hours ago'
  },
  {
    type: 'warning',
    title: 'Document Classifier Failed Assessment',
    description: 'Security assessment identified 2 medium-risk issues.',
    timestamp: '1 day ago'
  },
  {
    type: 'info',
    title: 'New Regulation Update',
    description: 'UK AI Safety Act amendments require updated risk assessments.',
    timestamp: '2 days ago'
  }
];

export const complianceFrameworks = [
  {
    name: 'UK AI Regulation',
    score: 94,
    status: 'good'
  },
  {
    name: 'GDPR Compliance',
    score: 98,
    status: 'excellent'
  },
  {
    name: 'Algorithmic Transparency',
    score: 87,
    status: 'warning'
  },
  {
    name: 'Bias & Fairness Testing',
    score: 91,
    status: 'good'
  },
  {
    name: 'Data Protection Impact',
    score: 95,
    status: 'excellent'
  }
];

export const auditLogs = [
  {
    system: 'Augmented Planning Decisions',
    department: 'MHCLG',
    action: 'Quarterly Review Completed',
    status: 'Passed',
    date: '2025-01-15'
  },
  {
    system: 'Tax Fraud Detector',
    department: 'HMRC',
    action: 'Bias Assessment',
    status: 'Passed',
    date: '2025-01-14'
  },
  {
    system: 'Housing Allocation Engine',
    department: 'MHCLG',
    action: 'Fairness Audit',
    status: 'Review',
    date: '2025-01-13'
  },
  {
    system: 'NHS Triage Bot',
    department: 'NHS',
    action: 'Compliance Check',
    status: 'Passed',
    date: '2025-01-12'
  },
  {
    system: 'Document Classifier',
    department: 'MOJ',
    action: 'Security Assessment',
    status: 'Failed',
    date: '2025-01-11'
  }
];

export const stats = {
  aiSystemsDeployed: {
    value: '47',
    label: 'AI Systems Deployed',
    sublabel: 'across 5 departments'
  },
  complianceScore: {
    value: '94.2%',
    label: 'Compliance Score',
    trend: '+2.3%',
    sublabel: 'overall average'
  },
  activeRiskAssessments: {
    value: '12',
    label: 'Active Risk Assessments',
    sublabel: 'in progress'
  },
  pendingReviews: {
    value: '8',
    label: 'Pending Reviews',
    sublabel: 'require attention'
  }
};
