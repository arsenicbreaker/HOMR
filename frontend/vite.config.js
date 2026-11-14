import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
    plugins: [
        react(),
        nodePolyfills({
            // Ini akan menyediakan Buffer, process, dan global untuk browser
            globals: {
                Buffer: true,
                global: true,
                process: true,
            },
        }),
    ],
})