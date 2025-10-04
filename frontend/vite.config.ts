import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() , tailwindcss()],
  // server: {
  //   host: '10.160.112.39', // listen on all addresses
  //   port: 5173,      // optional, default is 5173
  // },
})
