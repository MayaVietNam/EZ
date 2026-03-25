import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/EZ/', // Cấu hình đường dẫn gốc dành cho thư mục trên GitHub Pages
  plugins: [
    react(), // Chỉ giữ lại plugin của React
  ]
});
