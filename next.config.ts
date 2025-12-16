import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the little Next.js "N" dev logo if you want
  devIndicators: false,

  // Allow dev access from your LAN IP
  allowedDevOrigins: ["192.168.1.190:3000"],
};

export default nextConfig;
