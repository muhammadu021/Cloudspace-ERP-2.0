import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const isDemoMode = process.env.VITE_DEMO_MODE === 'true';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["react", "react-dom"],
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
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: (id) => {
          // Core vendor chunk - React ecosystem
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/scheduler')) {
            return 'vendor-react';
          }
          
          // Redux and state management
          if (id.includes('node_modules/@reduxjs') || 
              id.includes('node_modules/redux') ||
              id.includes('node_modules/react-redux')) {
            return 'vendor-redux';
          }
          
          // UI libraries
          if (id.includes('node_modules/lucide-react') || 
              id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/@radix-ui')) {
            return 'vendor-ui';
          }
          
          // Charts and visualization
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/react-select') ||
              id.includes('node_modules/react-datepicker')) {
            return 'vendor-forms';
          }
          
          // Utilities
          if (id.includes('node_modules/axios') || 
              id.includes('node_modules/date-fns') ||
              id.includes('node_modules/clsx')) {
            return 'vendor-utils';
          }
          
          // PDF and document libraries
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/pdf-lib') ||
              id.includes('node_modules/xlsx')) {
            return 'vendor-documents';
          }
          
          // Design system components
          if (id.includes('/src/design-system/')) {
            return 'design-system';
          }
          
          // Space modules - split by space for better caching
          if (id.includes('/src/modules/projects/')) {
            return 'space-projects';
          }
          if (id.includes('/src/modules/hr/')) {
            return 'space-hr';
          }
          if (id.includes('/src/modules/finance/')) {
            return 'space-finance';
          }
          if (id.includes('/src/modules/sales/')) {
            return 'space-sales';
          }
          if (id.includes('/src/modules/inventory/')) {
            return 'space-inventory';
          }
          if (id.includes('/src/modules/admin/')) {
            return 'space-admin';
          }
          if (id.includes('/src/modules/support/')) {
            return 'space-support';
          }
          if (id.includes('/src/modules/myspace/')) {
            return 'space-myspace';
          }
        },
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
