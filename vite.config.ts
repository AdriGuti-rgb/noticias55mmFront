import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        // target: "http://localhost:4002",
        target: "https://noticias55mmback-production.up.railway.app",
        changeOrigin: true,
      },
      "/uploads": {
        // target: "http://localhost:4002",
        target: "https://noticias55mmback-production.up.railway.app",
        changeOrigin: true,
      },
    },
  },
});
