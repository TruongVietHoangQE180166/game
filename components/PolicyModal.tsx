import React from 'react';
import { 
  Terminal, CheckCircle2, ShieldAlert, Cpu, 
  Layers, Code2, Server, Database, LayoutTemplate,
  Scale, BookOpen, ShieldCheck, AlertTriangle, Award
} from 'lucide-react';

interface PolicyModalProps {
  onClose: () => void;
}

const PolicyModal: React.FC<PolicyModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
      <div className="bg-[#0c0c0c] border-2 border-gray-700 w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col animate-pop">
        
        {/* Terminal Header */}
        <div className="bg-[#1f1f1f] px-4 py-3 flex justify-between items-center border-b border-gray-700 shrink-0">
           <div className="flex items-center gap-3 text-gray-400 text-xs">
              <Terminal size={14} />
              <span>root@dev-team:~/transparency/ai_usage_declaration_v3.md</span>
           </div>
           <div className="flex gap-2">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400"></button>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
           </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-8 text-gray-300 text-sm leading-relaxed overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
           
           <div className="mb-8 font-bold text-lg border-b border-gray-800 pb-4">
              <span className="text-green-500">➜</span> <span className="text-blue-400">~</span> cat <span className="text-yellow-300">CAM_KET_SU_DUNG_AI_MINH_BACH.md</span>
           </div>

           {/* Header Info */}
           <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-l-4 border-cyan-400 p-4 mb-8 rounded">
              <div className="text-white font-bold text-base mb-2">BÁO CÁO MINH BẠCH SỬ DỤNG AI</div>
              <div className="text-xs text-gray-400 space-y-1">
                 <div><strong className="text-white">Sản phẩm:</strong> Vampire Survival Game - Educational Edition</div>
                 <div><strong className="text-white">Mô hình AI:</strong> Google Gemini 2.0 Flash</div>
                 <div><strong className="text-white">Nền tảng:</strong> Google AI Studio</div>
                 <div><strong className="text-white">Ngày công bố:</strong> {new Date().toLocaleDateString('vi-VN')}</div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              
              {/* SECTION 1: TECH STACK */}
              <section>
                  <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2 text-cyan-400">
                     <Server size={20} /> 1. NỀN TẢNG CÔNG NGHỆ
                  </h2>
                  <div className="bg-[#1a1a1a] p-5 rounded border border-gray-700 space-y-3">
                     <div className="flex items-center gap-3">
                        <Code2 size={16} className="text-blue-400"/>
                        <span className="font-bold text-white">Framework:</span>
                        <span className="text-gray-400">React 19 (Hooks)</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <LayoutTemplate size={16} className="text-pink-400"/>
                        <span className="font-bold text-white">Styling:</span>
                        <span className="text-gray-400">Tailwind CSS</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <Database size={16} className="text-green-400"/>
                        <span className="font-bold text-white">Storage:</span>
                        <span className="text-gray-400">LocalStorage API</span>
                     </div>
                     <div className="flex items-center gap-3">
                        <Cpu size={16} className="text-yellow-400"/>
                        <span className="font-bold text-white">AI Model:</span>
                        <span className="text-gray-400">Gemini 2.0 Flash</span>
                     </div>
                  </div>
              </section>

              {/* SECTION 2: AI CONTRIBUTION */}
              <section>
                  <h2 className="text-xl font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2 text-purple-400">
                     <Layers size={20} /> 2. TỶ LỆ ĐÓNG GÓP
                  </h2>
                  <div className="bg-[#1a1a1a] p-5 rounded border border-gray-700 space-y-4">
                     {/* AI Contribution */}
                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-white font-bold">AI Generated Code</span>
                           <span className="text-yellow-400 font-bold">~80-85%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                           <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full" style={{width: '85%'}}></div>
                        </div>
                        <ul className="text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
                           <li>React components & hooks</li>
                           <li>Game logic algorithms</li>
                           <li>Collision detection system</li>
                           <li>Particle effects rendering</li>
                        </ul>
                     </div>

                     {/* Human Contribution */}
                     <div>
                        <div className="flex justify-between mb-2">
                           <span className="text-white font-bold">Human Contribution</span>
                           <span className="text-green-400 font-bold">~15-20%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                           <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-full" style={{width: '20%'}}></div>
                        </div>
                        <ul className="text-xs text-gray-400 mt-2 space-y-1 list-disc list-inside">
                           <li>Game design & concept</li>
                           <li>Educational content curation</li>
                           <li>Testing & balancing</li>
                           <li>Quality assurance</li>
                        </ul>
                     </div>
                  </div>
              </section>
           </div>

           {/* SECTION 3: CRITICAL COMMITMENTS */}
           <section className="mb-10 border-t border-gray-800 pt-8">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 text-red-500">
                 <ShieldCheck size={20} /> 3. CAM KẾT QUAN TRỌNG
              </h2>
              <div className="space-y-4">
                 
                 {/* Cam kết 1: Nội dung học thuật */}
                 <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                       <BookOpen className="shrink-0 text-yellow-400 mt-1" size={24} />
                       <div className="flex-1">
                          <h3 className="text-white font-bold text-base mb-2 flex items-center gap-2">
                             CAM KẾT VỀ NỘI DUNG HỌC THUẬT
                             <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-black">QUAN TRỌNG</span>
                          </h3>
                          <div className="space-y-2 text-sm">
                             <p className="text-gray-300 text-justify">
                                <strong className="text-yellow-400">100% câu hỏi lịch sử</strong> được biên soạn và kiểm duyệt bởi con người (Human Curated). 
                                AI <strong className="text-red-400">TUYỆT ĐỐI KHÔNG</strong> được phép tự sinh nội dung lịch sử để tránh thông tin sai lệch (hallucination).
                             </p>
                             <div className="bg-black/40 p-3 rounded border-l-4 border-yellow-500 mt-2">
                                <p className="text-xs text-gray-400 font-mono">
                                   <strong className="text-white">Quy trình kiểm duyệt:</strong><br/>
                                   1. Nghiên cứu tài liệu lịch sử chính thống<br/>
                                   2. Biên soạn câu hỏi bởi chuyên gia nội dung<br/>
                                   3. Kiểm tra chéo với nguồn đáng tin cậy<br/>
                                   4. Review cuối cùng trước khi đưa vào game
                                </p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Cam kết 2: Cơ chế game */}
                 <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-2 border-blue-500 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                       <Scale className="shrink-0 text-blue-400 mt-1" size={24} />
                       <div className="flex-1">
                          <h3 className="text-white font-bold text-base mb-2">CAM KẾT VỀ CÂN BẰNG GAME</h3>
                          <p className="text-gray-300 text-sm text-justify">
                             Các thông số game (sát thương, tốc độ, tỷ lệ rơi vật phẩm, độ khó boss) được 
                             <strong className="text-blue-400"> thiết kế và tinh chỉnh thủ công</strong> bởi Game Designer để đảm bảo 
                             trải nghiệm công bằng và hấp dẫn. AI chỉ hỗ trợ code hóa các công thức đã được định sẵn.
                          </p>
                       </div>
                    </div>
                 </div>

                 {/* Cam kết 3: Trách nhiệm sản phẩm */}
                 <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-2 border-green-500 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                       <ShieldAlert className="shrink-0 text-green-400 mt-1" size={24} />
                       <div className="flex-1">
                          <h3 className="text-white font-bold text-base mb-2">CAM KẾT TRÁCH NHIỆM SẢN PHẨM</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-1"/>
                                <p><strong>Mục đích:</strong> Phi lợi nhuận, phục vụ giáo dục "Học mà chơi"</p>
                             </div>
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-1"/>
                                <p><strong>Bảo mật:</strong> Chỉ lưu trữ tên hiển thị & điểm số (không thu thập dữ liệu cá nhân)</p>
                             </div>
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-1"/>
                                <p><strong>Minh bạch:</strong> Công khai quy trình sử dụng AI trong tài liệu này</p>
                             </div>
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-1"/>
                                <p><strong>Chất lượng:</strong> Đảm bảo nội dung chính xác, code đã được review kỹ lưỡng</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Cam kết 4: Đạo đức AI */}
                 <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-2 border-purple-500 rounded-lg p-5">
                    <div className="flex items-start gap-4">
                       <AlertTriangle className="shrink-0 text-purple-400 mt-1" size={24} />
                       <div className="flex-1">
                          <h3 className="text-white font-bold text-base mb-2">CAM KẾT ĐẠO ĐỨC AI</h3>
                          <div className="space-y-2 text-sm text-gray-300">
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-1"/>
                                <p>Tôi đã <strong>đọc hiểu và review</strong> toàn bộ code do AI sinh ra</p>
                             </div>
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-1"/>
                                <p>AI được sử dụng như <strong>công cụ hỗ trợ</strong>, không phải để đạo văn hoặc gian lận</p>
                             </div>
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-1"/>
                                <p>Tôi <strong>chịu trách nhiệm hoàn toàn</strong> về chất lượng và tính chính xác của sản phẩm</p>
                             </div>
                             <div className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-1"/>
                                <p>Không sử dụng code/tài nguyên có bản quyền mà không có phép</p>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </section>

           {/* SECTION 4: AI WORKFLOW */}
           <section className="mb-10 border-t border-gray-800 pt-8">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 text-yellow-400">
                 <Layers size={20} /> 4. QUY TRÌNH SỬ DỤNG AI (3 GIAI ĐOẠN)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                 <div className="bg-[#151515] p-4 rounded border border-yellow-500/50">
                    <div className="flex items-center gap-2 mb-3">
                       <Award className="text-yellow-400" size={18}/>
                       <strong className="text-white text-sm">GIAI ĐOẠN 1: Khởi tạo</strong>
                    </div>
                    <div className="text-yellow-400 font-bold mb-2">🤖 AI: 90% | 👤 Human: 10%</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                       <li>Tạo project structure (React + Vite)</li>
                       <li>Setup Tailwind CSS config</li>
                       <li>Viết utility functions cơ bản</li>
                       <li>Generate boilerplate components</li>
                    </ul>
                 </div>

                 <div className="bg-[#151515] p-4 rounded border border-blue-500/50">
                    <div className="flex items-center gap-2 mb-3">
                       <Cpu className="text-blue-400" size={18}/>
                       <strong className="text-white text-sm">GIAI ĐOẠN 2: Phát triển</strong>
                    </div>
                    <div className="text-blue-400 font-bold mb-2">🤖 AI: 70% | 👤 Human: 30%</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                       <li>AI: Code game logic & algorithms</li>
                       <li>Human: Design UI/UX & color scheme</li>
                       <li>Human: Tạo câu hỏi lịch sử</li>
                       <li>AI: Implement particle effects</li>
                    </ul>
                 </div>

                 <div className="bg-[#151515] p-4 rounded border border-green-500/50">
                    <div className="flex items-center gap-2 mb-3">
                       <ShieldCheck className="text-green-400" size={18}/>
                       <strong className="text-white text-sm">GIAI ĐOẠN 3: Hoàn thiện</strong>
                    </div>
                    <div className="text-green-400 font-bold mb-2">🤖 AI: 20% | 👤 Human: 80%</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-400">
                       <li>Human: Bug testing & debugging</li>
                       <li>Human: Game balancing</li>
                       <li>Human: Content verification</li>
                       <li>Human: Code review & optimization</li>
                    </ul>
                 </div>
              </div>
           </section>

           {/* SECTION 5: SAMPLE PROMPTS */}
           <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider flex items-center gap-2 text-purple-400">
                 <Code2 size={20} /> 5. MẪU PROMPTS ĐÃ SỬ DỤNG
              </h2>
              <div className="space-y-3 font-mono text-xs">
                 <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <span className="text-purple-400 font-bold">$ prompt_01:</span>
                    <span className="text-gray-400 ml-2">"Tạo React component game với WASD movement, camera follow player, và collision detection cho enemies"</span>
                 </div>
                 <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <span className="text-purple-400 font-bold">$ prompt_02:</span>
                    <span className="text-gray-400 ml-2">"Implement fireball skill với auto-targeting nearest enemy và particle explosion effects bằng Canvas API"</span>
                 </div>
                 <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <span className="text-purple-400 font-bold">$ prompt_03:</span>
                    <span className="text-gray-400 ml-2">"Tạo buff rarity system với Common/Rare/Epic/Legendary tiers, mỗi tier có màu border và drop rate khác nhau"</span>
                 </div>
                 <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                    <span className="text-purple-400 font-bold">$ prompt_04:</span>
                    <span className="text-gray-400 ml-2">"Code localStorage system để lưu game history với player name, survival time, score và date played"</span>
                 </div>
              </div>
           </section>

           {/* Footer */}
           <div className="mt-8 pt-6 border-t-2 border-gray-700">
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded border border-gray-700 mb-4">
                 <p className="text-xs text-gray-400 text-center italic">
                    "Tôi cam kết rằng mọi thông tin trong tài liệu này là chính xác và trung thực. 
                    Tôi hiểu rõ vai trò của AI trong quá trình phát triển và chịu trách nhiệm hoàn toàn về sản phẩm cuối cùng."
                 </p>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                 <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Terminal size={14}/>
                    Verified by Dev Team | {new Date().toLocaleDateString('vi-VN', {
                       year: 'numeric',
                       month: 'long', 
                       day: 'numeric'
                    })}
                 </div>
                 <button 
                   onClick={onClose}
                   className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-black font-black px-8 py-3 uppercase tracking-wider transition-all border-2 border-white shadow-[4px_4px_0_0_rgba(255,255,255,0.3)] active:translate-y-1 active:shadow-none flex items-center gap-2 rounded"
                 >
                    <CheckCircle2 size={18} />
                    ĐÃ ĐỌC & ĐỒNG Ý CAM KẾT
                 </button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default PolicyModal;