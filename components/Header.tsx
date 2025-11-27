import React from 'react';
import { Play, Sparkles, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  hasConfig: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, hasConfig }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-brand-500 p-1.5 rounded-lg shadow-lg shadow-brand-500/20">
            <Play className="w-5 h-5 text-white fill-current" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            VidGraph<span className="font-light text-slate-500">AI</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-brand-400 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Gemini 2.5 Flash</span>
          </div>

          <button 
            onClick={onOpenSettings}
            className={`p-2 rounded-lg transition-colors border ${hasConfig ? 'text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white' : 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 animate-pulse'}`}
            title="配置 Telegram 机器人"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;