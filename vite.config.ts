import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
          firebase: ['firebase/app', "firebase/auth", 'firebase/firestore'],
          recharts: ['recharts'],
          html: ['html2canvas'],
          pdf: ['jspdf', 'jspdf-autotable'], // or whichever PDF lib you use
        },
      },
    },
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version),
  }
}));
