// --- START OF FILE useDarkMode.ts ---

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useDarkMode(): [boolean, (isDark: boolean) => void] {
  // 1. Khởi tạo state, ưu tiên theo thứ tự:
  //    - Giá trị đã lưu trong localStorage
  //    - Chế độ của hệ điều hành
  //    - Mặc định là 'light'
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (error) {
      // Server-side rendering, không có window
      return false;
    }
  });

  // Hàm để set theme, dùng cho các nút bấm
  const setMode = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };
  
  // 2. Sử dụng useEffect để cập nhật class 'dark' trên <html>
  //    và lưu lựa chọn vào localStorage mỗi khi isDarkMode thay đổi.
  useEffect(() => {
    const root = window.document.documentElement;
    const newTheme: Theme = isDarkMode ? 'dark' : 'light';
    
    root.classList.remove(isDarkMode ? 'light' : 'dark');
    root.classList.add(newTheme);

    try {
      window.localStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error("Không thể truy cập localStorage", error);
    }
  }, [isDarkMode]);

  return [isDarkMode, setMode];
}
