export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  suggestedFilename: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  apiRoot?: string; // Optional custom API root for local bot servers
}

export interface UploadState {
  file: File | null;
  previewUrl: string | null;
  base64Data: string | null;
  status: 'idle' | 'compressing' | 'analyzing' | 'uploading' | 'complete' | 'error';
  progress: number;
  error?: string;
  metadata?: VideoMetadata;
  telegramLink?: string;
}