import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => {
  return (
    // Lớp vỏ ngoài cùng, giữ nguyên màu nền gradient tối của màn hình
    <div className="w-full h-full absolute top-0 left-0 bg-gradient-to-br from-[#16213e] to-[#0a0a14] flex flex-col overflow-hidden">
      
      {/* --- Skeleton cho Header (Đã đồng bộ) --- */}
      <header className="sticky top-0 left-0 w-full h-[53px] box-border flex items-center justify-between px-4 bg-slate-900/70 backdrop-blur-sm border-b border-white/10 flex-shrink-0 z-10">
        
        {/* Nút Back/Home */}
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse"></div>
            <div className="hidden sm:block h-5 w-24 rounded-md bg-white/10 animate-pulse"></div>
        </div>

        {/* Các chỉ số tài nguyên */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-24 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-8 w-24 rounded-md bg-white/10 animate-pulse"></div>
          <div className="h-8 w-24 rounded-md bg-white/10 animate-pulse"></div>
        </div>
      </header>

      {/* --- Skeleton cho Main Content (Gallery các rương) --- */}
      <main className="flex-grow overflow-hidden p-5">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-7">
          {/* Lặp qua để tạo 5 skeleton card, phù hợp với số lượng rương */}
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="bg-[#1a1f36] rounded-2xl overflow-hidden border border-white/10 flex flex-col animate-pulse"
            >
              {/* === SKELETON HEADER: Đồng bộ với .chest-header === */}
              {/* Mô phỏng header của card với padding và thanh text giả ở giữa */}
              <div className="px-5 py-3 bg-white/5 border-b border-white/10">
                <div className="h-4 w-1/2 mx-auto rounded-md bg-white/10"></div>
              </div>

              {/* === SKELETON BODY: Đồng bộ với .chest-body === */}
              {/* Thân card với padding và bố cục flex column */}
              <div className="p-5 flex flex-col flex-grow">
                
                {/* Top Section: Đồng bộ với .chest-top-section */}
                <div className="flex justify-between items-center mb-5">
                  {/* Trái: Icon (?) và Tên Level. Mô phỏng đúng 2 thành phần */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex-shrink-0"></div>
                    <div className="h-6 w-20 rounded-full bg-white/10"></div>
                  </div>
                  {/* Phải: Text "Còn lại: X" */}
                  <div className="h-5 w-28 rounded-md bg-white/10"></div>
                </div>

                {/* Visual Row: Đồng bộ với .chest-visual-row */}
                <div className="flex items-center gap-4 mb-5">
                  {/* Hình ảnh rương: tỷ lệ 1/3, hình vuông */}
                  <div className="w-1/3 aspect-square bg-white/10 rounded-lg flex-shrink-0"></div>
                  {/* Ô thông tin: chiếm phần còn lại */}
                  <div className="flex-1 h-24 bg-white/10 rounded-lg"></div>
                </div>

                {/* Action Buttons: Đồng bộ với .action-button-group */}
                {/* Dùng mt-auto để đẩy các nút xuống dưới cùng */}
                <div className="flex items-center gap-3 mt-auto pt-4">
                  <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
                  <div className="flex-1 h-12 bg-white/10 rounded-xl"></div>
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
