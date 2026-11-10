import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs, so the build can be served from any sub-path (e.g. /react-proxy-app/).
  base: './',
  // Keep the variable names from the Create React App setup, so existing .env files keep working.
  envPrefix: 'REACT_APP_',
  server: { port: 3000 },
  build: {
    outDir: 'build',
    // The seat map lib alone is ~520 kB and is needed on load, so splitting it off gains nothing.
    chunkSizeWarningLimit: 750,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    clearMocks: true,
    restoreMocks: true,
    unstubEnvs: true,
  },
});
