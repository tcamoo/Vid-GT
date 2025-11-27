import React, { useState, useEffect } from 'react';
import { Settings, Save, X, ExternalLink, Server, AlertTriangle } from 'lucide-react';
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
      setBotToken(config.botToken);
      setChatId(config.chatId);
      setApiRoot(config.apiRoot || 'https://api.telegram.org');
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ botToken, chatId, apiRoot });
    onClose();
  };

  const isCustomServer = apiRoot && !apiRoot.includes('api.telegram.org');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6 text-brand-400">
          <Settings className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white">设置</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Telegram Bot Token (机器人令牌)
            </label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="例如: 123456:ABC-DEF..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm font-mono"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              请通过 <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-brand-400 hover:underline inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-3 h-3"/></a> 获取
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Chat ID 或 频道用户名
            </label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="@mychannel 或 -100123456789"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm font-mono"
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              目标频道或群组 ID。机器人必须是该频道的管理员。
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800 mt-2">
            <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
               <Server className="w-3 h-3"/> API 服务器地址 (可选)
            </label>
            <input
              type="text"
              value={apiRoot}
              onChange={(e) => setApiRoot(e.target.value)}
              placeholder="https://api.telegram.org"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-sm font-mono"
            />
            <p className="mt-1 text-xs text-slate-500">
              官方 API 限制 50MB。要上传大文件 (最大 2GB)，请填入你自己搭建的本地 Bot API 地址。
            </p>
          </div>

          {isCustomServer && (
             <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-200/80">
                        <strong className="text-amber-400 block mb-1">CORS 跨域配置提醒</strong>
                        因为本网页运行在 Cloudflare 上，而 API 在你的服务器上，浏览器会拦截上传请求。请确保你的 API 服务器 (Nginx/Docker) 允许跨域：
                        <code className="block bg-black/30 p-1 mt-1 rounded text-amber-100 break-all">
                            Access-Control-Allow-Origin: *
                        </code>
                    </div>
                </div>
             </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              保存配置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;