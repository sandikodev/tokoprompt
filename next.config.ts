import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow all major tunnel providers as dev origins
  // This lets you use ngrok / Cloudflare tunnel / localtunnel without editing .env each time
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.app",
    "*.trycloudflare.com",
    "*.loca.lt",
    "*.cfargotunnel.com",
  ],
};

export default nextConfig;
