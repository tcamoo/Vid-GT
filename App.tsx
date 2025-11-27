import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ResultCard from './components/ResultCard';
import SettingsModal from './components/SettingsModal';
import HistoryPanel from './components/HistoryPanel';
import { UploadState, TelegramConfig } from './types';
import { uploadToTelegram } from './services/telegramService';
import { saveHistory } from './services/historyService';

const App: React.FC = () => {
  const [state, setState] = useState<UploadState>({
    file: null,
    fileType: null,
    previewUrl: null,
    status: 'idle',
    progress: 0
  });

  const [tgConfig, setTgConfig] = useState<TelegramConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);

  useEffect(() => {
    const savedConfig = localStorage.getItem('vidgraph_tg_config');
    if (savedConfig) {
      try {
        setTgConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Config Error", e);
      }
    }
  }, []);

  const handleSaveConfig = (config: TelegramConfig) => {
    setTgConfig(config);
    localStorage.setItem('vidgraph_tg_config', JSON.stringify(config));
  };

  const handleUploadStart = async (file: File) => {
    if (!tgConfig) {
        setIsSettingsOpen(true);
        return;
    }

    // Determine type
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    
    // Create preview only if video
    const previewUrl = isVideo ? URL.createObjectURL(file) : null;
    
    setState({
      file,
      fileType: isVideo ? 'video' : 'audio',
      previewUrl,
      status: 'uploading',
      progress: 0
    });

    try {
      const caption = `Filename: \`${file.name}\`\nSize: \`${(file.size/1024/1024).toFixed(2)}MB\``;
      
      const { link, fileId } = await uploadToTelegram(
        file, 
        caption, 
        tgConfig, 
        (p) => setState(prev => ({ ...prev, progress: p }))
      );

      // Save to History (KV)
      await saveHistory({
        filename: file.name,
        fileType: isVideo ? 'video' : 'audio',
        link,
        fileId,
        timestamp: Date.now(),
        size: file.size
      });
      
      // Trigger history refresh
      setHistoryRefreshTrigger(prev => prev + 1);

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        telegramLink: link,
        fileId: fileId
      }));

    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown Error",
        progress: 0
      }));
    }
  };

  const handleReset = () => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    setState({
      file: null,
      fileType: null,
      previewUrl: null,
      status: 'idle',
      progress: 0
    });
  };

  return (
    <div className="min-h-screen font-sans selection:bg-cyber-cyan/30 selection:text-cyber-cyan">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onToggleHistory={() => setIsHistoryOpen(true)}
        hasConfig={!!tgConfig}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={tgConfig}
        onSave={handleSaveConfig}
      />

      <HistoryPanel 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)}
        refreshTrigger={historyRefreshTrigger}
      />

      <main className="pt-32 pb-12 px-4 max-w-3xl mx-auto relative z-10">
        
        {/* Title Area */}
        <div className="text-center mb-16 space-y-4">
            <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 tracking-tighter text-glow">
              LINK<span className="text-cyber-cyan">NEXUS</span>
            </h2>
            <p className="text-cyber-cyan/60 font-mono text-sm md:text-base tracking-widest uppercase">
              // Secure Video & Audio Uplink Protocol
            </p>
        </div>

        {state.status === 'complete' ? (
          <ResultCard state={state} onReset={handleReset} />
        ) : (
          <UploadZone onUploadStart={handleUploadStart} uploadState={state} />
        )}

      </main>

      {/* Decorative Lights */}
      <div className="fixed top-1/4 left-0 w-64 h-64 bg-cyber-purple/20 blur-[100px] pointer-events-none -z-10 animate-float"></div>
      <div className="fixed bottom-1/4 right-0 w-64 h-64 bg-cyber-cyan/10 blur-[100px] pointer-events-none -z-10 animate-float" style={{ animationDelay: '2s' }}></div>

    </div>
  );
};

export default App;
