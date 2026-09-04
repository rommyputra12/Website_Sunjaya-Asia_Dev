import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
  },
  optimizeDeps: {
    include: ["react-simple-maps", "d3-geo", "framer-motion", "lenis", "three", "react-globe.gl"],
  },
});
