import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // Proxy neuro-san API requests to port 8080 (Tornado HTTP server)
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      // Proxy nsflow WebSocket requests to port 4173 (FastAPI/uvicorn)
      '/nsflow': {
        target: 'http://localhost:4173',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/nsflow/, '/api/v1/ws')
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
              // Use Python manifest parser to get only served networks
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
              // Securely resolve the path
              const safePath = networkPath.replace(/\.\./g, ''); // Basic traversal protection
              const fullPath = path.join(REGISTRY_ROOT, `${safePath}.hocon`);

              if (!fs.existsSync(fullPath)) {
                res.statusCode = 404;
                res.end('File not found');
                return;
              }

              // Spawn python process to parse HOCON
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

          // Handle POST for updates
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

                // Resolve path
                const safePath = networkPath.replace(/\.\./g, '');
                const fullPath = path.join(REGISTRY_ROOT, `${safePath}.hocon`);

                if (!fs.existsSync(fullPath)) {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Network file not found' }));
                  return;
                }

                const { spawn } = await import('child_process');
                const pythonScript = path.resolve(__dirname, 'pyhocon_updater_service.py');

                // Pass prompt as an argument. 
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

          next();
        });
      }
    }
  ],
})
// Server restart trigger: 1769455956
