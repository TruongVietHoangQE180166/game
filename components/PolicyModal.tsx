
import React from 'react';
import { X } from 'lucide-react';

interface PolicyModalProps {
  onClose: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black neo-shadow w-[600px] flex flex-col">
        <div className="bg-gray-200 text-black px-4 py-2 flex justify-between items-center border-b-4 border-black">
          <span className="font-mono font-bold uppercase tracking-widest">SECURITY_POLICY.TXT</span>
          <button onClick={onClose} className="hover:bg-black hover:text-white px-2 font-black border-2 border-black transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8">
          <h2 className="text-3xl font-black italic uppercase mb-6">Cam Kết AI & Bảo Mật</h2>
          <div className="prose font-medium text-justify mb-8">
            <p className="mb-4">
              Trò chơi này được phát triển với sự hỗ trợ của công nghệ Trí tuệ Nhân tạo (AI) tiên tiến để tạo ra trải nghiệm chơi game năng động.
            </p>
            <p>
              Chúng tôi cam kết không thu thập dữ liệu cá nhân của người chơi. Mọi dữ liệu lịch sử đấu chỉ được lưu trữ cục bộ trên thiết bị (Local Storage) của bạn.
            </p>
          </div>
          <button onClick={onClose} className="w-full bg-black text-white px-4 py-4 font-black hover:bg-gray-800 uppercase border-4 border-transparent hover:border-gray-500">
            Tôi Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
