import { Globe, Shield, Activity, Database, Lock, Workflow, Cloud, Key, Code } from 'lucide-react';

export const mcpData = [
  {
    id: 'gov-uk-notify',
    name: 'GOV.UK Notify Connector',
    organization: 'GDS',
    description: 'Connect to GOV.UK Notify for sending emails, SMS, and letters to citizens with full audit trail.',
    compatibleModels: ['Claude', 'OpenAI', 'Gemini'],
    downloads: '2,340',
    rating: '4.9 (156)',
    category: 'Data Connectors',
    govApproved: true,
    securityTested: true,
    openSource: true,
    icon: Globe,
    iconBg: 'bg-blue-500'
  },
  {
    id: 'gdpr-compliance-guard',
    name: 'GDPR Compliance Guard',
    organization: 'UK ICO',
    description: 'Automatic PII detection and redaction with GDPR compliance checking for AI responses.',
    compatibleModels: ['Claude', 'OpenAI'],
    downloads: '1,890',
    rating: '4.8 (134)',
    category: 'Security & Compliance',
    govApproved: true,
    securityTested: true,
    openSource: false,
    icon: Shield,
    iconBg: 'bg-green-500'
  },
  {
    id: 'nhs-api-gateway',
    name: 'NHS API Gateway',
    organization: 'NHS Digital',
    description: 'Secure access to NHS APIs including patient demographics, prescriptions, and appointments.',
    compatibleModels: ['Claude', 'Gemini'],
    downloads: '1,560',
    rating: '4.7 (98)',
    category: 'Data Connectors',
    govApproved: true,
    securityTested: true,
    openSource: false,
    icon: Activity,
    iconBg: 'bg-blue-600'
  },
  {
    id: 'planning-data-hub',
    name: 'Planning Data Hub',
    organization: 'MHCLG',
    description: 'Connect to national planning database for property searches, applications, and decisions.',
    compatibleModels: ['Claude', 'OpenAI', 'Gemini'],
    downloads: '890',
    rating: '4.6 (67)',
    category: 'Data Connectors',
    govApproved: true,
    securityTested: true,
    openSource: true,
    icon: Database,
    iconBg: 'bg-cyan-500'
  },
  {
    id: 'audit-trail-logger',
    name: 'Audit Trail Logger',
    organization: 'CDDO',
    description: 'Comprehensive logging and audit trail for all AI interactions meeting government standards.',
    compatibleModels: ['Claude', 'OpenAI', 'Gemini'],
    downloads: '2,100',
    rating: '4.8 (145)',
    category: 'Security & Compliance',
    govApproved: true,
    securityTested: true,
    openSource: true,
    icon: Lock,
    iconBg: 'bg-purple-500'
  },
  {
    id: 'n8n-workflow-bridge',
    name: 'N8N Workflow Bridge',
    organization: 'Community',
    description: 'Seamlessly integrate AI agents with N8N workflows for complex automation scenarios.',
    compatibleModels: ['Claude', 'OpenAI', 'Gemini'],
    downloads: '1,340',
    rating: '4.5 (89)',
    category: 'Workflow Integrations',
    govApproved: false,
    securityTested: true,
    openSource: true,
    icon: Workflow,
    iconBg: 'bg-orange-500'
  },
  {
    id: 'gov-cloud-storage',
    name: 'Gov Cloud Storage',
    organization: 'Crown Commercial',
    description: 'Secure cloud storage connector for government-approved cloud providers.',
    compatibleModels: ['Claude', 'OpenAI'],
    downloads: '980',
    rating: '4.6 (72)',
    category: 'Data Connectors',
    govApproved: true,
    securityTested: true,
    openSource: false,
    icon: Cloud,
    iconBg: 'bg-indigo-500'
  },
  {
    id: 'sso-authentication',
    name: 'SSO Authentication',
    organization: 'GDS',
    description: 'Single Sign-On integration for government identity providers and Active Directory.',
    compatibleModels: ['Claude', 'OpenAI', 'Gemini'],
    downloads: '1,670',
    rating: '4.7 (112)',
    category: 'Security & Compliance',
    govApproved: true,
    securityTested: true,
    openSource: false,
    icon: Key,
    iconBg: 'bg-yellow-500'
  },
  {
    id: 'custom-protocol-builder',
    name: 'Custom Protocol Builder',
    organization: 'Community',
    description: 'Create custom MCP protocols for specialized government use cases.',
    compatibleModels: ['Claude', 'OpenAI'],
    downloads: '450',
    rating: '4.4 (34)',
    category: 'Custom Protocols',
    govApproved: false,
    securityTested: false,
    openSource: true,
    icon: Code,
    iconBg: 'bg-gray-500'
  }
];

export const integrationSteps = [
  {
    number: '1',
    title: 'Install MCP Package',
    code: 'pip install gov-mcp-client'
  },
  {
    number: '2',
    title: 'Configure API Keys',
    code: 'mcp configure --api-key YOUR_KEY'
  },
  {
    number: '3',
    title: 'Initialize Connection',
    code: 'from gov_mcp import MCPClient'
  },
  {
    number: '4',
    title: 'Start Using',
    code: 'result = client.execute("gov-notify", params)'
  }
];
