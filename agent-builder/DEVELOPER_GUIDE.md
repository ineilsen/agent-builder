# Agent Configuration Drawer - Developer Guide

## Quick Start

### Opening the Configuration Drawer
The drawer opens automatically when you click on any agent node in the flow canvas. The `AgentBuilderV2.jsx` component handles this:

```javascript
const handleNodeClick = (event, node) => {
    if (node.type === 'agent') {
        setSelectedAgentId(node.id);
        setIsDrawerOpen(true);
    }
};
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AgentBuilderV2.jsx                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ State: agentConfig[selectedAgentId]                       │  │
│  │        ↓                                                  │  │
│  │  AgentConfigDrawer Component                             │  │
│  │    ├─ Props: agentId, agentConfig, onSave, onClose       │  │
│  │    ├─ Local State: config, hasUnsavedChanges, isSaving  │  │
│  │    └─ useEffect: Watches agentId changes                │  │
│  │                                                           │  │
│  │  User edits config → updateConfig() → hasUnsavedChanges  │  │
│  │  User clicks Save → handleSave()                         │  │
│  │    ├─ saveAgentConfig(agentId, config) [API Service]    │  │
│  │    │    ├─ Try: POST /api/agents/:id/config             │  │
│  │    │    └─ Catch: localStorage.setItem()                │  │
│  │    └─ onSave(savedConfig) → Update parent state         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Key Patterns

### 1. Config Initialization
```javascript
const initializeConfig = (config) => ({
    name: config?.label || agentId,
    description: config?.function?.description || '',
    instructions: config?.instructions || '',
    // ... all other fields with defaults
});

const [config, setConfig] = useState(() => initializeConfig(agentConfig));
```

### 2. Tracking Changes
```javascript
// ❌ Don't do this:
setConfig({ ...config, name: newName }); // Doesn't track changes

// ✅ Do this:
updateConfig({ name: newName }); // Tracks changes, sets hasUnsavedChanges
```

### 3. Agent Switching Logic
```javascript
useEffect(() => {
    // If unsaved changes, show warning
    if (hasUnsavedChanges && pendingAgentId !== agentId) {
        setPendingAgentId(agentId);
        setShowUnsavedWarning(true);
        return; // Don't switch yet
    }

    // No unsaved changes, switch immediately
    setConfig(initializeConfig(agentConfig));
    setHasUnsavedChanges(false);
    setActiveTab('overview');
}, [agentId]);
```

### 4. Save with Error Handling
```javascript
const handleSave = async () => {
    setIsSaving(true);

    try {
        await saveAgentConfig(agentId, savedConfig);
        onSave(savedConfig); // Update parent
        setHasUnsavedChanges(false);
    } catch (error) {
        alert('Failed to save configuration. Please try again.');
    } finally {
        setIsSaving(false);
    }
};
```

## Adding New Configuration Fields

### Step 1: Add to initializeConfig
```javascript
const initializeConfig = (config) => ({
    // ... existing fields
    myNewField: config?.myNewField || 'default value',
});
```

### Step 2: Add UI in the appropriate tab
```javascript
{activeTab === 'overview' && (
    <div>
        <label>My New Field</label>
        <input
            value={config.myNewField}
            onChange={(e) => updateConfig({ myNewField: e.target.value })}
        />
    </div>
)}
```

### Step 3: Include in savedConfig
```javascript
const savedConfig = {
    // ... existing fields
    myNewField: config.myNewField,
};
```

## Adding New Tabs

### Step 1: Add to tabs array
```javascript
const tabs = [
    // ... existing tabs
    {
        id: 'mynew',
        label: 'My New Tab',
        icon: MyIcon,
        badge: someCount // optional
    }
];
```

### Step 2: Add tab content
```javascript
{activeTab === 'mynew' && (
    <div className="space-y-5">
        {/* Your tab content here */}
    </div>
)}
```

## API Service Usage

### Saving Configuration
```javascript
import { saveAgentConfig } from '../services/agentApi';

const config = { /* ... */ };
await saveAgentConfig('agent_id', config);
// Automatically saves to backend, falls back to localStorage
```

### Loading Configuration
```javascript
import { loadAgentConfig } from '../services/agentApi';

const config = await loadAgentConfig('agent_id');
// Returns config object or null
```

### Listing All Configurations
```javascript
import { listAgentConfigs } from '../services/agentApi';

const allConfigs = await listAgentConfigs();
// Returns array of all saved configurations
```

## Styling Guidelines

### Colors
- **Purple** (#8b5cf6): Primary actions, selected items
- **Blue** (#3b82f6): MCP servers, secondary actions
- **Green** (#22c55e): Success states, active toggles
- **Orange** (#f97316): Warnings, unsaved changes
- **Red** (#ef4444): Errors, delete actions
- **Gray**: Neutral states, borders, backgrounds

### Spacing
Use Tailwind spacing scale:
- `gap-2` (0.5rem): Tight spacing between related items
- `gap-3` (0.75rem): Default spacing
- `gap-4` (1rem): Section spacing
- `gap-6` (1.5rem): Major section spacing

### Border Radius
- `rounded-lg` (0.5rem): Buttons, small cards
- `rounded-xl` (0.75rem): Inputs, larger cards
- `rounded-2xl` (1rem): Modals, containers

### Shadows
- `shadow-sm`: Subtle elevation
- `shadow-lg`: Cards, important elements
- `shadow-2xl`: Modals, drawers

## Performance Optimization

### useMemo for Expensive Filtering
```javascript
const filteredTools = useMemo(() => {
    let tools = availableTools;

    if (toolCategoryFilter !== 'All') {
        tools = tools.filter(t => t.category === toolCategoryFilter);
    }

    if (toolSearch) {
        tools = tools.filter(t =>
            t.name.toLowerCase().includes(toolSearch.toLowerCase())
        );
    }

    return tools;
}, [toolSearch, toolCategoryFilter]);
```

### Debouncing Search (Future Enhancement)
```javascript
import { useDebouncedValue } from '../hooks/useDebouncedValue';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebouncedValue(searchInput, 300);

// Use debouncedSearch in filtering
```

## Testing

### Unit Tests (Future)
```javascript
describe('AgentConfigDrawer', () => {
    it('should update config when agent switches', () => {
        // Test agent switching logic
    });

    it('should show warning when switching with unsaved changes', () => {
        // Test unsaved changes warning
    });

    it('should save configuration to backend', async () => {
        // Test save functionality
    });
});
```

### Manual Testing Checklist
1. ✅ Open drawer by clicking agent node
2. ✅ Modify any field → See "Unsaved" badge
3. ✅ Click different agent → See warning modal
4. ✅ Choose "Discard Changes" → Config resets
5. ✅ Choose "Keep Editing" → Stay on current agent
6. ✅ Click Save → See loading spinner
7. ✅ Check localStorage for saved config
8. ✅ Reload page → Drawer should show saved values

## Troubleshooting

### Issue: Config not updating when switching agents
**Solution**: Check that `agentId` is changing in the useEffect dependency array

### Issue: Unsaved changes not tracked
**Solution**: Make sure all inputs use `updateConfig()` instead of `setConfig()`

### Issue: Save not persisting
**Solution**: Check browser console for API errors, verify localStorage fallback

### Issue: Dark mode colors wrong
**Solution**: Ensure all classes have `dark:` variants

## Environment Variables

Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5174/api
```

## Backend API Contract

### PUT /api/agents/:agentId/config
**Request:**
```json
{
    "agentId": "string",
    "label": "string",
    "function": { ... },
    "instructions": "string",
    "command": "string",
    "tools": ["string"],
    "mcp_servers": ["string"],
    "model": "string",
    "llm_config": { ... },
    "memory": { ... },
    "logging": boolean
}
```

**Response:**
```json
{
    "success": true,
    "data": { ... },
    "timestamp": "2024-01-01T00:00:00Z"
}
```

### GET /api/agents/:agentId/config
**Response:**
```json
{
    "success": true,
    "data": { ... }
}
```

## Best Practices

1. **Always use updateConfig()** for state changes that should be tracked
2. **Add loading states** for async operations
3. **Show error messages** when operations fail
4. **Validate inputs** before saving
5. **Use semantic HTML** for accessibility
6. **Add ARIA labels** for screen readers
7. **Test dark mode** alongside light mode
8. **Keep components focused** - one responsibility per component
9. **Document complex logic** with comments
10. **Use TypeScript types** (future enhancement)

## Resources

- [Lucide Icons](https://lucide.dev/) - Icon library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Hooks](https://react.dev/reference/react) - State management
- [Vite](https://vitejs.dev/) - Build tool

---

Happy coding! 🚀
