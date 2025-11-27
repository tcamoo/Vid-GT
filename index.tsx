@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-cyber-black text-slate-300 overflow-x-hidden;
    background-image: 
      linear-gradient(rgba(0, 243, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 243, 255, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    background-position: center top;
  }
}

@layer components {
  .cyber-box {
    @apply bg-cyber-dark/80 backdrop-blur-md border border-cyber-cyan/30 shadow-[0_0_15px_rgba(0,243,255,0.1)];
  }
  
  .cyber-input {
    @apply bg-cyber-black/50 border border-cyber-cyan/30 text-cyber-cyan placeholder-cyber-cyan/30 focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan outline-none transition-all;
  }

  .cyber-button {
    @apply bg-cyber-cyan/10 border border-cyber-cyan/50 text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-black transition-all duration-300 font-bold tracking-wider uppercase shadow-[0_0_10px_rgba(0,243,255,0.2)] hover:shadow-[0_0_20px_rgba(0,243,255,0.6)];
  }

  .text-glow {
    text-shadow: 0 0 10px rgba(0, 243, 255, 0.7);
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: #030712;
}
::-webkit-scrollbar-thumb {
  background: #1f2937;
  border-radius: 4px;
  border: 1px solid #00f3ff;
}
::-webkit-scrollbar-thumb:hover {
  background: #00f3ff;
}

.scanline {
  width: 100%;
  height: 100px;
  z-index: 10;
  background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0, 243, 255, 0.1) 50%, rgba(0,0,0,0) 100%);
  opacity: 0.1;
  position: absolute;
  bottom: 100%;
  animation: scanline 8s linear infinite;
  pointer-events: none;
}

@keyframes scanline {
  0% {
    bottom: 100%;
  }
  80% {
    bottom: 100%;
  }
  100% {
    bottom: -100%;
  }
}
