import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { heyApiPlugin } from '@hey-api/vite-plugin'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), viteReact(), heyApiPlugin({
    config: {
      input: './openapi.yml', // sign up at app.heyapi.dev
      output: 'src/generated/api',
      plugins: [
        '@tanstack/react-query',
        '@hey-api/client-fetch'
      ]
    },
  }),],
  server: {
    watch: null, // disable hot module reloading
  }
})

export default config
