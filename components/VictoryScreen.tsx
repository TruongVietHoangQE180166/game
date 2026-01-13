
import React, { useEffect, useState } from 'react';
import { PlayerStats } from '../types';
import { Trophy, RefreshCw, Home, Star, Crown, Medal, Sparkles } from 'lucide-react';

interface VictoryScreenProps {
  stats: PlayerStats;
  onRetry: () => void;
  onMenu: () => void;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({ stats, onRetry, onMenu }) => {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-yellow-400 font-sans overflow-y-auto">
      
      {/* Sunburst Background Effect - Fixed */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-20">
         <div className="w-[200vw] h-[200vw] bg-[repeating-conic-gradient(#000_0deg_10deg,transparent_10deg_20deg)] animate-[spin_20s_linear_infinite]"></div>
      </div>

      {/* Confetti Particles - Fixed */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
           {[...Array(30)].map((_, i) => (
              <div key={i} className="absolute animate-bounce" style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  animationDelay: `${Math.random()}s`,
              }}>
                  <div className={`w-3 h-3 border-2 border-black transform rotate-45 ${Math.random() > 0.5 ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              </div>
           ))}
      </div>

      {/* Scrollable Content Container */}
      <div className="min-h-screen flex items-center justify-center py-20 px-4 relative z-10">
        <div className={`w-full max-w-4xl transition-all duration-700 ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          
          {/* Main Card Container */}
          <div className="bg-white border-[8px] border-black shadow-[20px_20px_0_0_#000] p-0 relative flex flex-col items-center">
            
            {/* Header Badge - Floating */}
            <div className="absolute -top-12 md:-top-16 z-20 animate-bounce">
                <div className="bg-yellow-300 text-black p-4 md:p-6 rounded-full border-8 border-black shadow-[8px_8px_0_0_#000] relative">
                   <Crown size={48} className="md:w-16 md:h-16" strokeWidth={2.5} fill="white" />
                   <div className="absolute top-0 right-0 animate-ping">
                      <Sparkles size={24} className="md:w-8 md:h-8 text-yellow-600" />
                   </div>
                </div>
            </div>

            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-12 h-12 md:w-16 md:h-16 border-t-[12px] md:border-t-[16px] border-l-[12px] md:border-l-[16px] border-black"></div>
            <div className="absolute top-0 right-0 w-12 h-12 md:w-16 md:h-16 border-t-[12px] md:border-t-[16px] border-r-[12px] md:border-r-[16px] border-black"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 border-b-[12px] md:border-b-[16px] border-l-[12px] md:border-l-[16px] border-black"></div>
            <div className="absolute bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 border-b-[12px] md:border-b-[16px] border-r-[12px] md:border-r-[16px] border-black"></div>

            <div className="pt-20 pb-8 px-6 md:pt-24 md:pb-12 md:px-8 w-full flex flex-col items-center text-center">

              {/* Title Section */}
              <div className="mb-8 md:mb-10 transform -rotate-2">
                <h2 className="text-xl md:text-2xl font-black bg-black text-white inline-block px-3 py-1 md:px-4 uppercase tracking-[0.3em] mb-2 border-2 border-transparent">
                    Sứ Mệnh Hoàn Thành
                </h2>
                <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-600 drop-shadow-[4px_4px_0_#000] md:drop-shadow-[6px_6px_0_#000]"
                    style={{ WebkitTextStroke: '2px black' }}>
                  CHIẾN<br/>THẮNG
                </h1>
              </div>

              {/* Stats Showcase - Brutalist Grid */}
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
                 {/* Stat 1: Kills */}
                 <div className="bg-cyan-300 border-4 border-black p-4 shadow-[6px_6px_0_0_#000] md:shadow-[8px_8px_0_0_#000] group hover:-translate-y-2 transition-transform duration-300">
                    <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Trophy size={32} className="md:w-10 md:h-10" strokeWidth={2} />
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-black mb-1">{stats.kills}</div>
                    <div className="bg-black text-white font-mono font-bold text-[10px] md:text-xs py-1 uppercase tracking-widest">Kẻ Địch Đã Diệt</div>
                 </div>
                 
                 {/* Stat 2: Level */}
                 <div className="bg-purple-400 border-4 border-black p-4 shadow-[6px_6px_0_0_#000] md:shadow-[8px_8px_0_0_#000] group hover:-translate-y-2 transition-transform duration-300 md:-translate-y-6">
                    <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Medal size={32} className="md:w-10 md:h-10" strokeWidth={2} />
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-black mb-1">{stats.level}</div>
                    <div className="bg-black text-white font-mono font-bold text-[10px] md:text-xs py-1 uppercase tracking-widest">Cấp Độ Cuối</div>
                 </div>

                 {/* Stat 3: Rank */}
                 <div className="bg-green-400 border-4 border-black p-4 shadow-[6px_6px_0_0_#000] md:shadow-[8px_8px_0_0_#000] group hover:-translate-y-2 transition-transform duration-300">
                     <div className="flex justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Star size={32} className="md:w-10 md:h-10" strokeWidth={2} fill="black" />
                     </div>
                     <div className="text-xl md:text-2xl font-black text-black mb-1 uppercase leading-8 pt-2">
                        {stats.kills > 2000 ? "THẦN CHIẾN" : stats.level > 30 ? "HUYỀN THOẠI" : "CHIẾN BINH"}
                     </div>
                     <div className="bg-black text-white font-mono font-bold text-[10px] md:text-xs py-1 uppercase tracking-widest mt-1">Danh Hiệu</div>
                 </div>
              </div>

              {/* Buttons Area */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-2xl">
                <button 
                  onClick={onRetry}
                  className="flex-1 bg-black text-white py-4 md:py-5 px-6 border-4 border-black font-black text-lg md:text-xl uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-red-600 hover:text-black hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 transition-all"
                >
                  <RefreshCw size={20} className="md:w-6 md:h-6 animate-spin-slow" strokeWidth={3} /> 
                  Chơi Lại
                </button>
                <button 
                  onClick={onMenu}
                  className="flex-1 bg-white text-black py-4 md:py-5 px-6 border-4 border-black font-black text-lg md:text-xl uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-gray-200 hover:shadow-[8px_8px_0_0_#000] hover:-translate-y-1 transition-all"
                >
                   <Home size={20} className="md:w-6 md:h-6" strokeWidth={3} /> 
                   Menu Chính
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VictoryScreen;
