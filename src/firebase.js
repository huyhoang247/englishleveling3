// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Import thêm auth và provider
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';

// Import Firestore
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDbdIjGaUoCB2RMZGbeoFaSTKUl8g21I7Y", // <-- Thay bằng cấu hình của bạn
  authDomain: "englishleveling-82f44.firebaseapp.com", // <-- Thay bằng cấu hình của bạn
  projectId: "englishleveling-82f44", // <-- Thay bằng cấu hình của bạn
  storageBucket: "englishleveling-82f44.appspot.com", // <-- Thay bằng cấu hình của bạn
  messagingSenderId: "814669813776", // <-- Thay bằng cấu hình của bạn
  appId: "1:814669813776:web:fe7abeb97c4514202a9295", // <-- Thay bằng cấu hình của bạn
  measurementId: "G-KQ86BV6LHG" // <-- Thay bằng cấu hình của bạn
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Khởi tạo Firebase Authentication
const auth = getAuth(app);

// Tạo các provider để sử dụng
const googleProvider = new GoogleAuthProvider();
const emailProvider = EmailAuthProvider;

// Khởi tạo Firestore
const db = getFirestore(app);

export {
  app,
  analytics,
  auth,
  googleProvider,
  emailProvider,
  db // Export db
};
