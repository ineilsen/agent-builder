import { FileText, Home, Users, Building, BarChart, MessageCircle, Shield, TrendingUp } from 'lucide-react';

export const mhclgApps = [
  {
    id: 'planning-assistant-pro',
    name: 'Augmented Planning Decisions',
    category: 'Planning',
    provider: 'Claude',
    providerBadge: 'bg-purple-100 text-purple-700',
    description: 'AI-powered planning application analysis with automated compliance checking and recommendation generation for local authorities.',
    externalUrl: 'https://mhclg-planning-app.azurewebsites.net/',
    features: [
      'Auto compliance checking',
      'Document analysis',
      'Risk assessment'
    ],
    responsibleAIScore: 94,
    users: '1,250',
    rating: '4.8',
    status: 'Available',
    icon: FileText,
    iconBg: 'bg-blue-500'
  },
  {
    id: 'housing-allocation-engine',
    name: 'Housing Allocation Engine',
    category: 'Housing',
    provider: 'OpenAI',
    providerBadge: 'bg-green-100 text-green-700',
    description: 'Intelligent housing allocation system that prioritizes cases based on need assessment and availability matching.',
    features: [
      'Priority scoring',
      'Match optimization',
      'Wait list management'
    ],
    responsibleAIScore: 96,
    users: '890',
    rating: '4.7',
    status: 'Available',
    icon: Home,
    iconBg: 'bg-orange-500'
  },
  {
    id: 'community-insight-analyzer',
    name: 'Community Insight Analyzer',
    category: 'Community Services',
    provider: 'Gemini',
    providerBadge: 'bg-blue-100 text-blue-700',
    description: 'Analyze community feedback, complaints, and suggestions to identify trends and prioritize local interventions.',
    features: [
      'Sentiment analysis',
      'Trend detection',
      'Priority ranking'
    ],
    responsibleAIScore: 91,
    users: '560',
    rating: '4.5',
    status: 'Available',
    icon: Users,
    iconBg: 'bg-cyan-500'
  },
  {
    id: 'local-plan-generator',
    name: 'Local Plan Generator',
    category: 'Planning',
    provider: 'Claude',
    providerBadge: 'bg-purple-100 text-purple-700',
    description: 'Generate comprehensive local development plans with AI assistance, incorporating policy requirements and community input.',
    features: [
      'Policy integration',
      'Community input analysis',
      'Environmental assessment'
    ],
    responsibleAIScore: 89,
    users: '340',
    rating: '4.4',
    status: 'Available',
    icon: FileText,
    iconBg: 'bg-blue-600'
  },
  {
    id: 'council-performance-dashboard',
    name: 'Council Performance Dashboard',
    category: 'Local Government',
    provider: 'OpenAI',
    providerBadge: 'bg-green-100 text-green-700',
    description: 'Real-time analytics dashboard for monitoring council KPIs and performance metrics with predictive insights.',
    features: [
      'Real-time metrics',
      'Predictive analytics',
      'Benchmark comparison'
    ],
    responsibleAIScore: 87,
    users: '720',
    rating: '4.6',
    status: 'Available',
    icon: BarChart,
    iconBg: 'bg-green-500'
  },
  {
    id: 'citizen-query-assistant',
    name: 'Citizen Query Assistant',
    category: 'Community Services',
    provider: 'Claude',
    providerBadge: 'bg-purple-100 text-purple-700',
    description: 'AI chatbot for handling citizen queries about council services, planning applications, and local information.',
    features: [
      '24/7 availability',
      'Multi-language support',
      'Service routing'
    ],
    responsibleAIScore: 93,
    users: '1,100',
    rating: '4.7',
    status: 'Available',
    icon: MessageCircle,
    iconBg: 'bg-purple-500'
  },
  {
    id: 'building-safety-inspector',
    name: 'Building Safety Inspector',
    category: 'Housing',
    provider: 'Gemini',
    providerBadge: 'bg-blue-100 text-blue-700',
    description: 'AI-assisted building safety compliance checking tool with automated report generation and risk flagging.',
    features: [
      'Safety compliance',
      'Risk flagging',
      'Report automation'
    ],
    responsibleAIScore: 95,
    users: '480',
    rating: '4.8',
    status: 'Available',
    icon: Shield,
    iconBg: 'bg-red-500'
  },
  {
    id: 'policy-impact-predictor',
    name: 'Policy Impact Predictor',
    category: 'Local Government',
    provider: 'OpenAI',
    providerBadge: 'bg-green-100 text-green-700',
    description: 'Predict the impact of proposed policies on local communities using historical data and simulation models.',
    features: [
      'Impact simulation',
      'Scenario modeling',
      'Community impact'
    ],
    responsibleAIScore: 88,
    users: '290',
    rating: '4.3',
    status: 'Available',
    icon: TrendingUp,
    iconBg: 'bg-indigo-500'
  }
];

export const filterConfig = [
  {
    id: 'categories',
    label: 'Categories',
    options: [
      { value: 'planning', label: 'Planning', count: 2 },
      { value: 'housing', label: 'Housing', count: 2 },
      { value: 'local-government', label: 'Local Government', count: 2 },
      { value: 'community-services', label: 'Community Services', count: 2 }
    ]
  },
  {
    id: 'aiModel',
    label: 'AI Model',
    options: [
      { value: 'claude', label: 'Claude (Anthropic)', count: 3 },
      { value: 'openai', label: 'OpenAI', count: 3 },
      { value: 'gemini', label: 'Gemini (Google)', count: 2 }
    ]
  },
  {
    id: 'aiScore',
    label: 'Responsible AI Score',
    options: [
      { value: '90+', label: '90% and above' },
      { value: '80-89', label: '80% - 89%' },
      { value: '70-79', label: '70% - 79%' }
    ]
  }
];
