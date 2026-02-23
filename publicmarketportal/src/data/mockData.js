export const stats = {
  totalApps: {
    value: '130+',
    label: 'Total AI Apps',
    trend: '+12%',
    trendLabel: 'across all departments'
  },
  activeDeployments: {
    value: '1,247',
    label: 'Active Deployments',
    trend: '+8%',
    trendLabel: 'government-wide'
  },
  userSatisfaction: {
    value: '4.7/5',
    label: 'User Satisfaction',
    trend: '+0.2',
    trendLabel: 'average rating'
  },
  departments: {
    value: '5',
    label: 'Departments',
    trend: '',
    trendLabel: 'currently onboarded'
  }
};

export const departments = [
  {
    id: 'mhclg',
    name: 'MHCLG',
    appCount: 24,
    description: 'AI solutions for planning, housing allocation, and community services across local authorities.',
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    iconBg: 'bg-cyan-500',
    borderColor: 'border-cyan-200'
  },
  {
    id: 'hmrc',
    name: 'HMRC',
    appCount: 31,
    description: 'Tax processing, fraud detection, and customer service automation solutions.',
    color: 'orange',
    bgColor: 'bg-orange-50',
    iconBg: 'bg-orange-500',
    borderColor: 'border-orange-200'
  },
  {
    id: 'moj',
    name: 'MOJ',
    appCount: 18,
    description: 'Legal document processing, case management, and justice system optimization.',
    color: 'purple',
    bgColor: 'bg-purple-50',
    iconBg: 'bg-purple-500',
    borderColor: 'border-purple-200'
  },
  {
    id: 'homeoffice',
    name: 'Home Office',
    appCount: 22,
    description: 'Immigration processing, border security, and public safety applications.',
    color: 'pink',
    bgColor: 'bg-pink-50',
    iconBg: 'bg-pink-500',
    borderColor: 'border-pink-200'
  },
  {
    id: 'nhs',
    name: 'NHS',
    appCount: 35,
    description: 'Healthcare diagnostics, patient management, and medical research support.',
    color: 'blue',
    bgColor: 'bg-blue-50',
    iconBg: 'bg-blue-500',
    borderColor: 'border-blue-200'
  },
  {
    id: 'raf-predictive',
    name: 'RAF Predictive Maintenance Demo',
    appCount: 1,
    description: 'AI-powered predictive maintenance solution for A400M aircraft fleet operations and logistics.',
    color: 'slate',
    bgColor: 'bg-slate-50',
    iconBg: 'bg-slate-700',
    borderColor: 'border-slate-200',
    externalUrl: 'https://a400-webapp-ercscuhvf3h7ftdw.uksouth-01.azurewebsites.net/'
  }
];

export const featuredApps = [
  {
    id: 'planning-assistant',
    name: 'Augmented Planning Decisions',
    category: 'Planning',
    provider: 'Claude',
    providerBadge: 'bg-purple-100 text-purple-700',
    description: 'AI-powered planning application analysis with automated compliance checking and recommendation generation.',
    externalUrl: 'https://mhclg-planning-app.azurewebsites.net/',
    features: [
      'Auto compliance check',
      'Document analysis',
      'Risk assessment'
    ],
    responsibleAIScore: 94,
    users: '1,250',
    rating: '4.8',
    status: 'Available',
    iconBg: 'bg-blue-500'
  },
  {
    id: 'tax-fraud-detector',
    name: 'Tax Fraud Detector',
    category: 'Finance',
    provider: 'OpenAI',
    providerBadge: 'bg-green-100 text-green-700',
    description: 'Advanced anomaly detection system for identifying potential tax fraud patterns in real-time.',
    features: [
      'Real-time analysis',
      'Pattern recognition',
      'Alert system'
    ],
    responsibleAIScore: 91,
    users: '890',
    rating: '4.6',
    status: 'Available',
    iconBg: 'bg-orange-500'
  },
  {
    id: 'nhs-triage-bot',
    name: 'NHS Triage Bot',
    category: 'Healthcare',
    provider: 'Gemini',
    providerBadge: 'bg-blue-100 text-blue-700',
    description: 'Intelligent patient triage assistant helping prioritize cases and reduce wait times.',
    features: [
      'Symptom analysis',
      'Priority scoring',
      'GP integration'
    ],
    responsibleAIScore: 97,
    users: '2,100',
    rating: '4.9',
    status: 'Available',
    iconBg: 'bg-blue-600'
  },
  {
    id: 'document-classifier',
    name: 'Document Classifier',
    category: 'Legal',
    provider: 'Claude',
    providerBadge: 'bg-purple-100 text-purple-700',
    description: 'Automated classification and routing of legal documents with high accuracy.',
    features: [
      'Multi-format support',
      'Auto-routing',
      'Version control'
    ],
    responsibleAIScore: 89,
    users: '780',
    rating: '4.5',
    status: 'Available',
    iconBg: 'bg-purple-500'
  }
];

export const howItWorksSteps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Browse our curated catalogue of AI solutions filtered by your department and use case.'
  },
  {
    number: '02',
    title: 'Evaluate',
    description: 'Review responsible AI scores, compliance certificates, and user reviews before deploying.'
  },
  {
    number: '03',
    title: 'Deploy',
    description: 'One-click deployment with automatic integration into your existing systems.'
  }
];

export const footerLinks = {
  platform: [
    { label: 'About', href: '#' },
    { label: 'How it works', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'API Documentation', href: '#' }
  ],
  support: [
    { label: 'Help Centre', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'Training', href: '#' },
    { label: 'Status Page', href: '#' }
  ],
  legal: [
    { label: 'Terms of Service', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Accessibility', href: '#' }
  ],
  departments: [
    { label: 'MHCLG', href: '#' },
    { label: 'HMRC', href: '#' },
    { label: 'MOJ', href: '#' },
    { label: 'Home Office', href: '#' },
    { label: 'NHS', href: '#' }
  ]
};
