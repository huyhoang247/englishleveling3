// src/hooks/useUniqueImageReward.ts (ví dụ về đường dẫn)

import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebase'; // Đảm bảo đường dẫn này đúng
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { defaultImageUrls } from '../image-url'; // Đảm bảo đường dẫn này đúng

// Định nghĩa kiểu dữ liệu cho phần thưởng
export interface ImageReward {
  id: number; // 1-based ID
  url: string;
}

export const useUniqueImageReward = (currentUserId: string | null) => {
  const [availableImageIndices, setAvailableImageIndices] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hàm fetch dữ liệu từ Firestore
  const fetchOpenedImages = useCallback(async () => {
    if (!currentUserId) {
      // Nếu không có user, coi như tất cả hình ảnh đều có sẵn
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
      let openedImageIds: number[] = []; // 1-based IDs

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData?.openedImageIds && Array.isArray(userData.openedImageIds)) {
          openedImageIds = userData.openedImageIds.filter(id => typeof id === 'number' && id > 0);
        }
      } else {
        // Tạo document nếu chưa có
        await setDoc(userDocRef, { openedImageIds: [] }, { merge: true });
      }

      const openedImageIndices = openedImageIds.map(id => id - 1);
      const allIndices = defaultImageUrls.map((_, index) => index);
      const remainingIndices = allIndices.filter(index => !openedImageIndices.includes(index));
      
      setAvailableImageIndices(remainingIndices);
    } catch (err) {
      console.error("Error fetching/creating user image data:", err);
      setError("Không thể tải dữ liệu hình ảnh. Vui lòng thử lại.");
      // Fallback: cho phép chơi với tất cả hình ảnh nếu có lỗi
      const allIndices = defaultImageUrls.map((_, index) => index);
      setAvailableImageIndices(allIndices);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchOpenedImages();
  }, [fetchOpenedImages]);

  // Hàm lưu ID hình ảnh đã mở vào Firestore
  const addOpenedImageToFirestore = async (imageIds: number[]) => {
    if (!currentUserId || imageIds.length === 0) return;
    const userDocRef = doc(db, 'users', currentUserId);
    try {
      await updateDoc(userDocRef, {
        openedImageIds: arrayUnion(...imageIds)
      });
    } catch (error) {
      console.error("Error updating opened images in Firestore:", error);
      // Có thể thêm logic retry hoặc thông báo lỗi ở đây
    }
  };

  // Hàm chính để lấy phần thưởng
  const getNextRewards = useCallback((count: number): ImageReward[] => {
    if (availableImageIndices.length === 0) {
      console.log("Hết hình ảnh để mở!");
      return [];
    }

    const rewards: ImageReward[] = [];
    let currentAvailableIndices = [...availableImageIndices];
    
    const numToPick = Math.min(count, currentAvailableIndices.length);

    for (let i = 0; i < numToPick; i++) {
        const randomIndex = Math.floor(Math.random() * currentAvailableIndices.length);
        const selectedImageIndex = currentAvailableIndices[randomIndex];
        
        rewards.push({
            id: selectedImageIndex + 1, // 1-based ID
            url: defaultImageUrls[selectedImageIndex]
        });

        // Xóa index đã chọn để không bị trùng lặp trong một lần gọi
        currentAvailableIndices.splice(randomIndex, 1);
    }

    if (rewards.length > 0) {
        const newOpenedIds = rewards.map(r => r.id);
        // Cập nhật state ngay lập tức để UI phản hồi nhanh
        setAvailableImageIndices(prev => prev.filter(index => !newOpenedIds.includes(index + 1)));
        // Gửi cập nhật lên Firestore ở chế độ nền
        addOpenedImageToFirestore(newOpenedIds);
    }

    return rewards;
  }, [availableImageIndices, currentUserId]);

  return {
    isLoading,
    error,
    availableCount: availableImageIndices.length,
    totalCount: defaultImageUrls.length,
    getNextRewards,
    refetch: fetchOpenedImages, // Cung cấp hàm để tải lại dữ liệu nếu cần
  };
};
