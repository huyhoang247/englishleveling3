import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền gradient tối của màn hình
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-br from-[#16213e] to-[#0a0a14] flex flex-col overflow-hidden">
      
      {/* --- Skeleton cho Header (Đã đồng bộ) --- */}
      <header className="sticky top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/70 backdrop-blur-sm border-b border-white/10 flex-shrink-0 z-10">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse"></div>
            <div className="hidden sm:block h-5 w-24 rounded-md bg-white/10 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-8 w-24 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-8 w-24 rounded-md bg-white/10 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content (Gallery các rương) --- */}
      <main className="flex-grow overflow-hidden p-5">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-7">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              // Container chính của card không cần màu nền nữa, vì các con sẽ che hết.
              // Nó chỉ cần bo góc, border và hiệu ứng pulse.
              className="rounded-2xl overflow-hidden border border-white/10 flex flex-col animate-pulse"
            >
              {/* === SKELETON HEADER: Đồng bộ với .chest-header === */}
              {/* Đổi màu nền thành màu thật của header: rgba(42, 49, 78, 0.7) -> #2a314e */}
              <div className="px-5 py-3 bg-[#2a314e]">
                <div className="h-4 w-1/2 mx-auto rounded-md bg-white/10"></div>
              </div>

              {/* === SKELETON BODY: Đồng bộ với .chest-body === */}
              {/* THAY ĐỔI LỚN NHẤT: Áp dụng đúng màu gradient của body thật */}
              <div className="p-5 flex flex-col flex-grow bg-[linear-gradient(170deg,#43335b,#2c2240)]">
                
                {/* Top Section: Đồng bộ với .chest-top-section */}
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0"></div>
                    <div className="h-6 w-20 rounded-full bg-white/10"></div>
                  </div>
                  <div className="h-5 w-28 rounded-md bg-white/10"></div>
                </div>

                {/* Visual Row: Đồng bộ với .chest-visual-row */}
                <div className="flex items-center gap-4 mb-5">
                  {/* Hình ảnh và ô thông tin dùng màu nền trong suốt hơn để nổi bật trên nền tím */}
                  <div className="w-1/3 aspect-square bg-black/20 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 h-24 bg-black/20 rounded-lg"></div>
                </div>

                {/* Action Buttons: Đồng bộ với .action-button-group */}
                <div className="flex items-center gap-3 mt-auto pt-4">
                  <div className="flex-1 h-12 bg-black/20 rounded-xl"></div>
                  <div className="flex-1 h-12 bg-black/20 rounded-xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default VocabularyChestLoadingSkeleton;
