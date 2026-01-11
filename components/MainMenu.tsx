
import React from 'react';
import { Play, BarChart2, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onShowHistory: () => void;
  onShowTutorial: () => void;
  onShowPolicy: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onShowHistory, onShowTutorial, onShowPolicy }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f0f0f0] pattern-grid">
      <div className="flex flex-col items-center transform -rotate-2 mb-12 animate-pop">
        <div className="bg-black text-white px-6 py-2 border-4 border-black neo-shadow mb-4">
          <span className="font-mono text-lg tracking-[0.2em] uppercase font-bold">Phiên Bản 2.1 - Cách Mạng</span>
        </div>
        <h1 className="text-9xl font-black tracking-tighter leading-[0.85] text-center uppercase text-[oklch(0.6489_0.2370_26.9728)] drop-shadow-[10px_10px_0px_rgba(0,0,0,1)]">
          HÀNH TRÌNH<br />
          <span className="text-black bg-white px-4 border-4 border-black">TƯ TƯỞNG</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-6 w-[700px]">
        <button onClick={onStart} className="col-span-2 py-8 bg-black text-white font-black text-4xl border-4 border-black neo-shadow hover:-translate-y-2 hover:-translate-x-2 transition-transform uppercase flex items-center justify-center gap-4 group">
          <Play className="w-10 h-10" strokeWidth={3} />
          <span>Bắt Đầu Ngay</span>
          <ArrowRight className="w-10 h-10 group-hover:translate-x-2 transition-transform" strokeWidth={3} />
        </button>
        <button onClick={onShowHistory} className="py-6 bg-white text-black font-black text-xl border-4 border-black neo-shadow hover:-translate-y-1 hover:-translate-x-1 transition-transform uppercase hover:bg-gray-50 flex items-center justify-center gap-2">
          <BarChart2 className="w-6 h-6" strokeWidth={3} />
          Lịch Sử Đấu
        </button>
        <button onClick={onShowTutorial} className="py-6 bg-[oklch(0.9680_0.2110_109.7692)] text-black font-black text-xl border-4 border-black neo-shadow hover:-translate-y-1 hover:-translate-x-1 transition-transform uppercase flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6" strokeWidth={3} />
          Cách Chơi
        </button>
        <button onClick={onShowPolicy} className="col-span-2 py-4 bg-gray-200 text-gray-600 font-bold text-sm border-4 border-black neo-shadow hover:bg-gray-300 uppercase flex items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Cam Kết Sử Dụng AI & Bảo Mật
        </button>
      </div>

      <div className="absolute bottom-8 text-xs font-mono text-gray-400">
        PHÁT TRIỂN BỞI ĐỘI NGŨ KỸ THUẬT © 2024
      </div>
    </div>
  );
};

export default MainMenu;
