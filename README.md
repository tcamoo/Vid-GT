# LinkNexus 

![LinkNexus Banner](https://img.shields.io/badge/Status-Operational-00f3ff?style=for-the-badge&logo=cloudflare) ![Style](https://img.shields.io/badge/Style-Cyberpunk-bc13fe?style=for-the-badge)

LinkNexus 是一个基于 **Cloudflare Pages** 的赛博朋克风格文件托管工具。它利用 Telegram 作为无限容量的存储后端，提供**视频、音频、图片**的上传、历史记录管理以及**直链流式播放**功能。

---

## ✨ 核心特性

1.  **多模式上传**:
    *   ☁️ **服务器模式 (Server Mode)**: 无需前端配置，通过 Cloudflare 后端代理上传 (最安全，限 100MB)。
    *   ⚡ **直连模式 (Direct Mode)**: 浏览器直接上传到 Telegram (支持大文件)。
2.  **多格式支持**: 自动识别 MP4/WebM (视频), MP3/FLAC/WAV (音频), JPG/PNG/WEBP (图片)。
3.  **直链代理 (Direct Link)**: 生成 `https://your-domain/api/file?id=xxx` 链接，支持在网页中直接播放/引用，支持拖拽进度条。
4.  **历史记录**: 集成 Cloudflare KV，自动保存上传记录，并在侧边栏展示。
5.  **大文件支持**: 配合本地 Bot Server，支持最大 **2GB** 文件上传与直链播放。
6.  **视觉体验**: 极致的赛博朋克 UI，全息玻璃质感与霓虹动效。

---

## 🚀 部署指南 (Cloudflare Pages)

### 1. 创建项目
1.  登录 Cloudflare Dashboard。
2.  进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3.  选择本项目仓库。

### 2. 构建设置 (Build Settings)
*   **Framework preset**: `Vite` (或者 None)
*   **Build command**: `npm run build`
*   **Build output directory**: `dist`
*   **Path to root**: `(留空)` **不要填任何东西**

### 3. 环境变量 (Environment Variables) - 关键！
进入项目 **Settings** -> **Environment variables**，添加以下变量：

| 变量名 | 必填 | 说明 |
| :--- | :--- | :--- |
| `TG_BOT_TOKEN` | ✅ | 你的 Telegram Bot Token (找 @BotFather 获取)。用于后端上传代理和直链解析。 |
| `TG_CHAT_ID` | ✅ | 你的频道或群组 ID (如 `@mychannel` 或 `-100xxxx`)。用于后端上传代理。 |
| `TG_API_ROOT` | ❌ | (可选) 自建 Bot API Server 地址，如 `http://1.2.3.4:8081`。用于突破 20MB 直链限制。 |

### 4. 配置 KV (历史记录)
1.  在 Cloudflare 左侧菜单点击 **Workers & Pages** -> **KV**。
2.  点击 **Create a Namespace**，命名为 `VIDGRAPH_HISTORY`，点击 Add。
3.  回到你的 Pages 项目 -> **Settings** -> **Functions**。
4.  找到 **KV Namespace Bindings**，点击 **Add binding**。
    *   **Variable name**: `HISTORY_KV` (必须完全一致)
    *   **KV Namespace**: 选择刚才创建的 `VIDGRAPH_HISTORY`
5.  **保存设置**。

### 5. 完成部署
所有配置完成后，进入 **Deployments** 选项卡，点击 **Retry deployment** (重试部署) 以让环境变量生效。

---

## 📖 使用说明

### 模式一：普通用户 (Server Mode)
*   **适用场景**: 文件小于 100MB，懒得配置前端。
*   **操作**: 直接打开网页，拖拽文件上传。系统会自动使用后台配置的 Token 进行上传。

### 模式二：高级用户 (Direct Mode)
*   **适用场景**: 文件大于 100MB。
*   **操作**: 点击网页右上角 **设置 (Settings)**，填入你的 Bot Token 和 Chat ID。此时浏览器会直接向 Telegram 发起请求，绕过 Cloudflare 的体积限制。

### 关于直链 (Direct Link) 的限制
*   **默认情况**: 直链播放/下载仅支持 **20MB** 以下的文件 (Telegram 官方 API 限制)。
*   **如何突破**: 你需要有一台 VPS，搭建 [Telegram Bot API Local Server](https://github.com/tdlib/telegram-bot-api)。
    1.  搭建成功后，将地址 (如 `http://vps-ip:8081`) 填入 Cloudflare 环境变量 `TG_API_ROOT`。
    2.  重新部署后，直链即可支持最大 **2GB** 的文件流式传输。

---

## 🛠️ 常见报错

1.  **Server Config Error: TG_BOT_TOKEN missing...**
    *   原因：Cloudflare 后台环境变量没设置。
    *   解决：去后台 Settings -> Environment variables 添加 Token，并重试部署。

2.  **File is too big (limit 20MB)**
    *   原因：尝试使用直链播放一个 >20MB 的文件，且没有配置本地 API Server。
    *   解决：这是 Telegram 限制。请配置 `TG_API_ROOT` 或直接使用 Telegram 原生链接跳转观看。

3.  **413 Request Entity Too Large (Server Mode)**
    *   原因：通过后端代理上传了超过 100MB 的文件。
    *   解决：在网页设置里填入 Token，切换到直连模式。

4.  **上传后黑屏 / 历史记录不显示**
    *   原因：KV 未绑定。
    *   解决：检查 KV Namespace Binding 是否名为 `HISTORY_KV`。

---

## ⚖️ 免责声明
本项目仅供学习与技术研究。请勿用于存储违反 Telegram 服务条款的内容。开发者不对用户上传的内容负责。
