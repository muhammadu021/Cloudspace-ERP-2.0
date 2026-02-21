import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const isDemoMode = process.env.VITE_DEMO_MODE === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react", "react-dom", "react-redux", "@reduxjs/toolkit"],
    force: true, // Force re-optimization
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@modules": path.resolve(__dirname, "./src/modules"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@design-system": path.resolve(__dirname, "./src/design-system"),
    },
  },
  server: {
    port: 3005,
    proxy: isDemoMode ? {} : {
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    // Target modern browsers for smaller bundles
    target: 'es2015',
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Ensure proper module preloading
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      output: {
        // Let Vite handle chunking automatically to avoid dependency issues
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Enable minification with esbuild (faster than terser)
    minify: 'esbuild',
  },
});
