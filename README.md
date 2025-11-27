# VidGraph AI

这是一个基于 Gemini AI 和 Telegram 的智能视频托管工具。
它可以自动分析视频内容，生成标题、简介和标签，并将其上传到 Telegram 频道，生成永久分享链接。

## Cloudflare Pages 部署指南

### 1. 准备工作
- Fork 或上传此代码到你的 GitHub 仓库。
- 申请一个 [Google Gemini API Key](https://aistudio.google.com/app/apikey)。

### 2. 在 Cloudflare Pages 中部署
1. 登录 Cloudflare Dashboard，进入 **Workers & Pages**。
2. 点击 **Create application** -> **Pages** -> **Connect to Git**。
3. 选择你的仓库。
4. **Build settings (构建设置)**:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
5. **Environment variables (环境变量)**:
   - 添加变量名: `API_KEY`
   - 值: `你的_Google_Gemini_API_Key`
6. 点击 **Save and Deploy**。

### 3. 如何上传大于 50MB (如 500MB) 的视频？
Telegram 官方公网 API (`api.telegram.org`) 限制文件大小为 50MB。要突破此限制（最大 2GB），你需要搭建 **Telegram Bot API Local Server**。

1. **搭建本地服务器 (VPS)**:
   使用 Docker 快速搭建：
   ```bash
   docker run -d -p 8081:8081 \
     -e TELEGRAM_API_ID=你的AppID \
     -e TELEGRAM_API_HASH=你的AppHash \
     -e TELEGRAM_LOCAL=true \
     aiogram/telegram-bot-api:latest
   ```
2. **配置 CORS (关键)**:
   因为网页跑在 Cloudflare 上，API 跑在你的 VPS 上，必须配置 Nginx 反代允许跨域，否则浏览器无法上传。
   
   Nginx 配置示例：
   ```nginx
   server {
       listen 80;
       server_name your-api.domain.com;

       location / {
           proxy_pass http://localhost:8081;
           
           # 允许跨域上传
           add_header 'Access-Control-Allow-Origin' '*' always;
           add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
           add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
           
           if ($request_method = 'OPTIONS') {
               add_header 'Access-Control-Max-Age' 1728000;
               add_header 'Content-Type' 'text/plain; charset=utf-8';
               add_header 'Content-Length' 0;
               return 204;
           }
       }
   }
   ```
3. **在网页中配置**:
   打开 VidGraph AI 网页右上角的设置，将 **API 服务器地址** 改为 `http://your-api.domain.com` (或者 HTTPS)。

## 隐私说明
- **API Key**: Gemini API Key 仅在构建时注入或通过环境变量运行，建议使用 Cloudflare 环境变量保护。
- **Telegram Token**: 你的 Bot Token 仅存储在浏览器本地 (Local Storage)，直接与 Telegram API 通信，不经过第三方服务器。
