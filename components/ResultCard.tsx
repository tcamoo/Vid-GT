import React, { useState } from 'react';
import { UploadState } from '../types';
import { Check, Copy, FileCode, Hash, RefreshCw, Share2, Tag, ExternalLink } from 'lucide-react';

interface ResultCardProps {
  state: UploadState;
  onReset: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ state, onReset }) => {
  const [copied, setCopied] = useState(false);

  if (!state.metadata || !state.previewUrl) return null;

  const handleCopy = () => {
    const urlToCopy = state.telegramLink || `https://vidgraph.ai/v/${state.metadata.suggestedFilename}`;
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Video Player Section */}
      <div className="bg-black rounded-t-2xl overflow-hidden aspect-video border border-slate-800 shadow-2xl relative group">
        <video 
          src={state.previewUrl} 
          controls 
          className="w-full h-full object-contain"
          playsInline
        />
        {state.telegramLink && (
            <a 
              href={state.telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 bg-brand-500/90 hover:bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur transition-all flex items-center gap-1 shadow-lg"
            >
                在 Telegram 中查看 <ExternalLink className="w-3 h-3" />
            </a>
        )}
      </div>

      {/* Analysis Content */}
      <div className="bg-slate-900 border-x border-b border-slate-800 rounded-b-2xl p-6 space-y-6">
        
        {/* Title & Share */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white leading-tight">
              {state.metadata.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-mono bg-slate-800/50 px-2 py-1 rounded">
                    <FileCode className="w-3 h-3" />
                    {state.metadata.suggestedFilename}
                </div>
                {state.telegramLink && (
                    <div className="flex items-center gap-2 text-green-400 text-sm font-medium bg-green-900/20 border border-green-900/30 px-2 py-1 rounded">
                        <Check className="w-3 h-3" />
                        已上传至 Telegram
                    </div>
                )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-brand-500/20 h-10"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? '已复制' : '复制链接'}
            </button>
            <button 
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors h-10 w-10 flex items-center justify-center"
              title="上传新视频"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-800" />

        {/* AI Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Description */}
            <div className="md:col-span-2 space-y-2">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    AI 简介
                </h4>
                <p className="text-slate-300 leading-relaxed text-lg">
                    {state.metadata.description}
                </p>
            </div>

            {/* Tags */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Tag className="w-4 h-4" /> 智能标签
                </h4>
                <div className="flex flex-wrap gap-2">
                    {state.metadata.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-brand-300 text-sm rounded-md border border-slate-700 transition-colors cursor-default flex items-center gap-1">
                            <Hash className="w-3 h-3 opacity-50" />
                            {tag.replace('#', '')}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Disclaimer */}
        {!state.telegramLink && (
            <div className="mt-6 p-4 bg-amber-500/10 rounded-lg border border-amber-500/20 text-xs text-amber-200/80">
            <p>
                <strong className="text-amber-400">预览模式：</strong> 视频已分析但尚未上传。请配置 Telegram 设置以开启云端上传和链接生成功能。
            </p>
            </div>
        )}

      </div>
    </div>
  );
};

export default ResultCard;