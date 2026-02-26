# Agent Builder V2 - Comprehensive Gap Analysis & Implementation Roadmap

## Executive Summary
The Agent Builder V2 has a strong foundation with visual canvas, configuration drawer, and export capabilities. However, several critical gaps prevent it from being a "state-of-the-art" platform. This document identifies 15 key gaps across 5 categories and provides a prioritized implementation roadmap.

---

## Current State Assessment ✅

### What's Working Well
1. ✅ **Visual Canvas** - React Flow-based interactive graph with zoom, pan, minimap
2. ✅ **Agent Naming** - Editable agent names in configuration drawer header
3. ✅ **Basic Configuration** - 7-tab drawer (Overview, Function, Instructions, Tools, MCP, Model, Advanced)
4. ✅ **Network Management** - Load 50+ networks from Neuro SAN registry
5. ✅ **Export Functionality** - Download network/agent HOCON files
6. ✅ **Theme System** - Dark/light mode toggle
7. ✅ **Real-time Logs** - Execution logs panel with WebSocket streaming
8. ✅ **AI Copilot** - Gemini-powered network architecture generation

---

## Critical Gaps Identified 🚨

### Category 1: Data Integration (CRITICAL)
**Impact:** Users cannot access real Neuro SAN tools/MCPs, severely limiting agent capabilities

#### Gap 1.1: Agent Config Drawer Using Mock Tool Data
- **Current:** AgentConfigDrawer imports mock data from `toolsData.js` (58 hardcoded tools)
- **Issue:** Real Neuro SAN tools (100+ from `toolbox/toolbox_info.hocon`) are fetched but NOT used in drawer
- **Evidence:**
  - Line 6 of AgentConfigDrawer.jsx: `import { availableTools } from '../data/toolsData';`
  - Real tools ARE loaded in AgentNetworkContext (line 136-138)
  - ComponentLibrary DOES use real tools via `useAgentNetwork()` hook
- **Impact:** Users can't select actual coded tools like `arxiv_rag`, `confluence_rag`, `agentforce_adapter`, etc.

#### Gap 1.2: No MCP Server Integration
- **Current:** AgentConfigDrawer uses mock MCP data from `mcpData.js` (9 hardcoded servers)
- **Issue:** Real MCP servers from `mcp/mcp_info.hocon` are NOT loaded or displayed
- **Missing API:** No `getMcpServers()` endpoint in agentBuilderService
- **Impact:** Users can't configure real enterprise integrations (PostgreSQL, GitHub, AWS, Slack, Jira)

### Category 2: AI-Powered Features (HIGH PRIORITY)
**Impact:** Users must manually write everything, missing modern AI UX patterns

#### Gap 2.1: No AI Prompt Optimization
- **Current:** Users type instructions from scratch in plain textarea
- **Missing:** AI-powered prompt enhancement system
- **Desired UX:**
  1. User enters simple description: "Customer support agent"
  2. AI expands to: "You are a professional customer support agent. Your role is to..."
  3. User reviews and tweaks
  4. AI suggests relevant tools based on task (e.g., search, RAG, email)
- **Technical Approach:** Gemini API + structured prompt templates

#### Gap 2.2: No Context-Aware Tool Suggestions
- **Current:** Users manually browse 100+ tools with no guidance
- **Missing:** AI recommends tools based on agent instructions/role
- **Example:** Agent with instructions "answer questions about research papers" → AI suggests `arxiv_rag`, `pdf_rag`, `wikipedia_rag`

#### Gap 2.3: No Intelligent Parameter Generation
- **Current:** Users manually define function parameters (name, type, description, required)
- **Missing:** AI auto-generates parameters from instructions
- **Example:** "Flight booking agent" → AI suggests parameters: `departure_city`, `arrival_city`, `date`, `passengers`

### Category 3: Visual Workflow (MEDIUM PRIORITY)
**Impact:** Users struggle with manual agent connections and layout

#### Gap 3.1: No Visual Edge Creation UI
- **Current:** Edges are created programmatically when adding child nodes
- **Missing:**
  - Drag from agent output handle to create connection
  - Context menu "Connect to..." option
  - Connection validation (prevent cycles)
- **Desired:** Click agent → drag handle → drop on target agent → edge created

#### Gap 3.2: No Drag-and-Drop Tool Addition
- **Current:** Tools are only selectable via Config Drawer tabs
- **Missing:** Drag tool from library → drop on canvas → creates new tool node or adds to agent
- **Note:** ComponentLibrary has `handleDragStart` but no drop handler

#### Gap 3.3: No Agent Duplication
- **Current:** To create similar agents, must manually recreate all settings
- **Missing:** Right-click → Duplicate → creates copy with `_copy` suffix

### Category 4: Validation & Quality (MEDIUM PRIORITY)
**Impact:** Users create invalid configurations that fail at runtime

#### Gap 4.1: No Real-Time Configuration Validation
- **Current:** Errors only discovered when network is executed
- **Missing:**
  - Required field validation (name, instructions)
  - Tool availability checking (warn if tool doesn't exist)
  - Circular dependency detection
  - Parameter type validation
  - Visual error indicators in drawer

#### Gap 4.2: No Agent Testing Interface
- **Current:** Must deploy network to test agents
- **Missing:**
  - "Test Agent" button in drawer
  - Modal with test input form
  - Execute agent with sample input
  - Display output and logs inline
  - Validate agent works before saving

#### Gap 4.3: No Template Validation
- **Current:** No way to verify exported HOCON is valid
- **Missing:** HOCON syntax validator before download

### Category 5: Professional Features (LOW PRIORITY)
**Impact:** Missing enterprise-grade capabilities

#### Gap 5.1: No Agent Template Library
- **Current:** Always start from blank canvas
- **Missing:**
  - Pre-built templates: "Customer Support Network", "Research Assistant", "Sales Automation"
  - Template gallery with previews
  - One-click instantiate
  - Community template sharing

#### Gap 5.2: No Version Control / History
- **Current:** No undo/redo, no change history
- **Missing:**
  - Undo/redo stack for graph changes
  - Version history modal
  - Restore to previous version
  - Change diff visualization

#### Gap 5.3: No Bulk Operations
- **Current:** Must edit/delete agents one-by-one
- **Missing:**
  - Multi-select (Shift+Click, Ctrl+Click)
  - Bulk delete
  - Bulk tool assignment
  - Group operations

#### Gap 5.4: No Search/Filter in Canvas
- **Current:** Large networks become hard to navigate
- **Missing:**
  - Global search bar: find agent by name/instruction
  - Filter by type (agent/tool/sub-network)
  - Highlight matching nodes
  - Jump to node

#### Gap 5.5: No Collaboration Features
- **Current:** Single-user only
- **Missing:**
  - Real-time collaboration (multiple users editing)
  - Comments/annotations on agents
  - Change request workflow
  - Activity log ("John updated Agent A")

---

## Prioritized Implementation Roadmap 🎯

### Phase 1: Critical Data Integration (Week 1)
**Goal:** Connect to real Neuro SAN tools and MCP servers

1. **Task 1.1:** Fix AgentConfigDrawer to use real tools from context
   - Replace `import { availableTools } from '../data/toolsData'`
   - Use `const { tools } = useAgentNetwork()`
   - Update tool selection UI to handle dynamic tool list
   - Test with 100+ real tools

2. **Task 1.2:** Build MCP backend endpoint
   - Add `getMcpServers()` to agentBuilderService.js
   - Python backend: read `mcp/mcp_info.hocon`, return JSON
   - Parse MCP server metadata (name, class, transport, args)

3. **Task 1.3:** Integrate MCP in AgentConfigDrawer
   - Load MCP servers from backend via context
   - Display in MCP tab with real metadata
   - Allow selection and configuration

**Success Metrics:**
- ✅ Drawer shows 100+ real coded tools
- ✅ Drawer shows 15+ real MCP servers
- ✅ Selected tools persist to HOCON export

---

### Phase 2: AI-Powered Prompt Optimization (Week 2)
**Goal:** Add intelligent prompt assistance

1. **Task 2.1:** Build AI Prompt Enhancer Component
   - New "Prompt Assistant" button in Instructions tab
   - Modal with input: "Describe agent purpose in 1-2 sentences"
   - Call Gemini API with structured prompt template
   - Display enhanced prompt with "Apply" button

2. **Task 2.2:** Implement Context-Aware Tool Suggestions
   - Analyze agent instructions (keywords, intent)
   - Match against tool descriptions
   - Display "Suggested Tools" section in Tools tab
   - One-click add suggested tools

3. **Task 2.3:** Auto-Generate Function Parameters
   - "Generate Parameters" button in Function tab
   - AI reads instructions → suggests parameters
   - User reviews/edits before applying

**Success Metrics:**
- ✅ Simple description → professional prompt in <5 seconds
- ✅ Tool suggestions have >80% relevance
- ✅ Parameter generation saves >70% manual work

---

### Phase 3: Visual Workflow Enhancements (Week 3)
**Goal:** Make canvas interactions intuitive

1. **Task 3.1:** Add Visual Edge Creation
   - Add connection handles to agent nodes
   - Implement drag-to-connect interaction
   - Add "Connect to..." context menu option
   - Validate connections (no cycles)

2. **Task 3.2:** Enable Tool Drag-and-Drop
   - Add drop zone overlay on canvas
   - Handle drop event → add tool to agent
   - Visual feedback during drag

3. **Task 3.3:** Add Agent Duplication
   - Right-click menu → Duplicate
   - Copy all config + position offset
   - Auto-rename with "_copy" suffix

**Success Metrics:**
- ✅ Users can connect agents without opening drawers
- ✅ Drag-drop tool addition works for 100% of tools
- ✅ Duplication preserves all configurations

---

### Phase 4: Validation & Testing (Week 4)
**Goal:** Prevent invalid configurations

1. **Task 4.1:** Build Real-Time Validator
   - Validate on every config change
   - Display errors inline in drawer tabs
   - Red badges on tabs with errors
   - Block save until errors resolved

2. **Task 4.2:** Create Agent Testing Interface
   - "Test Agent" button in drawer
   - Test modal with input fields
   - Execute via backend API
   - Display results and logs

3. **Task 4.3:** Add HOCON Syntax Validator
   - Parse generated HOCON before export
   - Display syntax errors
   - Offer to fix common issues

**Success Metrics:**
- ✅ Invalid configs caught before save
- ✅ Users can test agents without deployment
- ✅ Zero export failures due to syntax errors

---

### Phase 5: Professional Features (Week 5+)
**Goal:** Enterprise-grade capabilities

1. **Task 5.1:** Build Template Library
   - Create 10 starter templates
   - Template browser modal
   - One-click instantiate

2. **Task 5.2:** Add Version Control
   - Implement undo/redo stack
   - Version history modal
   - Diff visualization

3. **Task 5.3:** Multi-Select & Bulk Ops
   - Shift/Ctrl+Click selection
   - Bulk delete, tool assignment
   - Group move/alignment

4. **Task 5.4:** Canvas Search/Filter
   - Global search bar
   - Filter dropdown
   - Highlight + jump to matches

**Success Metrics:**
- ✅ Templates reduce setup time by 80%
- ✅ Undo/redo works for 100% of operations
- ✅ Bulk operations save 5+ clicks per action

---

## Technical Architecture Recommendations

### 1. Unified Tool/MCP Data Model
```javascript
// Standardize tool/MCP data structure
{
  id: string,
  name: string,
  type: 'coded_tool' | 'mcp_server' | 'sub_network',
  category: string,
  description: string,
  class: string, // Python class path
  icon: Component,
  metadata: {
    provider?: string,
    compatibleModels?: string[],
    requiredParams?: object
  }
}
```

### 2. AI Service Abstraction
```javascript
// /src/services/aiService.js
export const aiService = {
  enhancePrompt: async (simpleDescription, agentType) => {...},
  suggestTools: async (instructions) => {...},
  generateParameters: async (instructions) => {...},
  validateConfig: async (config) => {...}
};
```

### 3. Canvas Interaction Manager
```javascript
// /src/hooks/useCanvasInteractions.js
export const useCanvasInteractions = () => {
  const handleNodeConnect = (source, target) => {...};
  const handleToolDrop = (toolId, position) => {...};
  const handleNodeDuplicate = (nodeId) => {...};
  return { handleNodeConnect, handleToolDrop, handleNodeDuplicate };
};
```

---

## Estimated Effort

| Phase | Tasks | Story Points | Duration |
|-------|-------|--------------|----------|
| Phase 1: Data Integration | 3 | 13 | 1 week |
| Phase 2: AI Features | 3 | 21 | 1 week |
| Phase 3: Visual Workflow | 3 | 13 | 1 week |
| Phase 4: Validation | 3 | 13 | 1 week |
| Phase 5: Professional | 4 | 21 | 2 weeks |
| **TOTAL** | **16** | **81** | **6 weeks** |

---

## Success Criteria for "State-of-the-Art" Platform

✅ **Ease of Use:** Non-technical users can build functional networks in <15 minutes
✅ **AI-Powered:** 70%+ of prompt/tool/parameter work done by AI
✅ **Professional:** Zero manual errors, instant validation feedback
✅ **Complete:** Access to 100% of Neuro SAN tools and MCPs
✅ **Scalable:** Handle networks with 50+ agents smoothly
✅ **Collaborative:** Multiple users can work together (Phase 5+)

---

## Next Steps

1. ✅ Review and approve this gap analysis
2. ⏳ Prioritize phases based on business needs
3. ⏳ Begin Phase 1 implementation
4. ⏳ Establish testing/QA process
5. ⏳ Plan user training/documentation

**Recommendation:** Start with Phase 1 immediately. Data integration is blocking all other features and has highest ROI.
