import React, { useEffect, useState } from 'react';
import { X, Clock, FileVideo, FileAudio, ExternalLink, Copy, Check, Link } from 'lucide-react';
import { HistoryItem } from '../types';
import { fetchHistory } from '../services/historyService';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  refreshTrigger: number; // Increment to reload
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose, refreshTrigger }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, refreshTrigger]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchHistory();
    setHistory(data);
    setLoading(false);
  };

  const handleCopy = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDirectLink = (fileId?: string) => {
      if (!fileId) return null;
      return `${window.location.origin}/api/file?id=${fileId}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Panel */}
      <div className="relative w-full max-w-sm h-full bg-cyber-black border-l border-cyber-cyan/30 shadow-[-10px_0_30px_rgba(0,243,255,0.1)] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-cyber-cyan/20 flex items-center justify-between bg-cyber-dark/80">
          <div className="flex items-center gap-2 text-cyber-cyan">
            <Clock className="w-5 h-5" />
            <h2 className="font-bold tracking-wider font-mono">TRANSMISSION LOG</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-cyber-cyan/50 font-mono animate-pulse">LOADING DATA...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-slate-600 font-mono">NO RECORDS FOUND</div>
          ) : (
            history.map((item) => {
              const directLink = getDirectLink(item.fileId);
              const targetLink = directLink || item.link;

              return (
                <div key={item.id} className="bg-cyber-gray/30 border border-cyber-cyan/10 p-3 rounded-sm hover:border-cyber-cyan/50 transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.fileType === 'video' ? (
                        <FileVideo className="w-4 h-4 text-cyber-cyan shrink-0" />
                      ) : (
                        <FileAudio className="w-4 h-4 text-cyber-purple shrink-0" />
                      )}
                      <span className="text-sm text-slate-300 truncate font-mono">{item.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 bg-black/50 border border-cyber-cyan/10 rounded-sm px-2 py-1 flex items-center gap-2">
                        {directLink ? <Link className="w-3 h-3 text-cyber-cyan" /> : <ExternalLink className="w-3 h-3 text-slate-500" />}
                        <input 
                            type="text" 
                            value={targetLink} 
                            readOnly 
                            className="bg-transparent text-cyber-cyan/70 text-xs flex-1 border-none font-mono focus:ring-0 p-0"
                        />
                    </div>
                    
                    <button 
                        onClick={() => handleCopy(targetLink, item.id)}
                        className="p-1.5 text-slate-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10 rounded-sm transition-colors"
                        title="Copy Link"
                    >
                        {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a href={item.link} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-cyber-cyan hover:bg-cyber-cyan/10 rounded-sm" title="Open TG Link">
                        <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        <div className="p-3 text-center text-[10px] text-slate-600 border-t border-cyber-cyan/10 font-mono">
            SYNCED WITH CLOUDFLARE KV
        </div>
      </div>
    </div>
  );
};

export default HistoryPanel;
