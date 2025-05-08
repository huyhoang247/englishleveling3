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

export default function Auth() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser]         = useState(null);

  // Theo dõi thay đổi trạng thái đăng nhập
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, u => setUser(u));
    return unsubscribe;
  }, []);

  const handleRegister = async e => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Đăng ký lỗi:', err);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Đăng nhập lỗi:', err);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign‑in lỗi:', err);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      {user ? (
        <div className="text-center">
          <p className="mb-4">Xin chào, {user.displayName || user.email}</p>
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
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
              type="submit"
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
      )}
    </div>
  );
}
