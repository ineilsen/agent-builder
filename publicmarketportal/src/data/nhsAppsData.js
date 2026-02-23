import { Activity, Heart, Stethoscope, Users, UserPlus, ClipboardCheck, Brain, Ambulance } from 'lucide-react';

export const nhsApps = [
    {
        id: 'virtual-clinician',
        name: 'Virtual Clinician',
        category: 'Clinical Care',
        provider: 'DeepMind',
        providerBadge: 'bg-purple-100 text-purple-700',
        description: 'AI-driven triage and preliminary diagnosis assistant that helps prioritize patient care and reduce waiting times.',
        features: [
            'Symptom analysis',
            'Triage prioritization',
            'Patient history integration'
        ],
        responsibleAIScore: 98,
        users: '15,000+',
        rating: '4.9',
        status: 'Available',
        icon: Stethoscope,
        iconBg: 'bg-blue-600',
        externalUrl: 'https://ddna-cognizant0493--medpalm.soului.dh.soulmachines.cloud/?sig=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3Njk2MDkyNzgsImlzcyI6InNpZ25lZF91cmwtZTNlMzJmZmMtMDViYy00Y2Y4LTk0NTktNDNiMGU4YjRlNDE5IiwiZXhwIjoxODU1OTIyODc4LCJlbWFpbCI6ImNvZ25pemFudDA0OTMtLW1lZHBhbG1AZGRuYS5zdHVkaW8iLCJzb3VsSWQiOiJkZG5hLWNvZ25pemFudDA0OTMtLW1lZHBhbG0ifQ.ugHXtUjDtcnXxEobRR306iiqLH4SmKveXXJ8r1HCHSg'
    },
    {
        id: 'jml-orchestration',
        name: 'JML Orchestration',
        category: 'Workforce',
        provider: 'Microsoft',
        providerBadge: 'bg-blue-100 text-blue-700',
        route: '/apps/jml-orchestration',
        description: 'Automated Joiners, Movers, and Leavers process orchestration to streamline staff onboarding and access management securely.',
        features: [
            'Auto-provisioning',
            'Access audits',
            'HR system sync'
        ],
        responsibleAIScore: 95,
        users: '45,000+',
        rating: '4.7',
        status: 'Available',
        icon: UserPlus,
        iconBg: 'bg-green-600'
    },
    {
        id: 'radiology-assistant',
        name: 'Radiology Insight',
        category: 'Diagnostics',
        provider: 'Google Health',
        providerBadge: 'bg-orange-100 text-orange-700',
        description: 'Computer vision support for radiologists to detect anomalies in X-rays, MRIs, and CT scans with high precision.',
        features: [
            'Anomaly detection',
            'Scan prioritization',
            'Report drafting'
        ],
        responsibleAIScore: 96,
        users: '3,200',
        rating: '4.8',
        status: 'Available',
        icon: Activity,
        iconBg: 'bg-indigo-600'
    },
    {
        id: 'patient-flow-optimizer',
        name: 'A&E Flow Optimizer',
        category: 'Operations',
        provider: 'Palantir',
        providerBadge: 'bg-gray-100 text-gray-700',
        description: 'Predictive analytics for Accident & Emergency departments to optimize bed availability and staff allocation.',
        features: [
            'Demand forecasting',
            'Bed management',
            'Staff rostering'
        ],
        responsibleAIScore: 92,
        users: '850',
        rating: '4.6',
        status: 'Beta',
        icon: Ambulance,
        iconBg: 'bg-red-600'
    },
    {
        id: 'care-plan-generator',
        name: 'Personalized Care Planner',
        category: 'Clinical Care',
        provider: 'OpenAI',
        providerBadge: 'bg-green-100 text-green-700',
        description: 'Generates tailored care plans for chronic disease management based on clinical guidelines and patient lifestyle data.',
        features: [
            'Guideline adherence',
            'Lifestyle integration',
            'Multi-condition support'
        ],
        responsibleAIScore: 94,
        users: '5,600',
        rating: '4.7',
        status: 'Available',
        icon: ClipboardCheck,
        iconBg: 'bg-teal-600'
    },
    {
        id: 'mental-health-bot',
        name: 'Wellbeing Assistant',
        category: 'Mental Health',
        provider: 'Anthropic',
        providerBadge: 'bg-purple-100 text-purple-700',
        description: '24/7 conversational support for low-intensity mental health monitoring and cognitive behavioral therapy exercises.',
        features: [
            'Sentiment monitoring',
            'Crisis escalation',
            'CBT exercises'
        ],
        responsibleAIScore: 97,
        users: '12,000',
        rating: '4.8',
        status: 'Pilot',
        icon: Brain,
        iconBg: 'bg-pink-600'
    }
];

export const filterConfig = [
    {
        id: 'categories',
        label: 'Clinical Area',
        options: [
            { value: 'clinical-care', label: 'Clinical Care', count: 2 },
            { value: 'diagnostics', label: 'Diagnostics', count: 1 },
            { value: 'workforce', label: 'Workforce', count: 1 },
            { value: 'operations', label: 'Operations', count: 1 },
            { value: 'mental-health', label: 'Mental Health', count: 1 }
        ]
    },
    {
        id: 'aiModel',
        label: 'AI Provider',
        options: [
            { value: 'deepmind', label: 'DeepMind', count: 1 },
            { value: 'microsoft', label: 'Microsoft', count: 1 },
            { value: 'google-health', label: 'Google Health', count: 1 },
            { value: 'openai', label: 'OpenAI', count: 1 },
            { value: 'anthropic', label: 'Anthropic', count: 1 }
        ]
    },
    {
        id: 'aiScore',
        label: 'Responsible AI Score',
        options: [
            { value: '95+', label: '95% and above' },
            { value: '90-94', label: '90% - 94%' },
            { value: '80-89', label: '80% - 89%' }
        ]
    }
];
