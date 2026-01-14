
import React, { useState } from 'react';
import { PlayerStats, Enemy } from '../types';
import { 
  Heart, Shield, Skull, Clock, 
  Crosshair, Book, Maximize2, Minimize2, Swords, Zap, Bomb,
  Activity, AlertOctagon, HeartPulse, Cpu, AlertTriangle
} from 'lucide-react';

interface HUDProps {
  stats: PlayerStats;
  timer: number;
  activeBosses: Enemy[];
}

const HUD: React.FC<HUDProps> = ({ stats, timer, activeBosses }) => {
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(true);

  // Calculate percentages strictly clamped
  const hpPercent = Math.min(100, Math.max(0, (stats.hp / stats.maxHP) * 100));
  const armorPercent = Math.min(100, Math.max(0, (stats.currentArmor / stats.maxArmor) * 100));
  const expPercent = Math.min(100, Math.max(0, (stats.exp / stats.expToNext) * 100));

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getBossTitle = (type: string) => {
      switch(type) {
          case 'BOSS_1': return 'CỖ MÁY HUỶ DIỆT';
          case 'BOSS_2': return 'XẠ THỦ BÓNG ĐÊM';
          case 'BOSS_3': return 'ĐẠI TƯỚNG QUÂN';
          default: return 'BOSS';
      }
  };

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-40 font-sans flex flex-col justify-between overflow-hidden">
      
      {/* === TOP EDGE: GLOBAL XP BAR === */}
      <div className="w-full h-4 bg-gray-900 border-b-2 border-black relative pointer-events-auto z-50">
         <div 
            className="h-full bg-yellow-400 transition-all duration-300 ease-out relative"
            style={{ width: `${expPercent}%` }}
         >
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_#fff]"></div>
         </div>
         
         {/* Level Badge - INCREASED SIZE */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-yellow-400 border-2 border-yellow-400 px-6 py-1 transform skew-x-12 shadow-[0_4px_0_rgba(0,0,0,0.5)] z-20">
            <span className="block transform -skew-x-12 font-black text-xl md:text-2xl tracking-widest leading-none drop-shadow-md">
               LVL.{stats.level}
            </span>
         </div>
      </div>

      {/* === MAIN LAYOUT CONTAINER === */}
      <div className="flex-1 p-4 md:p-6 relative">

        {/* --- TOP ROW --- */}
        <div className="w-full flex justify-between items-start relative z-40">
           
           {/* LEFT: PLAYER VITALS */}
           <div className="pointer-events-auto transform -skew-x-6 origin-top-left transition-all hover:skew-x-0">
              <div className="flex flex-col gap-2">
                  {/* HP - NO TRANSITIONS, INSTANT UPDATE */}
                  <div className="bg-black/90 backdrop-blur text-red-500 p-3 border-l-8 border-red-600 shadow-[8px_8px_0_0_rgba(0,0,0,0.3)] min-w-[240px] md:min-w-[280px]">
                       <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-black tracking-[0.2em] uppercase flex items-center gap-1">
                            <Heart size={12} fill="currentColor"/> Sinh Lực
                          </span>
                          <span className="text-sm font-mono font-bold text-white">{Math.ceil(stats.hp)}<span className="text-gray-500 text-[10px]">/{stats.maxHP}</span></span>
                      </div>
                      <div className="h-4 bg-gray-900 w-full overflow-hidden border border-gray-700 relative group">
                          {/* Removing transition-all duration-200 to make it instant */}
                          <div 
                            className={`h-full bg-red-600 relative ${hpPercent < 20 ? 'animate-pulse' : ''}`}
                            style={{ width: `${hpPercent}%` }}
                          >
                              <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)'}}></div>
                          </div>
                      </div>
                  </div>

                  {/* SECOND CHANCE & ARMOR ROW */}
                  <div className="flex gap-2 items-stretch">
                      
                      {/* SECOND CHANCE INDICATOR - SIMPLIFIED */}
                      <div className={`
                         flex items-center justify-center px-4 bg-black/80 backdrop-blur border-l-4 shadow-lg
                         ${stats.secondChance > 0 ? 'border-green-500' : 'border-gray-800'}
                      `}>
                          {stats.secondChance > 0 ? (
                              <Heart size={28} className="text-green-500 fill-green-500 animate-pulse drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                          ) : (
                              <Heart size={28} className="text-gray-700" />
                          )}
                      </div>

                      {/* ARMOR - NO TRANSITIONS */}
                      <div className="flex-1 bg-black/80 backdrop-blur text-blue-400 p-2 border-l-4 border-blue-500 shadow-lg min-w-[150px]">
                          <div className="flex justify-between items-center mb-1 text-[10px] font-bold tracking-widest uppercase">
                              <span className="flex items-center gap-1"><Shield size={10} /> Giáp</span>
                              <span className="font-mono">{Math.ceil(stats.currentArmor)}/{stats.maxArmor}</span>
                          </div>
                          <div className="h-2 bg-gray-900 w-full overflow-hidden relative">
                              <div 
                                className="h-full bg-blue-500 relative"
                                style={{ width: `${armorPercent}%` }}
                              >
                                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] opacity-50 w-full animate-shine"></div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
           </div>

           {/* CENTER: COMMAND DECK (Timer & Kills) */}
           <div className="absolute left-1/2 -translate-x-1/2 top-0 flex flex-col items-center gap-1 group pointer-events-auto pt-6">
              <div className="bg-white border-4 border-black neo-shadow px-6 py-1 md:px-8 md:py-2 relative flex items-center justify-center min-w-[140px]">
                 <div className="absolute top-1 left-1 w-1 h-1 bg-gray-400 rounded-full"></div>
                 <div className="absolute top-1 right-1 w-1 h-1 bg-gray-400 rounded-full"></div>
                 <div className="absolute bottom-1 left-1 w-1 h-1 bg-gray-400 rounded-full"></div>
                 <div className="absolute bottom-1 right-1 w-1 h-1 bg-gray-400 rounded-full"></div>
                 
                 <span className="text-3xl md:text-5xl font-mono font-black tracking-tighter tabular-nums leading-none text-black">
                   {formatTime(timer)}
                 </span>
              </div>
              <div className="bg-black text-white px-4 py-1 border-2 border-white/50 shadow-lg transform -translate-y-2 group-hover:translate-y-0 transition-transform">
                 <div className="flex items-center gap-2 text-xs md:text-sm font-bold tracking-widest">
                    <Skull size={14} className="text-red-500" />
                    <span>DIỆT: {stats.kills}</span>
                 </div>
              </div>
           </div>

           {/* RIGHT: TACTICAL MONITOR (Stats Panel) */}
           <div className="pointer-events-auto flex flex-col items-end z-50">
               <button 
                 onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                 className={`
                    bg-black text-white border-2 border-white p-2 mb-2 transition-all duration-300
                    hover:bg-gray-800 hover:scale-105 active:scale-95 shadow-[4px_4px_0_0_rgba(0,0,0,0.5)]
                    flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider
                 `}
               >
                 {isStatsCollapsed ? (
                    <>
                        <Maximize2 size={16} /> <span>Chỉ Số</span>
                    </>
                 ) : (
                    <>
                        <Minimize2 size={16} /> <span>Thu Gọn</span>
                    </>
                 )}
               </button>

               {!isStatsCollapsed && (
                 <div className="bg-black/95 backdrop-blur-md border-l-4 border-b-4 border-white/20 p-4 w-72 md:w-80 text-white animate-pop origin-top-right shadow-2xl flex flex-col max-h-[60vh]">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-700 pb-2 shrink-0">
                        <Activity size={16} className="text-green-400 animate-pulse" />
                        <span className="font-mono text-xs text-green-400">HỆ_THỐNG_GIÁM_SÁT_v2.1</span>
                    </div>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        <WeaponStatBlock 
                            icon={<Crosshair size={14} />} 
                            name="Súng Lục" 
                            color="text-orange-400" 
                            stats={[
                                { l: "S.Thương", v: `${Math.round(stats.gunDamageMult * 100)}%` },
                                { l: "Tốc độ", v: `${Math.round((1/stats.gunCooldownMult) * 100)}%` },
                                { l: "Số lượng", v: stats.gunAmount },
                                { l: "Xuyên", v: stats.gunPierce },
                            ]}
                        />
                        <WeaponStatBlock 
                            icon={<Book size={14} />} 
                            name="Sách Phép" 
                            color="text-purple-400" 
                            stats={[
                                { l: "S.Thương", v: `${Math.round(stats.bookDamageMult * 100)}%` },
                                { l: "Tốc độ", v: `${Math.round(stats.bookSpeed * 100)}%` },
                                { l: "P.Vi", v: `${Math.round(stats.bookArea * 100)}%` },
                                { l: "Số lượng", v: stats.bookAmount },
                            ]}
                        />
                        {stats.lightningAmount > 0 && (
                            <WeaponStatBlock 
                                icon={<Zap size={14} />} 
                                name="Sấm Sét" 
                                color="text-cyan-400" 
                                stats={[
                                    { l: "S.Thương", v: `${Math.round(stats.lightningDamageMult * 100)}%` },
                                    { l: "H.Chiêu", v: `${Math.round((1/stats.lightningCooldownMult) * 100)}%` },
                                    { l: "P.Vi", v: `${Math.round(stats.lightningArea * 100)}%` },
                                    { l: "Số lượng", v: stats.lightningAmount },
                                ]}
                            />
                        )}
                        {stats.novaUnlocked && (
                            <WeaponStatBlock 
                                icon={<Bomb size={14} />} 
                                name="Nova Blast" 
                                color="text-red-400" 
                                stats={[
                                    { l: "S.Thương", v: `${Math.round(stats.novaDamageMult * 100)}%` },
                                    { l: "H.Chiêu", v: `${Math.round((1/stats.novaCooldownMult) * 100)}%` },
                                    { l: "P.Vi", v: `${Math.round(stats.novaArea * 100)}%` },
                                ]}
                            />
                        )}
                        
                        {/* PLAYER STATS - FULLY TRANSLATED & COMPLETE */}
                        <WeaponStatBlock 
                             icon={<Swords size={14} />}
                             name="Chỉ Số Nhân Vật"
                             color="text-gray-400"
                             stats={[
                                 { l: "Tốc chạy", v: Math.round(stats.moveSpeed) },
                                 { l: "Hồi Máu/s", v: stats.hpRegen.toFixed(1) },
                                 { l: "Hồi Giáp/s", v: stats.armorRegen.toFixed(1) },
                                 { l: "Giáp cứng", v: stats.armor.toFixed(1) },
                             ]}
                        />
                    </div>
                 </div>
               )}
           </div>
        </div>

        {/* --- BOTTOM ROW: BOSS BARS (Exclusive Area) --- */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center items-end pointer-events-auto px-4 z-30">
            {activeBosses.length > 0 && (
                <div className="flex items-end gap-3 w-full max-w-4xl transition-all duration-500">
                    {activeBosses.map((boss) => (
                        <div key={boss.id} className="flex-1 animate-pop group shadow-[4px_4px_0_0_rgba(0,0,0,0.3)]">
                            {/* Header Info */}
                            <div className="flex justify-between items-center mb-0.5 bg-black/90 backdrop-blur px-2 py-1 border-r-4 border-red-600">
                                    <div className="flex items-center gap-2 text-red-500 overflow-hidden">
                                        <AlertOctagon size={14} className="animate-pulse shrink-0" />
                                        <span className="font-black uppercase tracking-wider truncate text-[10px] md:text-xs leading-none">
                                            {getBossTitle(boss.type)}
                                        </span>
                                    </div>
                                    <span className="font-mono font-bold text-white shrink-0 text-[10px] md:text-xs">
                                    {Math.ceil(boss.hp)} <span className="text-gray-500 hidden md:inline">/ {boss.maxHP}</span>
                                    </span>
                            </div>
                            
                            {/* The Bar - Instant updates */}
                            <div className="h-4 md:h-6 w-full bg-gray-900 border border-gray-600 relative overflow-hidden">
                                    <div 
                                    className="h-full bg-gradient-to-l from-red-600 via-red-500 to-red-900 relative"
                                    style={{ width: `${(boss.hp / boss.maxHP) * 100}%` }}
                                    >
                                        <div className="absolute top-0 bottom-0 right-0 w-[1px] bg-white opacity-60 shadow-[0_0_8px_#fff]"></div>
                                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, #000 5px, #000 10px)'}}></div>
                                    </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1); 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3); 
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5); 
        }
      `}</style>
    </div>
  );
};

// Helper Component for Stats Monitor
const WeaponStatBlock = ({ icon, name, color, stats }: { icon: React.ReactNode, name: string, color: string, stats: {l: string, v: string | number}[] }) => (
    <div className="mb-4 last:mb-0">
        <div className={`flex items-center gap-2 mb-1 ${color} border-b border-gray-800 pb-1`}>
            {icon}
            <span className="font-black text-[10px] uppercase tracking-wider">{name}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {stats.map((s, i) => (
                <div key={i} className="flex justify-between text-[10px] font-mono">
                    <span className="text-gray-500">{s.l}</span>
                    <span className="text-gray-200">{s.v}</span>
                </div>
            ))}
        </div>
    </div>
);

export default HUD;
