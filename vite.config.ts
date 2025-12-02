import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/lanchonete-sh82-sistema/", // Mantém a configuração do GitHub Pages
  server: {
    host: "::",
    port: 8080,
  },
  // Removemos o componentTagger daqui
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));