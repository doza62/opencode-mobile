/**
 * Port detection utilities
 */

import * as net from "net";

/**
 * Find the next available port starting from a given port
 * @param startPort - Port to start searching from
 * @param maxAttempts - Maximum number of ports to try
 * @returns The first available port
 * @throws Error if no port is found after maxAttempts
 */
export function getNextAvailablePort(
  startPort: number,
  maxAttempts: number = 50,
): Promise<number> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const tryPort = (port: number) => {
      if (attempts >= maxAttempts) {
        reject(
          new Error(
            `Could not find available port after ${maxAttempts} attempts`,
          ),
        );
        return;
      }
      attempts++;

      const server = net.createServer();

      server.on("error", (e: any) => {
        if (e.message?.includes("EADDRINUSE")) {
          console.log(`[PushPlugin] Port ${port} in use, trying next...`);
          tryPort(port + 1);
        } else {
          // Don't retry on other errors - could mask serious issues
          reject(new Error(`Port ${port} error: ${e.message}`));
        }
      });

      server.listen(port, "127.0.0.1", () => {
        server.close(() => {
          resolve(port);
        });
      });
    };

    tryPort(startPort);
  });
}
