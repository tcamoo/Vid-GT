import { TelegramConfig } from "../types";

export const uploadToTelegram = async (
  file: File,
  caption: string,
  config: TelegramConfig,
  onProgress?: (progress: number) => void
): Promise<{ link: string; fileId: string }> => {
  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');
  
  // Determine endpoint and form field name based on type
  let endpoint = 'sendVideo';
  let fileKey = 'video';
  
  if (isImage) {
    endpoint = 'sendPhoto';
    fileKey = 'photo';
  } else if (isAudio) {
    endpoint = 'sendAudio';
    fileKey = 'audio';
  }

  const formData = new FormData();
  formData.append("chat_id", config.chatId);
  formData.append(fileKey, file);
  formData.append("caption", caption);
  formData.append("parse_mode", "Markdown");

  // Use custom API root if provided, otherwise default to official API
  const apiRoot = config.apiRoot ? config.apiRoot.replace(/\/$/, '') : "https://api.telegram.org";
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const url = `${apiRoot}/bot${config.botToken}/${endpoint}`;

    xhr.open("POST", url, true);
    // Disable timeout for large files
    xhr.timeout = 0; 

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.ok) {
             const messageId = response.result.message_id;
             const chat = response.result.chat;
             let link = "";

             // Extract File ID
             let fileId = "";
             if (response.result.video) {
                fileId = response.result.video.file_id;
             } else if (response.result.audio) {
                fileId = response.result.audio.file_id;
             } else if (response.result.document) {
                fileId = response.result.document.file_id;
             } else if (response.result.photo && Array.isArray(response.result.photo)) {
                // Photos are sent as an array of different sizes. The last one is the largest.
                const photos = response.result.photo;
                fileId = photos[photos.length - 1].file_id;
             }

             if (chat.username) {
               // Public channel/group: https://t.me/username/message_id
               link = `https://t.me/${chat.username}/${messageId}`;
             } else {
               // Private chat: https://t.me/c/CHAT_ID_WITHOUT_PREFIX/message_id
               const cleanId = chat.id.toString().replace(/^-100/, '');
               link = `https://t.me/c/${cleanId}/${messageId}`;
             }
             resolve({ link, fileId });
          } else {
            reject(new Error(response.description || "Telegram 上传失败"));
          }
        } catch (e) {
          reject(new Error("Telegram 返回了无效的响应"));
        }
      } else {
        if (xhr.status === 413) {
            reject(new Error("文件太大。官方 API 限制 50MB。请搭建本地 Bot Server 以支持最大 2GB 文件。"));
        } else {
            reject(new Error(`Telegram HTTP 错误: ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("连接 Telegram 服务器失败，请检查网络、代理设置或 CORS 配置"));
    xhr.send(formData);
  });
};
