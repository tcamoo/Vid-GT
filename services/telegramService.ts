import { TelegramConfig } from "../types";

export const uploadToTelegram = async (
  file: File,
  caption: string,
  config: TelegramConfig,
  onProgress?: (progress: number) => void
): Promise<{ link: string; fileId: string }> => {
  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');
  
  // 1. Determine type key for endpoint selection
  let typeKey = 'video';
  if (isImage) typeKey = 'photo';
  else if (isAudio) typeKey = 'audio';

  // 2. CHECK MODE: Direct (Frontend) vs Server (Backend)
  // If botToken is missing, we assume Server Mode (Proxy)
  if (!config.botToken || !config.chatId) {
    return uploadViaBackendProxy(file, caption, typeKey, onProgress);
  }

  // --- DIRECT MODE LOGIC (XHR) ---
  
  let endpoint = 'sendVideo';
  let fileKey = 'video';
  if (isImage) { endpoint = 'sendPhoto'; fileKey = 'photo'; }
  else if (isAudio) { endpoint = 'sendAudio'; fileKey = 'audio'; }

  const formData = new FormData();
  formData.append("chat_id", config.chatId);
  formData.append(fileKey, file);
  formData.append("caption", caption);
  formData.append("parse_mode", "Markdown");

  const apiRoot = config.apiRoot ? config.apiRoot.replace(/\/$/, '') : "https://api.telegram.org";
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${apiRoot}/bot${config.botToken}/${endpoint}`;

    xhr.open("POST", url, true);
    xhr.timeout = 0; 

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress((event.loaded / event.total) * 100);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.ok) {
             const result = parseTelegramResponse(response);
             resolve(result);
          } else {
            reject(new Error(response.description || "Telegram Upload Failed"));
          }
        } catch (e) {
          reject(new Error("Invalid JSON from Telegram"));
        }
      } else {
        if (xhr.status === 413) {
            reject(new Error("文件过大 (直连模式下官方API限制 50MB)。请使用本地服务器支持高达 2GB。"));
        } else {
            reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network Error (CORS or Connectivity)"));
    xhr.send(formData);
  });
};

// --- SERVER MODE HELPER ---
async function uploadViaBackendProxy(
    file: File, 
    caption: string, 
    typeKey: string, 
    onProgress?: (progress: number) => void
): Promise<{ link: string; fileId: string }> {
    
    // Cloudflare Workers limit request body (FormData) severely in free tier
    // Use a safe limit to prevent crashes
    const SAFE_LIMIT_MB = 25; 
    if (file.size > SAFE_LIMIT_MB * 1024 * 1024) {
        throw new Error(`服务器模式文件限制 ${SAFE_LIMIT_MB}MB (Cloudflare 内存限制)。\n请在设置中填入 Token 使用直连模式上传大文件。`);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('type', typeKey); // 'video', 'audio', 'photo'

    if (onProgress) onProgress(10); // Fake start

    let res;
    try {
        res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
    } catch (e) {
        throw new Error("网络错误: 无法连接到 Cloudflare 后端。");
    }

    if (onProgress) onProgress(80); // Processing

    // Check for Worker Crash (often returns 502/500 with HTML or empty body)
    if (!res.ok) {
        let errText = "";
        try { 
            errText = await res.text(); 
        } catch(e) {}

        // Try to parse JSON error first
        try {
            const jsonErr = JSON.parse(errText);
            throw new Error(jsonErr.description || "后端配置错误 (请检查 TG_BOT_TOKEN)");
        } catch (e) {
            // If not JSON, it's likely a crash
            console.error("Server Crash Response:", errText);
            throw new Error("Cloudflare 后端崩溃。可能是文件过大导致内存溢出，请切换到直连模式。");
        }
    }

    const response = await res.json();
    if (onProgress) onProgress(100);

    if (response.ok) {
        return parseTelegramResponse(response);
    } else {
        throw new Error(response.description || "Server Upload Failed");
    }
}

// --- SHARED PARSER ---
function parseTelegramResponse(response: any): { link: string; fileId: string } {
     const messageId = response.result.message_id;
     const chat = response.result.chat;
     let link = "";

     let fileId = "";
     if (response.result.video) fileId = response.result.video.file_id;
     else if (response.result.audio) fileId = response.result.audio.file_id;
     else if (response.result.document) fileId = response.result.document.file_id;
     else if (response.result.photo && Array.isArray(response.result.photo)) {
        const photos = response.result.photo;
        fileId = photos[photos.length - 1].file_id;
     }

     if (chat.username) {
       link = `https://t.me/${chat.username}/${messageId}`;
     } else {
       const cleanId = chat.id.toString().replace(/^-100/, '');
       link = `https://t.me/c/${cleanId}/${messageId}`;
     }
     return { link, fileId };
}
