import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Load .env của frontend để lấy VITE_API_URL làm target cho proxy
  const env = loadEnv(mode, process.cwd(), '')
  // Mặc định 8080 cho khớp với backend/.env.example (PORT=8080)
  // ─────────────────────────────────────────────────────────────────────────
  //  🔥 QUAN TRỌNG KHI CHẠY LAN:
  //  Nếu máy khác trong cùng mạng vào FE qua http://<IP-LAN-BẠN>:4444
  //  thì proxy của FE phải trỏ về IP LAN của backend, KHÔNG phải localhost
  //  (vì `localhost` ở đây là chính máy chạy FE — không phải máy khách).
  //  → Tạo file `frontend/.env` với:
  //      VITE_API_URL=http://<IP-LAN-CỦA-BẠN>:8080
  //  Ví dụ: VITE_API_URL=http://192.168.1.20:8080
  // ─────────────────────────────────────────────────────────────────────────
  const apiTarget = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // host: true → Vite lắng nghe trên 0.0.0.0, chấp nhận truy cập từ LAN.
      // Bạn sẽ thấy Vite in ra 2 dòng:
      //   ➜  Local:   http://localhost:4444/
      //   ➜  Network: http://192.168.x.x:4444/   ← URL để máy khác dùng
      host: true,
      port: 4444,
      strictPort: true,
      proxy: {
        // FE axios gọi '/api/*' → proxy về backend
        // Port đọc từ VITE_API_URL nếu có, fallback 8080
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
