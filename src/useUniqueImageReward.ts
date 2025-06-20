// src/hooks/useUniqueImageReward.ts

import { useState, useEffect, useCallback } from 'react';
// Giả sử firebase.js và image-url.ts nằm ở thư mục src
import { db } from '../firebase'; 
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { defaultImageUrls } from '../image-url';

// Định nghĩa kiểu dữ liệu cho phần thưởng hình ảnh để tái sử dụng
export interface ImageReward {
  id: number; // ID dựa trên index + 1 (1-based)
  url: string;
}

/**
 * Custom Hook để quản lý việc lấy phần thưởng hình ảnh duy nhất cho người dùng.
 * Tự động đồng bộ với Firestore.
 * @param currentUserId - ID của người dùng hiện tại, hoặc null nếu chưa đăng nhập.
 * @returns {object} Trạng thái và các hàm để tương tác.
 */
export const useUniqueImageReward = (currentUserId: string | null) => {
  const [availableImageIndices, setAvailableImageIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm để lấy danh sách các hình ảnh đã mở từ Firestore
  const fetchOpenedImages = useCallback(async () => {
    if (!currentUserId) {
      // Nếu không có người dùng, coi như tất cả hình ảnh đều có sẵn để trải nghiệm
      const allIndices = defaultImageUrls.map((_, index) => index);
      setAvailableImageIndices(allIndices);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const userDocRef = doc(db, 'users', currentUserId);

    try {
      const userDocSnap = await getDoc(userDocRef);
      let openedImageIds: number[] = []; // ID là 1-based

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData?.openedImageIds && Array.isArray(userData.openedImageIds)) {
          // Lọc để đảm bảo chỉ có số hợp lệ
          openedImageIds = userData.openedImageIds.filter(id => typeof id === 'number' && id > 0);
        }
      } else {
        // Nếu user document chưa tồn tại, tự động tạo mới
        await setDoc(userDocRef, { openedImageIds: [] }, { merge: true });
      }

      // Chuyển đổi ID (1-based) đã mở thành indices (0-based)
      const openedImageIndices = openedImageIds.map(id => id - 1);
      
      // Tạo danh sách tất cả các indices (0-based)
      const allIndices = defaultImageUrls.map((_, index) => index);
      
      // Lọc ra những indices còn lại (chưa được mở)
      const remainingIndices = allIndices.filter(index => !openedImageIndices.includes(index));
      
      setAvailableImageIndices(remainingIndices);
    } catch (err) {
      console.error("Error fetching/creating user image data:", err);
      setError("Không thể tải dữ liệu hình ảnh. Vui lòng thử lại.");
      // Cung cấp fallback: cho phép chơi với tất cả hình ảnh nếu có lỗi
      const allIndices = defaultImageUrls.map((_, index) => index);
      setAvailableImageIndices(allIndices);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // useEffect để chạy hàm fetch khi component mount hoặc userId thay đổi
  useEffect(() => {
    fetchOpenedImages();
  }, [fetchOpenedImages]);

  // Hàm để lưu các ID hình ảnh mới được mở vào Firestore
  const addOpenedImageIdsToFirestore = async (imageIds: number[]) => {
    if (!currentUserId || imageIds.length === 0) return;
    const userDocRef = doc(db, 'users', currentUserId);
    try {
      // Sử dụng arrayUnion để thêm các ID mới vào mảng một cách an toàn
      await updateDoc(userDocRef, {
        openedImageIds: arrayUnion(...imageIds)
      });
    } catch (error) {
      console.error("Error updating opened images in Firestore:", error);
      // Có thể thêm logic retry hoặc thông báo lỗi cho người dùng ở đây
    }
  };

  /**
   * Lấy một số lượng phần thưởng hình ảnh ngẫu nhiên và duy nhất từ danh sách có sẵn.
   * @param count - Số lượng phần thưởng cần lấy.
   * @returns {ImageReward[]} Mảng các đối tượng phần thưởng.
   */
  const getNextRewards = useCallback((count: number): ImageReward[] => {
    if (availableImageIndices.length === 0) {
      console.warn("Không còn hình ảnh nào để mở.");
      return [];
    }

    const rewards: ImageReward[] = [];
    // Tạo bản sao để không làm thay đổi state gốc trong lúc xử lý
    let currentAvailableIndices = [...availableImageIndices];
    
    // Đảm bảo không lấy nhiều hơn số lượng có sẵn
    const numToPick = Math.min(count, currentAvailableIndices.length);

    for (let i = 0; i < numToPick; i++) {
        // Chọn ngẫu nhiên một index từ danh sách còn lại
        const randomIndexInAvailableList = Math.floor(Math.random() * currentAvailableIndices.length);
        const selectedImageIndex = currentAvailableIndices[randomIndexInAvailableList];
        
        rewards.push({
            id: selectedImageIndex + 1, // Chuyển thành ID (1-based)
            url: defaultImageUrls[selectedImageIndex]
        });

        // Xóa index đã chọn khỏi danh sách tạm thời để không bị trùng
        currentAvailableIndices.splice(randomIndexInAvailableList, 1);
    }

    // Sau khi đã chọn xong, cập nhật state và Firestore
    if (rewards.length > 0) {
        const newOpenedIds = rewards.map(r => r.id);
        
        // Cập nhật state ngay lập tức để UI phản hồi nhanh
        const remainingIndices = availableImageIndices.filter(index => !newOpenedIds.includes(index + 1));
        setAvailableImageIndices(remainingIndices);

        // Gửi cập nhật lên Firestore ở chế độ nền
        addOpenedImageIdsToFirestore(newOpenedIds);
    }

    return rewards;
  }, [availableImageIndices, currentUserId]); // Thêm currentUserId vào dependencies

  // Trả về các giá trị và hàm cần thiết cho component
  return {
    isLoading,
    error,
    availableCount: availableImageIndices.length,
    totalCount: defaultImageUrls.length,
    getNextRewards,
    refetch: fetchOpenedImages, // Cung cấp hàm để tải lại nếu cần
  };
};
