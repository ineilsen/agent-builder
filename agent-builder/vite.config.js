import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    server: {
        port: 5174,
        proxy: {
            // Proxy neuro-san API requests to port 8080 (Tornado HTTP server)
            '/api/v1': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
                ws: true
            },
            // Proxy nsflow REST requests to port 4173 (FastAPI/uvicorn)
            '/nsflow-api': {
                target: 'http://localhost:4173',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/nsflow-api/, '/api/v1')
            },
            // Proxy nsflow WebSocket requests to port 4173 (FastAPI/uvicorn)
            '/nsflow': {
                target: 'http://localhost:4173',
                changeOrigin: true,
                secure: false,
                ws: true,
                rewrite: (path) => path.replace(/^\/nsflow\//, '/api/v1/ws/')
            }
        }
    },
    plugins: [
        react(),
        {
            name: 'local-network-server',
            configureServer(server) {
                server.middlewares.use('/api/local', async (req, res, next) => {
                    const fs = await import('fs');
                    const path = await import('path');
                    const url = new URL(req.url, `http://${req.headers.host}`);

                    // Path to registries in neuro-san-studio (peer directory)
                    const REGISTRY_ROOT = path.resolve(__dirname, '../neuro-san-studio/registries');
                    // USE VIRTUAL ENV PYTHON
                    const PYTHON_EXECUTABLE = path.resolve(__dirname, '../neuro-san-studio/venv/bin/python3');

                    if (url.pathname === '/networks' && req.method === 'GET') {
                        try {
                            const { spawn } = await import('child_process');
                            const pythonScript = path.resolve(__dirname, 'pyhocon_manifest_parser.py');

                            const pythonProcess = spawn(PYTHON_EXECUTABLE, [pythonScript, REGISTRY_ROOT]);

                            let stdoutData = '';
                            let stderrData = '';

                            pythonProcess.stdout.on('data', (data) => {
                                stdoutData += data.toString();
                            });

                            pythonProcess.stderr.on('data', (data) => {
                                stderrData += data.toString();
                            });

                            pythonProcess.on('close', (code) => {
                                if (code !== 0) {
                                    console.error(`Manifest parser failed: ${stderrData}`);
                                    res.statusCode = 500;
                                    res.end(JSON.stringify({ error: 'Parser failed', details: stderrData }));
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(stdoutData);
                                }
                            });

                        } catch (err) {
                            console.error('Error listing networks:', err);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: err.message }));
                        }
                        return;
                    }

                    if (url.pathname === '/network-content' && req.method === 'GET') {
                        const networkPath = url.searchParams.get('path');
                        if (!networkPath) {
                            res.statusCode = 400;
                            res.end('Missing path parameter');
                            return;
                        }

                        try {
                            const safePath = networkPath.replace(/\.\./g, '');
                            const fullPath = path.join(REGISTRY_ROOT, `${safePath}.hocon`);

                            if (!fs.existsSync(fullPath)) {
                                res.statusCode = 404;
                                res.end('File not found');
                                return;
                            }

                            const { spawn } = await import('child_process');
                            const pythonScript = path.resolve(__dirname, 'pyhocon_parser_service.py');

                            const pythonProcess = spawn(PYTHON_EXECUTABLE, [pythonScript, fullPath, REGISTRY_ROOT]);

                            let stdoutData = '';
                            let stderrData = '';

                            pythonProcess.stdout.on('data', (data) => {
                                stdoutData += data.toString();
                            });

                            pythonProcess.stderr.on('data', (data) => {
                                stderrData += data.toString();
                            });

                            pythonProcess.on('close', (code) => {
                                if (code !== 0) {
                                    console.error(`Python parser failed: ${stderrData}`);
                                    res.statusCode = 500;
                                    res.end(JSON.stringify({ error: 'Parser failed', details: stderrData }));
                                } else {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(stdoutData);
                                }
                            });

                        } catch (err) {
                            console.error('Error executing parser:', err);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: err.message }));
                        }
                        return;
                    }

                    if (url.pathname === '/update-agent-prompt' && req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => { body += chunk.toString(); });
                        req.on('end', async () => {
                            try {
                                const { networkPath, agentName, newPrompt } = JSON.parse(body);

                                if (!networkPath || !agentName || newPrompt === undefined) {
                                    res.statusCode = 400;
                                    res.end(JSON.stringify({ error: 'Missing required fields' }));
                                    return;
                                }

                                const safePath = networkPath.replace(/\.\./g, '');
                                const fullPath = path.join(REGISTRY_ROOT, `${safePath}.hocon`);

                                if (!fs.existsSync(fullPath)) {
                                    res.statusCode = 404;
                                    res.end(JSON.stringify({ error: 'Network file not found' }));
                                    return;
                                }

                                const { spawn } = await import('child_process');
                                const pythonScript = path.resolve(__dirname, 'pyhocon_updater_service.py');

                                const pythonProcess = spawn(PYTHON_EXECUTABLE, [pythonScript, fullPath, agentName, newPrompt]);

                                let stderrData = '';
                                pythonProcess.stderr.on('data', d => stderrData += d.toString());

                                pythonProcess.on('close', (code) => {
                                    if (code === 0) {
                                        res.setHeader('Content-Type', 'application/json');
                                        res.end(JSON.stringify({ success: true }));
                                    } else {
                                        console.error('Updater failed:', stderrData);
                                        res.statusCode = 500;
                                        res.end(JSON.stringify({ error: 'Update failed', details: stderrData }));
                                    }
                                });

                            } catch (e) {
                                res.statusCode = 500;
                                res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                            }
                        });
                        return;
                    }

                    // [NEW] Endpoint to list all network files across registries
                    if (url.pathname === '/all-networks' && req.method === 'GET') {
                        const getAllHoconFiles = (dir, prefix = '') => {
                            let results = [];
                            if (fs.existsSync(dir)) {
                                const list = fs.readdirSync(dir);
                                list.forEach(file => {
                                    if (file.startsWith('.')) return; // Skip hidden
                                    const fullPath = path.join(dir, file);
                                    const stat = fs.statSync(fullPath);
                                    if (stat && stat.isDirectory()) {
                                        results = results.concat(getAllHoconFiles(fullPath, `${prefix}${file}/`));
                                    } else if (file.endsWith('.hocon')) {
                                        results.push(`${prefix}${file.replace('.hocon', '')}`);
                                    }
                                });
                            }
                            return results;
                        };
                        try {
                            const networks = getAllHoconFiles(REGISTRY_ROOT);
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ networks }));
                        } catch (e) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: e.message }));
                        }
                        return;
                    }

                    // [NEW] Endpoint to list Native Coded Tools from toolbox_info.hocon
                    if (url.pathname === '/tools' && req.method === 'GET') {
                        try {
                            const { spawn } = await import('child_process');
                            const pythonScript = path.resolve(__dirname, 'pyhocon_toolbox_parser.py');
                            const toolboxPath = path.resolve(__dirname, '../neuro-san-studio/toolbox/toolbox_info.hocon');

                            const pythonProcess = spawn(PYTHON_EXECUTABLE, [pythonScript, toolboxPath]);

                            let dataString = '';
                            let errorString = '';

                            pythonProcess.stdout.on('data', (data) => {
                                dataString += data.toString();
                            });

                            pythonProcess.stderr.on('data', (data) => {
                                errorString += data.toString();
                            });

                            pythonProcess.on('close', (code) => {
                                if (code === 0) {
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(dataString);
                                } else {
                                    console.error('Tools Parser failed:', errorString);
                                    res.statusCode = 500;
                                    res.end(JSON.stringify({ error: 'Failed to parse tools', details: errorString }));
                                }
                            });

                        } catch (err) {
                            console.error('Error executing tools parser:', err);
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: err.message }));
                        }
                        return;
                    }

                    // [NEW] Copilot Generation Endpoint
                    if (url.pathname === '/copilot-generate' && req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => { body += chunk.toString(); });
                        req.on('end', async () => {
                            try {
                                const { networkPath, prompt } = JSON.parse(body);
                                if (!networkPath || !prompt) {
                                    res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing networkPath or prompt' })); return;
                                }
                                const safePath = networkPath.replace(/\.\./g, '');
                                const fullPath = path.join(REGISTRY_ROOT, `${safePath}.hocon`);

                                if (!fs.existsSync(fullPath)) {
                                    res.statusCode = 404; res.end(JSON.stringify({ error: 'HOCON file not found' })); return;
                                }

                                const { spawn } = await import('child_process');
                                const pythonScript = path.resolve(__dirname, 'pyhocon_copilot_service.py');
                                const pythonProcess = spawn(PYTHON_EXECUTABLE, [pythonScript, fullPath, prompt]);

                                let stdoutData = '';
                                let stderrData = '';
                                pythonProcess.stdout.on('data', d => stdoutData += d.toString());
                                pythonProcess.stderr.on('data', d => stderrData += d.toString());

                                pythonProcess.on('close', code => {
                                    if (code === 0) {
                                        res.setHeader('Content-Type', 'application/json');
                                        res.end(stdoutData);
                                    } else {
                                        console.error('Copilot service failed:', stderrData);
                                        res.statusCode = 500;
                                        res.end(JSON.stringify({ error: 'Copilot inference failed', details: stderrData }));
                                    }
                                });
                            } catch (e) {
                                res.statusCode = 500; res.end(JSON.stringify({ error: 'Invalid JSON body' }));
                            }
                        });
                        return;
                    }

                    // [NEW] Copilot Save Endpoint
                    if (url.pathname === '/copilot-save' && req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => { body += chunk.toString(); });
                        req.on('end', async () => {
                            try {
                                const { networkPath, hocon } = JSON.parse(body);
                                if (!networkPath || !hocon) {
                                    res.statusCode = 400; res.end(JSON.stringify({ error: 'Missing fields' })); return;
                                }
                                const safePath = networkPath.replace(/\.\./g, '');
                                const fullPath = path.join(REGISTRY_ROOT, `${safePath}.hocon`);
                                fs.writeFileSync(fullPath, hocon, 'utf-8');
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ success: true }));
                            } catch (e) {
                                res.statusCode = 500; res.end(JSON.stringify({ error: 'Failed to write HOCON', message: e.message }));
                            }
                        });
                        return;
                    }

                    next();
                });
            }
        }
    ],
})
