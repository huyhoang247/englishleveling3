import React, { useState } from 'react';

// Custom Icon component using inline SVG (Copied from original file for self-containment)
// This component is used to render various icons based on the 'name' prop.
const Icon = ({ name, size = 24, className = '' }) => {
  // Define SVG paths for different icons.
  const icons = {
    RotateCcw: <g><path d="M3 12a9 9 0 1 0 9-9"></path><path d="M3 12v.7L6 9"></path></g>,
    ArrowRight: <g><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></g>,
    AlertCircle: <g><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></g>,
    Gem: <g><path d="M6 3h12l4 6-10 13L2 9l4-6z"></path><path d="M12 22L4 9l8-6 8 6-8 13z"></path><path d="M12 2l8 7-8 7-8-7 8-7z"></path><path d="M2 9h20"></path><path d="M12 2v20"></path></g>,
    X: <g><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></g>,
  };

  // Warn if the requested icon name is not found.
  if (!icons[name]) {
    console.warn(`Icon component: Icon with name "${name}" not found.`);
    return null;
  }

  // Render the SVG element with the specified icon path and styles.
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
  // Current character stats, needed to calculate refund points.
  currentStats: {
    atk: number;
    def: number;
    hp: number;
    luck: number;
    wit: number;
    crt: number;
  };
  // Callback function called when the user confirms the reset.
  // The number of refunded points will be passed to the parent component.
  onStatsReset: (pointsRefunded: number) => void;
}

// Component for the enhanced loading spinner animation.
const LoadingSpinner = ({ size = 48, color = 'currentColor' }) => {
  return (
    // Container for the spinner, centered and styled.
    <div className="flex items-center justify-center">
      {/* The Icon component is used here with a custom animation class. */}
      <Icon
        name="RotateCcw"
        size={size}
        className={`text-${color} animate-spin-pulse-custom`} // Apply custom combined animation class
      />
      {/* Define the custom keyframes for the combined animation */}
      <style jsx>{`
        @keyframes spin-custom {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-custom {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-spin-pulse-custom {
          animation: spin-custom 1s linear infinite, pulse-custom 1.5s ease-in-out infinite; /* Combine animations */
          transform-origin: 50% 50%; /* Explicitly set rotation origin to center */
        }
      `}</style>
    </div>
  );
};


// Component to control the Reset Stats functionality.
const ResetStatsControl: React.FC<ResetStatsControlProps> = ({ currentStats, onStatsReset }) => {
  // State to control the visibility of the confirmation modal.
  const [showResetModal, setShowResetModal] = useState(false);
  // State to control the animation effect during the reset process.
  const [resetAnimation, setResetAnimation] = useState(false);

  // Function to calculate the total potential points allocated based on current stats.
  const calculateResetPoints = () => {
    return Object.entries(currentStats).reduce((total, [key, value]) => {
      // Calculate refund points for HP (1 point / 25 HP).
      if (key === 'hp') {
        return total + Math.floor(value / 25);
      } else {
        // Calculate refund points for other stats (1 point / 2 value).
        return total + Math.floor(value / 2);
      }
    }, 0);
  };

  // Function to handle the user confirming the reset in the modal.
  const handleConfirmReset = () => {
    setResetAnimation(true); // Start the processing animation.

    // Calculate the number of points to be refunded.
    const pointsToRefund = calculateResetPoints();

    // Use setTimeout to create a delay for the animation before executing the reset logic.
    setTimeout(() => {
      // Call the callback function from the parent component, passing the refunded points.
      onStatsReset(pointsToRefund);
      setShowResetModal(false); // Close the modal.
      setResetAnimation(false); // End the processing animation.
    }, 1500); // 1.5 seconds delay.
  };

  // Internal Component for the Reset Stats Confirmation Modal.
  const ResetModal = () => {
    // Calculate the points to be received to display in the modal.
    const pointsToReceive = calculateResetPoints();

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Modal Content */}
        <div className={`bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all ${resetAnimation ? 'scale-105' : ''}`}>
          {/* Display the processing interface if resetAnimation is true. */}
          {resetAnimation ? (
            <div className="flex flex-col items-center justify-center py-8">
              {/* Enhanced Loading Spinner Component */}
              <LoadingSpinner size={60} color="blue-500" /> {/* Use the new spinner */}
              {/* Processing message */}
              <p className="text-gray-500 text-sm mt-4">Vui lòng chờ trong giây lát.</p>
            </div>
          ) : (
            // Display the reset confirmation content if resetAnimation is false.
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
                  onClick={handleConfirmReset} // Call the confirmation handler function.
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
        onClick={() => setShowResetModal(true)} // Open the modal on click.
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

      {/* Render the modal if showResetModal is true. */}
      {showResetModal && <ResetModal />}
    </>
  );
};

export default ResetStatsControl;
