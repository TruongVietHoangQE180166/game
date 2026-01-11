
import React, { useState } from 'react';
import { PlayerStats, Enemy } from '../types';
import { 
  Heart, Shield, Skull, Clock, 
  Crosshair, Book, Maximize2, Minimize2, Swords, Zap, Bomb
} from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  timer: number;
  activeBoss: Enemy | null;
}

const HUD: React.FC<HUDProps> = ({ stats, timer, activeBoss }) => {
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

  const hpPercent = (stats.hp / stats.maxHP) * 100;
  const armorPercent = (stats.currentArmor / stats.maxArmor) * 100;
  const expPercent = (stats.exp / stats.expToNext) * 100;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-40 p-6 font-sans">
      
      {/* TOP ROW */}
      <div className="flex justify-between items-start w-full relative z-10">
        
        {/* PLAYER STATUS (Left) */}
        <div className="flex flex-col gap-3 w-80 pointer-events-auto">
          {/* HP */}
          <div className="bg-white border-4 border-black neo-shadow p-2 flex items-stretch gap-3">
            <div className="bg-red-500 text-white w-10 flex items-center justify-center border-2 border-black neo-shadow-sm">
              <Heart size={20} strokeWidth={3} fill="currentColor" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div className="flex justify-between items-end leading-none mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">SINH LỰC</span>
                <span className="text-[10px] font-mono font-bold">{Math.ceil(stats.hp)}/{stats.maxHP}</span>
              </div>
              <div className="h-4 bg-gray-200 border-2 border-black w-full relative overflow-hidden">
                <div 
                  className="h-full bg-red-500 transition-all duration-300 absolute left-0 top-0" 
                  style={{ width: `${Math.max(0, hpPercent)}%` }} 
                />
                <div className="absolute inset-0 opacity-20 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqgABJNDt27cbIImC9AOw0wiV7Ip9QwAAAABJRU5ErkJggg==')]"></div>
              </div>
            </div>
          </div>

          {/* Armor */}
          <div className="bg-white border-4 border-black neo-shadow p-2 flex items-stretch gap-3">
             <div className="bg-blue-500 text-white w-10 flex items-center justify-center border-2 border-black neo-shadow-sm">
              <Shield size={20} strokeWidth={3} fill="currentColor" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-0.5">
              <div className="flex justify-between items-end leading-none mb-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">GIÁP NĂNG LƯỢNG</span>
                 <span className="text-[10px] font-mono font-bold">{Math.ceil(stats.currentArmor)}/{stats.maxArmor}</span>
              </div>
               <div className="h-4 bg-gray-200 border-2 border-black w-full relative overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300 absolute left-0 top-0" 
                  style={{ width: `${Math.max(0, armorPercent)}%` }} 
                />
              </div>
            </div>
          </div>
          
           {/* Level / EXP */}
           <div className="bg-white border-4 border-black neo-shadow p-2 flex items-center gap-3">
             <div className="bg-yellow-400 text-black w-10 h-10 border-2 border-black font-black font-mono flex items-center justify-center text-xl leading-none neo-shadow-sm">
              {stats.level}
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-end mb-1">
                 <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600">KINH NGHIỆM</span>
                 <span className="text-[10px] font-mono font-bold">{Math.floor(expPercent)}%</span>
              </div>
               <div className="h-3 bg-gray-200 border-2 border-black w-full relative">
                <div 
                  className="h-full bg-yellow-400 transition-all duration-300" 
                  style={{ width: `${expPercent}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* GAME INFO (Center) */}
        <div className="flex flex-col items-center gap-3 transform translate-y-2">
           <div className="bg-white border-4 border-black neo-shadow px-8 py-3 flex items-center gap-4">
             <Clock size={28} strokeWidth={3} />
             <span className="text-5xl font-mono font-black tracking-tighter tabular-nums leading-none">
               {formatTime(timer)}
             </span>
           </div>
           
           <div className="bg-black text-white border-4 border-black neo-shadow px-6 py-2 flex items-center gap-3 transform -rotate-1 hover:rotate-0 transition-transform">
             <Skull size={18} />
             <span className="font-mono font-bold text-xl tracking-widest">KILLS: {stats.kills}</span>
           </div>
        </div>

        {/* STATS MONITOR (Right) */}
        <div className="pointer-events-auto flex flex-col items-end">
           <button 
             onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
             className="bg-white border-4 border-black neo-shadow p-2 mb-2 hover:bg-gray-100 transition-colors group"
             title="Toggle Stats"
           >
             {isStatsCollapsed ? <Maximize2 size={24} className="group-hover:scale-110 transition-transform"/> : <Minimize2 size={24} className="group-hover:scale-110 transition-transform"/>}
           </button>

           {!isStatsCollapsed && (
             <div className="bg-white border-4 border-black neo-shadow w-72 p-4 transition-all animate-pop max-h-[50vh] overflow-y-auto">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] border-b-4 border-black pb-2 mb-3 text-center bg-gray-100">
                  THÔNG SỐ VŨ KHÍ
                </div>
                
                {/* GUN */}
                <div className="mb-4 relative">
                   <div className="flex items-center gap-2 mb-2 text-orange-600 border-b-2 border-orange-100 pb-1">
                     <Crosshair size={16} strokeWidth={3} /> <span className="text-xs font-black uppercase tracking-wider">Súng Lục</span>
                   </div>
                   <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-orange-50/50 p-2 rounded border border-orange-100">
                      <MiniStat label="SÁT THƯƠNG" value={`${Math.round(stats.gunDamageMult * 100)}%`} />
                      <MiniStat label="TỐC ĐỘ" value={`${Math.round((1/stats.gunCooldownMult) * 100)}%`} />
                      <MiniStat label="SỐ LƯỢNG" value={`x${stats.gunAmount}`} />
                      <MiniStat label="XUYÊN" value={stats.gunPierce} />
                   </div>
                </div>

                {/* BOOK */}
                <div className="mb-4 relative">
                   <div className="flex items-center gap-2 mb-2 text-purple-600 border-b-2 border-purple-100 pb-1">
                     <Book size={16} strokeWidth={3} /> <span className="text-xs font-black uppercase tracking-wider">Sách Phép</span>
                   </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-purple-50/50 p-2 rounded border border-purple-100">
                      <MiniStat label="SÁT THƯƠNG" value={`${Math.round(stats.bookDamageMult * 100)}%`} />
                      <MiniStat label="TỐC ĐỘ" value={`${Math.round(stats.bookSpeed * 100)}%`} />
                      <MiniStat label="PHẠM VI" value={`${Math.round(stats.bookArea * 100)}%`} />
                      <MiniStat label="SỐ LƯỢNG" value={`x${stats.bookAmount}`} />
                   </div>
                </div>

                {/* LIGHTNING */}
                {stats.lightningAmount > 0 && (
                  <div className="mb-4 relative">
                     <div className="flex items-center gap-2 mb-2 text-cyan-600 border-b-2 border-cyan-100 pb-1">
                       <Zap size={16} strokeWidth={3} /> <span className="text-xs font-black uppercase tracking-wider">Sấm Sét</span>
                     </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-cyan-50/50 p-2 rounded border border-cyan-100">
                        <MiniStat label="SÁT THƯƠNG" value={`${Math.round(stats.lightningDamageMult * 100)}%`} />
                        <MiniStat label="HỒI CHIÊU" value={`${Math.round((1/stats.lightningCooldownMult) * 100)}%`} />
                        <MiniStat label="PHẠM VI" value={`${Math.round(stats.lightningArea * 100)}%`} />
                        <MiniStat label="SỐ LƯỢNG" value={`x${stats.lightningAmount}`} />
                     </div>
                  </div>
                )}

                 {/* NOVA BLAST (New) */}
                {stats.novaUnlocked && (
                  <div className="mb-4 relative">
                     <div className="flex items-center gap-2 mb-2 text-red-600 border-b-2 border-red-100 pb-1">
                       <Bomb size={16} strokeWidth={3} /> <span className="text-xs font-black uppercase tracking-wider">Nova Blast</span>
                     </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-red-50/50 p-2 rounded border border-red-100">
                        <MiniStat label="SÁT THƯƠNG" value={`${Math.round(stats.novaDamageMult * 100)}%`} />
                        <MiniStat label="HỒI CHIÊU" value={`${Math.round((1/stats.novaCooldownMult) * 100)}%`} />
                        <MiniStat label="PHẠM VI" value={`${Math.round(stats.novaArea * 100)}%`} />
                     </div>
                  </div>
                )}

                 {/* PLAYER */}
                <div className="relative">
                   <div className="flex items-center gap-2 mb-2 text-gray-600 border-b-2 border-gray-100 pb-1">
                     <Swords size={16} strokeWidth={3} /> <span className="text-xs font-black uppercase tracking-wider">Nhân Vật</span>
                   </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-gray-50/50 p-2 rounded border border-gray-100">
                      <MiniStat label="MÁU TỐI ĐA" value={stats.maxHP} />
                      <MiniStat label="PHÒNG THỦ" value={stats.armor} />
                      <MiniStat label="TỐC CHẠY" value={Math.round(stats.moveSpeed)} />
                   </div>
                </div>
             </div>
           )}
        </div>

      </div>

      {/* BOTTOM CENTER - BOSS BAR */}
      {/* Position absolute to guarantee it stays at bottom even if stats panel is open/tall */}
      {activeBoss && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-3xl pointer-events-auto animate-pop z-50 px-6">
           <div className="flex justify-between items-end mb-2 px-2">
              <div className="bg-red-600 text-white px-4 py-2 border-4 border-black font-black uppercase italic text-xl transform -skew-x-12 neo-shadow tracking-widest">
                 ⚠️ {activeBoss.type === 'BOSS_1' ? 'CỖ MÁY HUỶ DIỆT' : activeBoss.type === 'BOSS_2' ? 'XẠ THỦ BÓNG ĐÊM' : 'TRÙM CUỐI'}
              </div>
              <div className="font-mono font-bold bg-black text-white px-3 py-1 border-4 border-white text-lg shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                {Math.ceil(activeBoss.hp)} / {Math.ceil(activeBoss.maxHP)}
              </div>
           </div>
           <div className="h-8 bg-black border-4 border-black p-1 neo-shadow relative">
             <div 
               className="h-full bg-red-600 transition-all duration-100 relative overflow-hidden" 
               style={{ width: `${(activeBoss.hp / activeBoss.maxHP) * 100}%` }}
             >
                {/* Danger stripes */}
                <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'}}></div>
                {/* Glare */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-white opacity-20"></div>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

const MiniStat = ({ label, value }: { label: string, value: string | number }) => (
  <div className="flex justify-between items-center text-[10px] font-mono border-b border-gray-200/50 last:border-0 pb-0.5">
    <span className="text-gray-500 font-bold">{label}</span>
    <span className="font-black text-black">{value}</span>
  </div>
);

export default HUD;
