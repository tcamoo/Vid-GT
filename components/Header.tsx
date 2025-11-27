import React from 'react';
import { Settings, Activity, History } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  hasConfig: boolean;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, onToggleHistory, hasConfig }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-cyber-cyan/20 bg-cyber-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyber-cyan rounded-md blur-md opacity-20 group-hover:opacity-50 transition-opacity"></div>
            <Activity className="w-6 h-6 text-cyber-cyan relative z-10" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter text-white">
            LINK<span className="text-cyber-cyan">NEXUS</span>
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleHistory}
            className="p-2 rounded-md border border-cyber-cyan/30 text-cyber-cyan/80 hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-all group"
            title="传输记录"
          >
            <History className="w-5 h-5 group-hover:animate-spin" style={{ animationDuration: '3s' }} />
          </button>

          <button 
            onClick={onOpenSettings}
            className={`p-2 rounded-md border transition-all ${
              hasConfig 
                ? 'border-cyber-cyan/30 text-cyber-cyan/80 hover:text-cyber-cyan hover:bg-cyber-cyan/10' 
                : 'border-cyber-purple/50 text-cyber-purple bg-cyber-purple/10 animate-pulse-glow'
            }`}
            title="系统配置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
