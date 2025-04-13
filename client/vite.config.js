import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    base: '/', // ensure paths resolve correctly
    root: '.', // project root is the client folder
    publicDir: 'public',
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://192.168.0.12:5000',
                changeOrigin: true,
                secure: false
            }
        },
        historyApiFallback: true
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: 'index.html'
        }
    },
    resolve: {
        alias: {
            '@': '/src'
        },
        extensions: ['.js', '.jsx'] // Added support for .jsx extensions
    }
});