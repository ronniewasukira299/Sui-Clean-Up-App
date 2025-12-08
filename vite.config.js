import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'sui-sdk': ['@mysten/sui/client', '@mysten/sui/transactions'],
          'dapp-kit': ['@mysten/dapp-kit'],
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@mysten/sui/client',
      '@mysten/sui/transactions', 
      '@mysten/sui/utils',
      '@mysten/dapp-kit',
      '@tanstack/react-query',
      'axios'
    ],
    esbuildOptions: {
      target: 'esnext',
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});