import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  // @ts-ignore
  plugins: [react(), renderer()],
  build: {
    target: 'chrome124', // electron version target
  },
  server: {
    port: 9080,
  },
})
