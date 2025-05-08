// src/auth.js - AuthProvider Component
import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase'; // Import auth và db từ firebase.js

// Định nghĩa AuthContext
export const AuthContext = createContext({
  user: null,
  coins: 0,
  setCoins: (newCoins) => {}, // Placeholder function
  isLoadingUserData: true, // Thêm trạng thái loading dữ liệu user
});

// AuthProvider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [coins, setCoins] = useState(0);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true); // Khởi tạo là true

  useEffect(() => {
    // Theo dõi thay đổi trạng thái xác thực
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setIsLoadingUserData(true); // Bắt đầu tải dữ liệu user
      setUser(currentUser);

      if (currentUser) {
        // Nếu user đăng nhập, tải hoặc tạo document user
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const snap = await getDoc(userDocRef);

          if (snap.exists() && typeof snap.data().coins === 'number') {
            // Nếu document tồn tại và có trường coins hợp lệ
            setCoins(snap.data().coins);
            console.log("Loaded coins from Firestore:", snap.data().coins);
          } else {
            // Nếu chưa có document hoặc trường coins không hợp lệ, tạo mới với 0 coin
            console.log("User document not found or coins invalid, creating default.");
            await setDoc(userDocRef, { coins: 0, gems: 0, keys: 0, createdAt: new Date() }); // Thêm các trường mặc định khác nếu cần
            setCoins(0);
          }
        } catch (error) {
          console.error("Error fetching/creating user document:", error);
          // Xử lý lỗi (ví dụ: hiển thị thông báo cho người dùng)
          setCoins(0); // Đặt coins về 0 nếu có lỗi
        } finally {
           setIsLoadingUserData(false); // Kết thúc tải dữ liệu user
        }

      } else {
        // User đã logout
        console.log("User logged out.");
        setCoins(0); // Reset coins về 0
        setIsLoadingUserData(false); // Kết thúc tải dữ liệu user
      }
    });

    // Cleanup subscription khi component unmount
    return () => unsubscribe();
  }, []); // Dependency rỗng để chỉ chạy một lần khi mount

  return (
    // Cung cấp user, coins, setCoins và isLoadingUserData cho các component con
    <AuthContext.Provider value={{ user, coins, setCoins, isLoadingUserData }}>
      {children}
    </AuthContext.Provider>
  );
}
