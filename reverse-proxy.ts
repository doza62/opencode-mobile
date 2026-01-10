import http from 'http';
import { request as httpRequest } from 'http';

const PROXY_PORT = 4098;
const TOKEN_API_PORT = 4097;
const SERVER_PORT = 4096;

let serverStarted = false;

export function startProxy(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (serverStarted) {
      console.log("[Proxy] Proxy already running");
      resolve();
      return;
    }

    const server = http.createServer((clientReq, clientRes) => {
      const url = clientReq.url || '';

      const targetPort = url.startsWith('/push-token')
        ? TOKEN_API_PORT
        : SERVER_PORT;

      const options = {
        hostname: '127.0.0.1',
        port: targetPort,
        path: url,
        method: clientReq.method,
        headers: {
          ...clientReq.headers,
          'x-forwarded-for': clientReq.socket.remoteAddress,
          'x-forwarded-host': clientReq.headers.host,
        },
      };

      const proxyReq = httpRequest(options, (proxyRes) => {
        clientRes.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
        proxyRes.pipe(clientRes);
      });

      proxyReq.on('error', (err) => {
        console.error('[Proxy] Error forwarding request:', err.message);
        if (!clientRes.headersSent) {
          clientRes.writeHead(502, { 'Content-Type': 'text/plain' });
          clientRes.end('Bad Gateway');
        }
      });

      clientReq.pipe(proxyReq);
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.log('[Proxy] Port already in use - proxy likely already running');
        serverStarted = true;
        resolve();
      } else {
        console.error('[Proxy] Failed to start:', err.message);
        reject(err);
      }
    });

    server.listen(PROXY_PORT, () => {
      serverStarted = true;
      console.log(`[Proxy] Running on port ${PROXY_PORT}`);
      console.log(`[Proxy] /push-token/* → Port ${TOKEN_API_PORT}`);
      console.log(`[Proxy] /* → Port ${SERVER_PORT}`);
      resolve();
    });
  });
}

export function getProxyPort(): number {
  return PROXY_PORT;
}
