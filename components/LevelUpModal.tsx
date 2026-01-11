
import React from 'react';
import { Buff, Rarity } from '../types';

interface LevelUpModalProps {
  options: Buff[];
  onSelect: (buff: Buff) => void;
}

const LevelUpModal: React.FC<LevelUpModalProps> = ({ options, onSelect }) => {
  const getStyle = (rarity: Rarity) => {
    switch (rarity) {
      case Rarity.COMMON: return 'bg-white border-gray-300 text-black';       // Trắng
      case Rarity.UNCOMMON: return 'bg-green-100 border-green-500 text-black'; // Xanh lá
      case Rarity.RARE: return 'bg-blue-100 border-blue-500 text-black';       // Xanh dương
      case Rarity.EPIC: return 'bg-yellow-100 border-yellow-500 text-black';   // Vàng
      case Rarity.LEGENDARY: return 'bg-purple-100 border-purple-600 text-black'; // Tím
      case Rarity.MYTHIC: return 'bg-orange-100 border-orange-500 text-black';  // Cam
      case Rarity.GODLY: return 'bg-red-600 border-red-900 text-white';        // Đỏ
      default: return 'bg-white border-black';
    }
  };

  const getRarityLabel = (rarity: Rarity) => {
    switch(rarity) {
        case Rarity.COMMON: return 'THƯỜNG';
        case Rarity.UNCOMMON: return 'KHÁ';
        case Rarity.RARE: return 'HIẾM';
        case Rarity.EPIC: return 'CỰC HIẾM';
        case Rarity.LEGENDARY: return 'HUYỀN THOẠI';
        case Rarity.MYTHIC: return 'THẦN THOẠI';
        case Rarity.GODLY: return 'THƯỢNG CỔ';
    }
  }

  const getIcon = (type: string) => {
      switch(type) {
          case 'GUN_BUFF': return '🔫';
          case 'BOOK_BUFF': return '📖';
          case 'LIGHTNING_BUFF': return '⚡';
          case 'NOVA_BUFF': return '💣';
          default: return '❤️';
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm p-4">
      <div className="max-w-6xl w-full flex flex-col items-center">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12 text-black bg-white border-4 border-black neo-shadow px-10 py-4 transform -rotate-2">
          CHỌN CƯỜNG HÓA
        </h1>
        
        <div className="flex flex-wrap justify-center gap-6">
          {options.map((buff, idx) => (
            <div
              key={idx}
              onClick={() => onSelect(buff)}
              className={`
                group relative w-[260px] h-[380px] cursor-pointer border-4 p-6 transition-all duration-200
                hover:-translate-y-4 hover:-translate-x-2 neo-shadow flex flex-col
                ${getStyle(buff.rarity)}
              `}
            >
              <div className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-70">
                {getRarityLabel(buff.rarity)}
              </div>
              
              <div className="flex-1 flex items-center justify-center py-4">
                <div className="text-6xl group-hover:scale-125 transition-transform duration-500">
                  {getIcon(buff.type)}
                </div>
              </div>

              <div className="mt-auto">
                <h3 className="text-lg font-black uppercase italic leading-none mb-2">
                  {buff.name}
                </h3>
                <p className={`text-xs font-bold leading-relaxed mb-6 opacity-90`}>
                  {buff.description}
                </p>
                
                <div className={`
                  w-full py-3 border-2 font-black text-[10px] uppercase tracking-[0.2em] text-center
                  group-hover:bg-black group-hover:text-white transition-colors border-current
                  ${buff.rarity === Rarity.GODLY ? 'bg-white/20 text-white' : 'bg-black/5'}
                `}>
                  CHẤP NHẬN
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LevelUpModal;
