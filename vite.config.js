import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Providing-work/', // <--- ต้องมีบรรทัดนี้ ไม่งั้น CSS/รูป จะหาย
})