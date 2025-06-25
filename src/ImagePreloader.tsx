// ImagePreloader.tsx
import { useEffect } from 'react';

interface ImagePreloaderProps {
  imageUrls: string[];
}

// Component này không render ra bất cứ thứ gì trên UI.
// Nó chỉ tồn tại để kích hoạt việc tải ảnh vào cache của trình duyệt.
const ImagePreloader = ({ imageUrls }: ImagePreloaderProps) => {
  useEffect(() => {
    imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [imageUrls]); // Chạy lại mỗi khi danh sách URL thay đổi

  return null; // Không render gì cả
};

export default ImagePreloader;
