import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // สำคัญมาก! ต้องใส่ชื่อ Repo ของพี่ตรงนี้ เพื่อไม่ให้จอขาวบน GitHub Pages
  base: '/Providing-work/', 
})