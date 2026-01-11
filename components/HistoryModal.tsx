
import React from 'react';
import { X } from 'lucide-react';
import { GameHistory } from '../types';

interface HistoryModalProps {
  history: GameHistory[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#f0f0f0] border-4 border-black neo-shadow w-[800px] h-[70vh] flex flex-col">
        {/* Window Header */}
        <div className="bg-black text-white px-4 py-2 flex justify-between items-center border-b-4 border-black">
          <span className="font-mono font-bold uppercase tracking-widest">SYSTEM.HISTORY_LOG</span>
          <button onClick={onClose} className="hover:bg-red-500 px-2 font-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <h2 className="text-4xl font-black italic uppercase mb-6 border-b-4 border-black inline-block">Lịch Sử Chiến Đấu</h2>
          <table className="w-full text-left font-mono border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-3 border-2 border-black">NGÀY</th>
                <th className="p-3 border-2 border-black">THỜI GIAN</th>
                <th className="p-3 border-2 border-black">CẤP ĐỘ</th>
                <th className="p-3 border-2 border-black text-right">DIỆT</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={h.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-yellow-100`}>
                  <td className="p-3 border-2 border-black font-bold">{h.date}</td>
                  <td className="p-3 border-2 border-black">{h.timeSurvived}</td>
                  <td className="p-3 border-2 border-black text-[oklch(0.6489_0.2370_26.9728)] font-black">{h.level}</td>
                  <td className="p-3 border-2 border-black text-right font-black">{h.kills}</td>
                </tr>
              ))}
              {history.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-500 italic border-2 border-black">Chưa có dữ liệu chiến đấu.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
