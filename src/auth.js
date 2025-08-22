// --- START OF FILE src/auth.js ---

// src/auth.js - Phiên bản cuối cùng: Giữ lại giao diện form gốc, loại bỏ loading thừa.
import React, { useState } from 'react';
import { auth, googleProvider } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';

// --- Các biểu tượng (SVG Icons) ---
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.32C34.553 4.475 29.626 2 24 2C11.822 2 2 11.822 2 24s9.822 22 22 22s22-9.822 22-22c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691c-1.332 2.623-2.074 5.56-2.074 8.651c0 3.091.742 6.028 2.074 8.651l-5.011 3.864C.945 32.744 0 28.534 0 24c0-4.534.945-8.744 2.617-12.529l5.011 3.22z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-4.792-3.714A8.91 8.91 0 0 1 24 36c-4.971 0-9.186-3.87-10.36-8.956l-4.922 3.822C10.551 38.358 16.636 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083L43.595 20L42 20H24v8h11.303a12.04 12.04 0 0 1-4.087 7.585l4.792 3.714A22.005 22.005 0 0 0 46 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);


// Component này không cần prop `logoFloating` nữa
export default function Auth({ appVersion }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  // `loading` giờ chỉ dành cho các hành động submit form, không phải loading ban đầu
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // XÓA BỎ useEffect và onAuthStateChanged VÌ App.tsx đã xử lý

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setError('');
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          username: username,
          createdAt: new Date(),
          coins: 0, gems: 0, keys: 0, openedImageIds: []
        });
      }
    } catch (err) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email này đã được sử dụng.' : 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng.');
    } finally {
        setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Đăng nhập với Google thất bại.');
    } finally {
        setLoading(false);
    }
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };
  
  // XÓA BỎ MÀN HÌNH LOADING RIÊNG BIỆT (`if (loading && !user)`)

  return (
    // Trả về giao diện form nguyên bản của bạn
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="w-full max-w-md">
          {/* Xóa bỏ logic `user ? ... : ...` vì component này chỉ render khi không có user */}
          <div className="relative bg-gray-800 p-8 pt-20 rounded-xl shadow-lg shadow-blue-500/10 animate-fade-in-up border border-gray-700">
            <img
              src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/main/src/assets/images/logo.webp"
              alt="App Logo"
              className="w-32 h-32 absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 mb-5 rounded-lg text-center" role="alert">
                <p className="font-medium text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><MailIcon /></span>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Email của bạn" required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>

              {isRegistering && (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3"><UserIcon /></span>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Tên người dùng (username)" required
                    className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>
              )}
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3"><LockIcon /></span>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Mật khẩu" required
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 text-gray-200 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading} className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isRegistering ? 'Đăng ký' : 'Đăng nhập')}
              </button>
            </form>
            
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">hoặc tiếp tục với</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <button onClick={handleGoogle} disabled={loading} className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-gray-200 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center">
                <GoogleIcon />
                Đăng nhập với Google
            </button>
            
            <p className="text-center text-sm text-gray-400 mt-8">
              {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
              <button onClick={toggleForm} disabled={loading} className="font-semibold text-blue-500 hover:text-blue-400 ml-1 focus:outline-none">
                {isRegistering ? 'Đăng nhập' : 'Đăng ký ngay'}
              </button>
            </p>
          </div>
      </div>
      <p className="absolute right-4 text-xs font-mono text-gray-500 tracking-wider opacity-60 bottom-[calc(1rem+env(safe-area-inset-bottom))]">
          Version {appVersion}
      </p>
    </div>
  );
}
