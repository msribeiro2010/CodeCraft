import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import path from "path";
import { fileURLToPath } from "url";

// Converte import.meta.url → caminho de arquivo e obtain __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async () => {
  // Plugins básicos sempre carregados
  const plugins = [react(), runtimeErrorOverlay()];

  // Carrega o Cartographer apenas quando estiver no Replit em modo dev
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID) {
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    plugins.push(cartographer());
  }

  return {
    plugins,
    // Diretório‑raiz do front‑end
    root: path.resolve(__dirname, "client"),

    // Atalhos de importação
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "client", "src", "assets"),
      },
    },

    // Saída de build
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});
