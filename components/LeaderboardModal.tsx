
import React, { useEffect, useState, useCallback } from 'react';
import { X, Trophy, Skull, Clock, Medal, RefreshCw, Loader2, AlertTriangle, WifiOff } from 'lucide-react';
import { LeaderboardEntry } from '../types';
import { fetchLeaderboard } from '../logic/supabaseClient';

interface LeaderboardModalProps {
  onClose: () => void;
}

const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
      setLoading(true);
      setError(null);
      
      // Artificial delay to show loading state (optional, remove in prod if desired)
      // await new Promise(resolve => setTimeout(resolve, 500)); 

      const { data, error: fetchError } = await fetchLeaderboard();
      
      if (fetchError) {
          setError(fetchError);
          setEntries([]);
      } else {
          setEntries(data);
      }
      
      setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
      <div className="bg-[#f8fafc] border-4 border-black neo-shadow w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-pop">
        
        {/* Header */}
        <div className="bg-yellow-400 px-6 py-4 flex justify-between items-center border-b-4 border-black shrink-0">
          <div className="flex items-center gap-3">
             <Trophy size={32} className="text-black" />
             <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-black">BẢNG XẾP HẠNG</h2>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={loadData} 
                disabled={loading}
                className="bg-white text-black p-2 border-2 border-black hover:bg-gray-100 hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Làm mới dữ liệu"
            >
                <RefreshCw size={24} strokeWidth={3} className={`group-hover:rotate-180 transition-transform duration-500 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="bg-black text-white p-2 hover:bg-gray-800 transition-colors border-2 border-black">
                <X size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-0 bg-white relative">
          
          {/* Loading Overlay */}
          {loading && (
             <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="bg-black text-white p-6 border-4 border-black neo-shadow flex flex-col items-center gap-3">
                    <Loader2 size={48} className="animate-spin text-yellow-400" />
                    <span className="font-black font-mono tracking-widest animate-pulse">ĐANG TẢI DỮ LIỆU...</span>
                </div>
             </div>
          )}

          <table className="w-full text-left border-collapse">
             <thead className="bg-black text-white sticky top-0 z-10 shadow-md">
                <tr>
                    <th className="p-4 font-black uppercase text-sm w-16 text-center">#</th>
                    <th className="p-4 font-black uppercase text-sm">Tên Chiến Binh</th>
                    <th className="p-4 font-black uppercase text-sm text-center"><Clock size={16} className="inline mr-1"/> Thời Gian</th>
                    <th className="p-4 font-black uppercase text-sm text-center">Level</th>
                    <th className="p-4 font-black uppercase text-sm text-center"><Skull size={16} className="inline mr-1"/> Kills</th>
                </tr>
             </thead>
             <tbody className="font-mono text-sm font-bold">
                {error ? (
                    <tr>
                        <td colSpan={5} className="p-12 text-center">
                           <div className="flex flex-col items-center justify-center gap-4 text-red-600 bg-red-50 p-8 border-4 border-red-200 rounded-lg max-w-lg mx-auto">
                              <AlertTriangle size={48} strokeWidth={2} />
                              <div>
                                <h3 className="text-xl font-black uppercase mb-1">LỖI KẾT NỐI SERVER</h3>
                                <p className="font-mono text-sm bg-white border border-red-300 p-2 rounded text-red-800 break-all">
                                   {error}
                                </p>
                              </div>
                              <button onClick={loadData} className="mt-2 bg-red-600 text-white px-4 py-2 font-bold uppercase text-xs hover:bg-red-700 transition-colors">
                                 Thử lại
                              </button>
                           </div>
                        </td>
                    </tr>
                ) : entries.length === 0 && !loading ? (
                    <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-400">
                           <div className="flex flex-col items-center justify-center gap-2">
                              <WifiOff size={48} className="opacity-20" />
                              <p>CHƯA CÓ DỮ LIỆU GHI NHẬN</p>
                           </div>
                        </td>
                    </tr>
                ) : (
                    entries.map((entry, index) => {
                        let rowClass = "border-b border-gray-200 hover:bg-gray-50 transition-colors";
                        let rankIcon = <span className="text-gray-500">#{index + 1}</span>;
                        
                        if (index === 0) {
                            rowClass = "bg-yellow-50 hover:bg-yellow-100 border-b-2 border-yellow-200";
                            rankIcon = <Medal className="mx-auto text-yellow-500 drop-shadow-sm" fill="currentColor" size={28} />;
                        } else if (index === 1) {
                            rowClass = "bg-gray-50 hover:bg-gray-100 border-b border-gray-200";
                            rankIcon = <Medal className="mx-auto text-gray-400 drop-shadow-sm" fill="currentColor" size={24} />;
                        } else if (index === 2) {
                            rowClass = "bg-orange-50 hover:bg-orange-100 border-b border-orange-200";
                            rankIcon = <Medal className="mx-auto text-orange-600 drop-shadow-sm" fill="currentColor" size={24} />;
                        }

                        return (
                            <tr key={entry.id || index} className={rowClass}>
                                <td className="p-4 text-center text-lg align-middle">{rankIcon}</td>
                                <td className="p-4 font-sans font-black text-lg uppercase align-middle text-gray-800">{entry.name}</td>
                                <td className="p-4 text-center font-black text-xl text-blue-600 align-middle">{formatTime(entry.time_survived)}</td>
                                <td className="p-4 text-center align-middle"><span className="bg-gray-200 px-3 py-1 rounded font-bold text-xs text-gray-700 border border-gray-300">LV {entry.level}</span></td>
                                <td className="p-4 text-center text-red-600 font-black text-lg align-middle">{entry.kills}</td>
                            </tr>
                        );
                    })
                )}
             </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-3 border-t-4 border-black flex justify-between items-center text-[10px] md:text-xs font-bold text-gray-500 uppercase">
            <span>Rank tính theo thời gian sống sót lâu nhất</span>
            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> LIVE UPDATE</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
