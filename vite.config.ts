import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  // process.cwd() 需要 @types/node 支持，已在 package.json 中添加
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // 防止第三方库访问 process.env 时报错 "process is not defined"
      'process.env': {},
      // 允许在客户端代码中使用 process.env.API_KEY
      // 优先使用 Cloudflare 构建环境中的变量，其次是 .env 文件
      'process.env.API_KEY': JSON.stringify(process.env.API_KEY || env.API_KEY),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
    }
  };
});
