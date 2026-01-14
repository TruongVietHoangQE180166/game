
  import React from 'react';
  import { Play, BarChart2, BookOpen, ShieldCheck, Zap, Trophy } from 'lucide-react';

  interface MainMenuProps {
    onStart: () => void;
    onShowHistory: () => void;
    onShowTutorial: () => void;
    onShowPolicy: () => void;
    onShowLeaderboard: () => void; // New prop
  }

  const MainMenu: React.FC<MainMenuProps> = ({ onStart, onShowHistory, onShowTutorial, onShowPolicy, onShowLeaderboard }) => {
    return (
      <div className="absolute inset-0 z-50 overflow-hidden flex items-center justify-center font-sans">
        
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0 overflow-hidden">
            {/* The Image */}
            <div 
              className="absolute inset-0"
              style={{ 
                  backgroundImage: "url('BackGround.webp')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
              }}
            ></div>

            {/* Layer 1: Subtle Blur & Tint (Lighter now: bg-black/20) */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

            {/* Layer 2: Vignette (Darker corners, transparent center to highlight image) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
          
          {/* HERO TITLE */}
          <div className="mb-12 text-center transform hover:scale-105 transition-transform duration-500">
            <div className="inline-block bg-black text-white px-4 py-1 mb-4 border-2 border-white neo-shadow-sm transform -rotate-2">
                <span className="font-mono font-bold tracking-[0.3em] text-xs md:text-sm">PHIÊN BẢN CÁCH MẠNG 2.1</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase drop-shadow-[8px_8px_0px_rgba(0,0,0,0.8)] text-white">
              HÀNH TRÌNH<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400" style={{ textShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>TƯ TƯỞNG</span>
            </h1>
            <p className="mt-4 font-mono font-bold text-gray-200 tracking-widest text-sm md:text-base drop-shadow-md bg-black/50 inline-block px-4 py-1 rounded">SURVIVAL RPG • BULLET HEAVEN • HISTORY</p>
          </div>

          {/* MENU GRID */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
            
            {/* PLAY BUTTON (Giant) */}
            <button 
              onClick={onStart}
              className="col-span-1 md:col-span-8 group relative h-40 bg-black text-white border-4 border-white neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative h-full flex items-center justify-between px-8 md:px-12">
                <div className="flex flex-col items-start">
                  <span className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase group-hover:translate-x-2 transition-transform">CHIẾN ĐẤU</span>
                  <span className="text-xs md:text-sm font-mono font-bold text-gray-400 group-hover:text-white mt-1">BẮT ĐẦU CHIẾN DỊCH MỚI</span>
                </div>
                <div className="bg-white text-black p-4 rounded-full border-4 border-black group-hover:scale-110 group-hover:rotate-12 transition-transform">
                  <Play size={40} fill="currentColor" />
                </div>
              </div>
            </button>

            {/* SIDE BUTTONS */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-4 h-40">
              <div className="flex-1 flex gap-4">
                  <button 
                    onClick={onShowHistory}
                    className="flex-1 bg-cyan-300 text-black border-4 border-white neo-shadow hover:bg-cyan-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col items-center justify-center gap-1 font-black uppercase text-sm"
                    title="Lịch sử"
                  >
                    <BarChart2 size={20} strokeWidth={3} /> Lịch Sử
                  </button>
                  <button 
                    onClick={onShowTutorial}
                    className="flex-1 bg-emerald-300 text-black border-4 border-white neo-shadow hover:bg-emerald-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex flex-col items-center justify-center gap-1 font-black uppercase text-sm"
                    title="Hướng dẫn"
                  >
                    <BookOpen size={20} strokeWidth={3} /> Hướng Dẫn
                  </button>
              </div>
              
              {/* LEADERBOARD BUTTON */}
              <button 
                onClick={onShowLeaderboard}
                className="flex-1 bg-yellow-400 text-black border-4 border-white neo-shadow hover:bg-yellow-300 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3 font-black uppercase text-lg"
              >
                <Trophy size={24} strokeWidth={3} /> Bảng Xếp Hạng
              </button>
            </div>

            {/* FOOTER BUTTONS */}
            <button 
              onClick={onShowPolicy}
              className="col-span-1 md:col-span-12 py-3 bg-white text-black font-black text-sm border-4 border-white neo-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-pink-200 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
            >
              <ShieldCheck size={18} strokeWidth={2.5} /> CAM KẾT SỬ DỤNG AI & BẢO MẬT DỮ LIỆU
            </button>

          </div>
        </div>
        
        {/* Version Tag */}
        <div className="absolute bottom-4 left-4 font-mono text-xs font-bold text-white/50">
          BUILD: v2.1.0_PROD
        </div>
      </div>
    );
  };

  export default MainMenu;
