#!/usr/bin/env bun
import { startTunnel } from "./tunnel-manager";

async function test() {
  console.log("Testing tunnel startup...\n");
  
  try {
    console.log("Attempting to start ngrok tunnel...");
    const tunnel = await startTunnel({ 
      port: 3000, 
      provider: "ngrok" 
    });
    
    console.log("\n=== Tunnel Result ===");
    console.log(`URL: ${tunnel.url}`);
    console.log(`ID: ${tunnel.tunnelId}`);
    console.log(`Provider: ${tunnel.provider}`);
    
  } catch (error: any) {
    console.error("\n=== Tunnel Failed ===");
    console.error(`Error: ${error.message}`);
    
    // Try localtunnel fallback
    console.log("\nTrying localtunnel fallback...");
    try {
      const tunnel = await startTunnel({ 
        port: 3000, 
        provider: "localtunnel" 
      });
      console.log(`Localtunnel URL: ${tunnel.url}`);
    } catch (ltError: any) {
      console.error(`Localtunnel also failed: ${ltError.message}`);
    }
  }
}

test().catch(console.error);
