import React from 'react';
import { useNavigate } from 'react-router-dom'; // Giả định bạn đang sử dụng react-router-dom
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Ví dụ sử dụng Heroicons cho icon back

interface FooterBackProps {
  // Prop để chứa phần tử (nút, icon, text,...) hiển thị bên phải icon back
  rightContent?: React.ReactNode;
  // Prop cho hành động khi click vào icon back
  onBackClick?: () => void;
}

const FooterBack: React.FC<FooterBackProps> = ({ rightContent, onBackClick }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      // Hành động mặc định: quay lại trang trước
      navigate(-1);
    }
  };

  return (
    // Sử dụng Tailwind CSS để tạo footer cố định ở cuối trang và flexbox để căn chỉnh
    <footer className="fixed bottom-0 left-0 w-full bg-gray-100 p-4 flex items-center justify-between shadow-lg z-20 rounded-t-xl">
      {/* Container cho icon back */}
      <div className="flex items-center">
        <button
          onClick={handleBackClick}
          className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-150 ease-in-out"
          aria-label="Quay lại"
        >
          <ArrowLeftIcon className="h-6 w-6 text-gray-700" />
        </button>
        {/* Bạn có thể thêm các phần tử khác bên cạnh icon back nếu cần */}
      </div>

      {/* Container cho nội dung bên phải (nút reset chỉ số hoặc nội dung khác) */}
      {/* Sử dụng flex items-center và space-x-2 để căn chỉnh và tạo khoảng cách */}
      <div className="flex items-center space-x-2">
        {rightContent}
      </div>
    </footer>
  );
};

export default FooterBack;
