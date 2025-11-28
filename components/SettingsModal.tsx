import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Server, AlertTriangle, Info, Cloud, RefreshCw, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
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
  
  // Backend Status State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    if (config) {
      setBotToken(config.botToken || '');
      setChatId(config.chatId || '');
      setApiRoot(config.apiRoot || 'https://api.telegram.org');
    }
  }, [config, isOpen]);

  // Check Backend Status when modal opens
  useEffect(() => {
    if (isOpen) {
        checkBackendStatus();
    }
  }, [isOpen]);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        if (data.status === 'connected') {
            setBackendStatus('connected');
        } else {
            setBackendStatus('disconnected');
        }
    } catch (e) {
        setBackendStatus('disconnected');
    }
  };

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
          <h2 className="text-xl font-bold tracking-widest font-mono">系统配置 (SYSTEM CONFIG)</h2>
        </div>

        <div className="space-y-5 font-mono">
          
          {/* Backend Status Indicator */}
          <div className="bg-black/40 border border-cyber-cyan/10 p-3 rounded-sm flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud Link Status</span>
            <div className="flex items-center gap-2">
                {backendStatus === 'checking' && (
                    <span className="flex items-center gap-2 text-yellow-500 text-xs">
                        <Loader2 className="w-3 h-3 animate-spin" /> 检测中...
                    </span>
                )}
                {backendStatus === 'connected' && (
                    <span className="flex items-center gap-2 text-green-400 text-xs font-bold shadow-green-500/20 drop-shadow-md">
                        <CheckCircle2 className="w-4 h-4" /> 已连接 (READY)
                    </span>
                )}
                {backendStatus === 'disconnected' && (
                    <span className="flex items-center gap-2 text-red-500 text-xs font-bold">
                        <XCircle className="w-4 h-4" /> 未连接 (OFFLINE)
                    </span>
                )}
            </div>
          </div>

          {/* Mode Indicator */}
          <div className={`p-3 rounded-sm border ${isServerMode ? 'bg-cyber-purple/10 border-cyber-purple/50' : 'bg-cyber-cyan/10 border-cyber-cyan/50'} transition-colors`}>
            <div className="flex items-center gap-2 font-bold mb-1">
                {isServerMode ? <Cloud className="w-4 h-4 text-cyber-purple" /> : <Server className="w-4 h-4 text-cyber-cyan" />}
                <span className={isServerMode ? 'text-cyber-purple' : 'text-cyber-cyan'}>
                    {isServerMode ? '当前: 服务器模式 (Server Mode)' : '当前: 直连模式 (Direct Mode)'}
                </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mt-2">
                {isServerMode ? (
                    backendStatus === 'connected' 
                        ? "✅ 后端已就绪。无需填Token，直接上传 (限25MB)。" 
                        : "⚠️ 后端未连接。请先在 Cloudflare 后台配置 TG_BOT_TOKEN，或者在下方填入 Token 切换到直连模式。"
                ) : (
                    "浏览器直接上传至 Telegram。支持大文件 (配合本地服务器可达 2GB)。"
                )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-cyber-cyan/80 mb-1 uppercase">Telegram 机器人令牌 (Bot Token)</label>
                <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder={backendStatus === 'connected' ? "后端已配置，此处可留空" : "如后端未配置，请在此填写"}
                className="cyber-input w-full px-4 py-2 text-sm rounded-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-cyber-cyan/80 mb-1 uppercase">频道 ID / 用户名 (Chat ID)</label>
                <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder={backendStatus === 'connected' ? "后端已配置，此处可留空" : "如后端未配置，请在此填写"}
                className="cyber-input w-full px-4 py-2 text-sm rounded-sm"
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-cyber-cyan/80 mb-1 uppercase flex items-center gap-2">
                API 网关地址 (API Gateway) <span className="text-[10px] text-slate-500 lowercase font-normal">(本地服务器可选)</span>
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
                    重要提示
                </div>
                <p className="text-slate-400 leading-relaxed">
                    如果遇到 "ERR: Server Error"，通常是因为文件太大导致 Cloudflare 内存溢出。请在上方填入 Token 切换到<strong>直连模式</strong>。
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
                        重置为服务器模式
                    </button>
                )}
                <button
                type="submit"
                className="flex-[2] cyber-button py-3 flex items-center justify-center gap-2"
                >
                <Save className="w-4 h-4" />
                保存配置
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
