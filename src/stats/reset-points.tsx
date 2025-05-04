import React, { useState } from 'react';

// Custom Icon component using inline SVG (Copied from original file for self-containment)
const Icon = ({ name, size = 24, className = '' }) => {
  const icons = {
    RotateCcw: <g><path d="M3 12a9 9 0 1 0 9-9"></path><path d="M3 12v.7L6 9"></path></g>,
    ArrowRight: <g><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></g>,
    AlertCircle: <g><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></g>,
    Gem: <g><path d="M6 3h12l4 6-10 13L2 9l4-6z"></path><path d="M12 22L4 9l8-6 8 6-8 13z"></path><path d="M12 2l8 7-8 7-8-7 8-7z"></path><path d="M2 9h20"></path><path d="M12 2v20"></path></g>,
    X: <g><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></g>,
    CheckCircle: <g><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></g>,
    Sparkles: <g><path d="M12 3v18"></path><path d="M17.5 7.5l-11 11"></path><path d="M3.5 10.5l17-7"></path><path d="M3.5 13.5l17 7"></path><path d="M6.5 20.5l11-11"></path><path d="M12 3v18"></path></g>,
  };

  if (!icons[name]) {
    console.warn(`Icon component: Icon with name "${name}" not found.`);
    return null;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-${name.toLowerCase()} ${className}`}
    >
      {icons[name]}
    </svg>
  );
};


// Định nghĩa interface cho props
interface ResetStatsControlProps {
  // Chỉ số hiện tại của nhân vật, cần để tính điểm hoàn trả
  currentStats: {
    atk: number;
    def: number;
    hp: number;
    luck: number;
    wit: number;
    crt: number;
  };
  // Hàm callback được gọi khi người dùng xác nhận reset
  // Sẽ truyền số điểm hoàn trả về component cha
  onStatsReset: (pointsRefunded: number) => void;
}

// Component điều khiển chức năng Reset Chỉ Số
const ResetStatsControl: React.FC<ResetStatsControlProps> = ({ currentStats, onStatsReset }) => {
  // State để điều khiển hiển thị modal xác nhận
  const [showResetModal, setShowResetModal] = useState(false);
  // State để điều khiển trạng thái reset
  const [resetState, setResetState] = useState<'idle' | 'processing' | 'success'>('idle');

  // Hàm tính toán tổng điểm tiềm năng đã phân bổ dựa trên chỉ số hiện tại
  const calculateResetPoints = () => {
    return Object.entries(currentStats).reduce((total, [key, value]) => {
      // Tính điểm hoàn trả cho HP (1 điểm / 25 HP)
      if (key === 'hp') {
        return total + Math.floor(value / 25);
      } else {
        // Tính điểm hoàn trả cho các chỉ số khác (1 điểm / 2 giá trị)
        return total + Math.floor(value / 2);
      }
    }, 0);
  };

  // Hàm xử lý khi người dùng bấm xác nhận reset trong modal
  const handleConfirmReset = () => {
    // Bắt đầu animation xử lý
    setResetState('processing');

    // Tính toán số điểm sẽ hoàn trả
    const pointsToRefund = calculateResetPoints();

    // Mô phỏng quá trình xử lý với timeline animation
    setTimeout(() => {
      // Chuyển sang trạng thái thành công
      setResetState('success');
      
      // Đợi hiển thị animation thành công trước khi đóng modal
      setTimeout(() => {
        // Gọi hàm callback từ component cha, truyền số điểm hoàn trả
        onStatsReset(pointsToRefund);
        setShowResetModal(false);
        // Reset về trạng thái ban đầu sau khi đóng modal
        setTimeout(() => setResetState('idle'), 300);
      }, 1200);
    }, 2000);
  };

  // Component nội bộ cho Modal xác nhận Reset Chỉ Số
  const ResetModal = () => {
    // Tính toán số điểm sẽ nhận được để hiển thị trong modal
    const pointsToReceive = calculateResetPoints();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all ${resetState === 'processing' ? 'animate-pulse' : ''}`}>
          {/* Modal Header */}
          <div className={`bg-gradient-to-br ${resetState === 'success' ? 'from-green-500 to-emerald-600' : 'from-purple-500 to-blue-600'} text-white p-4 rounded-xl mb-4 shadow-lg transition-colors duration-500`}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4 ${resetState === 'processing' ? 'animate-spin' : ''}`}>
                {resetState === 'success' ? (
                  <Icon name="CheckCircle" size={24} className="text-white" />
                ) : (
                  <Icon name="RotateCcw" size={24} className="text-white" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl">
                  {resetState === 'success' ? 'Reset Thành Công' : 'Reset Chỉ Số'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {resetState === 'success' ? 'Đã hoàn trả điểm tiềm năng' : 'Lấy lại điểm phân bổ'}
                </p>
              </div>
            </div>
          </div>

          {/* Status Messages */}
          {resetState === 'processing' && (
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200 animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 mr-3 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-blue-800 text-sm mb-1">Đang xử lý</h4>
                  <p className="text-blue-700 text-sm">Vui lòng đợi trong giây lát...</p>
                </div>
              </div>
            </div>
          )}

          {resetState === 'success' && (
            <div className="mb-4 bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex">
                <Icon name="CheckCircle" size={20} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-green-800 text-sm mb-1">Hoàn tất</h4>
                  <p className="text-green-700 text-sm">
                    Các chỉ số đã được reset và điểm tiềm năng đã được hoàn trả!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Important Note Section - Chỉ hiển thị khi chưa xử lý hoặc đang xử lý */}
          {resetState !== 'success' && (
            <div className="mb-4 bg-amber-50 p-4 rounded-lg border border-amber-200">
              <div className="flex">
                <Icon name="AlertCircle" size={20} className="text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-800 text-sm mb-1">Lưu ý quan trọng</h4>
                  <p className="text-amber-700 text-sm">
                    Reset sẽ đưa tất cả chỉ số về 0 và hoàn trả điểm tiềm năng.
                    Hành động này không thể hoàn tác!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Points Received Section */}
          <div className="bg-gray-50 p-3 rounded-lg mb-5">
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              {resetState === 'success' ? 'Bạn đã nhận được:' : 'Bạn sẽ nhận được:'}
            </h4>
            <div className={`flex items-center bg-white p-3 rounded-lg border ${resetState === 'success' ? 'border-green-100' : 'border-blue-100'}`}>
              {/* Point Icon with animation when success */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                resetState === 'success' 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              } ${resetState === 'success' ? 'animate-ping-short' : ''}`}>
                <Icon name="Gem" size={16} className="text-white" />
              </div>
              {/* Point Description */}
              <div className="flex-1">
                <p className="font-medium text-gray-700">Điểm Tiềm Năng</p>
                <p className="text-xs text-gray-500">Dùng để nâng cấp chỉ số</p>
              </div>
              {/* Points Amount */}
              <div className={`px-3 py-1 rounded-lg font-bold ${
                resetState === 'success' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-indigo-100 text-indigo-600'
              }`}>
                +{pointsToReceive}
              </div>
            </div>
          </div>

          {/* Special Effect when Success */}
          {resetState === 'success' && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-6 h-6 text-yellow-500 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                >
                  <Icon name="Sparkles" size={24} />
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Cancel Button - Chỉ hiển thị khi chưa xử lý */}
            {resetState === 'idle' && (
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              >
                Hủy
              </button>
            )}

            {/* Reset Button - Thay đổi theo trạng thái */}
            <button
              onClick={resetState === 'idle' ? handleConfirmReset : () => setShowResetModal(false)}
              disabled={resetState === 'processing'}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 ${
                resetState === 'processing' 
                  ? 'bg-blue-500 cursor-not-allowed' 
                  : resetState === 'success'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              } transition-all`}
            >
              {resetState === 'processing' && (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý...
                </>
              )}
              {resetState === 'success' && (
                <>
                  <Icon name="CheckCircle" size={16} />
                  Đóng
                </>
              )}
              {resetState === 'idle' && (
                <>
                  <Icon name="RotateCcw" size={16} />
                  Reset
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* CSS cho animation ping ngắn hơn */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes ping-short {
          0% { transform: scale(0.95); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(0.95); opacity: 1; }
        }
        
        .animate-float {
          animation: float 3s ease-in-out forwards;
        }
        
        .animate-ping-short {
          animation: ping-short 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>

      {/* Nút "Reset Chỉ Số" ở footer */}
      <button
        onClick={() => setShowResetModal(true)} // Mở modal khi click
        className="group px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 relative overflow-hidden"
      >
        {/* Background shine effect on hover */}
        <div className="absolute top-0 left-0 h-full w-16 bg-white opacity-20 skew-x-30 transform -translate-x-20 transition-transform group-hover:translate-x-64 duration-1000"></div>
        {/* Button Text and Icons */}
        <div className="flex items-center gap-2 relative">
          <Icon name="RotateCcw" size={16} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>Reset Chỉ Số</span>
          <Icon name="ArrowRight" size={14} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </div>
        {/* Tooltip */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Thu hồi điểm tiềm năng
        </div>
      </button>

      {/* Render modal nếu showResetModal là true */}
      {showResetModal && <ResetModal />}
    </>
  );
};

export default ResetStatsControl;
