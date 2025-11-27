import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Server, AlertTriangle, Info, Cloud, RefreshCw } from 'lucide-react';
import { TelegramConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TelegramConfig | null;
  onSave: (config: TelegramConfig) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [apiRoot, setApiRoot] = useState('https://api.telegram.org');

  useEffect(() => {
    if (config) {
      setBotToken(config.botToken || '');
      setChatId(config.chatId || '');
      setApiRoot(config.apiRoot || 'https://api.telegram.org');
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ botToken, chatId, apiRoot });
    onClose();
  };

  const handleReset = () => {
    setBotToken('');
    setChatId('');
    onSave({ botToken: '', chatId: '', apiRoot });
    onClose();
  };

  const isServerMode = !botToken || !chatId;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="cyber-box w-full max-w-md p-6 relative rounded-sm max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-cyber-cyan transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6 text-cyber-cyan border-b border-cyber-cyan/20 pb-4">
          <Settings className="w-6 h-6 animate-spin-slow" />
          <h2 className="text-xl font-bold tracking-widest font-mono">SYSTEM CONFIG</h2>
        </div>

        <div className="space-y-5 font-mono">
          
          {/* Mode Indicator */}
          <div className={`p-3 rounded-sm border ${isServerMode ? 'bg-cyber-purple/10 border-cyber-purple/50' : 'bg-cyber-cyan/10 border-cyber-cyan/50'} transition-colors`}>
            <div className="flex items-center gap-2 font-bold mb-1">
                {isServerMode ? <Cloud className="w-4 h-4 text-cyber-purple" /> : <Server className="w-4 h-4 text-cyber-cyan" />}
                <span className={isServerMode ? 'text-cyber-purple' : 'text-cyber-cyan'}>
                    {isServerMode ? 'CURRENT: SERVER MODE' : 'CURRENT: DIRECT MODE'}
                </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
                {isServerMode 
                    ? "Using Cloudflare Backend Env Vars. Limit: 100MB. No frontend config required."
                    : "Browser uploads directly to Telegram. Supports large files (up to 2GB with Local Server)."
                }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-cyber-cyan/80 mb-1 uppercase">Telegram Bot Token</label>
                <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="Direct Mode Only"
                className="cyber-input w-full px-4 py-2 text-sm rounded-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-cyber-cyan/80 mb-1 uppercase">Chat ID / Username</label>
                <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Direct Mode Only"
                className="cyber-input w-full px-4 py-2 text-sm rounded-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-cyber-cyan/80 mb-1 uppercase flex items-center gap-2">
                API Gateway <span className="text-[10px] text-slate-500 lowercase font-normal">(optional for local server)</span>
                </label>
                <input
                type="text"
                value={apiRoot}
                onChange={(e) => setApiRoot(e.target.value)}
                placeholder="https://api.telegram.org"
                className="cyber-input w-full px-4 py-2 text-sm rounded-sm"
                />
            </div>

            {/* Critical Notice for Direct Links */}
            <div className="bg-cyber-dark/50 border border-yellow-500/30 p-3 rounded-sm text-xs space-y-2">
                <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase">
                    <Info className="w-4 h-4" />
                    Env Var Required
                </div>
                <p className="text-slate-400 leading-relaxed">
                    For Direct Links to work, <strong>TG_BOT_TOKEN</strong> must be set in Cloudflare Dashboard, even if using Direct Mode here.
                </p>
            </div>

            <div className="pt-4 border-t border-cyber-cyan/20 flex gap-3">
                {!isServerMode && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold border border-cyber-purple/50 text-cyber-purple hover:bg-cyber-purple/10 transition-colors uppercase"
                    >
                        <RefreshCw className="w-3 h-3" />
                        Reset to Server Mode
                    </button>
                )}
                <button
                type="submit"
                className="flex-[2] cyber-button py-3 flex items-center justify-center gap-2"
                >
                <Save className="w-4 h-4" />
                SAVE CONFIG
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
