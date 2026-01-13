
import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Zap, Shield, Cpu, Wifi, Radio } from 'lucide-react';

interface LoadingScreenProps {
  progress: number;
}

const TIPS = [
  { title: "CHIẾN THUẬT DI CHUYỂN", text: "Đừng đứng yên! Kẻ địch sẽ bao vây bạn rất nhanh. Hãy di chuyển theo hình tròn để gom quái." },
  { title: "SỨC MẠNH TRI THỨC", text: "Trả lời đúng câu hỏi Lịch sử/Tư tưởng giúp bạn nhận được Buff mạnh mẽ. Trả lời sai chỉ hồi máu nhẹ." },
  { title: "CẢNH BÁO BOSS", text: "Boss xuất hiện ở phút 2, 4 và 6. Khi Boss ra, một vòng bo điện từ sẽ xuất hiện. Đừng bước ra ngoài!" },
  { title: "TỐI ƯU HÓA", text: "Súng Lục mạnh về đơn mục tiêu (Diệt Boss). Sách Phép mạnh về diện rộng (Dọn quái). Hãy cân bằng cả hai." },
  { title: "THÔNG TIN LỊCH SỬ", text: "Năm 1911, Bác Hồ ra đi tìm đường cứu nước tại Bến cảng Nhà Rồng." },
  { title: "THÔNG TIN LỊCH SỬ", text: "Tư tưởng Hồ Chí Minh là ngọn đuốc soi đường cho cách mạng Việt Nam." }
];

const SYSTEM_LOGS = [
  "INITIALIZING_CORE_SYSTEM...",
  "LOADING_ASSETS_PACK_V2...",
  "CONNECTING_TO_HISTORY_DATABASE...",
  "CALIBRATING_WEAPON_SYSTEMS...",
  "SCANNING_TERRAIN_DATA...",
  "DETECTING_HOSTILE_SIGNALS...",
  "OPTIMIZING_PARTICLE_SHADERS...",
  "SYNCING_LEADERBOARD_DATA...",
  "ESTABLISHING_NEURAL_LINK...",
  "PREPARING_BATTLEFIELD..."
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * TIPS.length));
  }, []);

  // Simulate logs appearing based on progress
  useEffect(() => {
    const logIndex = Math.floor((progress / 100) * SYSTEM_LOGS.length);
    const visibleLogs = SYSTEM_LOGS.slice(0, Math.max(1, logIndex));
    setLogs(visibleLogs);
    
    // Auto scroll logs
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [progress]);

  const currentTip = TIPS[tipIndex];

  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-yellow-400 overflow-hidden font-mono cursor-wait">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ 
             backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, 
             backgroundSize: '40px 40px' 
           }}>
      </div>
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.4)_100%)] pointer-events-none"></div>

      {/* Main Interface Container */}
      <div className="relative z-10 w-full max-w-5xl h-screen md:h-auto md:aspect-video p-4 md:p-8 flex flex-col justify-between">
        
        {/* HEADER: TOP BAR */}
        <div className="flex justify-between items-start">
            <div className="bg-black text-white px-4 py-2 border-2 border-white shadow-[4px_4px_0_0_rgba(0,0,0,0.2)]">
                <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                    <Radio className="animate-pulse text-red-500" />
                    SYSTEM BOOT
                </h1>
            </div>
            <div className="hidden md:flex flex-col items-end font-bold text-xs gap-1">
                <div className="flex items-center gap-2"><Wifi size={14}/> SERVER: ONLINE</div>
                <div className="flex items-center gap-2"><Cpu size={14}/> MEMORY: OK</div>
                <div className="flex items-center gap-2"><Zap size={14}/> POWER: 98%</div>
            </div>
        </div>

        {/* CENTER: CONTENT */}
        <div className="flex-1 flex flex-col md:flex-row items-stretch gap-6 my-8">
            
            {/* LEFT: LOGS (Terminal Style) */}
            <div className="flex-1 bg-black border-4 border-black p-1 shadow-[8px_8px_0_0_rgba(0,0,0,0.2)] flex flex-col min-h-[200px]">
                <div className="bg-gray-800 px-3 py-1 text-[10px] text-gray-400 flex justify-between items-center border-b border-gray-700">
                    <span className="flex items-center gap-2"><Terminal size={12}/> ROOT@SYSTEM:~/LOGS</span>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                </div>
                <div ref={logContainerRef} className="flex-1 p-4 font-mono text-xs md:text-sm text-green-500 overflow-y-auto space-y-1 scrollbar-hide">
                    {logs.map((log, idx) => (
                        <div key={idx} className="opacity-80">
                            <span className="text-gray-500 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            <span className="animate-pulse">➜</span> {log}
                        </div>
                    ))}
                    <div className="animate-pulse text-green-400 font-bold mt-2">_</div>
                </div>
            </div>

            {/* RIGHT: INTEL CARD */}
            <div className="flex-1 md:max-w-md bg-white border-4 border-black p-6 shadow-[8px_8px_0_0_#000] relative transform md:rotate-1 transition-transform hover:rotate-0">
                {/* Decorative Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-300/80 px-4 py-1 text-[10px] font-black tracking-widest border border-black transform -rotate-1 shadow-sm">
                    TOP SECRET INTEL
                </div>

                <div className="h-full flex flex-col justify-center">
                    <h3 className="text-xl font-black uppercase text-blue-600 mb-2 flex items-center gap-2 border-b-2 border-blue-100 pb-2">
                        <Shield size={20} className="fill-current" /> {currentTip.title}
                    </h3>
                    <p className="text-sm md:text-base font-bold text-gray-700 leading-relaxed text-justify">
                        {currentTip.text}
                    </p>
                    <div className="mt-auto pt-4 flex gap-2 opacity-50">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-1 flex-1 bg-black skew-x-12"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* FOOTER: PROGRESS BAR */}
        <div className="relative">
            <div className="flex justify-between items-end mb-2">
                <span className="text-xs md:text-sm font-black bg-black text-white px-2 py-1">LOADING_RESOURCES</span>
                <span className="text-4xl md:text-6xl font-black italic tracking-tighter">{Math.floor(progress)}%</span>
            </div>
            
            {/* The Bar Container */}
            <div className="h-8 md:h-12 w-full border-4 border-black bg-white p-1 relative shadow-[4px_4px_0_0_#000]">
                {/* The Fill */}
                <div 
                    className="h-full bg-black transition-all duration-100 ease-out relative overflow-hidden flex items-center" 
                    style={{ width: `${progress}%` }}
                >
                    {/* Hazard Stripes Pattern */}
                    <div className="absolute inset-0 opacity-30" 
                         style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #333 10px, #333 20px)' }}>
                    </div>
                    
                    {/* White Glare/Shimmer */}
                    <div className="absolute top-0 right-0 bottom-0 w-1 bg-white shadow-[0_0_10px_#fff]"></div>
                </div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] font-bold text-black/50">
                <span>UID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                <span>BUILD_VER: 2.1.0</span>
            </div>
        </div>

      </div>
      
      {/* Bottom Right Decorative Big Text */}
      <div className="absolute bottom-[-20px] right-[-20px] text-[150px] font-black text-black opacity-[0.03] pointer-events-none select-none leading-none">
        LOAD
      </div>
    </div>
  );
};

export default LoadingScreen;
