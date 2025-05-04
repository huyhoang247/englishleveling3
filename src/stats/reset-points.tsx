import React, { useState } from 'react';

// Custom Icon component using inline SVG
const Icon = ({ name, size = 24, className = '' }) => {
  const icons = {
    RotateCcw: <g><path d="M3 12a9 9 0 1 0 9-9"></path><path d="M3 12v.7L6 9"></path></g>,
    ArrowRight: <g><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></g>,
    AlertCircle: <g><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></g>,
    Gem: <g><path d="M6 3h12l4 6-10 13L2 9l4-6z"></path><path d="M12 22L4 9l8-6 8 6-8 13z"></path><path d="M12 2l8 7-8 7-8-7 8-7z"></path><path d="M2 9h20"></path><path d="M12 2v20"></path></g>,
    X: <g><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></g>,
    ChevronRight: <g><polyline points="9 18 15 12 9 6"></polyline></g>,
    Shield: <g><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></g>,
    Zap: <g><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></g>,
    Heart: <g><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></g>,
    Cpu: <g><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></g>,
    Sword: <g><path d="M14.5 17.5L3 6V3h3l11.5 11.5"></path><path d="M13 19l6-6"></path><path d="M16 16l4 4"></path><path d="M19 21l2-2"></path></g>,
    Star: <g><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></g>
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

// Interface cho props
interface ResetStatsControlProps {
  currentStats: {
    atk: number;
    def: number;
    hp: number;
    luck: number;
    wit: number;
    crt: number;
  };
  onStatsReset: (pointsRefunded: number) => void;
}

const ResetStatsControl: React.FC<ResetStatsControlProps> = ({ currentStats, onStatsReset }) => {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetAnimation, setResetAnimation] = useState(false);
  const [resetStage, setResetStage] = useState(0); // 0: initial, 1: confirming, 2: processing

  // Tính toán số điểm hoàn trả
  const calculateResetPoints = () => {
    return Object.entries(currentStats).reduce((total, [key, value]) => {
      if (key === 'hp') {
        return total + Math.floor(value / 25);
      } else {
        return total + Math.floor(value / 2);
      }
    }, 0);
  };

  // Xử lý quá trình reset với animation
  const handleConfirmReset = () => {
    setResetStage(2); // Chuyển sang trạng thái đang xử lý
    setResetAnimation(true);

    const pointsToRefund = calculateResetPoints();

    // Tạo hiệu ứng loading trước khi hoàn tất
    setTimeout(() => {
      onStatsReset(pointsToRefund);
      setTimeout(() => {
        setShowResetModal(false);
        setResetAnimation(false);
        setResetStage(0);
      }, 500);
    }, 1500);
  };

  // Danh sách chỉ số để hiển thị
  const statIcons = {
    atk: { icon: 'Sword', color: 'from-red-500 to-red-600' },
    def: { icon: 'Shield', color: 'from-blue-500 to-blue-600' },
    hp: { icon: 'Heart', color: 'from-green-500 to-green-600' },
    luck: { icon: 'Star', color: 'from-amber-500 to-amber-600' },
    wit: { icon: 'Cpu', color: 'from-purple-500 to-purple-600' },
    crt: { icon: 'Zap', color: 'from-yellow-500 to-yellow-600' }
  };

  // Thành phần Modal
  const ResetModal = () => {
    const pointsToReceive = calculateResetPoints();
    const statEntries = Object.entries(currentStats);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full transform transition-all ${resetAnimation ? 'animate-pulse' : ''}`}>
          {/* Modal Header */}
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 rounded-t-3xl overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 opacity-20"></div>
              <div className="absolute -bottom-6 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
            </div>
            
            {/* Content */}
            <div className="relative pt-8 pb-12 px-6">
              {/* Close button */}
              <button 
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-all"
              >
                <Icon name="X" size={14} className="text-white" />
              </button>
              
              {/* Header content */}
              <div className="flex items-start mb-3">
                <div className="w-14 h-14 rounded-2xl bg-white bg-opacity-20 p-3 flex items-center justify-center mr-4">
                  <div className="w-full h-full rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
                    <Icon name="RotateCcw" size={24} className="text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-white">Reset Chỉ Số</h3>
                  <p className="text-blue-100 text-sm font-medium">Hoàn trả {pointsToReceive} điểm tiềm năng</p>
                </div>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="px-6 pb-6 -mt-2">
            {resetStage < 2 ? (
              <>
                {/* Stats Preview */}
                <div className="bg-gray-50 dark:bg-gray-700/40 rounded-2xl p-4 mb-5">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">Chỉ số sẽ được reset:</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {statEntries.map(([key, value]) => (
                      <div key={key} className="flex items-center bg-white dark:bg-gray-700 p-3 rounded-xl shadow-sm">
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${statIcons[key]?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center mr-3 shadow-sm`}>
                          <Icon name={statIcons[key]?.icon || 'AlertCircle'} size={16} className="text-white" />
                        </div>
                        {/* Label & Value */}
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{key}</p>
                          <p className="font-bold text-gray-800 dark:text-gray-100">{value}</p>
                        </div>
                        {/* Reset indicator */}
                        <div className="ml-auto">
                          <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <Icon name="X" size={12} className="text-red-500 dark:text-red-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Points Preview */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-2xl mb-5 border border-indigo-100 dark:border-indigo-700/30">
                  <div className="flex items-center">
                    {/* Points icon */}
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <Icon name="Gem" size={24} className="text-white" />
                      </div>
                      <div className="absolute -right-1 -bottom-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <span className="text-xs font-bold text-white">+</span>
                      </div>
                    </div>
                    
                    {/* Points description */}
                    <div className="ml-4 flex-1">
                      <h4 className="font-bold text-gray-800 dark:text-gray-100">Nhận {pointsToReceive} Điểm Tiềm Năng</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Dùng để nâng cấp các chỉ số nhân vật</p>
                    </div>
                  </div>
                </div>

                {/* Warning */}
                {resetStage === 0 ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl mb-5 border border-amber-100 dark:border-amber-700/30">
                    <div className="flex">
                      <Icon name="AlertCircle" size={20} className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">Lưu ý quan trọng</h4>
                        <p className="text-amber-700 dark:text-amber-400 text-sm">
                          Reset sẽ đưa tất cả chỉ số về 0 và hoàn trả điểm tiềm năng.
                          <span className="font-medium"> Hành động này không thể hoàn tác!</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl mb-5 border border-red-100 dark:border-red-700/30">
                    <div className="flex">
                      <Icon name="AlertCircle" size={20} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-red-800 dark:text-red-300 text-sm mb-1">Xác nhận reset?</h4>
                        <p className="text-red-700 dark:text-red-400 text-sm">
                          Bạn có chắc chắn muốn reset tất cả chỉ số? Hành động này
                          <span className="font-medium"> không thể hoàn tác!</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mb-4"></div>
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Đang Reset Chỉ Số...</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
                  Hệ thống đang xử lý, vui lòng đợi trong giây lát
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {resetStage < 2 && (
              <div className="flex gap-3">
                {/* Cancel/Back Button */}
                <button
                  onClick={() => resetStage === 0 ? setShowResetModal(false) : setResetStage(0)}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {resetStage === 0 ? 'Hủy' : 'Quay lại'}
                </button>
                
                {/* Next/Confirm Button */}
                <button
                  onClick={() => resetStage === 0 ? setResetStage(1) : handleConfirmReset()}
                  className={`flex-1 px-4 py-3.5 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 
                    ${resetStage === 1 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'} 
                    transition-all`}
                >
                  {resetStage === 0 ? (
                    <>
                      <span>Tiếp tục</span>
                      <Icon name="ChevronRight" size={16} />
                    </>
                  ) : (
                    <>
                      <Icon name="RotateCcw" size={16} />
                      <span>Xác nhận Reset</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Reset Stats Button */}
      <button
        onClick={() => setShowResetModal(true)}
        className="group px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105 relative overflow-hidden"
      >
        {/* Background shine effect */}
        <div className="absolute top-0 left-0 h-full w-16 bg-white opacity-20 skew-x-30 transform -translate-x-20 transition-transform group-hover:translate-x-64 duration-1000"></div>
        
        {/* Button content */}
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

      {/* Render modal khi cần */}
      {showResetModal && <ResetModal />}
    </>
  );
};

export default ResetStatsControl;
