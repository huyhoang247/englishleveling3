// src/Auth.js
import React, { useState, useEffect } from 'react';
import { auth, googleProvider } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';

// --- Các biểu tượng (SVG Icons) cho giao diện đẹp hơn ---

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.32C34.553 4.475 29.626 2 24 2C11.822 2 2 11.822 2 24s9.822 22 22 22s22-9.822 22-22c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691c-1.332 2.623-2.074 5.56-2.074 8.651c0 3.091.742 6.028 2.074 8.651l-5.011 3.864C.945 32.744 0 28.534 0 24c0-4.534.945-8.744 2.617-12.529l5.011 3.22z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-4.792-3.714A8.91 8.91 0 0 1 24 36c-4.971 0-9.186-3.87-10.36-8.956l-4.922 3.822C10.551 38.358 16.636 44 24 44z" />
t
    <path fill="#1976D2" d="M43.611 20.083L43.595 20L42 20H24v8h11.303a12.04 12.04 0 0 1-4.087 7.585l4.792 3.714A22.005 22.005 0 0 0 46 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);


export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Bắt đầu là true để hiển thị skeleton/loading ban đầu
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Bắt đầu với form Đăng nhập

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Giữ nguyên logic xử lý của bạn ---

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
      console.error('Đăng ký lỗi:', err);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Email hoặc mật khẩu không đúng.');
      console.error('Đăng nhập lỗi:', err);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      // Logic đảm bảo document người dùng tồn tại sau khi đăng nhập Google
      // thường sẽ được xử lý ở một nơi khác (ví dụ: trong onAuthStateChanged hoặc 1 cloud function)
      // nhưng ở đây ta cứ tiếp tục luồng đơn giản.
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Đăng nhập với Google thất bại.');
      console.error('Google Sign‑in lỗi:', err);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      setError('Đăng xuất lỗi. Vui lòng thử lại.');
      console.error('Đăng xuất lỗi:', err);
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };
  
  // --- Giao diện được thiết kế lại ---

  if (loading && !user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-4 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        {user ? (
          // Giao diện khi đã đăng nhập
          <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
            <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random&size=128`} 
                alt="User Avatar"
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-200"
            />
            <h2 className="text-2xl font-bold text-gray-800">Chào mừng trở lại!</h2>
            <p className="text-gray-600 mt-2 mb-6">{user.displayName || user.email}</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              onClick={handleSignOut}
              disabled={loading}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Đăng xuất'
              )}
            </button>
          </div>
        ) : (
          // Giao diện Đăng nhập / Đăng ký
          <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in-up">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
              {isRegistering ? 'Tạo tài khoản' : 'Chào mừng bạn'}
            </h2>
            <p className="text-center text-gray-500 mb-8">
              {isRegistering ? 'Bắt đầu hành trình của bạn với chúng tôi!' : 'Đăng nhập để tiếp tục'}
            </p>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md" role="alert">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
              {/* Ô nhập Email */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>

              {/* Ô nhập Username (chỉ khi đăng ký) */}
              {isRegistering && (
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserIcon />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Tên người dùng (username)"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>
              )}
              
              {/* Ô nhập Mật khẩu */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockIcon />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={loading}
                />
              </div>

              {/* Nút Submit chính */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  isRegistering ? 'Đăng ký' : 'Đăng nhập'
                )}
              </button>
            </form>
            
            {/* Dải phân cách "hoặc" */}
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">hoặc tiếp tục với</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Nút đăng nhập Google */}
            <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300 disabled:opacity-50 flex items-center justify-center"
            >
                <GoogleIcon />
                Đăng nhập với Google
            </button>
            
            {/* Link chuyển đổi form */}
            <p className="text-center text-sm text-gray-600 mt-8">
              {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
              <button
                onClick={toggleForm}
                disabled={loading}
                className="font-semibold text-blue-600 hover:text-blue-700 ml-1 focus:outline-none"
              >
                {isRegistering ? 'Đăng nhập' : 'Đăng ký ngay'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
