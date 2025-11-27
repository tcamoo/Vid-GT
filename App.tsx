import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ResultCard from './components/ResultCard';
import SettingsModal from './components/SettingsModal';
import { UploadState, TelegramConfig } from './types';
import { analyzeVideoContent } from './services/geminiService';
import { uploadToTelegram } from './services/telegramService';

const App: React.FC = () => {
  const [state, setState] = useState<UploadState>({
    file: null,
    previewUrl: null,
    base64Data: null,
    status: 'idle',
    progress: 0
  });

  const [tgConfig, setTgConfig] = useState<TelegramConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load config from local storage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('vidgraph_tg_config');
    if (savedConfig) {
      try {
        setTgConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error("Failed to parse saved config", e);
      }
    }
  }, []);

  const handleSaveConfig = (config: TelegramConfig) => {
    setTgConfig(config);
    localStorage.setItem('vidgraph_tg_config', JSON.stringify(config));
  };

  const handleUploadStart = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    
    setState({
      file,
      previewUrl,
      base64Data: null,
      status: 'compressing',
      progress: 0
    });

    try {
      // 1. Convert to Base64 for Gemini
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(',')[1];
      
      setState(prev => ({
        ...prev,
        base64Data,
        status: 'analyzing',
        progress: 0
      }));

      // 2. Call Gemini
      const metadata = await analyzeVideoContent(base64Data, file.type);
      
      // 3. Upload to Telegram if configured
      let telegramLink: string | undefined = undefined;

      if (tgConfig && tgConfig.botToken && tgConfig.chatId) {
        setState(prev => ({
            ...prev,
            status: 'uploading',
            progress: 0,
            metadata // Show metadata while uploading if we wanted, but logic keeps us in loading state
        }));

        // Construct caption with hashtags
        const caption = `**${metadata.title}**\n\n${metadata.description}\n\n${metadata.tags.join(' ')}`;
        
        telegramLink = await uploadToTelegram(
            file, 
            caption, 
            tgConfig,
            (progress) => {
                setState(prev => ({ ...prev, progress }));
            }
        );
      }

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        metadata,
        telegramLink
      }));

    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : "发生了意外错误",
        progress: 0
      }));
    }
  };

  const handleReset = () => {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    setState({
      file: null,
      previewUrl: null,
      base64Data: null,
      status: 'idle',
      progress: 0
    });
  };

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    };
  }, [state.previewUrl]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-brand-500/30">
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        hasConfig={!!tgConfig}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={tgConfig}
        onSave={handleSaveConfig}
      />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          
          {/* Hero Text */}
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              视频托管, <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-teal-400">
                Gemini 智能增强
              </span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              自动生成 AI 描述并上传视频到 Telegram。
              配置你的机器人，拖入文件，即刻获取分享链接。
            </p>
          </div>

          {/* Main Interface */}
          <div className="w-full max-w-3xl mx-auto">
            {state.status === 'complete' ? (
              <ResultCard state={state} onReset={handleReset} />
            ) : (
              <UploadZone onUploadStart={handleUploadStart} uploadState={state} />
            )}
          </div>

        </div>
      </main>
      
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl mix-blend-screen" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl mix-blend-screen" />
      </div>

    </div>
  );
};

// Helper for Base64 conversion
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default App;