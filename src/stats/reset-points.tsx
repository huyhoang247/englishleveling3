import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react'; // Import lottie-react

// Custom Icon component using inline SVG (Copied from original file for self-containment)
// Note: This component is kept but the loading spinner will use Lottie instead.
const Icon = ({ name, size = 24, className = '' }) => {
  const icons = {
    RotateCcw: <g><path d="M3 12a9 9 0 1 0 9-9"></path><path d="M3 12v.7L6 9"></path></g>,
    ArrowRight: <g><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></g>,
    AlertCircle: <g><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></g>,
    Gem: <g><path d="M6 3h12l4 6-10 13L2 9l4-6z"></path><path d="M12 22L4 9l8-6 8 6-8 13z"></path><path d="M12 2l8 7-8 7-8-7 8-7z"></path><path d="M2 9h20"></path><path d="M12 2v20"></path></g>,
    X: <g><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></g>,
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

// Define interface for props
interface ResetStatsControlProps {
  // Current character stats, needed to calculate refund points
  currentStats: {
    atk: number;
    def: number;
    hp: number;
    luck: number;
    wit: number;
    crt: number;
  };
  // Callback function called when user confirms reset
  // Will pass the refunded points back to the parent component
  onStatsReset: (pointsRefunded: number) => void;
}

// Component for controlling the Reset Stats functionality
const ResetStatsControl: React.FC<ResetStatsControlProps> = ({ currentStats, onStatsReset }) => {
  // State to control modal visibility
  const [showResetModal, setShowResetModal] = useState(false);
  // State to control reset animation effect
  const [resetAnimation, setResetAnimation] = useState(false);
  // State to store Lottie animation data
  const [lottieAnimationData, setLottieAnimationData] = useState(null);
  // State to track if Lottie data is loading
  const [isLottieLoading, setIsLottieLoading] = useState(true);
  // State to track if Lottie data failed to load
  const [lottieError, setLottieError] = useState(false);

  // Fetch Lottie animation data on component mount
  useEffect(() => {
    const fetchLottieData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/loading.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLottieAnimationData(data);
        setIsLottieLoading(false);
      } catch (error) {
        console.error("Failed to fetch Lottie animation:", error);
        setLottieError(true);
        setIsLottieLoading(false);
      }
    };

    fetchLottieData();
  }, []); // Empty dependency array means this runs once on mount

  // Function to calculate total allocated potential points based on current stats
  const calculateResetPoints = () => {
    return Object.entries(currentStats).reduce((total, [key, value]) => {
      // Calculate refund points for HP (1 point / 25 HP)
      if (key === 'hp') {
        return total + Math.floor(value / 25);
      } else {
        // Calculate refund points for other stats (1 point / 2 value)
        return total + Math.floor(value / 2);
      }
    }, 0);
  };

  // Handler when user confirms reset in the modal
  const handleConfirmReset = () => {
    setResetAnimation(true); // Start processing animation

    // Calculate points to refund
    const pointsToRefund = calculateResetPoints();

    // Use setTimeout to create a delay for the animation before performing reset logic
    setTimeout(() => {
      // Call the callback function from the parent component, passing the refunded points
      onStatsReset(pointsToRefund);
      setShowResetModal(false); // Close modal
      setResetAnimation(false); // End processing animation
    }, 1500); // 1.5 second delay
  };

  // Internal Component for Reset Stats Confirmation Modal
  const ResetModal = () => {
    // Calculate points to receive to display in the modal
    const pointsToReceive = calculateResetPoints();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Modal Content */}
        <div className={`bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all ${resetAnimation ? 'scale-105' : ''}`}>
          {/* Display processing interface if resetAnimation is true */}
          {resetAnimation ? (
            <div className="flex flex-col items-center justify-center py-8">
              {/* Display Lottie animation if loaded, otherwise show fallback */}
              {isLottieLoading ? (
                // Fallback spinner while Lottie is loading
                <div className="w-12 h-12 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
              ) : lottieAnimationData ? (
                // Lottie animation
                <Lottie animationData={lottieAnimationData} loop={true} className="w-24 h-24 mb-4" />
              ) : (
                // Fallback message if Lottie failed to load
                <div className="text-red-500 mb-4">Lỗi tải animation.</div>
              )}
              {/* Processing message */}
              <p className="text-gray-500 text-sm mt-1">Vui lòng chờ trong giây lát.</p>
            </div>
          ) : (
            // Display reset confirmation content if resetAnimation is false
            <>
              {/* Modal Header */}
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-4 rounded-xl mb-4 shadow-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center mr-4">
                    <Icon name="RotateCcw" size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">Reset Chỉ Số</h3>
                    <p className="text-blue-100 text-sm">Lấy lại điểm phân bổ</p>
                  </div>
                </div>
              </div>

              {/* Important Note Section */}
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

              {/* Points Received Section */}
              <div className="bg-gray-50 p-3 rounded-lg mb-5">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Bạn sẽ nhận được:</h4>
                <div className="flex items-center bg-white p-3 rounded-lg border border-blue-100">
                  {/* Point Icon */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-3">
                    <Icon name="Gem" size={16} className="text-white" />
                  </div>
                  {/* Point Description */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-700">Điểm Tiềm Năng</p>
                    <p className="text-xs text-gray-500">Dùng để nâng cấp chỉ số</p>
                  </div>
                  {/* Points Amount */}
                  <div className="bg-indigo-100 px-3 py-1 rounded-lg text-indigo-600 font-bold">
                    +{pointsToReceive}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {/* Cancel Button */}
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                >
                  Hủy
                </button>
                {/* Reset Button */}
                <button
                  onClick={handleConfirmReset} // Call confirmation handler
                  className={`flex-1 px-4 py-3 rounded-xl font-medium text-white shadow-lg flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all`}
                >
                   <Icon name="RotateCcw" size={16} />
                   Reset
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* "Reset Stats" button in the footer */}
      <button
        onClick={() => setShowResetModal(true)} // Open modal on click
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

      {/* Render modal if showResetModal is true */}
      {showResetModal && <ResetModal />}
    </>
  );
};

export default ResetStatsControl;
