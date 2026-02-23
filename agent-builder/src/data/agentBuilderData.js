import { Brain, Zap, Sparkles, MessageSquare, Send, GitBranch, Database, Shuffle, Layers } from 'lucide-react';

export const aiModels = [
  {
    id: 'claude',
    name: 'Claude 3.5',
    provider: 'Anthropic',
    icon: Brain,
    iconBg: 'bg-purple-500'
  },
  {
    id: 'gpt4',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    icon: Zap,
    iconBg: 'bg-green-500'
  },
  {
    id: 'gemini',
    name: 'Gemini Pro',
    provider: 'Google',
    icon: Sparkles,
    iconBg: 'bg-blue-500'
  }
];

export const components = [
  {
    id: 'user-input',
    name: 'User Input',
    description: 'Receive user messages',
    icon: MessageSquare,
    iconColor: 'text-blue-600'
  },
  {
    id: 'output',
    name: 'Output',
    description: 'Send response to user',
    icon: Send,
    iconColor: 'text-green-600'
  },
  {
    id: 'logic-branch',
    name: 'Logic Branch',
    description: 'Conditional routing',
    icon: GitBranch,
    iconColor: 'text-purple-600'
  },
  {
    id: 'data-connector',
    name: 'Data Connector',
    description: 'Connect to data sources',
    icon: Database,
    iconColor: 'text-cyan-600'
  },
  {
    id: 'transform',
    name: 'Transform',
    description: 'Process and transform data',
    icon: Shuffle,
    iconColor: 'text-orange-600'
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Store conversation context',
    icon: Layers,
    iconColor: 'text-indigo-600'
  }
];

export const platforms = [
  {
    id: 'crewai',
    name: 'Crew AI',
    emoji: '🚀',
    status: 'Available',
    templates: 12
  },
  {
    id: 'n8n',
    name: 'N8N',
    emoji: '⚡',
    status: 'Available',
    templates: 24
  },
  {
    id: 'neuro',
    name: 'Neuro AI',
    emoji: '🧠',
    status: 'Connected',
    templates: 8
  }
];

export const templates = [
  {
    id: 'document-processor',
    name: 'Document Processor',
    description: 'Extract and classify document content',
    platform: 'crewai',
    uses: 156
  },
  {
    id: 'customer-service',
    name: 'Customer Service Bot',
    description: 'Handle common citizen queries',
    platform: 'n8n',
    uses: 234
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyze and visualize data insights',
    platform: 'crewai',
    uses: 89
  },
  {
    id: 'form-assistant',
    name: 'Form Assistant',
    description: 'Guide users through form completion',
    platform: 'neuro',
    uses: 178
  },
  {
    id: 'research-helper',
    name: 'Research Helper',
    description: 'Search and summarize information',
    platform: 'n8n',
    uses: 123
  },
  {
    id: 'compliance-checker',
    name: 'Compliance Checker',
    description: 'Verify regulatory compliance',
    platform: 'neuro',
    uses: 67
  }
];
