
import React, { useState } from 'react';
import { 
  X, MousePointer2, Keyboard, Crosshair, 
  Zap, Shield, Heart, Skull, BrainCircuit, 
  Swords, Gem, AlertTriangle, Target, Book, Bomb,
  Flame, Ghost, Crown, Star
} from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const KeyCap = ({ char, label }: { char: string, label?: string }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-12 h-12 md:w-14 md:h-14 bg-white border-b-[6px] border-r-4 border-2 border-gray-800 rounded-lg flex items-center justify-center font-black text-xl text-gray-800 shadow-sm active:translate-y-1 active:border-b-2 transition-all cursor-default select-none">
      {char}
    </div>
    {label && <span className="text-[10px] font-bold uppercase text-gray-500">{label}</span>}
  </div>
);

type TabType = 'CONTROLS' | 'GAMEPLAY' | 'SYSTEM' | 'ENEMIES';

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('CONTROLS');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'CONTROLS', label: 'Điều Khiển', icon: <Keyboard size={18} /> },
    { id: 'GAMEPLAY', label: 'Lối Chơi', icon: <Swords size={18} /> },
    { id: 'SYSTEM', label: 'Vũ Khí & Hệ Thống', icon: <Zap size={18} /> },
    { id: 'ENEMIES', label: 'Hồ Sơ Kẻ Thù', icon: <Skull size={18} /> },
  ];

  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-pop">
      <div className="bg-[#f8fafc] border-4 border-black neo-shadow w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#1e293b] text-white px-6 py-4 flex justify-between items-center border-b-4 border-black shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-yellow-400 text-black p-1.5 border-2 border-white transform -rotate-6">
                <BrainCircuit size={24} strokeWidth={2.5} />
             </div>
             <div>
                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-none">CẨM NANG CHIẾN ĐẤU</h2>
                <p className="text-[10px] text-gray-400 font-mono tracking-widest">SURVIVAL HANDBOOK v2.2</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Layout: Sidebar Tabs (Desktop) / Top Tabs (Mobile) + Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-gray-200 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-row md:flex-col shrink-0 overflow-x-auto md:overflow-visible">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex-1 md:flex-none p-4 md:px-6 md:py-5 flex items-center gap-3 font-black uppercase text-sm tracking-wide transition-all relative whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'bg-white text-black md:border-r-0 z-10' 
                                : 'text-gray-500 hover:bg-gray-300 hover:text-black'
                            }
                        `}
                    >
                        {/* Active Indicator Line */}
                        {activeTab === tab.id && (
                            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-400"></div>
                        )}
                        {activeTab === tab.id && (
                            <div className="md:hidden absolute bottom-0 left-0 right-0 h-1 bg-yellow-400"></div>
                        )}
                        
                        <span className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] p-4 md:p-8 relative">
                
                {/* --- TAB: CONTROLS --- */}
                {activeTab === 'CONTROLS' && (
                    <div className="space-y-8 animate-pop max-w-3xl mx-auto">
                        <div className="bg-white p-8 border-4 border-black neo-shadow-sm">
                            <h3 className="text-xl font-black uppercase mb-8 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                                <Keyboard className="text-blue-500"/> Cơ Chế Di Chuyển
                            </h3>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-16">
                                <div className="flex flex-col items-center gap-3">
                                    <KeyCap char="W" />
                                    <div className="flex gap-3">
                                        <KeyCap char="A" />
                                        <KeyCap char="S" label="LÙI" />
                                        <KeyCap char="D" />
                                    </div>
                                </div>
                                <div className="hidden md:flex flex-col items-center justify-center">
                                    <span className="text-4xl font-black text-gray-300 italic">HOẶC</span>
                                    <span className="text-xs font-bold text-gray-400 mt-2">DÙNG PHÍM MŨI TÊN</span>
                                </div>
                                <div className="flex flex-col items-center gap-3">
                                    <KeyCap char="↑" />
                                    <div className="flex gap-3">
                                        <KeyCap char="←" />
                                        <KeyCap char="↓" label="XUỐNG" />
                                        <KeyCap char="→" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-red-50 p-6 border-4 border-black neo-shadow-sm relative overflow-hidden">
                                <div className="absolute top-2 right-2 opacity-10"><Crosshair size={64}/></div>
                                <h4 className="font-black uppercase mb-3 flex items-center gap-2 text-base text-red-700">
                                    <Crosshair size={20} className="text-red-600" /> Tự Động Tấn Công
                                </h4>
                                <p className="text-gray-800 text-sm font-medium leading-relaxed text-justify">
                                    Bạn <strong className="underline decoration-red-500 decoration-2">KHÔNG CẦN</strong> bấm nút bắn. 
                                    Nhân vật sẽ tự động nhắm vào kẻ địch gần nhất hoặc ngẫu nhiên tuỳ theo loại vũ khí.
                                    <br/><br/>
                                    Nhiệm vụ duy nhất của bạn là: <strong className="bg-black text-white px-1">DI CHUYỂN & NÉ TRÁNH</strong>.
                                </p>
                            </div>
                            <div className="bg-blue-50 p-6 border-4 border-black neo-shadow-sm relative overflow-hidden">
                                <div className="absolute top-2 right-2 opacity-10"><MousePointer2 size={64}/></div>
                                <h4 className="font-black uppercase mb-3 flex items-center gap-2 text-base text-blue-700">
                                    <MousePointer2 size={20} className="text-blue-600" /> Tương Tác Chuột
                                </h4>
                                <p className="text-gray-800 text-sm font-medium leading-relaxed text-justify">
                                    Sử dụng <strong>Chuột Trái</strong> để:
                                    <ul className="list-disc list-inside mt-2 space-y-1">
                                        <li>Chọn kỹ năng khi lên cấp.</li>
                                        <li>Trả lời câu hỏi trắc nghiệm.</li>
                                        <li>Xem thông tin chi tiết trên HUD.</li>
                                    </ul>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: GAMEPLAY --- */}
                {activeTab === 'GAMEPLAY' && (
                    <div className="space-y-6 animate-pop max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Step 1 */}
                            <div className="bg-white p-5 border-4 border-black neo-shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 border-2 border-red-500 text-red-600 group-hover:scale-110 transition-transform">
                                    <Skull size={28} />
                                </div>
                                <h4 className="font-black uppercase text-base mb-2">1. Sinh Tồn</h4>
                                <p className="text-sm text-gray-500 font-bold leading-snug">Tiêu diệt kẻ thù, sống sót qua các đợt tấn công ngày càng đông.</p>
                            </div>
                            {/* Step 2 */}
                            <div className="bg-white p-5 border-4 border-black neo-shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 border-2 border-blue-500 text-blue-600 group-hover:scale-110 transition-transform">
                                    <Gem size={28} />
                                </div>
                                <h4 className="font-black uppercase text-base mb-2">2. Thu Thập</h4>
                                <p className="text-sm text-gray-500 font-bold leading-snug">Nhặt <span className="text-blue-600">Ngọc Kinh Nghiệm</span> rơi ra từ quái để lên cấp độ.</p>
                            </div>
                            {/* Step 3 */}
                            <div className="bg-white p-5 border-4 border-black neo-shadow-sm flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
                                <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center mb-4 border-2 border-yellow-500 text-yellow-600 group-hover:scale-110 transition-transform">
                                    <Zap size={28} />
                                </div>
                                <h4 className="font-black uppercase text-base mb-2">3. Tiến Hóa</h4>
                                <p className="text-sm text-gray-500 font-bold leading-snug">Chọn Buff/Vũ khí mới mỗi khi lên cấp. Kết hợp để tối ưu sức mạnh.</p>
                            </div>
                        </div>

                        {/* Quiz Mechanic - Highlight */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-4 border-blue-500 p-6 relative overflow-hidden neo-shadow-sm">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <BrainCircuit size={120} />
                            </div>
                            <h3 className="text-xl font-black uppercase text-blue-800 mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-white px-2 py-1 text-xs transform -rotate-3 border border-blue-800">CƠ CHẾ ĐỘC QUYỀN</span>
                                TRẢ LỜI CÂU HỎI LỊCH SỬ
                            </h3>
                            <p className="text-sm font-bold text-gray-600 mb-6 max-w-2xl">
                                Mỗi khi lên cấp, bạn cần trả lời một câu hỏi về Tư tưởng Hồ Chí Minh hoặc Lịch sử Việt Nam để nhận sức mạnh.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="bg-white p-5 border-l-8 border-green-500 shadow-md transform hover:scale-[1.02] transition-transform">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-green-600 font-black text-sm uppercase">TRẢ LỜI ĐÚNG ✅</div>
                                        <AwardIcon color="#16a34a" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">Nhận được Buff/Vũ khí bạn đã chọn. Sức mạnh nhân vật tăng tiến vượt bậc.</p>
                                </div>
                                <div className="bg-white p-5 border-l-8 border-red-500 shadow-md transform hover:scale-[1.02] transition-transform">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-red-600 font-black text-sm uppercase">TRẢ LỜI SAI ❌</div>
                                        <SkullIcon color="#dc2626" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">
                                        <span className="text-red-600 underline">MẤT QUYỀN CHỌN BUFF.</span>
                                        <br/>Thay vào đó chỉ được hồi phục <span className="bg-red-100 text-red-800 px-1">10% Máu</span> tối đa.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Zone Mechanic */}
                         <div className="bg-red-100 border-4 border-red-600 p-5 flex items-start gap-5 neo-shadow-sm">
                            <div className="bg-red-500 text-white p-2 border-2 border-black animate-pulse shrink-0">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h4 className="font-black text-red-800 uppercase text-lg mb-1">CẢNH BÁO: VÒNG BO TỬ THẦN</h4>
                                <p className="text-sm text-red-900 font-medium leading-relaxed">
                                    Khi <strong className="bg-black text-white px-1">BOSS XUẤT HIỆN</strong>, một vòng tròn đỏ khổng lồ sẽ bao quanh khu vực.
                                    <br/>
                                    Nếu bạn bước ra ngoài vòng tròn này, bạn sẽ bị mất máu liên tục theo thời gian.
                                    Vòng bo sẽ biến mất sau khi Boss bị tiêu diệt.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: SYSTEM (WEAPONS & STATS) --- */}
                {activeTab === 'SYSTEM' && (
                    <div className="space-y-8 animate-pop">
                        
                        {/* 1. ARSENAL SECTION */}
                        <div>
                            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-black pb-2 w-fit bg-yellow-300 px-4">
                                <Swords className="text-black"/> Kho Vũ Khí
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Gun */}
                                <div className="bg-white p-4 border-4 border-black neo-shadow-sm flex items-start gap-4">
                                    <div className="w-16 h-16 bg-orange-100 border-2 border-orange-500 flex items-center justify-center shrink-0">
                                        <Crosshair size={32} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg uppercase text-orange-700">Súng Lục (Gun)</h4>
                                        <p className="text-xs font-bold text-gray-500 mb-2">SÁT THƯƠNG ĐƠN • TẦM XA</p>
                                        <p className="text-sm text-gray-800 leading-snug">
                                            Bắn đạn vào kẻ địch <strong>gần nhất</strong>.
                                            <br/>Nâng cấp: Tăng số lượng đạn, xuyên thấu và tốc độ bắn. Tuyệt vời để diệt Boss.
                                        </p>
                                    </div>
                                </div>

                                {/* Book */}
                                <div className="bg-white p-4 border-4 border-black neo-shadow-sm flex items-start gap-4">
                                    <div className="w-16 h-16 bg-purple-100 border-2 border-purple-500 flex items-center justify-center shrink-0">
                                        <Book size={32} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg uppercase text-purple-700">Sách Phép (Book)</h4>
                                        <p className="text-xs font-bold text-gray-500 mb-2">PHÒNG THỦ • ĐẨY LÙI</p>
                                        <p className="text-sm text-gray-800 leading-snug">
                                            Các quyển sách <strong>xoay quanh</strong> nhân vật.
                                            <br/>Gây sát thương và đẩy lùi kẻ địch tiếp cận. Cần thiết để sống sót giữa đám đông.
                                        </p>
                                    </div>
                                </div>

                                {/* Lightning */}
                                <div className="bg-white p-4 border-4 border-black neo-shadow-sm flex items-start gap-4">
                                    <div className="w-16 h-16 bg-cyan-100 border-2 border-cyan-500 flex items-center justify-center shrink-0">
                                        <Zap size={32} className="text-cyan-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg uppercase text-cyan-700">Sấm Sét (Lightning)</h4>
                                        <p className="text-xs font-bold text-gray-500 mb-2">DIỆN RỘNG • NGẪU NHIÊN</p>
                                        <p className="text-sm text-gray-800 leading-snug">
                                            Giáng sét xuống các kẻ địch <strong>ngẫu nhiên</strong> trên màn hình.
                                            <br/>Sát thương cực cao, dọn quái yếu rất nhanh.
                                        </p>
                                    </div>
                                </div>

                                {/* Nova */}
                                <div className="bg-white p-4 border-4 border-black neo-shadow-sm flex items-start gap-4">
                                    <div className="w-16 h-16 bg-red-100 border-2 border-red-500 flex items-center justify-center shrink-0">
                                        <Bomb size={32} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg uppercase text-red-700">Nova Blast</h4>
                                        <p className="text-xs font-bold text-gray-500 mb-2">BÙNG NỔ • DIỆN RỘNG</p>
                                        <p className="text-sm text-gray-800 leading-snug">
                                            Tạo ra vụ nổ lớn xung quanh nhân vật sau mỗi khoảng thời gian.
                                            <br/>Xóa sổ mọi kẻ địch dám lại gần.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. STATS & RARITY */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Stats */}
                            <div className="bg-gray-100 p-5 border-4 border-black neo-shadow-sm">
                                <h3 className="font-black uppercase mb-4 text-center border-b-2 border-gray-300 pb-2">Chỉ Số Sinh Tồn</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-white p-2 border-2 border-black">
                                        <div className="bg-red-500 text-white p-1"><Heart size={18} fill="currentColor" /></div>
                                        <div className="flex-1">
                                            <div className="font-black text-xs uppercase">Máu (HP)</div>
                                            <div className="text-[10px] text-gray-500 font-bold">Hết máu = Thua. Hồi phục chậm theo thời gian.</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white p-2 border-2 border-black">
                                        <div className="bg-blue-500 text-white p-1"><Shield size={18} fill="currentColor" /></div>
                                        <div className="flex-1">
                                            <div className="font-black text-xs uppercase">Giáp (Armor)</div>
                                            <div className="text-[10px] text-gray-500 font-bold">Lớp máu ảo tự hồi phục. Chặn sát thương trước khi vào máu chính.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Rarity */}
                            <div className="bg-gray-100 p-5 border-4 border-black neo-shadow-sm">
                                <h3 className="font-black uppercase mb-4 text-center border-b-2 border-gray-300 pb-2">Hệ Thống 7 Phẩm Chất</h3>
                                <div className="space-y-1">
                                    <RarityRow color="bg-gray-400" name="1. THƯỜNG (Common)" rate="Cao nhất" />
                                    <RarityRow color="bg-green-500" name="2. KHÁ (Uncommon)" rate="Cao" />
                                    <RarityRow color="bg-blue-500" name="3. HIẾM (Rare)" rate="Trung bình" />
                                    <RarityRow color="bg-purple-500" name="4. CỰC HIẾM (Epic)" rate="Thấp" />
                                    <RarityRow color="bg-yellow-400" name="5. HUYỀN THOẠI (Legendary)" rate="Rất thấp" />
                                    <RarityRow color="bg-orange-500" name="6. THẦN THOẠI (Mythic)" rate="Cực hiếm" />
                                    <RarityRow color="bg-red-600" name="7. THƯỢNG CỔ (Godly)" rate="Jackpot (0.1%)" animate />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- TAB: ENEMIES (ENHANCED) --- */}
                {activeTab === 'ENEMIES' && (
                    <div className="space-y-8 animate-pop">
                        
                        {/* BASIC ENEMIES */}
                        <div>
                            <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2 border-b-4 border-gray-300 pb-2 text-gray-700">
                                <Ghost className="text-gray-500"/> Quái Vật Thường Gặp
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <EnemyCard 
                                    color="bg-gray-300" 
                                    name="Quái Thường" 
                                    desc="Đông đảo, di chuyển chậm. Dễ tiêu diệt." 
                                />
                                <EnemyCard 
                                    color="bg-green-400" 
                                    name="Dasher (Lao Nhanh)" 
                                    desc="Cảnh báo trước khi lướt cực nhanh. Hãy di chuyển vuông góc để né." 
                                    icon={<ChevronsRightIcon/>}
                                />
                                <EnemyCard 
                                    color="bg-purple-400" 
                                    name="Shooter (Bắn Tỉa)" 
                                    desc="Đứng từ xa và bắn đạn. Nên ưu tiên tiêu diệt sớm." 
                                    icon={<Target size={20}/>}
                                />
                                <EnemyCard 
                                    color="bg-orange-500" 
                                    name="Kamikaze (Cảm Tử)" 
                                    desc="Lao vào bạn và phát nổ (Có vòng tròn đỏ). Sát thương cực lớn!" 
                                    icon={<Flame size={20}/>}
                                    danger
                                />
                                <EnemyCard 
                                    color="bg-emerald-500" 
                                    name="Slime (Phân Tách)" 
                                    desc="Khi chết sẽ tách ra thành 3 con Slime nhỏ. Cẩn thận bị bao vây." 
                                    icon={<LayersIcon/>}
                                />
                                <EnemyCard 
                                    color="bg-red-700" 
                                    name="ELITE (TINH NHUỆ)" 
                                    desc="To lớn, máu trâu. Kỹ năng: Dậm chân tạo sóng xung kích (Shockwave)." 
                                    icon={<Crown size={20} className="text-white"/>}
                                    danger
                                />
                            </div>
                        </div>

                        {/* BOSS INTEL */}
                        <div className="bg-black text-white p-6 border-4 border-red-600 neo-shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20 text-red-600">
                                <Skull size={150} />
                            </div>
                            
                            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3 text-red-500 border-b-2 border-red-900 pb-3 relative z-10">
                                <AlertTriangle size={32} /> HỒ SƠ TRÙM (BOSS INTEL)
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                {/* Boss 1 */}
                                <div className="bg-gray-900 border-2 border-gray-700 p-4 hover:border-red-500 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-black text-lg text-red-500">BOSS 1: CỖ MÁY</h4>
                                        <span className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-600">2 Phút</span>
                                    </div>
                                    <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                                        <li><strong className="text-white">Mưa Tên Lửa:</strong> Tạo các vòng tròn đỏ trên đất. Nổ sau 1s.</li>
                                        <li><strong className="text-white">Dậm Nhảy:</strong> Nhảy tới vị trí của bạn và gây choáng.</li>
                                    </ul>
                                </div>

                                {/* Boss 2 */}
                                <div className="bg-gray-900 border-2 border-gray-700 p-4 hover:border-blue-500 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-black text-lg text-blue-400">BOSS 2: XẠ THỦ</h4>
                                        <span className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-600">4 Phút</span>
                                    </div>
                                    <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                                        <li><strong className="text-white">Hố Đen:</strong> Hút bạn về phía Boss. Hãy chạy ngược hướng hút.</li>
                                        <li><strong className="text-white">Laser:</strong> Bắn tia năng lượng cực mạnh theo đường thẳng.</li>
                                    </ul>
                                </div>

                                {/* Boss 3 */}
                                <div className="bg-gray-900 border-2 border-gray-700 p-4 hover:border-yellow-500 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-black text-lg text-yellow-400">BOSS 3: ĐẠI TƯỚNG</h4>
                                        <span className="text-xs bg-gray-800 px-2 py-1 rounded border border-gray-600">6 Phút</span>
                                    </div>
                                    <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                                        <li><strong className="text-white">Xoắn Ốc:</strong> Bắn đạn toả ra 360 độ.</li>
                                        <li><strong className="text-white">Lưới Điện:</strong> Tạo các dòng điện ngang/dọc bản đồ.</li>
                                        <li><strong className="text-white">Lướt:</strong> Lao cực nhanh về phía bạn 3 lần liên tiếp.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 p-3 border-t-4 border-black text-center shrink-0">
             <p className="text-[10px] md:text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
                "Biết địch biết ta, trăm trận trăm thắng"
             </p>
        </div>

      </div>
    </div>
  );
};

// Helper Components
const RarityRow = ({ color, name, rate, animate }: { color: string, name: string, rate: string, animate?: boolean }) => (
    <div className="flex items-center gap-3 bg-white p-2 border border-gray-200">
        <div className={`w-4 h-4 ${color} border border-black ${animate ? 'animate-pulse' : ''}`}></div>
        <div className="flex-1 font-bold text-xs uppercase">{name}</div>
        <div className="text-[10px] text-gray-500 font-mono">{rate}</div>
    </div>
);

const EnemyCard = ({ color, name, desc, icon, danger }: { color: string, name: string, desc: string, icon?: React.ReactNode, danger?: boolean }) => (
    <div className={`bg-white p-4 border-4 border-black neo-shadow-sm flex items-start gap-4 ${danger ? 'ring-2 ring-red-500 ring-offset-2' : ''}`}>
        <div className={`w-12 h-12 ${color} border-2 border-black shrink-0 flex items-center justify-center`}>
            {icon}
        </div>
        <div>
            <h4 className={`font-black text-sm uppercase ${danger ? 'text-red-600' : 'text-black'}`}>
                {name} {danger && '⚠️'}
            </h4>
            <p className="text-xs text-gray-600 mt-1 font-medium">{desc}</p>
        </div>
    </div>
);

// Small inline icons
const AwardIcon = ({color}: {color: string}) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
);
const SkullIcon = ({color}: {color: string}) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
);
const ChevronsRightIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
);
const LayersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);

export default TutorialModal;
