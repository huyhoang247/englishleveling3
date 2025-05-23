// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

// Import thêm auth và provider
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDbdIjGaUoCB2RMZGbeoFaS***********",
  authDomain: "englishleveling-82f44.firebaseapp.com",
  projectId: "englishleveling-82f44",
  storageBucket: "englishleveling-82f44.appspot.com",
  messagingSenderId: "814669813776",
  appId: "1:814669813776:web:fe7abeb970********",
  measurementId: "G-KQ86BV6LHG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Khởi tạo Firebase Authentication
const auth = getAuth(app);

// Tạo các provider để sử dụng
const googleProvider = new GoogleAuthProvider();
const emailProvider = EmailAuthProvider;

export {
  app,
  analytics,
  auth,
  googleProvider,
  emailProvider
};
