# Agent Builder

A React/Vite web application for building, visualising, and interacting with [Neuro SAN](https://github.com/cognizant-ai-labs/neuro-san) agent networks.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| npm | 9+ |
| Neuro SAN Tornado server | running on port 8080 |
| NSFlow FastAPI server | running on port 4173 |

---

## Setup

```bash
# 1. Install dependencies
cd agent-builder
npm install

# 2. Configure target servers
cp .env.local.example .env.local
# Edit .env.local and set VITE_NEURO_SAN_URL and VITE_NSFLOW_URL
```

### `.env.local` options

```env
# Remote server (AWS / EC2 / cloud)
VITE_NEURO_SAN_URL=http://<host>:8080
VITE_NSFLOW_URL=http://<host>:4173

# Local development (defaults used when vars are absent)
# VITE_NEURO_SAN_URL=http://localhost:8080
# VITE_NSFLOW_URL=http://localhost:4173
```

`.env.local` is gitignored — safe to put IPs and credentials here.

---

## Start

```bash
npm run dev
```

App runs at **http://localhost:5174**

---

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | Agent Viewer (Studio) | Network dropdown, flow graph, chat panel |
| `/studio` | Agent Viewer (Studio) | Same as `/` |
| `/builder` | Agent Builder V2 | Full canvas editor with copilot and save-to-registry |

---

## Architecture

```
Browser (localhost:5174)
        │
        ├─ /api/v1/*         ──► Neuro SAN Tornado   (port 8080)
        │                        • /api/v1/list           — list all networks
        │                        • /api/v1/{name}/streaming_chat — chat
        │
        ├─ /nsflow-api/*     ──► NSFlow FastAPI REST  (port 4173)
        │   (rewrites to /api/v1/*)
        │                        • /api/v1/connectivity/{name}          — graph nodes + edges
        │                        • /api/v1/networkconfig/{name}         — full HOCON config
        │                        • /api/v1/networkconfig/{name}/agent/{id} — per-agent config
        │
        └─ /nsflow/*         ──► NSFlow FastAPI WS    (port 4173)
            (rewrites to /api/v1/ws/*)
                                 • /api/v1/ws/chat/{network}/{session}  — streaming chat WS
```

All proxying is handled by Vite at dev time — no CORS issues, no hardcoded URLs in source.

---

## Key Source Files

```
agent-builder/
├── vite.config.js                   # Proxy config + local API middleware
├── src/
│   ├── App.jsx                      # Routes
│   ├── pages/
│   │   ├── AgentBuilder.jsx         # /  and /studio — viewer mode
│   │   └── AgentBuilderV2.jsx       # /builder       — editor mode
│   ├── services/
│   │   ├── agentNetworkService.js   # Network list + graph (viewer)
│   │   └── agentBuilderService.js   # Network graph + copilot + save (editor)
│   └── context/
│       └── AgentNetworkContext.jsx  # Shared network + chat state
```

---

## Build for Production

```bash
npm run build     # outputs to dist/
npm run preview   # serves dist/ locally to verify
```

---

## Developer Notes

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for component-level patterns (AgentConfigDrawer data flow, adding config fields, tabs, and styling guidelines).
