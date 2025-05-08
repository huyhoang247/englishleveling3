// src/Auth.js
import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged // Import onAuthStateChanged
} from 'firebase/auth';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Không cần state 'user' ở đây nữa vì index.tsx sẽ quản lý trạng thái user
  // const [user, setUser] = useState(null);

  // Theo dõi thay đổi trạng thái đăng nhập
  // useEffect(() => {
  //   const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
  //   return unsubscribe;
  // }, []);
  // Logic theo dõi trạng thái user đã được chuyển sang index.tsx

  const handleRegister = async e => {
    e.preventDefault(); // Thêm e.preventDefault() để ngăn reload trang
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Xử lý sau khi đăng ký thành công (ví dụ: hiển thị thông báo, chuyển hướng)
    } catch (err) {
      console.error('Đăng ký lỗi:', err);
      // TODO: Thêm xử lý hiển thị lỗi cho người dùng
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Xử lý sau khi đăng nhập thành công
    } catch (err) {
      console.error('Đăng nhập lỗi:', err);
      // TODO: Thêm xử lý hiển thị lỗi cho người dùng
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      // Xử lý sau khi đăng nhập Google thành công
    } catch (err) {
      console.error('Google Sign‑in lỗi:', err);
      // TODO: Thêm xử lý hiển thị lỗi cho người dùng
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    // Xử lý sau khi đăng xuất thành công (index.tsx sẽ tự động hiển thị lại Auth)
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Logic hiển thị dựa trên trạng thái user đã được chuyển sang index.tsx */}
      {/* {user ? (
        <div className="text-center">
          <p className="mb-4">Xin chào, {user.displayName || user.email}</p>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Đăng xuất
          </button>
        </div>
      ) : ( */}
        {/* Sử dụng form cho cả đăng ký và đăng nhập, hoặc tách riêng */}
        {/* Hiện tại giữ nguyên một form nhưng sửa type button */}
        <form className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="button" // Sửa thành type="button"
              onClick={handleRegister} // Gọi hàm handleRegister trực tiếp
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Đăng ký
            </button>
            <button
              type="button"
              onClick={handleLogin}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
            >
              Đăng nhập
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleGoogle}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              Sign in with Google
            </button>
          </div>
        </form>
      {/* )} */}
    </div>
  );
}
