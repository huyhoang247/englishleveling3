// --- START OF NEW FILE useAnimateValue.ts ---

import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook để tạo hiệu ứng số đếm (tăng hoặc giảm).
 * @param endValue Giá trị cuối cùng muốn animate tới.
 * @param duration Thời gian diễn ra animation (tính bằng ms).
 * @returns Giá trị hiện tại trong quá trình animate.
 */
export const useAnimateValue = (endValue: number, duration: number = 500): number => {
  // State để lưu trữ giá trị hiển thị trên UI
  const [currentValue, setCurrentValue] = useState(endValue);
  
  // Ref để lưu trữ giá trị bắt đầu của mỗi lần animation
  // và ID của requestAnimationFrame để có thể hủy nó
  const startValueRef = useRef(endValue);
  const frameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = startValueRef.current;
    
    // Nếu giá trị không đổi, không cần animate
    if (endValue === startValue) {
      setCurrentValue(endValue);
      return;
    }

    let startTime: number | null = null;
    const range = endValue - startValue;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }
      
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const nextValue = startValue + range * progress;

      // Cập nhật giá trị hiển thị
      setCurrentValue(Math.round(nextValue));
      
      // Nếu animation chưa kết thúc, tiếp tục yêu cầu frame tiếp theo
      if (progress < 1) {
        frameIdRef.current = requestAnimationFrame(animate);
      } else {
        // Đảm bảo giá trị cuối cùng luôn chính xác
        setCurrentValue(endValue);
        startValueRef.current = endValue; // Cập nhật giá trị bắt đầu cho lần animate sau
      }
    };

    // Bắt đầu animation
    frameIdRef.current = requestAnimationFrame(animate);

    // Cleanup function: Hủy animation khi component unmount hoặc endValue thay đổi
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      // Cập nhật ref để lần animate tiếp theo bắt đầu từ giá trị cuối cùng của lần này
      startValueRef.current = endValue;
    };
  }, [endValue, duration]); // Chạy lại effect khi endValue hoặc duration thay đổi

  return currentValue;
};
