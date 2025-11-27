import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, Cpu, Music, Video, Zap } from 'lucide-react';
import { UploadState } from '../types';

interface UploadZoneProps {
  onUploadStart: (file: File) => void;
  uploadState: UploadState;
}

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
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (!isVideo && !isAudio) {
      alert("UNSUPPORTED FILE TYPE // 仅支持视频或音频文件");
      return;
    }

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      alert(`CAPACITY EXCEEDED // 文件过大 (Max ${MAX_SIZE_MB}MB)`);
      return;
    }
    
    // Local server check
    let isLocalServer = false;
    try {
        const configStr = localStorage.getItem('vidgraph_tg_config');
        if (configStr) {
            const config = JSON.parse(configStr);
            if (config.apiRoot && !config.apiRoot.includes('telegram.org')) {
                isLocalServer = true;
            }
        }
    } catch (e) {
       console.error(e);
    }

    if (fileSizeMB > OFFICIAL_API_LIMIT_MB && !isLocalServer) {
        const proceed = window.confirm(`WARNING // 文件 (${Math.round(fileSizeMB)}MB) 超过官方 50MB 限制。\n\n需要配置本地 Bot Server。\n\n是否强制继续？`);
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

  // Loading State
  if (uploadState.status === 'uploading') {
    return (
      <div className="w-full h-80 rounded-sm cyber-box flex flex-col items-center justify-center p-8 relative overflow-hidden group">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="absolute top-0 w-full h-1 bg-cyber-cyan shadow-[0_0_15px_#00f3ff]"></div>
        <div className="scanline"></div>

        <Cpu className="w-16 h-16 text-cyber-cyan animate-pulse mb-6 relative z-10" />
        
        <h3 className="text-2xl font-bold text-white tracking-widest mb-2 z-10 font-mono">
          UPLOADING DATA
        </h3>
        
        {/* Cyber Progress Bar */}
        <div className="w-full max-w-md h-6 border border-cyber-cyan/30 bg-black/50 p-1 relative mt-4">
            <div 
                className="h-full bg-cyber-cyan/80 relative overflow-hidden transition-all duration-300"
                style={{ width: `${uploadState.progress}%` }}
            >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.3)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
            </div>
            <div className="absolute top-0 right-2 h-full flex items-center text-xs font-mono text-cyber-cyan">
                {Math.round(uploadState.progress)}%
            </div>
        </div>

        <p className="text-cyber-cyan/60 font-mono text-xs mt-4 animate-pulse">
          &gt; ESTABLISHING SECURE LINK...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-80 rounded-sm border-2 transition-all duration-300 flex flex-col items-center justify-center p-8 cursor-pointer overflow-hidden
        ${dragActive 
          ? 'border-cyber-cyan bg-cyber-cyan/10 shadow-[0_0_30px_rgba(0,243,255,0.3)]' 
          : 'border-cyber-gray bg-cyber-dark/60 hover:border-cyber-cyan/50 hover:bg-cyber-dark/80'
        }
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className="scanline"></div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber-cyan"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyber-cyan"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyber-cyan"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber-cyan"></div>

      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="video/*,audio/*"
        onChange={handleChange}
      />
      
      <div className={`p-6 rounded-full mb-6 transition-all duration-500 ${dragActive ? 'bg-cyber-cyan text-black scale-110' : 'bg-cyber-black/50 text-cyber-cyan border border-cyber-cyan/30'}`}>
        <Upload className="w-10 h-10" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-wider font-mono">
        INITIATE UPLOAD
      </h3>
      
      <div className="flex items-center gap-4 text-cyber-cyan/60 text-sm mb-6 font-mono">
        <span className="flex items-center gap-1"><Video className="w-3 h-3" /> MP4/WebM</span>
        <span className="text-cyber-cyan/20">|</span>
        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> MP3/FLAC/WAV</span>
      </div>

      <div className="flex items-center gap-2 text-xs text-cyber-cyan/40 bg-cyber-black/40 px-3 py-1 border border-cyber-cyan/10">
        <Zap className="w-3 h-3" />
        <span>LOCAL SERVER: UP TO 2GB</span>
      </div>

      {uploadState.error && (
        <div className="absolute bottom-4 left-4 right-4 bg-red-900/80 text-red-100 px-4 py-2 border-l-4 border-red-500 flex items-center gap-2 font-mono text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>ERR: {uploadState.error}</span>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
