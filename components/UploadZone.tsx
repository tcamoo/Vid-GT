import React, { useCallback, useState } from 'react';
import { UploadCloud, FileVideo, AlertCircle, Loader2, Info } from 'lucide-react';
import { UploadState } from '../types';

interface UploadZoneProps {
  onUploadStart: (file: File) => void;
  uploadState: UploadState;
}

// Increased limit to 2000MB (Telegram Local Server limit)
// Note: Browsers might struggle with 2GB files depending on RAM.
const MAX_SIZE_MB = 2000;
const OFFICIAL_API_LIMIT_MB = 50;

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadStart, uploadState }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndUpload = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      alert("请上传有效的视频文件。");
      return;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > MAX_SIZE_MB) {
      alert(`文件过大。当前限制为 ${MAX_SIZE_MB}MB。`);
      return;
    }
    
    // Warning for official API users
    const isLocalServer = localStorage.getItem('vidgraph_tg_config')?.includes('http');
    if (fileSizeMB > OFFICIAL_API_LIMIT_MB && !isLocalServer) {
        const proceed = window.confirm(`警告：该文件 (${Math.round(fileSizeMB)}MB) 超过了 Telegram 官方 API 的 50MB 限制。\n\n如果您没有配置本地 Bot 服务器，上传将会失败。\n\n是否继续？`);
        if (!proceed) return;
    }

    onUploadStart(file);
  }, [onUploadStart]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  }, [validateAndUpload]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  }, [validateAndUpload]);

  if (['compressing', 'analyzing', 'uploading'].includes(uploadState.status)) {
    return (
      <div className="w-full h-64 rounded-2xl border-2 border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-500/5 animate-pulse-slow"></div>
        <Loader2 className="w-12 h-12 text-brand-400 animate-spin mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">
            {uploadState.status === 'compressing' && '正在处理视频...'}
            {uploadState.status === 'analyzing' && 'Gemini 正在思考...'}
            {uploadState.status === 'uploading' && '正在上传至 Telegram...'}
        </h3>
        
        {/* Progress Bar for Uploading */}
        {uploadState.status === 'uploading' && (
             <div className="w-64 h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                <div 
                    className="h-full bg-brand-500 transition-all duration-300 ease-out"
                    style={{ width: `${uploadState.progress}%` }}
                />
             </div>
        )}

        <p className="text-slate-400 text-sm text-center max-w-xs mt-2">
          {uploadState.status === 'compressing' && '正在为 AI 模型准备视频数据。'}
          {uploadState.status === 'analyzing' && '正在生成标题、简介和标签。'}
          {uploadState.status === 'uploading' && `正在发送文件到 Telegram (${Math.round(uploadState.progress)}%)`}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out flex flex-col items-center justify-center p-6 cursor-pointer group
        ${dragActive 
          ? 'border-brand-400 bg-brand-400/10 scale-[1.01]' 
          : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 bg-slate-900/30'
        }
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('video-upload')?.click()}
    >
      <input
        type="file"
        id="video-upload"
        className="hidden"
        accept="video/*"
        onChange={handleChange}
      />
      
      <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:bg-brand-500/20 group-hover:text-brand-400 transition-colors">
        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-brand-400" />
      </div>

      <h3 className="text-lg font-medium text-slate-200 mb-1">
        点击或拖拽视频以上传
      </h3>
      <div className="text-slate-500 text-sm mb-4 flex flex-col items-center gap-1">
        <span>支持 MP4, WebM, Ogg</span>
        <span className="flex items-center gap-1 text-xs bg-slate-800/50 px-2 py-0.5 rounded">
            <Info className="w-3 h-3" />
            官方API限 50MB / 本地API限 2GB
        </span>
      </div>

      {uploadState.error && (
        <div className="absolute bottom-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20 max-w-[90%] text-center">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadState.error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadZone;