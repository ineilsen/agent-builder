import { MessageSquare, Send, GitBranch, Database, Shuffle, Layers } from 'lucide-react';

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

