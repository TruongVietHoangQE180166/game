
import React from 'react';
import { X, Gamepad2, AlertTriangle, Swords } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black neo-shadow w-[900px] h-[80vh] flex flex-col">
        <div className="bg-[oklch(0.9680_0.2110_109.7692)] text-black px-4 py-2 flex justify-between items-center border-b-4 border-black">
          <span className="font-mono font-bold uppercase tracking-widest">MANUAL.PDF</span>
          <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2 font-black border-2 border-black bg-white flex items-center gap-2 transition-colors">
            <X className="w-4 h-4" /> ĐÓNG
          </button>
        </div>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
                <Gamepad2 className="w-8 h-8" strokeWidth={2.5} /> Điều Khiển
              </h3>
              <div className="flex gap-4 mb-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 border-4 border-black flex items-center justify-center font-black bg-gray-100">W</div>
                  <div className="flex gap-2">
                    <div className="w-12 h-12 border-4 border-black flex items-center justify-center font-black bg-gray-100">A</div>
                    <div className="w-12 h-12 border-4 border-black flex items-center justify-center font-black bg-gray-100">S</div>
                    <div className="w-12 h-12 border-4 border-black flex items-center justify-center font-black bg-gray-100">D</div>
                  </div>
                </div>
                <div className="flex items-center text-lg font-bold ml-4">
                  Di chuyển nhân vật
                </div>
              </div>

              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
                <AlertTriangle className="w-8 h-8" strokeWidth={2.5} /> Lưu Ý
              </h3>
              <ul className="space-y-4 font-bold border-l-4 border-black pl-4">
                <li className="text-red-600">THU HẸP VÒNG BO: <span className="text-black font-medium">Mỗi 10 cấp độ, vòng bo sẽ xuất hiện. Ở lại bên trong hoặc chết.</span></li>
                <li className="text-blue-600">GIÁP NĂNG LƯỢNG: <span className="text-black font-medium">Giáp phục hồi sau khi lên cấp. Nó chịu sát thương thay cho Máu.</span></li>
              </ul>
            </div>

            <div>
              <h3 className="text-3xl font-black mb-6 uppercase flex items-center gap-3">
                <Swords className="w-8 h-8" strokeWidth={2.5} /> Kho Vũ Khí
              </h3>
              <div className="space-y-4">
                <div className="border-4 border-black p-4 bg-yellow-50 neo-shadow-sm">
                  <div className="flex justify-between mb-2">
                    <strong className="text-orange-600 text-xl font-black">SÚNG LỤC</strong>
                    <span className="text-xs bg-black text-white px-2 py-1 font-mono">TẦM XA</span>
                  </div>
                  <p className="text-sm font-medium">Bắn đạn thẳng về phía kẻ địch gần nhất. Nâng cấp để tăng số lượng đạn và khả năng xuyên thấu.</p>
                </div>
                <div className="border-4 border-black p-4 bg-purple-50 neo-shadow-sm">
                  <div className="flex justify-between mb-2">
                    <strong className="text-purple-600 text-xl font-black">SÁCH PHÉP</strong>
                    <span className="text-xs bg-black text-white px-2 py-1 font-mono">CẬN CHIẾN</span>
                  </div>
                  <p className="text-sm font-medium">Xoay quanh người chơi bảo vệ khỏi kẻ địch lao vào. Tăng kích thước và tốc độ quay khi nâng cấp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
