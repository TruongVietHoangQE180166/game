
import React from 'react';
import { PlayerStats } from '../types';

interface GameOverScreenProps {
  stats: PlayerStats;
  onRetry: () => void;
  onMenu: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ stats, onRetry, onMenu }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#f8fafc]">
      <div className="bg-white border-4 border-black neo-shadow p-12 max-w-2xl w-full flex flex-col items-center relative overflow-hidden">
        {/* Stamp Effect */}
        <div className="absolute top-10 right-10 transform rotate-12 border-4 border-red-500 text-red-500 px-4 py-2 text-4xl font-black uppercase opacity-20 pointer-events-none">
          THẤT BẠI
        </div>

        <h1 className="text-7xl font-black italic tracking-tighter uppercase mb-2 text-black">BÁO CÁO NHIỆM VỤ</h1>
        <p className="font-mono text-gray-500 mb-8 uppercase tracking-widest">--- Chiến dịch kết thúc ---</p>

        <div className="grid grid-cols-2 gap-6 w-full mb-8">
          <div className="bg-gray-50 border-2 border-black p-4 text-center">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Kẻ Địch Đã Diệt</div>
            <div className="text-6xl font-black text-[oklch(0.6489_0.2370_26.9728)]">{stats.kills}</div>
          </div>
          <div className="bg-gray-50 border-2 border-black p-4 text-center">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Cấp Độ Đạt Được</div>
            <div className="text-6xl font-black text-black">{stats.level}</div>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          <button onClick={onMenu} className="flex-1 py-4 bg-white text-black border-4 border-black neo-shadow font-black text-lg uppercase hover:translate-y-1 hover:translate-x-1 transition-transform">
            Về Menu Chính
          </button>
          <button onClick={onRetry} className="flex-1 py-4 bg-black text-white border-4 border-black neo-shadow font-black text-lg uppercase hover:-translate-y-1 hover:-translate-x-1 transition-transform">
            Thử Lại Ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;
