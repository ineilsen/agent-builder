# Azure DevOps SCRUM Board - Agent Builder Platform
## Complete Epic, User Story, and Work Items Structure

---

## TABLE OF CONTENTS

1. [Epic 1: Security & Authentication](#epic-1-security--authentication)
2. [Epic 2: Architecture Refactoring](#epic-2-architecture-refactoring)
3. [Epic 3: Performance Optimization](#epic-3-performance-optimization)
4. [Epic 4: Multi-Tenancy & SaaS Features](#epic-4-multi-tenancy--saas-features)
5. [Epic 5: Testing & Quality Assurance](#epic-5-testing--quality-assurance)
6. [Epic 6: DevOps & Production Readiness](#epic-6-devops--production-readiness)
7. [Epic 7: TypeScript Migration](#epic-7-typescript-migration)
8. [Sprint Planning Summary](#sprint-planning-summary)

---

# EPIC 1: Security & Authentication

**Priority:** P0 - Critical
**Business Value:** 100
**Effort:** 80 Story Points
**Sprint:** Sprint 1-2
**Dependencies:** None (blocking all other work)

## Description
Implement comprehensive security measures including authentication, authorization, and vulnerability fixes to make the platform production-ready and secure for multi-user environments.

## Success Criteria
- All critical security vulnerabilities resolved
- JWT-based authentication implemented
- All API endpoints protected
- Security audit passes
- No unauthorized access possible

---

## USER STORY 1.1: Fix Path Traversal Vulnerability

**Priority:** P0 - Critical
**Story Points:** 5
**Sprint:** Sprint 1
**Assigned To:** Backend Developer

### Description
As a **security engineer**, I need to **fix the path traversal vulnerability in vite.config.js** so that **attackers cannot read arbitrary files from the server**.

### Acceptance Criteria
- [ ] Path validation uses `path.resolve()` with whitelist checking
- [ ] All user-provided paths are sanitized
- [ ] Absolute paths and symlinks are rejected
- [ ] Security testing confirms vulnerability is patched
- [ ] No regression in legitimate file access

### Technical Details
**File:** `vite.config.js:93`
**Current Issue:** `const safePath = networkPath.replace(/\.\./g, '');`
**Security Risk:** Can access files outside intended directory

### Work Items

#### Task 1.1.1: Implement Path Validation Function
**Effort:** 2 hours
**Assigned To:** Backend Developer

**Description:**
Create secure path validation utility function

**Implementation Steps:**
```javascript
// Create src/utils/pathValidator.js
import path from 'path';

const ALLOWED_BASE_PATHS = [
    path.resolve(process.cwd(), 'neuro-san-studio/registries'),
    path.resolve(process.cwd(), 'neuro-san-studio/toolbox')
];

export function validatePath(userProvidedPath) {
    // Resolve to absolute path
    const resolvedPath = path.resolve(userProvidedPath);

    // Check if path is within allowed directories
    const isAllowed = ALLOWED_BASE_PATHS.some(basePath =>
        resolvedPath.startsWith(basePath)
    );

    if (!isAllowed) {
        throw new Error('Access denied: Path outside allowed directories');
    }

    // Check for symlinks
    const realPath = fs.realpathSync(resolvedPath);
    if (realPath !== resolvedPath) {
        throw new Error('Access denied: Symlinks not allowed');
    }

    return resolvedPath;
}
```

**Testing:**
- Test with `../../../etc/passwd` → Should reject
- Test with valid registry path → Should pass
- Test with symlink → Should reject

---

#### Task 1.1.2: Update Vite Middleware to Use Path Validator
**Effort:** 3 hours
**Assigned To:** Backend Developer

**Description:**
Replace insecure regex with secure path validation in all Vite middleware endpoints

**Files to Update:**
- `vite.config.js` lines 93, 134, 167, 199

**Implementation:**
```javascript
// In vite.config.js
import { validatePath } from './src/utils/pathValidator.js';

// Line 93 - Replace
const safePath = networkPath.replace(/\.\./g, '');
// With
const safePath = validatePath(networkPath);

// Wrap in try-catch
try {
    const validatedPath = validatePath(networkPath);
    // Proceed with file operations
} catch (error) {
    res.statusCode = 403;
    res.end(JSON.stringify({ error: error.message }));
    return;
}
```

---

#### Task 1.1.3: Add Security Testing for Path Validation
**Effort:** 2 hours
**Assigned To:** QA Engineer

**Description:**
Create automated security tests to verify path traversal is prevented

**Test Cases:**
```javascript
// tests/security/pathTraversal.test.js
describe('Path Traversal Prevention', () => {
    test('rejects path with ../', async () => {
        const response = await request(app)
            .get('/api/local/network-content?path=../../etc/passwd');
        expect(response.status).toBe(403);
    });

    test('rejects absolute paths outside allowed dirs', async () => {
        const response = await request(app)
            .get('/api/local/network-content?path=/etc/passwd');
        expect(response.status).toBe(403);
    });

    test('accepts valid registry paths', async () => {
        const response = await request(app)
            .get('/api/local/network-content?path=registries/basic/hello_world.hocon');
        expect(response.status).toBe(200);
    });
});
```

---

#### Task 1.1.4: Code Review & Security Audit
**Effort:** 1 hour
**Assigned To:** Senior Developer

**Checklist:**
- [ ] Path validation covers all user inputs
- [ ] No regex-based sanitization remains
- [ ] Whitelist approach is used
- [ ] Error messages don't leak path information
- [ ] Tests cover edge cases
- [ ] Documentation updated

---

## USER STORY 1.2: Implement JWT Authentication

**Priority:** P0 - Critical
**Story Points:** 13
**Sprint:** Sprint 1
**Assigned To:** Full Stack Developer

### Description
As a **platform administrator**, I need to **implement JWT-based authentication** so that **only authorized users can access the platform and their data is protected**.

### Acceptance Criteria
- [ ] Users can login with username/password
- [ ] JWT tokens are issued upon successful login
- [ ] Tokens expire after configurable time (default 24h)
- [ ] Refresh token mechanism works
- [ ] All API endpoints validate JWT tokens
- [ ] Frontend stores tokens securely
- [ ] Logout clears tokens

### Work Items

#### Task 1.2.1: Set Up Authentication Backend Service
**Effort:** 4 hours
**Assigned To:** Backend Developer

**Description:**
Create authentication service with JWT token generation

**Implementation:**
```javascript
// Create src/services/authService.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '24h';
const REFRESH_TOKEN_EXPIRY = '7d';

export class AuthService {
    async login(username, password) {
        // Validate credentials against database
        const user = await UserModel.findByUsername(username);

        if (!user || !await bcrypt.compare(password, user.passwordHash)) {
            throw new Error('Invalid credentials');
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, type: 'refresh' },
            JWT_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );

        return { accessToken, refreshToken, user };
    }

    async verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    async refreshAccessToken(refreshToken) {
        const payload = await this.verifyToken(refreshToken);

        if (payload.type !== 'refresh') {
            throw new Error('Invalid refresh token');
        }

        const user = await UserModel.findById(payload.userId);
        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        return { accessToken: newAccessToken };
    }
}
```

**Dependencies:**
- Install: `npm install jsonwebtoken bcryptjs`
- Create User model/database schema

---

#### Task 1.2.2: Create Authentication Middleware
**Effort:** 2 hours
**Assigned To:** Backend Developer

**Description:**
Create Express middleware to validate JWT on protected routes

**Implementation:**
```javascript
// Create src/middleware/authMiddleware.js
import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export const requireAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
        const payload = await authService.verifyToken(token);
        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Optional: Role-based authorization
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        next();
    };
};
```

**Usage:**
```javascript
// Protect routes
app.get('/api/v1/networks', requireAuth, getNetworks);
app.post('/api/v1/agents', requireAuth, requireRole(['admin', 'editor']), createAgent);
```

---

#### Task 1.2.3: Create Frontend Auth Context
**Effort:** 4 hours
**Assigned To:** Frontend Developer

**Description:**
Create React context for authentication state management

**Implementation:**
```javascript
// Create src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load user from token on mount
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            verifyAndLoadUser(token);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyAndLoadUser = async (token) => {
        try {
            const userData = await authApi.verifyToken(token);
            setUser(userData);
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        setError(null);
        try {
            const { accessToken, refreshToken, user } = await authApi.login(username, password);

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);

            return true;
        } catch (error) {
            setError(error.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
    };

    const refreshAccessToken = async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { accessToken } = await authApi.refresh(refreshToken);
        localStorage.setItem('accessToken', accessToken);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            error,
            login,
            logout,
            refreshAccessToken,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
```

---

#### Task 1.2.4: Create Login Page Component
**Effort:** 3 hours
**Assigned To:** Frontend Developer

**Description:**
Build login UI with form validation and error handling

**Implementation:**
```javascript
// Create src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const success = await login(username, password);

        if (success) {
            navigate('/builder');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
                <div className="flex items-center justify-center mb-8">
                    <img src="/assets/Cognizant/cog-icon.png" alt="Logo" className="w-12 h-12" />
                    <h2 className="ml-3 text-2xl font-bold text-white">Neuro AI Platform</h2>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded text-red-200 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
```

---

#### Task 1.2.5: Update API Client with Token Management
**Effort:** 3 hours
**Assigned To:** Frontend Developer

**Description:**
Update all API services to include JWT tokens in requests and handle token refresh

**Implementation:**
```javascript
// Create src/services/ApiClient.js
import axios from 'axios';

class ApiClient {
    constructor() {
        this.axios = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
            timeout: 30000
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor: Add auth token
        this.axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor: Handle token refresh
        this.axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If 401 and not already retrying, attempt token refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        const { data } = await axios.post('/api/v1/auth/refresh', {
                            refreshToken
                        });

                        localStorage.setItem('accessToken', data.accessToken);

                        // Retry original request with new token
                        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                        return this.axios(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    // HTTP methods
    get(url, config) {
        return this.axios.get(url, config);
    }

    post(url, data, config) {
        return this.axios.post(url, data, config);
    }

    put(url, data, config) {
        return this.axios.put(url, data, config);
    }

    delete(url, config) {
        return this.axios.delete(url, config);
    }
}

export const apiClient = new ApiClient();
```

**Update existing services:**
```javascript
// Update agentNetworkService.js
import { apiClient } from './ApiClient';

export const getNetworks = async () => {
    const response = await apiClient.get('/networks');
    return response.data;
};

// Update agentApi.js, agentBuilderService.js similarly
```

---

#### Task 1.2.6: Add Protected Route Component
**Effort:** 2 hours
**Assigned To:** Frontend Developer

**Description:**
Create route protection component to redirect unauthenticated users

**Implementation:**
```javascript
// Create src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
```

**Update App.jsx:**
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AgentBuilderV2 from './pages/AgentBuilderV2';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/builder"
                        element={
                            <ProtectedRoute>
                                <AgentBuilderV2 />
                            </ProtectedRoute>
                        }
                    />
                    {/* Other protected routes */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
```

---

#### Task 1.2.7: Testing Authentication Flow
**Effort:** 3 hours
**Assigned To:** QA Engineer

**Test Cases:**
1. Login with valid credentials → Success, redirects to /builder
2. Login with invalid credentials → Error message shown
3. Access /builder without token → Redirects to /login
4. Token expires during session → Auto-refresh works
5. Refresh token expires → Redirects to /login
6. Logout → Tokens cleared, redirects to /login
7. API calls include Authorization header
8. 401 response triggers token refresh

---

## USER STORY 1.3: Secure WebSocket Connections

**Priority:** P1 - High
**Story Points:** 8
**Sprint:** Sprint 1
**Assigned To:** Full Stack Developer

### Description
As a **developer**, I need to **secure WebSocket connections with authentication** so that **only authorized users can establish real-time connections**.

### Acceptance Criteria
- [ ] WebSocket connections require valid JWT token
- [ ] Token validation happens on connection establishment
- [ ] Invalid tokens are rejected with appropriate error
- [ ] Connections are scoped to user's accessible networks
- [ ] No cross-user message leakage

### Work Items

#### Task 1.3.1: Add WebSocket Authentication Middleware
**Effort:** 3 hours
**Assigned To:** Backend Developer

**Implementation:**
```javascript
// Backend: Create WebSocket auth middleware
import { Server } from 'socket.io';
import { AuthService } from '../services/authService.js';

const authService = new AuthService();

export function setupWebSocketAuth(io) {
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const payload = await authService.verifyToken(token);
            socket.user = payload;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });
}

// Usage in server setup
const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL }
});

setupWebSocketAuth(io);

io.on('connection', (socket) => {
    console.log(`User ${socket.user.userId} connected`);

    // Scope connections to user's accessible networks
    socket.on('join-network', async (networkId) => {
        const hasAccess = await checkUserNetworkAccess(
            socket.user.userId,
            networkId
        );

        if (hasAccess) {
            socket.join(`network:${networkId}`);
        } else {
            socket.emit('error', 'Access denied to network');
        }
    });
});
```

---

#### Task 1.3.2: Update Frontend WebSocket Client
**Effort:** 2 hours
**Assigned To:** Frontend Developer

**Implementation:**
```javascript
// Update AgentNetworkContext.jsx WebSocket connections
import { io } from 'socket.io-client';

const connectWebSocket = useCallback((url) => {
    const token = localStorage.getItem('accessToken');

    const socket = io(url, {
        auth: { token },
        transports: ['websocket']
    });

    socket.on('connect_error', (error) => {
        if (error.message === 'Authentication required' ||
            error.message === 'Invalid token') {
            // Token expired, try refresh
            refreshAccessToken().then(() => {
                // Reconnect with new token
                connectWebSocket(url);
            }).catch(() => {
                // Refresh failed, redirect to login
                navigate('/login');
            });
        }
    });

    return socket;
}, []);
```

---

#### Task 1.3.3: Test WebSocket Security
**Effort:** 2 hours
**Assigned To:** QA Engineer

**Test Cases:**
- Connect without token → Rejected
- Connect with invalid token → Rejected
- Connect with valid token → Success
- Token expires during connection → Reconnects with refresh
- User A cannot see User B's messages

---


---

# EPIC 2: Architecture Refactoring

**Priority:** P0 - Critical
**Business Value:** 90
**Effort:** 100 Story Points
**Sprint:** Sprint 2-3
**Dependencies:** Epic 1 (Auth must be complete)

## Description
Refactor monolithic components and oversized context to improve maintainability, performance, and developer experience. Split large files into focused, reusable components.

## Success Criteria
- Context state reduced to <10 variables per context
- No component exceeds 300 lines
- Unified HTTP client replaces all fetch/axios calls
- Code duplication reduced by 50%
- Developer onboarding time reduced

---

## USER STORY 2.1: Split AgentNetworkContext into 3 Contexts

**Priority:** P0 - Critical
**Story Points:** 21
**Sprint:** Sprint 2
**Assigned To:** Senior Frontend Developer

### Description
As a **frontend developer**, I need to **split the monolithic AgentNetworkContext** so that **components only re-render when relevant state changes, improving performance**.

### Acceptance Criteria
- [ ] NetworkDataContext manages networks, tools, graphData
- [ ] ChatContext manages chat messages, WebSocket, send functions
- [ ] ExecutionContext manages logs, traces, activeAgents
- [ ] Context providers are properly nested
- [ ] All consuming components updated
- [ ] No performance regression

### Technical Context
**Current Issue:** AgentNetworkContext.jsx has 40+ state variables in single context
**Impact:** Any state change re-renders ALL consumers
**File:** `src/context/AgentNetworkContext.jsx` (833 lines)

### Work Items

#### Task 2.1.1: Create NetworkDataContext
**Effort:** 8 hours
**Assigned To:** Frontend Developer

**Implementation:**
```javascript
// Create src/context/NetworkDataContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { agentNetworkService } from '../services/agentNetworkService';
import { agentBuilderService } from '../services/agentBuilderService';

const NetworkDataContext = createContext();

export const NetworkDataProvider = ({ children }) => {
    const [networks, setNetworks] = useState([]);
    const [currentNetwork, setCurrentNetwork] = useState(null);
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load networks on mount
    useEffect(() => {
        loadNetworks();
        loadTools();
    }, []);

    const loadNetworks = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const networksData = await agentNetworkService.getNetworks();
            setNetworks(networksData || []);

            if (networksData && networksData.length > 0) {
                await loadNetwork(networksData[0]);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadNetwork = useCallback(async (networkPath) => {
        try {
            const content = await agentNetworkService.getNetworkContent(networkPath);
            const { nodes, edges } = parseHoconToGraph(content);

            setCurrentNetwork(networkPath);
            setGraphData({ nodes, edges });
        } catch (err) {
            setError(`Failed to load network: ${err.message}`);
        }
    }, []);

    const loadTools = useCallback(async () => {
        try {
            const toolsData = await agentBuilderService.getTools();
            setTools(toolsData || []);
        } catch (err) {
            console.warn('Failed to load tools:', err.message);
        }
    }, []);

    const value = {
        networks,
        currentNetwork,
        graphData,
        tools,
        loading,
        error,
        loadNetworks,
        loadNetwork,
        loadTools
    };

    return (
        <NetworkDataContext.Provider value={value}>
            {children}
        </NetworkDataContext.Provider>
    );
};

export const useNetworkData = () => {
    const context = useContext(NetworkDataContext);
    if (!context) {
        throw new Error('useNetworkData must be used within NetworkDataProvider');
    }
    return context;
};
```

---

#### Task 2.1.2: Create ChatContext
**Effort:** 8 hours
**Assigned To:** Frontend Developer

**Implementation:**
```javascript
// Create src/context/ChatContext.jsx
import React, { createContext, useState, useRef, useCallback, useContext } from 'react';
import { useNetworkData } from './NetworkDataContext';
import { v4 as uuidv4 } from 'uuid';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { currentNetwork } = useNetworkData();
    const [chatMessages, setChatMessages] = useState([]);
    const [isChatConnected, setIsChatConnected] = useState(false);
    const [sessionId, setSessionId] = useState(() => uuidv4());

    const chatSocketRef = useRef(null);
    const chatContextRef = useRef({ chat_context: [], sly_data: {} });

    const connectChat = useCallback(async (networkPath) => {
        if (!networkPath) return;

        const wsBase = 'ws://localhost:8080/api/v1/agent_flows';
        const chatUrl = `${wsBase}/chat/${networkPath}/${sessionId}`;

        try {
            const socket = new WebSocket(chatUrl);

            socket.onopen = () => {
                console.log('Chat WebSocket connected');
                setIsChatConnected(true);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.message) {
                    setChatMessages(prev => [...prev, {
                        type: data.message.type || 'AI',
                        text: data.message.text || '',
                        timestamp: new Date().toISOString()
                    }]);

                    // Update chat context
                    if (data.message.chat_context) {
                        chatContextRef.current.chat_context = data.message.chat_context;
                    }
                    if (data.message.sly_data) {
                        chatContextRef.current.sly_data = data.message.sly_data;
                    }
                }
            };

            socket.onerror = (error) => {
                console.error('Chat WebSocket error:', error);
                setIsChatConnected(false);
            };

            socket.onclose = () => {
                console.log('Chat WebSocket closed');
                setIsChatConnected(false);
            };

            chatSocketRef.current = socket;
        } catch (error) {
            console.error('Failed to connect chat:', error);
        }
    }, [sessionId]);

    const disconnectChat = useCallback(() => {
        if (chatSocketRef.current) {
            chatSocketRef.current.close();
            chatSocketRef.current = null;
        }
        setIsChatConnected(false);
    }, []);

    const sendChatMessage = useCallback((message) => {
        if (!chatSocketRef.current || !isChatConnected) {
            console.warn('Chat not connected');
            return;
        }

        const payload = {
            user_message: message,
            chat_context: chatContextRef.current.chat_context,
            sly_data: chatContextRef.current.sly_data
        };

        chatSocketRef.current.send(JSON.stringify(payload));

        // Add user message to UI immediately
        setChatMessages(prev => [...prev, {
            type: 'USER',
            text: message,
            timestamp: new Date().toISOString()
        }]);
    }, [isChatConnected]);

    const clearChatHistory = useCallback(() => {
        setChatMessages([]);
        chatContextRef.current = { chat_context: [], sly_data: {} };
    }, []);

    const value = {
        chatMessages,
        isChatConnected,
        sessionId,
        connectChat,
        disconnectChat,
        sendChatMessage,
        clearChatHistory
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};
```

---

#### Task 2.1.3: Create ExecutionContext
**Effort:** 6 hours
**Assigned To:** Frontend Developer

**Implementation:**
```javascript
// Create src/context/ExecutionContext.jsx
import React, { createContext, useState, useRef, useCallback, useContext } from 'react';
import { useNetworkData } from './NetworkDataContext';

const ExecutionContext = createContext();

export const ExecutionProvider = ({ children }) => {
    const { currentNetwork } = useNetworkData();
    const [executionLogs, setExecutionLogs] = useState([]);
    const [internalChatMessages, setInternalChatMessages] = useState([]);
    const [activeAgents, setActiveAgents] = useState([]);
    const [agentChain, setAgentChain] = useState([]);
    const [isLogsConnected, setIsLogsConnected] = useState(false);

    const logsSocketRef = useRef(null);
    const currentExecutionTraceRef = useRef([]);

    const connectLogs = useCallback(async (networkPath, sessionId) => {
        if (!networkPath || !sessionId) return;

        const wsBase = 'ws://localhost:8080/api/v1/agent_flows';
        const logsUrl = `${wsBase}/logs/${networkPath}/${sessionId}`;

        try {
            const socket = new WebSocket(logsUrl);

            socket.onopen = () => {
                console.log('Logs WebSocket connected');
                setIsLogsConnected(true);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if (data.message) {
                    // Add to execution logs
                    setExecutionLogs(prev => [...prev, {
                        text: data.message.text || '',
                        otrace: data.message.otrace || [],
                        timestamp: new Date().toISOString()
                    }]);

                    // Update active agents for animation
                    if (data.message.otrace) {
                        const agents = data.message.otrace.map(entry => entry.split(':')[0]);
                        setActiveAgents(agents);

                        // Clear after animation
                        setTimeout(() => setActiveAgents([]), 2000);
                    }

                    // Update agent chain
                    if (data.message.otrace && data.message.otrace.length > 0) {
                        const trace = data.message.otrace;
                        currentExecutionTraceRef.current = trace;
                        setAgentChain(trace);
                    }
                }
            };

            socket.onerror = (error) => {
                console.error('Logs WebSocket error:', error);
                setIsLogsConnected(false);
            };

            socket.onclose = () => {
                console.log('Logs WebSocket closed');
                setIsLogsConnected(false);
            };

            logsSocketRef.current = socket;
        } catch (error) {
            console.error('Failed to connect logs:', error);
        }
    }, []);

    const disconnectLogs = useCallback(() => {
        if (logsSocketRef.current) {
            logsSocketRef.current.close();
            logsSocketRef.current = null;
        }
        setIsLogsConnected(false);
    }, []);

    const clearExecutionLogs = useCallback(() => {
        setExecutionLogs([]);
        setInternalChatMessages([]);
        setActiveAgents([]);
        setAgentChain([]);
        currentExecutionTraceRef.current = [];
    }, []);

    const value = {
        executionLogs,
        internalChatMessages,
        activeAgents,
        agentChain,
        isLogsConnected,
        connectLogs,
        disconnectLogs,
        clearExecutionLogs
    };

    return (
        <ExecutionContext.Provider value={value}>
            {children}
        </ExecutionContext.Provider>
    );
};

export const useExecution = () => {
    const context = useContext(ExecutionContext);
    if (!context) {
        throw new Error('useExecution must be used within ExecutionProvider');
    }
    return context;
};
```

---

#### Task 2.1.4: Update App.jsx with Nested Providers
**Effort:** 2 hours
**Assigned To:** Frontend Developer

**Implementation:**
```javascript
// Update src/App.jsx
import { AuthProvider } from './context/AuthContext';
import { NetworkDataProvider } from './context/NetworkDataContext';
import { ChatProvider } from './context/ChatContext';
import { ExecutionProvider } from './context/ExecutionContext';

function App() {
    return (
        <AuthProvider>
            <NetworkDataProvider>
                <ChatProvider>
                    <ExecutionProvider>
                        <BrowserRouter>
                            <Routes>
                                {/* Routes */}
                            </Routes>
                        </BrowserRouter>
                    </ExecutionProvider>
                </ChatProvider>
            </NetworkDataProvider>
        </AuthProvider>
    );
}
```

---

#### Task 2.1.5: Update All Components to Use New Contexts
**Effort:** 8 hours
**Assigned To:** Frontend Developer

**Files to Update:**
- `AgentBuilderV2.jsx` - Replace `useAgentNetwork` with specific hooks
- `StudioFlowCanvas.jsx` - Use `useNetworkData`, `useExecution`
- `DesignerCopilot.jsx` - Use `useChat`
- `ExecutionLogsPanel.jsx` - Use `useExecution`
- `ChatPanel.jsx` - Use `useChat`

**Example Migration:**
```javascript
// Before
import { useAgentNetwork } from '../context/AgentNetworkContext';

const MyComponent = () => {
    const { networks, chatMessages, executionLogs } = useAgentNetwork();
    // ...
};

// After
import { useNetworkData } from '../context/NetworkDataContext';
import { useChat } from '../context/ChatContext';
import { useExecution } from '../context/ExecutionContext';

const MyComponent = () => {
    const { networks } = useNetworkData();
    const { chatMessages } = useChat();
    const { executionLogs } = useExecution();
    // ...
};
```

---

#### Task 2.1.6: Performance Testing & Validation
**Effort:** 4 hours
**Assigned To:** QA Engineer

**Test Cases:**
1. Load network → Only NetworkDataContext consumers re-render
2. Send chat message → Only ChatContext consumers re-render
3. Execution log arrives → Only ExecutionContext consumers re-render
4. Measure re-render counts with React DevTools Profiler
5. Compare performance before/after refactor

**Success Criteria:**
- Re-render count reduced by 70%+
- No functionality regression
- All WebSocket connections work

---

## USER STORY 2.2: Create Unified API Client

**Priority:** P1 - High
**Story Points:** 13
**Sprint:** Sprint 2
**Assigned To:** Backend Developer

### Description
As a **developer**, I need a **unified HTTP client with centralized error handling and retry logic** so that **API calls are consistent and resilient**.

### Acceptance Criteria
- [ ] Single ApiClient class replaces all fetch/axios usage
- [ ] Automatic retry with exponential backoff on 5xx errors
- [ ] Standardized error responses
- [ ] Request/response logging
- [ ] Network timeout handling
- [ ] All services migrated to use ApiClient

### Work Items

#### Task 2.2.1: Create ApiClient Base Class
**Effort:** 4 hours
**Assigned To:** Backend Developer

**Implementation:**
```javascript
// Create src/services/ApiClient.js
import axios from 'axios';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export class ApiClient {
    constructor(config = {}) {
        this.axios = axios.create({
            baseURL: config.baseURL || import.meta.env.VITE_API_BASE_URL || '/api/v1',
            timeout: config.timeout || 30000,
            headers: {
                'Content-Type': 'application/json',
                'X-Client-Version': '1.0.0'
            }
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor
        this.axios.interceptors.request.use(
            (config) => {
                // Add auth token
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // Log request in development
                if (import.meta.env.DEV) {
                    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`, config.data);
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor
        this.axios.interceptors.response.use(
            (response) => {
                // Log response in development
                if (import.meta.env.DEV) {
                    console.log(`[API] Response ${response.config.url}`, response.data);
                }
                return response;
            },
            async (error) => {
                return this.handleResponseError(error);
            }
        );
    }

    async handleResponseError(error) {
        const config = error.config;

        // Handle token expiration (401)
        if (error.response?.status === 401 && !config._retry) {
            config._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken });

                localStorage.setItem('accessToken', data.accessToken);
                config.headers.Authorization = `Bearer ${data.accessToken}`;

                return this.axios(config);
            } catch (refreshError) {
                // Refresh failed, logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle server errors (5xx) with retry
        if (error.response?.status >= 500 && error.response?.status < 600) {
            const retryCount = config._retryCount || 0;

            if (retryCount < MAX_RETRIES) {
                config._retryCount = retryCount + 1;

                // Exponential backoff
                const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
                await new Promise(resolve => setTimeout(resolve, delay));

                console.log(`[API] Retrying request (${config._retryCount}/${MAX_RETRIES}): ${config.url}`);
                return this.axios(config);
            }
        }

        // Standardize error format
        const standardError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            status: error.response?.status,
            code: error.response?.data?.code || 'UNKNOWN_ERROR',
            details: error.response?.data?.details
        };

        console.error('[API] Error:', standardError);
        return Promise.reject(standardError);
    }

    // HTTP methods with standard interface
    async get(url, config = {}) {
        const response = await this.axios.get(url, config);
        return response.data;
    }

    async post(url, data, config = {}) {
        const response = await this.axios.post(url, data, config);
        return response.data;
    }

    async put(url, data, config = {}) {
        const response = await this.axios.put(url, data, config);
        return response.data;
    }

    async patch(url, data, config = {}) {
        const response = await this.axios.patch(url, data, config);
        return response.data;
    }

    async delete(url, config = {}) {
        const response = await this.axios.delete(url, config);
        return response.data;
    }

    // Streaming support for SSE
    async getStream(url, onMessage, config = {}) {
        const response = await fetch(`${this.axios.defaults.baseURL}${url}`, {
            headers: {
                ...this.axios.defaults.headers,
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            ...config
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);
            const lines = text.split('\n');

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const data = JSON.parse(line);
                        onMessage(data);
                    } catch (e) {
                        console.warn('Failed to parse stream data:', line);
                    }
                }
            }
        }
    }
}

// Create singleton instance
export const apiClient = new ApiClient();
```

---

#### Task 2.2.2: Migrate agentNetworkService to ApiClient
**Effort:** 2 hours
**Assigned To:** Backend Developer

**Implementation:**
```javascript
// Update src/services/agentNetworkService.js
import { apiClient } from './ApiClient';

export const agentNetworkService = {
    async getNetworks() {
        return await apiClient.get('/networks');
    },

    async getNetworkContent(networkPath) {
        return await apiClient.get('/network-content', {
            params: { path: networkPath }
        });
    },

    async updateAgentPrompt(networkPath, agentName, newPrompt) {
        return await apiClient.post('/update-agent-prompt', {
            network_path: networkPath,
            agent_name: agentName,
            new_prompt: newPrompt
        });
    },

    async createNetwork(networkData) {
        return await apiClient.post('/networks', networkData);
    },

    async deleteNetwork(networkPath) {
        return await apiClient.delete(`/networks/${encodeURIComponent(networkPath)}`);
    }
};
```

---

#### Task 2.2.3: Migrate agentBuilderService to ApiClient
**Effort:** 3 hours
**Assigned To:** Backend Developer

---

#### Task 2.2.4: Migrate agentApi to ApiClient
**Effort:** 2 hours
**Assigned To:** Backend Developer

---

#### Task 2.2.5: Add Error Notification System
**Effort:** 3 hours
**Assigned To:** Frontend Developer

**Implementation:**
```javascript
// Create src/context/NotificationContext.jsx
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'info') => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <NotificationContext.Provider value={{ addNotification, removeNotification }}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
};

// Update ApiClient to use notifications
this.axios.interceptors.response.use(
    response => response,
    error => {
        const { addNotification } = useNotification(); // In actual implementation, pass via context
        addNotification(error.message, 'error');
        return this.handleResponseError(error);
    }
);
```

---

