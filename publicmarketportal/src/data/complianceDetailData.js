export const detailedCompliance = [
  {
    id: 1,
    name: 'UK AI Regulation',
    score: 94,
    status: 'good',
    lastUpdated: '2025-01-15',
    requirements: [
      { name: 'Risk Assessment', status: 'Compliant', progress: 100 },
      { name: 'Transparency Requirements', status: 'Compliant', progress: 98 },
      { name: 'Human Oversight', status: 'Compliant', progress: 92 },
      { name: 'Data Governance', status: 'In Progress', progress: 85 }
    ],
    certificate: 'UK-AI-REG-2025-001',
    nextReview: '2025-04-15',
    actionItems: [
      { task: 'Complete data governance documentation', priority: 'Medium', dueDate: '2025-02-01' }
    ]
  },
  {
    id: 2,
    name: 'GDPR Compliance',
    score: 98,
    status: 'excellent',
    lastUpdated: '2025-01-14',
    requirements: [
      { name: 'Data Protection Impact Assessment', status: 'Compliant', progress: 100 },
      { name: 'Right to Explanation', status: 'Compliant', progress: 100 },
      { name: 'Data Minimization', status: 'Compliant', progress: 96 },
      { name: 'Consent Management', status: 'Compliant', progress: 98 }
    ],
    certificate: 'GDPR-CERT-2025-047',
    nextReview: '2025-03-14',
    actionItems: []
  },
  {
    id: 3,
    name: 'Algorithmic Transparency',
    score: 87,
    status: 'warning',
    lastUpdated: '2025-01-13',
    requirements: [
      { name: 'Model Explainability', status: 'In Progress', progress: 82 },
      { name: 'Decision Logging', status: 'Compliant', progress: 95 },
      { name: 'Audit Trail', status: 'Compliant', progress: 90 },
      { name: 'Public Disclosure', status: 'In Progress', progress: 78 }
    ],
    certificate: 'PENDING',
    nextReview: '2025-02-28',
    actionItems: [
      { task: 'Improve model explainability documentation', priority: 'High', dueDate: '2025-01-25' },
      { task: 'Complete public disclosure requirements', priority: 'High', dueDate: '2025-02-15' }
    ]
  },
  {
    id: 4,
    name: 'Bias & Fairness Testing',
    score: 91,
    status: 'good',
    lastUpdated: '2025-01-12',
    requirements: [
      { name: 'Fairness Metrics', status: 'Compliant', progress: 93 },
      { name: 'Bias Testing', status: 'Compliant', progress: 91 },
      { name: 'Demographic Parity', status: 'Compliant', progress: 89 },
      { name: 'Disparate Impact Analysis', status: 'Compliant', progress: 90 }
    ],
    certificate: 'BIAS-TEST-2025-023',
    nextReview: '2025-03-12',
    actionItems: [
      { task: 'Review demographic parity metrics', priority: 'Low', dueDate: '2025-02-20' }
    ]
  },
  {
    id: 5,
    name: 'Data Protection Impact',
    score: 95,
    status: 'excellent',
    lastUpdated: '2025-01-11',
    requirements: [
      { name: 'Privacy Impact Assessment', status: 'Compliant', progress: 97 },
      { name: 'Data Security', status: 'Compliant', progress: 96 },
      { name: 'Breach Prevention', status: 'Compliant', progress: 94 },
      { name: 'Encryption Standards', status: 'Compliant', progress: 93 }
    ],
    certificate: 'DPA-CERT-2025-089',
    nextReview: '2025-04-11',
    actionItems: []
  }
];

export const complianceTimeline = [
  { date: '2025-01-15', event: 'UK AI Regulation Review Completed', status: 'success' },
  { date: '2025-01-14', event: 'GDPR Annual Audit Passed', status: 'success' },
  { date: '2025-01-10', event: 'Algorithmic Transparency Assessment Started', status: 'in-progress' },
  { date: '2025-01-05', event: 'Bias Testing Cycle 3 Completed', status: 'success' },
  { date: '2024-12-20', event: 'Data Protection Impact Review', status: 'success' }
];
