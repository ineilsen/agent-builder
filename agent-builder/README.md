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

## Deploy to AWS (EC2 + nginx)

The built frontend is a static site. In production, nginx replaces the Vite dev proxy: it serves the `dist/` files and forwards the three API route prefixes to the two backend services.

### 1. EC2 prerequisites

- Instance: Amazon Linux 2023 or Ubuntu 22.04 LTS, **t3.small** or larger
- Security group inbound rules:

| Port | Source | Purpose |
|---|---|---|
| 22 | Your IP | SSH |
| 80 | 0.0.0.0/0 | HTTP (or 443 for HTTPS) |
| 8080 | SG self / VPC only | Neuro SAN Tornado — internal only |
| 4173 | SG self / VPC only | NSFlow FastAPI — internal only |

Keep 8080 and 4173 off the public internet; nginx proxies them.

### 2. Build locally

```bash
cd agent-builder
npm install
npm run build        # produces dist/
```

No env file is needed for production — all API calls use relative paths and nginx routes them.

### 3. Upload dist/ to EC2

```bash
# Replace <EC2_HOST> with your public IP or hostname
rsync -avz --delete dist/ ec2-user@<EC2_HOST>:/var/www/agent-builder/
```

Or use `scp -r dist/ ec2-user@<EC2_HOST>:/var/www/agent-builder/`.

### 4. Install and configure nginx

```bash
# On the EC2 instance
sudo yum install -y nginx          # Amazon Linux
# sudo apt install -y nginx        # Ubuntu

sudo mkdir -p /var/www/agent-builder
```

Create `/etc/nginx/conf.d/agent-builder.conf`:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/agent-builder;
    index index.html;

    # Neuro SAN Tornado — REST + streaming chat
    location /api/v1/ {
        proxy_pass         http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_buffering    off;          # required for streaming responses
        proxy_read_timeout 300s;
    }

    # NSFlow REST — rewrite prefix /nsflow-api → /api/v1
    location /nsflow-api/ {
        rewrite            ^/nsflow-api/(.*)$ /api/v1/$1 break;
        proxy_pass         http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
    }

    # NSFlow WebSocket — rewrite prefix /nsflow → /api/v1/ws
    location /nsflow/ {
        rewrite              ^/nsflow/(.*)$ /api/v1/ws/$1 break;
        proxy_pass           http://localhost:4173;
        proxy_http_version   1.1;
        proxy_set_header     Upgrade $http_upgrade;
        proxy_set_header     Connection "upgrade";
        proxy_set_header     Host $host;
        proxy_read_timeout   3600s;
    }

    # SPA fallback — all other paths return index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. Enable and start nginx

```bash
sudo nginx -t                          # test config
sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

App is now live at `http://<EC2_HOST>/`.

### 6. HTTPS with Let's Encrypt (optional)

```bash
sudo yum install -y certbot python3-certbot-nginx   # Amazon Linux
sudo certbot --nginx -d your.domain.com
```

---

### Caveat — `/api/local` endpoints

The `vite.config.js` Vite middleware (`/api/local/*`) — used for local HOCON parsing, copilot generation, and save-to-registry — **does not run in a static nginx deployment**.

- **Copilot** and **save-to-registry** in the Builder page require `npm run dev` (dev server) or a separate Node.js process alongside nginx.
- **Network list, graph, and chat** all go through Tornado/NSFlow and work fine with nginx.

---

## Developer Notes

See [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) for component-level patterns (AgentConfigDrawer data flow, adding config fields, tabs, and styling guidelines).
