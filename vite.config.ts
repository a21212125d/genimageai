import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // CORRECTED: Setting the base path to the repository name for production builds
  base: mode === "production" ? '/genimageai/' : '/',
  
  server: {
    host: "::",
    port: 8080,
    cors: true,
    headers: {
      'Content-Type': 'application/javascript',
    },
    fs: {
      strict: false,
      allow: ['..'],
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
