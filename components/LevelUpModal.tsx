
import React from 'react';
import { Buff, Rarity } from '../types';
import { 
  Crosshair, BookOpen, Zap, Flame, Heart, Shield, 
  ChevronsRight, ArrowUpCircle, MousePointer2
} from 'lucide-react';

interface LevelUpModalProps {
  options: Buff[];
  onSelect: (buff: Buff) => void;
  title?: string;
  tagline?: string;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ options, onSelect, title = "LÊN CẤP!", tagline = "// HỆ THỐNG NÂNG CẤP //" }) => {
  
  // Helper to determine styling based on Rarity
  const getRarityStyles = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: 
        return { 
          borderColor: 'border-gray-500', 
          bg: 'bg-gray-100',
          headerBg: 'bg-gray-500', 
          textColor: 'text-gray-900',
          iconBg: 'bg-white',
          label: 'THƯỜNG'
        };
      case Rarity.UNCOMMON: 
        return { 
          borderColor: 'border-green-600', 
          bg: 'bg-green-50',
          headerBg: 'bg-green-600',
          textColor: 'text-green-900',
          iconBg: 'bg-green-100',
          label: 'KHÁ'
        };
      case Rarity.RARE: 
        return { 
          borderColor: 'border-blue-600', 
          bg: 'bg-blue-50',
          headerBg: 'bg-blue-600',
          textColor: 'text-blue-900',
          iconBg: 'bg-blue-100',
          label: 'HIẾM'
        };
      case Rarity.EPIC: 
        return { 
          borderColor: 'border-purple-600', 
          bg: 'bg-purple-50',
          headerBg: 'bg-purple-600',
          textColor: 'text-purple-900',
          iconBg: 'bg-purple-100',
          label: 'CỰC HIẾM'
        };
      case Rarity.LEGENDARY: 
        return { 
          borderColor: 'border-yellow-500', 
          bg: 'bg-yellow-50',
          headerBg: 'bg-yellow-500',
          textColor: 'text-yellow-900',
          iconBg: 'bg-yellow-100',
          label: 'HUYỀN THOẠI'
        };
      case Rarity.MYTHIC: 
        return { 
          borderColor: 'border-orange-600', 
          bg: 'bg-orange-50',
          headerBg: 'bg-orange-600',
          textColor: 'text-orange-900',
          iconBg: 'bg-orange-100',
          label: 'THẦN THOẠI'
        };
      case Rarity.GODLY: 
        return { 
          borderColor: 'border-red-600', 
          bg: 'bg-red-50',
          headerBg: 'bg-red-600',
          textColor: 'text-red-900',
          iconBg: 'bg-red-100',
          label: 'THƯỢNG CỔ'
        };
      default: 
        return { 
          borderColor: 'border-black', 
          bg: 'bg-white',
          headerBg: 'bg-black',
          textColor: 'text-black',
          iconBg: 'bg-gray-100',
          label: 'UNKNOWN'
        };
    }
  };

  const renderIcon = (buff: Buff, className: string) => {
      if (buff.type === 'GUN_BUFF') return <Crosshair className={className} strokeWidth={2} />;
      if (buff.type === 'BOOK_BUFF') return <BookOpen className={className} strokeWidth={2} />;
      if (buff.type === 'LIGHTNING_BUFF') return <Zap className={className} strokeWidth={2} />;
      if (buff.type === 'NOVA_BUFF') return <Flame className={className} strokeWidth={2} />;
      
      const lowerName = buff.name.toLowerCase();
      const lowerDesc = buff.description.toLowerCase();

      if (lowerDesc.includes('hồi máu') || lowerName.includes('trái tim')) return <Heart className={className} strokeWidth={2} />;
      if (lowerDesc.includes('giáp') || lowerDesc.includes('khiên')) return <Shield className={className} strokeWidth={2} />;
      if (lowerDesc.includes('tốc độ') || lowerName.includes('giày')) return <ChevronsRight className={className} strokeWidth={2} />;
      
      return <ArrowUpCircle className={className} strokeWidth={2} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans overflow-y-auto">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Main Header - Redesigned */}
      <div className="mb-8 text-center animate-pop relative z-10 flex flex-col items-center gap-3 shrink-0">
         
         {/* Tagline */}
         <div className="bg-black px-6 py-2 border-2 border-white/30 transform -skew-x-12 shadow-[4px_4px_0_0_rgba(255,255,255,0.1)]">
            <span className="block transform skew-x-12 font-mono font-bold text-sm tracking-[0.3em] uppercase text-cyan-400">
               {tagline}
            </span>
         </div>

         {/* Title */}
         <h1 className="relative">
            <span className="block text-6xl md:text-8xl font-black italic uppercase text-yellow-400 tracking-tighter leading-none"
                  style={{ 
                    textShadow: '6px 6px 0px #000', 
                    WebkitTextStroke: '2px black'
                  }}>
               {title}
            </span>
            {/* Decoration Underline */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[110%] h-4 bg-red-600 transform -skew-x-12 -z-10 border-2 border-black"></div>
         </h1>
      </div>
        
      {/* Cards Container - Horizontal Row */}
      <div className="flex flex-row flex-wrap justify-center gap-4 w-full max-w-7xl items-stretch z-10 pb-8">
        {options.map((buff, idx) => {
          const style = getRarityStyles(buff.rarity);
          return (
            <div
              key={idx}
              onClick={() => onSelect(buff)}
              className={`
                group relative w-[200px] md:w-[240px] cursor-pointer flex flex-col
                ${style.bg} border-4 ${style.borderColor}
                transition-all duration-200 ease-out
                hover:-translate-y-4 hover:rotate-1 hover:z-20
                hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)]
                shadow-[4px_4px_0_0_rgba(0,0,0,1)]
              `}
            >
              {/* Rarity Header Bar */}
              <div className={`${style.headerBg} py-1.5 px-2 border-b-4 ${style.borderColor} flex justify-between items-center shrink-0`}>
                 <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] truncate mr-2">
                    {style.label}
                 </span>
                 <div className="flex gap-0.5 shrink-0">
                    {[...Array(buff.rarity === Rarity.GODLY ? 3 : 1)].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-white rotate-45"></div>
                    ))}
                 </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 p-4 flex flex-col items-center text-center relative">
                  
                  {/* Icon Box - Fixed Size */}
                  <div className={`
                     w-14 h-14 mb-3 flex items-center justify-center shrink-0
                     border-4 ${style.borderColor} ${style.iconBg}
                     group-hover:scale-110 transition-transform duration-200
                     shadow-[3px_3px_0_0_rgba(0,0,0,0.2)]
                     relative
                  `}>
                     {renderIcon(buff, `w-7 h-7 ${style.textColor}`)}
                     
                     {/* Corner decorative pixels */}
                     <div className={`absolute top-0.5 left-0.5 w-1 h-1 ${style.headerBg}`}></div>
                     <div className={`absolute top-0.5 right-0.5 w-1 h-1 ${style.headerBg}`}></div>
                     <div className={`absolute bottom-0.5 left-0.5 w-1 h-1 ${style.headerBg}`}></div>
                     <div className={`absolute bottom-0.5 right-0.5 w-1 h-1 ${style.headerBg}`}></div>
                  </div>

                  {/* Title - Flexible Height */}
                  <h3 className={`w-full text-sm md:text-base font-black uppercase italic leading-tight mb-3 ${style.textColor} drop-shadow-sm break-words`}>
                    {buff.name}
                  </h3>
                  
                  {/* Divider */}
                  <div className={`w-8 h-1 ${style.headerBg} mb-3 opacity-50 shrink-0`}></div>

                  {/* Description - Flexible Height */}
                  <div className="flex-1 flex items-start justify-center w-full">
                    <p className={`text-[11px] md:text-[12px] font-bold font-mono ${style.textColor} leading-snug opacity-90 break-words w-full`}>
                        {buff.description}
                    </p>
                  </div>
              </div>

              {/* Action Button - Compact */}
              <div className={`p-2 bg-white border-t-4 ${style.borderColor} mt-auto shrink-0`}>
                 <div className={`
                    w-full py-2 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5
                    bg-black text-white 
                    group-hover:bg-yellow-400 group-hover:text-black
                    transition-colors duration-100 border-2 border-transparent
                 `}>
                    <MousePointer2 size={12} strokeWidth={3} />
                    CHỌN
                 </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Hint */}
      <div className="mt-4 bg-black/50 px-4 py-1 rounded-full text-white/70 font-mono text-[10px] uppercase border border-white/20 shrink-0">
         Nhấp vào thẻ để chọn phần thưởng
      </div>
    </div>
  );
};

export default LevelUpModal;
