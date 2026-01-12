
import React, { useEffect, useState } from 'react';
import { PlayerStats } from '../types';
import { Skull, RefreshCw, Home, AlertTriangle, ZapOff } from 'lucide-react';

interface GameOverScreenProps {
  stats: PlayerStats;
  onRetry: () => void;
  onMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ stats, onRetry, onMenu }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowContent(true), 100);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-600 font-sans overflow-hidden">
      
      {/* Background Patterns - Aggressive */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 20px, transparent 20px, transparent 40px)' }}>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-80 pointer-events-none"></div>

      <div className={`relative w-full max-w-2xl p-4 transition-all duration-500 transform ${showContent ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        
        {/* Main Container - Tilted & Shadowed */}
        <div className="bg-[#1a1a1a] border-[8px] border-black shadow-[16px_16px_0_0_#000] p-0 relative transform -rotate-2 overflow-hidden">
          
          {/* Hazard Tape Top */}
          <div className="h-4 w-full bg-yellow-400 border-b-4 border-black" 
               style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #000 0, #000 10px, #facc15 10px, #facc15 20px)' }}>
          </div>

          <div className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
             
             {/* Skull Icon with Glitch Effect */}
             <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity animate-pulse"></div>
                <div className="bg-black text-white p-4 border-4 border-white shadow-[4px_4px_0_0_#ef4444] transform group-hover:rotate-12 transition-transform duration-300">
                    <Skull size={64} strokeWidth={2.5} />
                </div>
                <div className="absolute -top-2 -right-2 text-yellow-400 animate-bounce">
                    <ZapOff size={32} fill="currentColor" />
                </div>
             </div>

             {/* Title */}
             <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white drop-shadow-[4px_4px_0_#ef4444]">
               THẤT BẠI
             </h1>
             <div className="bg-red-600 text-black px-4 py-1 font-mono font-bold text-sm uppercase border-2 border-black transform rotate-2 mb-8">
               Mission Failed • System Halted
             </div>

             {/* Stats Grid - Colorful Cards */}
             <div className="grid grid-cols-2 gap-4 w-full mb-8">
                {/* Kills Card */}
                <div className="bg-blue-400 border-4 border-black p-3 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-transform">
                   <div className="flex justify-between items-start mb-1">
                      <Skull size={20} />
                      <span className="font-black text-2xl">{stats.kills}</span>
                   </div>
                   <div className="text-[10px] font-bold uppercase text-left border-t-2 border-black pt-1 mt-1">
                      Kẻ Địch Đã Diệt
                   </div>
                </div>

                {/* Level Card */}
                <div className="bg-pink-400 border-4 border-black p-3 shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-transform">
                   <div className="flex justify-between items-start mb-1">
                      <AlertTriangle size={20} />
                      <span className="font-black text-2xl">LV.{stats.level}</span>
                   </div>
                   <div className="text-[10px] font-bold uppercase text-left border-t-2 border-black pt-1 mt-1">
                      Cấp Độ Đạt Được
                   </div>
                </div>
             </div>

             {/* Action Buttons - Massive & High Contrast */}
             <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={onRetry}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 text-black border-4 border-black py-4 px-6 font-black text-xl uppercase tracking-widest shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  <RefreshCw size={24} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-500" />
                  THỬ LẠI NGAY
                </button>
                
                <button 
                  onClick={onMenu}
                  className="w-full bg-white hover:bg-gray-200 text-black border-4 border-black py-3 px-6 font-bold text-lg uppercase tracking-widest shadow-[6px_6px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                   <Home size={20} strokeWidth={3} />
                   Về Menu Chính
                </button>
             </div>

          </div>
          
          {/* Hazard Tape Bottom */}
          <div className="h-4 w-full bg-yellow-400 border-t-4 border-black" 
               style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #facc15 10px, #facc15 20px)' }}>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
