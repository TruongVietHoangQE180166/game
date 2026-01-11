
import React from 'react';

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  return (
    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-[#171717] text-white">
      <div className="w-[400px]">
        <div className="flex justify-between text-xs font-mono mb-2">
          <span>ĐANG TẢI DỮ LIỆU...</span>
          <span>{Math.floor(progress)}%</span>
        </div>
        <div className="h-4 w-full border-2 border-white p-0.5">
          <div className="h-full bg-white transition-all duration-200" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="mt-4 text-center font-bold text-[#facc15] animate-pulse">
          {progress < 30 ? "Đang chuẩn bị vũ khí..." : progress < 70 ? "Đang nghiên cứu tư tưởng..." : "Sẵn sàng chiến đấu!"}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
