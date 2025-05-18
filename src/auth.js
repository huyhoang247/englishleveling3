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
// Import db từ firebase.js để lưu thông tin người dùng vào Firestore
import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore'; // Import các hàm cần thiết cho Firestore

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // State cho username (chỉ dùng khi đăng ký)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Trạng thái loading
  const [error, setError] = useState('');     // Trạng thái lỗi
  const [isRegistering, setIsRegistering] = useState(true); // State để phân biệt Đăng ký (true) và Đăng nhập (false)

  // Theo dõi thay đổi trạng thái đăng nhập
  useEffect(() => {
    setLoading(true); // Bắt đầu với trạng thái loading khi kiểm tra auth state
    const unsubscribe = onAuthStateChanged(auth, u => {
      console.log("Auth state changed, user:", u);
      setUser(u);
      setLoading(false); // Kết thúc loading sau khi auth state được xác định
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleRegister = async e => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ
    setLoading(true);
    console.log("Attempting registration with:", email, "and username:", username);
    try {
      // Tạo người dùng mới bằng email và mật khẩu
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lưu thông tin người dùng bao gồm username vào Firestore
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          email: user.email,
          username: username, // Lưu username vào tài liệu người dùng
          createdAt: new Date(),
          coins: 0,
          gems: 0,
          keys: 0,
          openedImageIds: []
        });
        console.log("User document created in Firestore with username.");
      }

      // onAuthStateChanged sẽ tự động cập nhật user state
      console.log("Registration successful, waiting for onAuthStateChanged.");
    } catch (err) {
      console.error('Đăng ký lỗi:', err);
      setError(`Đăng ký lỗi: ${err.message}`); // Hiển thị lỗi cho người dùng
    }
    setLoading(false);
  };

  const handleLogin = async e => { // Thêm e để có thể gọi e.preventDefault() nếu dùng form
    e.preventDefault(); // Ngăn chặn reload trang nếu gọi từ form submit
    setError(''); // Xóa lỗi cũ
    setLoading(true);
    console.log("Attempting login with:", email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful:", userCredential.user);
      // onAuthStateChanged sẽ tự động cập nhật user state
    } catch (err) {
      console.error('Đăng nhập lỗi:', err);
      setError(`Đăng nhập lỗi: ${err.message}`); // Hiển thị lỗi cho người dùng
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError(''); // Xóa lỗi cũ
    setLoading(true);
    console.log("Attempting Google Sign-in");
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged sẽ tự động cập nhật user state và ensureUserDocumentExists trong index.tsx sẽ xử lý Firestore
      console.log("Google Sign-in successful, waiting for onAuthStateChanged.");
    } catch (err) {
      console.error('Google Sign‑in lỗi:', err);
      setError(`Google Sign-in lỗi: ${err.message}`); // Hiển thị lỗi cho người dùng
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    setError('');
    setLoading(true);
    try {
      await signOut(auth);
      console.log("Sign out successful.");
      // onAuthStateChanged sẽ tự động cập nhật user state thành null
    } catch (err) {
      console.error('Đăng xuất lỗi:', err);
      setError(`Đăng xuất lỗi: ${err.message}`);
    }
    setLoading(false);
  };

  if (loading && !user) { // Hiển thị loading indicator ban đầu hoặc khi đang xử lý
    return <div className="max-w-md mx-auto p-4 text-center">Đang tải...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {user ? (
        <div className="text-center">
          {/* Hiển thị username nếu có, nếu không thì hiển thị email hoặc displayName */}
          {/* Cần fetch username từ Firestore sau khi user state thay đổi */}
          {/* Tạm thời hiển thị email hoặc displayName */}
          <p className="mb-2">Xin chào, {user.displayName || user.email}</p>
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng xuất'}
          </button>
        </div>
      ) : (
        // Sử dụng một form duy nhất và điều chỉnh nội dung dựa vào isRegistering
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          <h2 className="text-xl font-semibold text-center">{isRegistering ? 'Đăng ký tài khoản mới' : 'Đăng nhập'}</h2>
          {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded">{error}</p>}
          <div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>
          {/* Chỉ hiển thị input username khi đang ở chế độ Đăng ký */}
          {isRegistering && (
            <div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username"
                required // Username là bắt buộc khi đăng ký
                className="w-full p-2 border rounded"
                disabled={loading}
              />
            </div>
          )}
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              required
              className="w-full p-2 border rounded"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col space-y-2"> {/* Dùng flex-col để các nút xếp dọc */}
            <button
              type="submit" // Nút này sẽ submit form, gọi handleRegister hoặc handleLogin tùy vào isRegistering
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : (isRegistering ? 'Đăng ký' : 'Đăng nhập')}
            </button>
            {/* Nút chuyển đổi giữa Đăng ký và Đăng nhập */}
            <button
              type="button" // Quan trọng: type="button" để không submit form
              onClick={() => {
                setIsRegistering(!isRegistering); // Đảo ngược trạng thái
                setError(''); // Xóa lỗi khi chuyển đổi
                setEmail(''); // Xóa email, password, username khi chuyển đổi
                setPassword('');
                setUsername('');
              }}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            >
              {isRegistering ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}
            </button>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full px-4 py-2 bg-yellow-500 text-black rounded disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
