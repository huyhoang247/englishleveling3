import React, { useState, useEffect } from 'react';

// Component hiển thị thời gian hiện tại
const App = () => {
  // State để lưu trữ thời gian hiện tại
  const [currentTime, setCurrentTime] = useState(new Date());

  // useEffect để cập nhật thời gian mỗi giây
  useEffect(() => {
    // Thiết lập interval để gọi hàm cập nhật thời gian mỗi 1000ms (1 giây)
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Cleanup function: Xóa interval khi component unmount
    return () => {
      clearInterval(timerId);
    };
  }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi mount và cleanup khi unmount

  // Định dạng thời gian (chỉ giờ, phút, giây)
  const optionsTime = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // Sử dụng định dạng 24 giờ
  };

  const formattedTime = currentTime.toLocaleTimeString('en-US', optionsTime);

  return (
    // Container chính, căn giữa nội dung theo chiều ngang và dọc
    // Đã loại bỏ bg-gray-100
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Card hoặc container hiển thị thời gian */}
      {/* Đã loại bỏ bg-white và shadow-2xl */}
      <div className="text-center">
        {/* Hiển thị thời gian chính */}
        {/* Đã thêm class opacity-75 */}
        <div className="text-lg font-bold text-black opacity-75">
          {formattedTime}
        </div>
        {/* Đã ẩn hiển thị ngày tháng và múi giờ */}
      </div>
    </div>
  );
};

export default App;
