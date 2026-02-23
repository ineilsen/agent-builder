import React, { useState, useEffect } from 'react';
import {
    Activity, Users, UserPlus, UserMinus, AlertTriangle, CheckCircle,
    Clock, ArrowRight, TrendingUp, Search, Menu, Filter,
    MoreHorizontal, Download, FileText, Settings, Bell, X,
    ChevronRight, Brain, Zap, Shield, ChevronUp, ChevronDown, Terminal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const JMLOrchestration = () => {
    const navigate = useNavigate();
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedCase, setSelectedCase] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Real-time Simulation State
    const [stats, setStats] = useState({
        activeCases: 142,
        completionRate: 98.4,
        falloutCount: 12,
        avgProcessTime: 14 // minutes
    });

    const [activeCases, setActiveCases] = useState([
        {
            id: 'JML-2401-001', type: 'Joiner', name: 'Dr. Sarah Miller', role: 'Nurse Practitioner', dept: 'Cardiology', stage: 'Provisioning', progress: 75, status: 'processing', updated: 'Just now',
            sla: '2h 15m left', team: ['JD', 'IT'],
            timeline: [
                { step: 'HR Trigger', status: 'completed', time: '09:00' },
                { step: 'Identity Creation', status: 'completed', time: '09:15' },
                { step: 'Smartcard Issue', status: 'completed', time: '10:30' },
                { step: 'AD Provisioning', status: 'processing', time: 'Now' },
                { step: 'Email Setup', status: 'pending', time: 'Est. 11:00' },
            ]
        },
        {
            id: 'JML-2401-002', type: 'Mover', name: 'David Chen', role: 'Senior Consultant', dept: 'Oncology', stage: 'Access Rights', progress: 45, status: 'processing', updated: '2m ago',
            sla: '4h 00m left', team: ['HR', 'JD'],
            timeline: [
                { step: 'Request Logged', status: 'completed', time: 'Yesterday' },
                { step: 'Manager Approval', status: 'completed', time: '09:00' },
                { step: 'Role Analysis', status: 'processing', time: 'Now' },
                { step: 'Access Grant', status: 'pending', time: 'Est. 13:00' }
            ]
        },
        {
            id: 'JML-2401-003', type: 'Joiner', name: 'James Wilson', role: 'Junior Doctor', dept: 'A&E', stage: 'HR Check', progress: 100, status: 'completed', updated: '5m ago',
            sla: 'Met (Early)', team: ['JD'],
            timeline: [
                { step: 'All Steps', status: 'completed', time: '10:45' }
            ]
        },
        {
            id: 'JML-2401-004', type: 'Leaver', name: 'Mary Thompson', role: 'Admin Support', dept: 'Radiology', stage: 'Asset Return', progress: 40, status: 'exception', updated: '10m ago',
            sla: 'On Hold', team: ['IT', 'mgr'],
            timeline: [
                { step: 'Notice Period', status: 'completed', time: 'Jan 15' },
                { step: 'Exit Interview', status: 'completed', time: 'Jan 28' },
                { step: 'Asset Return', status: 'failed', time: '10:42' },
                { step: 'Access Revoke', status: 'pending', time: 'Paused' }
            ]
        },
        {
            id: 'JML-2401-005', type: 'Joiner', name: 'Priya Patel', role: 'Pharmacist', dept: 'Pharmacy', stage: 'ID Card', progress: 90, status: 'processing', updated: '12m ago',
            sla: '1h 30m left', team: ['Sec'],
            timeline: [
                { step: 'Contract Signed', status: 'completed', time: '08:30' },
                { step: 'Occupational Health', status: 'completed', time: '09:45' },
                { step: 'ID Printing', status: 'processing', time: 'Now' }
            ]
        },
    ]);

    const [falloutQueue, setFalloutQueue] = useState([
        {
            id: 'JML-2401-004',
            type: 'Leaver',
            name: 'Mary Thompson',
            role: 'Admin Support',
            dept: 'Radiology',
            issue: 'Asset Return Verification Failed',
            confidence: 89,
            reason: 'IT Asset Database mismatch. User reports laptop spread to line manager, but system shows active assignment.',
            recAction: 'Override & Close',
            altAction: 'Escalate to IT Assets',
            validationSteps: [
                { name: 'Exit Interview', status: 'pass' },
                { name: 'Access Revocation', status: 'pass' },
                { name: 'Asset Return Check', status: 'fail', detail: 'Laptop S/N 88291 not scanned at depot' },
                { name: 'Payroll Halt', status: 'pending' }
            ],
            simulationLogs: [
                '[10:42:01] System: Initiating manual override sequence for AssetID: LAP-88291',
                '[10:42:02] Auth: Admin credentials verified (Jane Doe)',
                '[10:42:03] Connect: IT_ASSET_DB (Latency: 45ms)... Connected',
                '[10:42:04] Action: UPDATE assets SET status="Returned", location="Line Manager Safe" WHERE user_id="M_THOMPSON"',
                '[10:42:05] DB: Query executed successfully. 1 row affected.',
                '[10:42:06] Workflow: Resuming "Process Leaver" chain...',
                '[10:42:07] Notify: Sent confirmation to IT Service Desk',
                '[10:42:08] Success: Exception JML-2401-004 resolved.'
            ]
        },
        {
            id: 'JML-2401-008',
            type: 'Mover',
            name: 'John Wright',
            role: 'Consultant',
            dept: 'Neurology',
            issue: 'Grade Mismatch in ESR',
            confidence: 94,
            reason: 'Contract grade (Band 8a) does not match ESR position grade (Band 7).',
            recAction: 'Update ESR Record',
            altAction: 'Flag for HR Review',
            validationSteps: [
                { name: 'Identity Verification', status: 'pass' },
                { name: 'Contract Sync', status: 'pass' },
                { name: 'ESR Position Match', status: 'fail', detail: 'Band 8a != Band 7' },
                { name: 'Training Compliance', status: 'pending' }
            ],
            simulationLogs: [
                '[14:15:22] System: Triggering ESR Data Correction Bot',
                '[14:15:23] Bot: Fetching master contract data from SAP...',
                '[14:15:25] Bot: Contract Verified. Grade: Band 8a (Clinical Lead)',
                '[14:15:26] Connect: NHS Electronic Staff Record (ESR) API...',
                '[14:15:28] Action: PATCH /employees/J_WRIGHT/position { "grade": "Band 8a" }',
                '[14:15:29] ESR: 200 OK. Record updated.',
                '[14:15:30] Audit: Change logged (ref: JML-FIX-008)',
                '[14:15:31] Success: Exception JML-2401-008 resolved.'
            ]
        },
        {
            id: 'JML-2401-012',
            type: 'Joiner',
            name: 'Lisa Evans',
            role: 'Phlebotomist',
            dept: 'Pathology',
            issue: 'Missing Right to Work Doc',
            confidence: 98,
            reason: 'Passport scan quality below threshold for automated verification.',
            recAction: 'Request Re-upload',
            altAction: 'Manual Verify',
            validationSteps: [
                { name: 'Application Received', status: 'pass' },
                { name: 'DBS Check', status: 'pass' },
                { name: 'Right to Work', status: 'fail', detail: 'OCR Confidence: 42% (Low)' },
                { name: 'Reference Check', status: 'pending' }
            ],
            simulationLogs: [
                '[09:30:05] Workflow: Triggering "Candidate Request" email template',
                '[09:30:06] Notify: Generating secure upload link...',
                '[09:30:07] Email: Sending to l.evans@email.com (Subject: Action Required: Right to Work)',
                '[09:30:08] Status: Case moved to "Awaiting Candidate Action"',
                '[09:30:09] Success: Exception JML-2401-012 handled.'
            ]
        },
        // --- Added Cases (Mock Data Expansion) ---
        {
            id: 'JML-2401-015', type: 'Mover', name: 'Dr. Emily Chen', role: 'Surgeon', dept: 'Surgery', issue: 'Smartcard Cert Expired', confidence: 92, status: 'exception',
            reason: 'User RA01 certificate expired during transfer application window.', recAction: 'Issue Temp Token', altAction: 'Fast-track Renewal',
            validationSteps: [{ name: 'Identity', status: 'pass' }, { name: 'Smartcard Status', status: 'fail', detail: 'Cert expired 2023-12-01' }],
            simulationLogs: ['[11:00:01] System: Checking RA01 status...', '[11:00:02] Action: Generating temp access code...', '[11:00:03] Notify: Sent code to user mobile', '[11:00:04] Success: Temp access granted']
        },
        {
            id: 'JML-2401-018', type: 'Leaver', name: 'Mark Taylor', role: 'Porter', dept: 'Facilities', issue: 'Outstanding Loan Equipment', confidence: 85, status: 'exception',
            reason: 'Records show 1 active mobile device not returned to depot.', recAction: 'Mark Lost/Stolen', altAction: 'Contact Line Manager',
            validationSteps: [{ name: 'Exit Checklist', status: 'pass' }, { name: 'Asset Return', status: 'fail', detail: 'Device IMEI-99281 missing' }],
            simulationLogs: ['[11:15:01] System: Marking device as LOST...', '[11:15:02] AssetDB: Updated status to "Write-off"', '[11:15:03] Finance: Triggered cost center charge', '[11:15:04] Success: Leaver process finalized']
        },
        {
            id: 'JML-2401-022', type: 'Joiner', name: 'Sarah Jones', role: 'Midwife', dept: 'Maternity', issue: 'Duplicate ESR Record', confidence: 99, status: 'exception',
            reason: 'NINO matches existing record for "S. Jones" in Trust (Staff Group: Nursing).', recAction: 'Merge Records', altAction: 'Create New Assignment',
            validationSteps: [{ name: 'NINO Check', status: 'fail', detail: 'Match found: 20023192' }, { name: 'DBS', status: 'pending' }],
            simulationLogs: ['[11:30:01] System: Initiating merge sequence...', '[11:30:02] ESR: Link assignment to Person ID 99281', '[11:30:03] Sync: Updated AD attributes', '[11:30:04] Success: Records merged']
        },
        {
            id: 'JML-2401-025', type: 'Mover', name: 'James Smith', role: 'Admin', dept: 'HR', issue: 'Access Conflict (SoD)', confidence: 88, status: 'exception',
            reason: 'User requested "Payroll Admin" access but holds "HR Director" role. Violation of Segregation of Duties policy.', recAction: 'Reject Request', altAction: 'Request Audit Approval',
            validationSteps: [{ name: 'Role Check', status: 'pass' }, { name: 'SoD Policy', status: 'fail', detail: 'Conflict: Payroll + HR Dir' }],
            simulationLogs: ['[11:45:01] System: Logging SoD violation...', '[11:45:02] Notify: Request rejected per policy 4.2', '[11:45:03] Audit: Incident logged', '[11:45:04] Success: Request closed']
        },
        {
            id: 'JML-2401-029', type: 'Joiner', name: 'Raj Patel', role: 'Consultant', dept: 'Cardiology', issue: 'GMC Registration Check', confidence: 95, status: 'exception',
            reason: 'GMC number provided does not return active status in external API check.', recAction: 'Manual GMC Check', altAction: 'Hold Start Date',
            validationSteps: [{ name: 'Identity', status: 'pass' }, { name: 'GMC API', status: 'fail', detail: 'Status: Suspended/Error' }],
            simulationLogs: ['[12:00:01] System: Querying GMC Public Register...', '[12:00:02] Error: API Timeout (500)', '[12:00:03] Action: Queueing for manual review', '[12:00:04] Success: Case flagged']
        },
        {
            id: 'JML-2401-033', type: 'Leaver', name: 'Fiona White', role: 'Nurse', dept: 'Pediatrics', issue: 'Future Dated Leaver', confidence: 75, status: 'exception',
            reason: 'Leaver date is > 90 days in future. Automation threshold exceeded.', recAction: 'Schedule Deferred', altAction: 'Process Now',
            validationSteps: [{ name: 'Date Check', status: 'fail', detail: 'Date > 90 days' }, { name: 'Manager Approval', status: 'pass' }],
            simulationLogs: ['[12:15:01] System: Scheduling job for 2024-04-01...', '[12:15:02] Scheduler: Task created ID #9921', '[12:15:03] Notify: Manager informed of deferral', '[12:15:04] Success: Deferred']
        },
        {
            id: 'JML-2401-037', type: 'Mover', name: 'Tom Brown', role: 'Tech', dept: 'IT', issue: 'AD Group Cycle', confidence: 91, status: 'exception',
            reason: 'Cyclic dependency detected in requested Active Directory groups.', recAction: 'Flag for IT Sec', altAction: 'Remove Cyclic Group',
            validationSteps: [{ name: 'Group Analysis', status: 'fail', detail: 'Cycle: Group A -> Group B -> Group A' }],
            simulationLogs: ['[12:30:01] System: Analyzing group hierarchy...', '[12:30:02] Error: Infinity loop detected', '[12:30:03] Notify: IT Security Team', '[12:30:04] Success: Escalated']
        },
        {
            id: 'JML-2401-041', type: 'Joiner', name: 'Sophie Lee', role: 'Research', dept: 'Oncology', issue: 'Visa Sponsor Limit', confidence: 80, status: 'exception',
            reason: 'Department sponsorship allocation reached limit for current fiscal year.', recAction: 'Check Global Pool', altAction: 'Reject Offer',
            validationSteps: [{ name: 'Right to Work', status: 'pass' }, { name: 'Sponsor Cap', status: 'fail', detail: 'Limit: 5/5 used' }],
            simulationLogs: ['[12:45:01] System: Checking dept allocation...', '[12:45:02] Alert: Cap reached', '[12:45:03] Action: Checking central trust pool...', '[12:45:04] Success: Found capacity (Pool B)']
        },
        {
            id: 'JML-2401-045', type: 'Leaver', name: 'Ian Black', role: 'Director', dept: 'Finance', issue: 'Director Level Exit', confidence: 60, status: 'exception',
            reason: 'Director level exits require manual sign-off from Chief People Officer.', recAction: 'Route for Approval', altAction: 'Standard Process',
            validationSteps: [{ name: 'Grade Check', status: 'fail', detail: 'Grade: Director' }, { name: 'Workflow', status: 'pending' }],
            simulationLogs: ['[13:00:01] System: Detected VSM (Very Senior Manager)...', '[13:00:02] Workflow: Branching to "Executive Exit"', '[13:00:03] Notify: CPO Office', '[13:00:04] Success: Approval requested']
        }
    ]);

    const [consoleActive, setConsoleActive] = useState(false);
    const [activeLogs, setActiveLogs] = useState([]);
    const [pendingAction, setPendingAction] = useState(null);

    // Simulation: Live Data Updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate progress updates for active cases
            setActiveCases(prev => prev.map(c => {
                if (c.status === 'processing') {
                    const newProgress = Math.min(100, c.progress + Math.floor(Math.random() * 15));
                    return {
                        ...c,
                        progress: newProgress,
                        status: newProgress === 100 ? 'completed' : 'processing',
                        updated: 'Just now'
                    };
                }
                return c;
            }));

            // Random stat updates
            if (Math.random() > 0.7) {
                setStats(s => ({ ...s, activeCases: s.activeCases + (Math.random() > 0.5 ? 1 : -1) }));
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleAction = (action, caseId) => {
        const currentCase = falloutQueue.find(c => c.id === caseId);
        if (currentCase?.simulationLogs) {
            setActiveLogs(currentCase.simulationLogs);
            setConsoleActive(true);
            setPendingAction(caseId);
        } else {
            completeAction(caseId);
        }
    };

    const completeAction = (caseId) => {
        setConsoleActive(false);

        // Find the case before removing it
        const resolvedCase = falloutQueue.find(c => c.id === caseId);

        setFalloutQueue(prev => prev.filter(c => c.id !== caseId));
        setSelectedCase(null);

        if (resolvedCase) {
            // Move to active cases (or update if exists)
            setActiveCases(prev => {
                const exists = prev.find(c => c.id === caseId);
                if (exists) {
                    return prev.map(c => c.id === caseId ? { ...c, status: 'completed', progress: 100, updated: 'Just now', stage: 'Resolved' } : c);
                }
                return [{
                    ...resolvedCase,
                    status: 'completed',
                    progress: 100,
                    updated: 'Just now',
                    stage: 'Resolved'
                }, ...prev];
            });
        }

        // Update stats
        setStats(prev => ({
            ...prev,
            falloutCount: Math.max(0, prev.falloutCount - 1),
            // If it wasn't in active cases count (which it likely wasn't if in fallout only), we might increment activeCases
            // But let's keep it simple and just increment completion rate
            completionRate: 98.6
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            <ConsoleWindow
                isActive={consoleActive}
                logs={activeLogs}
                onComplete={() => completeAction(pendingAction)}
                onClose={() => setConsoleActive(false)}
            />

            {/* Sidebar */}
            <aside className={`bg-slate-900 text-white flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
                <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 cursor-pointer" onClick={() => navigate('/nhs-apps')}>
                        <span className="font-bold text-white text-xs">JML</span>
                    </div>
                    {isSidebarOpen && <span className="font-bold tracking-wide">Orchestrator</span>}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="ml-auto text-slate-400 hover:text-white lg:hidden">
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 py-6 space-y-2 px-3">
                    <NavButton icon={Activity} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} isOpen={isSidebarOpen} />
                    <NavButton icon={Users} label="Active Cases" active={activeView === 'cases'} onClick={() => setActiveView('cases')} isOpen={isSidebarOpen} count={stats.activeCases} />
                    <NavButton icon={AlertTriangle} label="Exceptions" active={activeView === 'exceptions'} onClick={() => setActiveView('exceptions')} isOpen={isSidebarOpen} count={stats.falloutCount} isAlert />
                    <NavButton icon={FileText} label="Audit Logs" active={activeView === 'audit'} onClick={() => setActiveView('audit')} isOpen={isSidebarOpen} />
                    <div className="my-4 border-t border-slate-800"></div>
                    <NavButton icon={Settings} label="Configuration" active={activeView === 'config'} onClick={() => setActiveView('config')} isOpen={isSidebarOpen} />
                </div>

                <div className="p-4 border-t border-slate-800">
                    <div className={`flex items-center ${isSidebarOpen ? 'space-x-3' : 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-xs font-bold">JD</div>
                        {isSidebarOpen && (
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium truncate">Jane Doe</p>
                                <p className="text-xs text-slate-400 truncate">Admin | NHS Digital</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeView === 'dashboard' && 'Operational Dashboard'}
                            {activeView === 'cases' && 'Case Management'}
                            {activeView === 'exceptions' && 'Exception Handling'}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-sm font-medium">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            System Healthy
                        </div>
                        <div className="relative">
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="text" placeholder="Search cases..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-sm" />
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* View Content */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-8">

                    {/* DASHBOARD VIEW */}
                    {activeView === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-4 gap-6">
                                <KpiCard title="Active Cases" value={stats.activeCases} icon={Users} color="blue" trend="+8 this week" />
                                <KpiCard title="Completion Rate" value={`${stats.completionRate}%`} icon={CheckCircle} color="green" trend="+0.2%" />
                                <KpiCard title="Exceptions" value={stats.falloutCount} icon={AlertTriangle} color="red" trend="-2 vs yesterday" isAlert />
                                <KpiCard title="Avg. Process Time" value={`${stats.avgProcessTime}m`} icon={Clock} color="purple" trend="-1m efficiency" />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* Process Flow Visualization */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 col-span-2">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="font-bold text-gray-800">Real-time Process Throughput</h3>
                                        <select className="text-sm border-gray-300 rounded-md shadow-sm"><option>Last 24 Hours</option></select>
                                    </div>
                                    <div className="flex items-center justify-between relative px-10 py-8">
                                        {/* Connector Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -z-0"></div>

                                        <ProcessStep label="HR Trigger" count={156} color="bg-blue-600" />
                                        <ProcessStep label="Identity Creation" count={148} color="bg-indigo-600" />
                                        <ProcessStep label="Provisioning" count={142} color="bg-purple-600" isActive />
                                        <ProcessStep label="Access Rights" count={130} color="bg-teal-600" />
                                        <ProcessStep label="Notification" count={128} color="bg-green-600" isLast />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="font-bold text-gray-800">Recent Activity Stream</h3>
                                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={() => setActiveView('cases')}>View All</button>
                                </div>
                                <ActivityTable data={activeCases} />
                            </div>
                        </div>
                    )}

                    {/* EXCEPTIONS VIEW */}
                    {activeView === 'exceptions' && (
                        <div className="flex h-full gap-6 animate-in slide-in-from-right-4 duration-300">
                            {/* List */}
                            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                                <div className="p-4 border-b border-gray-200 bg-red-50">
                                    <h3 className="font-bold text-red-900 flex items-center">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        Requires Attention ({falloutQueue.length})
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    {falloutQueue.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => setSelectedCase(item)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedCase?.id === item.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="font-mono text-xs text-gray-500">{item.id}</span>
                                                <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded-full">{item.confidence}% AI Confidence</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-600 truncate">{item.issue}</p>
                                        </div>
                                    ))}
                                    {falloutQueue.length === 0 && (
                                        <div className="p-8 text-center text-gray-500">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500 opacity-50" />
                                            <p>All exceptions resolved!</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detail Panel */}
                            <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 overflow-y-auto">
                                {selectedCase ? (
                                    <div className="animate-in fade-in duration-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h2 className="text-2xl font-bold text-gray-900">{selectedCase.issue}</h2>
                                                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold">Critical</span>
                                                </div>
                                                <p className="text-gray-500">Case ID: <span className="font-mono text-gray-700">{selectedCase.id}</span> • {selectedCase.type}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Employee</p>
                                                <p className="font-bold text-gray-900 text-lg">{selectedCase.name}</p>
                                                <p className="text-sm text-gray-600">{selectedCase.role}</p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                                            <h4 className="font-bold text-slate-800 mb-2 uppercase text-xs tracking-wider">Root Cause Analysis</h4>
                                            <p className="text-slate-700 leading-relaxed max-w-prose">{selectedCase.reason}</p>
                                        </div>

                                        {/* Validation Visualization */}
                                        {selectedCase.validationSteps && (
                                            <ValidationVisualizer steps={selectedCase.validationSteps} />
                                        )}

                                        {/* AI Recommendation */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100 relative overflow-hidden mb-8">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                            <div className="flex items-center space-x-2 mb-4">
                                                <div className="p-1.5 bg-blue-600 rounded-lg">
                                                    <Brain className="w-5 h-5 text-white" />
                                                </div>
                                                <h3 className="font-bold text-blue-900 text-lg">AI Recommendation (Next Best Action)</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm cursor-pointer hover:border-blue-300 transition-all" onClick={() => handleAction('rec', selectedCase.id)}>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-blue-800">Recommended</span>
                                                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded">{selectedCase.confidence}% Match</span>
                                                    </div>
                                                    <p className="text-gray-800 font-medium text-lg mb-1">{selectedCase.recAction}</p>
                                                    <p className="text-sm text-gray-500">Automated execution via API</p>
                                                    <div className="mt-3 flex items-center text-blue-600 font-bold text-sm">
                                                        <Zap className="w-4 h-4 mr-1" /> Execute Now
                                                    </div>
                                                </div>

                                                <div className="bg-white/50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-white transition-all" onClick={() => handleAction('alt', selectedCase.id)}>
                                                    <div className="mb-2"><span className="font-bold text-gray-600">Alternative</span></div>
                                                    <p className="text-gray-800 font-medium text-lg mb-1">{selectedCase.altAction}</p>
                                                    <p className="text-sm text-gray-500">Manual workflow trigger</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="text-lg font-medium">Select an exception to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ACTIVE CASES VIEW */}
                    {activeView === 'cases' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-800">Active Case Management</h2>
                                <div className="flex space-x-3">
                                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                                        <Filter className="w-4 h-4" /> <span>Filter</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                                        <Download className="w-4 h-4" /> <span>Export</span>
                                    </button>
                                </div>
                            </div>
                            <ActivityTable data={activeCases} full />
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

// --- Helper Components ---

const NavButton = ({ icon: Icon, label, active, onClick, isOpen, count, isAlert }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-lg transition-colors relative group
        ${active ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
      `}
    >
        <Icon className={`w-5 h-5 ${!isOpen ? 'mx-auto' : 'mr-3'}`} />
        {isOpen && <span className="font-medium text-sm">{label}</span>}
        {count !== undefined && isOpen && (
            <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${isAlert ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {count}
            </span>
        )}
        {!isOpen && (
            <div className="absolute left-14 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                {label}
            </div>
        )}
    </button>
);

const KpiCard = ({ title, value, icon: Icon, color, trend, isAlert }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className={`text-2xl font-bold mt-1 ${isAlert ? 'text-red-600' : 'text-gray-900'}`}>{value}</h3>
            </div>
            <div className={`p-2 rounded-lg bg-${color}-50`}>
                <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
        </div>
        <div className="flex items-center text-sm">
            <TrendingUp className={`w-4 h-4 mr-1 ${isAlert ? 'text-red-500' : 'text-green-500'}`} />
            <span className={`${isAlert ? 'text-red-600' : 'text-green-600'} font-medium`}>{trend}</span>
        </div>
    </div>
);

const ProcessStep = ({ label, count, color, isActive, isLast }) => (
    <div className="flex flex-col items-center relative z-10 group cursor-pointer">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 ${color} ${isActive ? 'ring-4 ring-offset-2 ring-blue-200' : ''}`}>
            <span className="font-bold">{count}</span>
        </div>
        <div className="mt-3 text-center">
            <p className="text-sm font-bold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">Processing</p>
        </div>
    </div>
);

const ActivityTable = ({ data, full }) => {
    const [expandedRow, setExpandedRow] = React.useState(null);

    const toggleRow = (id) => {
        if (expandedRow === id) setExpandedRow(null);
        else setExpandedRow(id);
    };

    return (
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Case ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SLA / Team</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Progress</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    {full && <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {data.map((item, i) => (
                    <React.Fragment key={i}>
                        <tr
                            onClick={() => toggleRow(item.id)}
                            className={`transition-colors cursor-pointer ${expandedRow === item.id ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                        >
                            <td className="px-6 py-4 font-mono text-xs text-gray-600 font-medium whitespace-nowrap">
                                <div className="flex items-center">
                                    {expandedRow === item.id ? <ChevronDown className="w-3 h-3 mr-2 text-blue-500" /> : <ChevronRight className="w-3 h-3 mr-2 text-gray-400" />}
                                    {item.id}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 text-xs font-bold mr-3 shadow-sm border border-white">
                                        {item.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-500 flex items-center">
                                            {item.type === 'Joiner' && <UserPlus className="w-3 h-3 mr-1 text-green-500" />}
                                            {item.type === 'Leaver' && <UserMinus className="w-3 h-3 mr-1 text-red-500" />}
                                            {item.role}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col space-y-1.5">
                                    {item.sla && <SlaBadge text={item.sla} />}
                                    {item.team && <TeamFacepile members={item.team} />}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                {item.stage}
                                <div className="text-[10px] text-gray-400 font-normal mt-0.5">Updated {item.updated}</div>
                            </td>
                            <td className="px-6 py-4">
                                <SegmentedProgress value={item.progress} />
                                <span className="text-[10px] text-gray-400 font-mono mt-1 block text-right">{item.progress}%</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border
                                    ${item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                        item.status === 'exception' ? 'bg-red-50 text-red-700 border-red-200' :
                                            'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {item.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                                    {item.status === 'exception' && <AlertTriangle className="w-3 h-3 mr-1.5" />}
                                    {item.status === 'processing' && <Clock className="w-3 h-3 mr-1.5 animate-spin-slow" />}
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </span>
                            </td>
                            {full && (
                                <td className="px-6 py-4">
                                    <button className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </button>
                                </td>
                            )}
                        </tr>
                        {expandedRow === item.id && item.timeline && (
                            <tr className="bg-blue-50/30 animate-in fade-in duration-200">
                                <td colSpan={full ? 7 : 6} className="px-6 py-4 border-b border-blue-100">
                                    <div className="pl-6">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Case Progression Timeline</p>
                                        <TimelineView steps={item.timeline} />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

const ValidationVisualizer = ({ steps }) => (
    <div className="mb-8">
        <h4 className="font-bold text-slate-800 mb-3 uppercase text-xs tracking-wider">Automated Validation Checks</h4>
        <div className="space-y-3">
            {steps.map((step, idx) => (
                <div key={idx} className="flex items-start">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mr-3 border
                        ${step.status === 'pass' ? 'bg-green-100 border-green-200 text-green-700' :
                            step.status === 'fail' ? 'bg-red-100 border-red-200 text-red-700' :
                                'bg-gray-100 border-gray-200 text-gray-400'}`}>
                        {step.status === 'pass' && <CheckCircle className="w-3 h-3" />}
                        {step.status === 'fail' && <X className="w-3 h-3" />}
                        {step.status === 'pending' && <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />}
                    </div>
                    <div>
                        <p className={`text-sm font-medium ${step.status === 'fail' ? 'text-red-700' : 'text-gray-900'}`}>{step.name}</p>
                        {step.detail && <p className="text-xs text-red-600 mt-0.5">{step.detail}</p>}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ConsoleWindow = ({ logs, isActive, onComplete, onClose }) => {
    const [visibleLogs, setVisibleLogs] = React.useState([]);
    const [isExpanded, setIsExpanded] = React.useState(true);
    const bottomRef = React.useRef(null);
    const hasCompletedRef = React.useRef(false);
    // Use ref to store the latest callback to avoid effect dependencies
    const onCompleteRef = React.useRef(onComplete);

    React.useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    React.useEffect(() => {
        if (isActive && logs && logs.length > 0) {
            // If these are new logs (different first line), reset
            if (visibleLogs.length > 0 && logs[0] !== visibleLogs[0]) {
                setVisibleLogs([]);
                hasCompletedRef.current = false;
            }

            // If we haven't started showing these logs yet
            if (visibleLogs.length === 0) {
                let i = 0;
                const interval = setInterval(() => {
                    if (i < logs.length) {
                        setVisibleLogs(prev => {
                            // double check we don't add duplicates if re-render happens
                            if (prev.length < logs.length) return [...prev, logs[i]];
                            return prev;
                        });
                        i++;
                    } else {
                        clearInterval(interval);
                        if (!hasCompletedRef.current) {
                            hasCompletedRef.current = true;
                            // Call the latest callback
                            if (onCompleteRef.current) onCompleteRef.current();
                        }
                    }
                }, 800);
                return () => clearInterval(interval);
            }
        }
    }, [isActive, logs]); // Removed onComplete from dependency array

    React.useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [visibleLogs, isExpanded]);

    if (!isActive) return null;

    return (
        <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1e1e1e] border-t border-gray-800 shadow-2xl transition-all duration-300 ${isExpanded ? 'h-64' : 'h-10'}`}>
            <div
                className="bg-[#2d2d2d] px-4 h-10 flex items-center justify-between cursor-pointer hover:bg-[#363636]"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                        <Terminal className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-xs font-mono font-bold">SYSTEM_ORCHESTRATOR.LOG</span>
                    </div>
                    {visibleLogs.length < logs?.length && <span className="text-[10px] text-green-400 animate-pulse">● Executing...</span>}
                    {visibleLogs.length === logs?.length && <span className="text-[10px] text-gray-500">Done</span>}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="text-gray-400 hover:text-white">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 text-gray-300 h-[calc(100%-40px)] overflow-y-auto font-mono text-sm">
                    {visibleLogs.map((log, i) => (
                        <div key={i} className="mb-1 animate-in slide-in-from-left-2 duration-200">
                            <span className="text-green-500 mr-2">➜</span>
                            <span>{log}</span>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                    {visibleLogs.length === logs?.length && (
                        <div className="mt-2 text-green-400 font-bold border-t border-gray-700 pt-2 text-xs">
                            [PROCESS COMPLETED - CASE ARCHIVED]
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SlaBadge = ({ text }) => {
    let color = 'bg-blue-100 text-blue-700 border-blue-200';
    if (text.includes('left') && text.includes('h')) {
        const hours = parseInt(text);
        if (hours < 2) color = 'bg-red-100 text-red-700 border-red-200 animate-pulse';
        else if (hours < 4) color = 'bg-yellow-100 text-yellow-700 border-yellow-200';
    } else if (text === 'Met (Early)') {
        color = 'bg-green-100 text-green-700 border-green-200';
    }

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${color}`}>
            <Clock className="w-3 h-3 mr-1" /> {text}
        </span>
    );
};

const TeamFacepile = ({ members }) => (
    <div className="flex -space-x-2">
        {members.map((m, i) => (
            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white
                ${m === 'JD' ? 'bg-indigo-500' : m === 'IT' ? 'bg-blue-500' : m === 'HR' ? 'bg-purple-500' : 'bg-gray-500'}`}
                title={m}
            >
                {m}
            </div>
        ))}
    </div>
);

const SegmentedProgress = ({ value }) => {
    const segments = 5;
    const filled = Math.ceil((value / 100) * segments);
    return (
        <div className="flex space-x-1">
            {[...Array(segments)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < filled ? 'bg-blue-600' : 'bg-gray-200'}`} />
            ))}
        </div>
    );
};

const TimelineView = ({ steps }) => (
    <div className="flex items-center justify-between w-full py-2 px-4 bg-slate-50 rounded-lg border border-slate-100">
        {steps.map((step, i) => (
            <React.Fragment key={i}>
                <div className="flex flex-col items-center relative group">
                    <div className={`w-3 h-3 rounded-full mb-1 border-2 z-10 
                        ${step.status === 'completed' ? 'bg-green-500 border-green-500' :
                            step.status === 'processing' ? 'bg-blue-500 border-blue-500 animate-pulse' :
                                step.status === 'failed' ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300'}`}
                    />
                    <span className={`text-[10px] font-bold ${step.status === 'processing' ? 'text-blue-700' : 'text-gray-500'}`}>{step.step}</span>
                    <span className="text-[9px] text-gray-400">{step.time}</span>
                </div>
                {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 -mt-4 ${steps[i].status === 'completed' ? 'bg-green-200' : 'bg-gray-200'}`} />
                )}
            </React.Fragment>
        ))}
    </div>
);

export default JMLOrchestration;
