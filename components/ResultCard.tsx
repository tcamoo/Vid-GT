import React, { useState } from 'react';
import { UploadState } from '../types';
import { Copy, Check, RefreshCw, ExternalLink, FileAudio, FileVideo, Link, Image as ImageIcon } from 'lucide-react';

interface ResultCardProps {
  state: UploadState;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ state, onReset }) => {
  const [copiedTg, setCopiedTg] = useState(false);
  const [copiedDirect, setCopiedDirect] = useState(false);

  if (!state.telegramLink) return null;

  const directLink = state.fileId 
    ? `${window.location.origin}/api/file?id=${state.fileId}`
    : null;

  const handleCopy = (text: string, isDirect: boolean) => {
    navigator.clipboard.writeText(text);
    if (isDirect) {
        setCopiedDirect(true);
        setTimeout(() => setCopiedDirect(false), 2000);
    } else {
        setCopiedTg(true);
        setTimeout(() => setCopiedTg(false), 2000);
    }
  };

  const isVideo = state.fileType === 'video';
  const isImage = state.fileType === 'image';

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="cyber-box rounded-sm overflow-hidden relative group">
        
        {/* Header Bar */}
        <div className="h-8 bg-cyber-dark border-b border-cyber-cyan/20 flex items-center justify-between px-3">
            <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
            </div>
            <div className="text-[10px] font-mono text-cyber-cyan/50 tracking-widest">TRANSMISSION COMPLETE</div>
        </div>

        {/* Preview Area */}
        <div className="bg-black/50 aspect-video flex flex-col items-center justify-center relative p-8">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.02)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            
            {isVideo && state.previewUrl && (
                <video 
                    src={state.previewUrl} 
                    controls 
                    className="max-h-full max-w-full shadow-[0_0_20px_rgba(0,243,255,0.2)] border border-cyber-cyan/20"
                />
            )}
            
            {isImage && state.previewUrl && (
                <img 
                    src={state.previewUrl} 
                    alt="Preview"
                    className="max-h-full max-w-full shadow-[0_0_20px_rgba(0,243,255,0.2)] border border-cyber-cyan/20 object-contain"
                />
            )}

            {!isVideo && !isImage && (
                <div className="flex flex-col items-center gap-4 animate-float">
                    <div className="p-6 rounded-full bg-cyber-purple/10 border border-cyber-purple shadow-[0_0_30px_rgba(188,19,254,0.3)]">
                        <FileAudio className="w-16 h-16 text-cyber-purple" />
                    </div>
                    <div className="h-1 w-32 bg-cyber-purple/20 rounded-full overflow-hidden">
                        <div className="h-full bg-cyber-purple w-2/3 animate-pulse"></div>
                    </div>
                </div>
            )}
        </div>

        {/* Data & Actions */}
        <div className="p-6 border-t border-cyber-cyan/20 bg-cyber-black/40 space-y-4">
            
            {/* Direct Link Section */}
            {directLink && (
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full space-y-1">
                        <label className="text-xs font-mono text-cyber-cyan uppercase flex items-center gap-1">
                            <Link className="w-3 h-3" /> Direct Proxy Link
                        </label>
                        <div className="flex bg-black/50 border border-cyber-cyan/30 p-1 rounded-sm shadow-[0_0_10px_rgba(0,243,255,0.1)]">
                            <input 
                                type="text" 
                                readOnly 
                                value={directLink} 
                                className="bg-transparent border-none text-cyber-cyan font-mono text-sm w-full focus:ring-0 px-2"
                            />
                        </div>
                    </div>
                    
                    <button
                        onClick={() => handleCopy(directLink, true)}
                        className="cyber-button px-6 py-2 flex items-center justify-center gap-2 text-sm shrink-0"
                    >
                        {copiedDirect ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedDirect ? 'COPIED' : 'COPY LINK'}
                    </button>
                </div>
            )}

            {/* Telegram Link Section */}
            <div className="flex flex-col md:flex-row gap-4 items-end opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-mono text-cyber-cyan/60 uppercase">Telegram Deep Link</label>
                    <div className="flex bg-black/50 border border-cyber-cyan/10 p-1 rounded-sm">
                        <input 
                            type="text" 
                            readOnly 
                            value={state.telegramLink} 
                            className="bg-transparent border-none text-cyber-cyan/70 font-mono text-sm w-full focus:ring-0 px-2"
                        />
                    </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => handleCopy(state.telegramLink!, false)}
                        className="p-2 border border-cyber-cyan/30 text-cyber-cyan/70 hover:bg-cyber-cyan/10 hover:text-cyber-cyan rounded-sm transition-all"
                        title="Copy TG Link"
                    >
                        {copiedTg ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                        href={state.telegramLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 border border-cyber-cyan/30 text-cyber-cyan/70 hover:bg-cyber-cyan/10 hover:text-cyber-cyan rounded-sm transition-all"
                        title="Open External"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Continue Uploading Action */}
            <div className="pt-6 border-t border-cyber-cyan/10 mt-4">
                <button 
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-cyber-gray/30 hover:bg-cyber-cyan/20 border border-cyber-gray hover:border-cyber-cyan text-slate-300 hover:text-cyber-cyan transition-all duration-300 font-mono uppercase tracking-widest text-sm rounded-sm group"
                >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Start New Transmission
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ResultCard;
