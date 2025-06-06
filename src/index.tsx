// src/index.tsx
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './background-game.tsx'; // Assuming Home is in background-game.tsx
import NavigationBarBottom from './navigation-bar-bottom.tsx';
import Story from './VerticalFlashcardGallery.tsx';
import Profile from './newgame.tsx';
import Quiz from './quiz/quiz-app-home.tsx';
import GameBrowser from './game.tsx'; // Import the new GameBrowser component
import AuthComponent from './auth.js';
import { auth, db } from './firebase.js'; // Import đối tượng auth và db của Firebase
import { onAuthStateChanged, User } from 'firebase/auth';
// Import các hàm cần thiết từ Firestore
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';

// Định nghĩa các loại tab có thể có
type TabType = 'home' | 'profile' | 'story' | 'quiz' | 'game'; // Add 'game' tab

// Hàm kiểm tra và tạo tài liệu người dùng trong Firestore nếu chưa có
const ensureUserDocumentExists = async (user: User) => {
  if (!user || !user.uid) {
    console.error("User object or UID is missing.");
    return;
  }

  // Lấy tham chiếu đến tài liệu người dùng trong collection 'users'
  const userDocRef = doc(db, 'users', user.uid);

  try {
    // Lấy snapshot của tài liệu
    const userDocSnap = await getDoc(userDocRef);

    // Kiểm tra xem tài liệu có tồn tại không
    if (!userDocSnap.exists()) {
      console.log(`User document for ${user.uid} does not exist. Creating...`);
      // Nếu không tồn tại, tạo tài liệu mới
      // Bao gồm email, timestamp và các trường mặc định khác
      // Quan trọng: Nếu người dùng đăng ký bằng email/password, username đã được lưu trong Auth.js.
      // Nếu người dùng đăng nhập bằng Google, ta có thể lấy displayName làm username ban đầu
      // hoặc để trống và yêu cầu người dùng cập nhật sau.
      await setDoc(userDocRef, {
        email: user.email, // Lưu email của người dùng
        // Thêm username. Nếu đăng nhập Google, user.displayName có thể là username ban đầu.
        // Nếu đăng ký email/password, username đã được xử lý trong Auth.js trước khi gọi hàm này.
        // Đối với Google Sign-in, user.displayName sẽ được sử dụng làm username ban đầu nếu có.
        username: user.displayName || null, // Sử dụng displayName của Google làm username ban đầu nếu có
        createdAt: new Date(), // Thêm timestamp thời gian tạo
        coins: 0, // Giá trị mặc định ban đầu
        gems: 0,   // Giá trị mặc định ban đầu
        keys: 0,    // Giá trị mặc định ban đầu
        openedImageIds: [] // Initialize openedImageIds as an empty array
        // Thêm các trường mặc định khác nếu cần
      });
      console.log(`User document for ${user.uid} created successfully.`);
    } else {
      console.log(`User document for ${user.uid} already exists.`);
      // Nếu tài liệu đã tồn tại, bạn có thể kiểm tra và cập nhật các trường nếu cần
      const userData = userDocSnap.data();

      // Cập nhật email nếu khác (ít xảy ra sau đăng ký)
      if (userData?.email !== user.email) {
          console.log(`Updating email for user ${user.uid} in Firestore.`);
          await setDoc(userDocRef, { email: user.email }, { merge: true });
      }

      // Đảm bảo trường openedImageIds tồn tại
       if (!userData?.openedImageIds) {
           console.log(`Adding openedImageIds field for user ${user.uid}.`);
           await setDoc(userDocRef, { openedImageIds: [] }, { merge: true });
       }

       // Kiểm tra và thêm trường username nếu chưa có (cho người dùng cũ)
       if (!userData?.username) {
           console.log(`Adding username field for user ${user.uid}.`);
           // Nếu người dùng cũ chưa có username, bạn có thể đặt giá trị mặc định
           // hoặc để null và yêu cầu họ cập nhật sau.
           // Ở đây, ta sẽ để null và có thể thêm logic yêu cầu người dùng cập nhật username sau.
           await setDoc(userDocRef, { username: null }, { merge: true });
       }
    }
  } catch (error) {
    console.error("Error ensuring user document exists:", error);
    // Xử lý lỗi nếu có
  }
};


const App: React.FC = () => {
  // State để theo dõi tab đang hoạt động, mặc định là 'home'
  const [activeTab, setActiveTab] = useState<TabType>('home');
  // State để kiểm soát hiển thị của thanh điều hướng
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  // State để lưu thông tin người dùng đã đăng nhập
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // State để xử lý quá trình kiểm tra trạng thái đăng nhập ban đầu
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Lắng nghe sự thay đổi trạng thái xác thực từ Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => { // Sử dụng async vì gọi hàm async bên trong
      setCurrentUser(user); // Cập nhật người dùng hiện tại

      if (user) {
        // Nếu có người dùng đăng nhập, đảm bảo tài liệu của họ tồn tại trong Firestore
        // Hàm này sẽ được gọi sau khi đăng ký email/password (username đã được lưu trong Auth.js)
        // và sau khi đăng nhập Google (username ban đầu có thể là displayName).
        await ensureUserDocumentExists(user);
      }

      setLoadingAuth(false); // Đã kiểm tra xong trạng thái, không còn loading nữa
    });

    // Cleanup subscription khi component unmount
    return () => unsubscribe();
  }, [auth]); // Depend on auth object (implicitly used by onAuthStateChanged)

  // Hàm xử lý thay đổi tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Đảm bảo thanh điều hướng hiển thị khi chuyển tab, trừ khi đó là tab story hoặc game
    if (tab !== 'story' && tab !== 'game') { // Added 'game' tab here
      setIsNavBarVisible(true);
    }
    if (tab === 'story' || tab === 'game') { // Added 'game' tab here
      setIsNavBarVisible(true);
    }
  };

  // Hàm ẩn thanh điều hướng
  const hideNavBar = () => {
    setIsNavBarVisible(false);
  };

  // Hàm hiển thị thanh điều hướng
  const showNavBar = () => {
    setIsNavBarVisible(true);
  };

  // Trong khi đang kiểm tra trạng thái đăng nhập, có thể hiển thị một loader
  if (loadingAuth) {
    return <div>Đang tải...</div>; // Hoặc một component loading đẹp hơn
  }

  // Nếu không có người dùng nào được xác thực (chưa đăng nhập)
  if (!currentUser) {
    // Hiển thị component AuthComponent để người dùng đăng nhập hoặc đăng ký
    // AuthComponent sẽ tự xử lý việc hiển thị form hoặc thông báo chào mừng (nếu có logic đó)
    return <AuthComponent />;
  }

  // Nếu người dùng đã được xác thực (đã đăng nhập)
  // Hiển thị nội dung chính của ứng dụng
  return (
    <div className="app-container">
      {/* Hiển thị component dựa trên activeTab state */}
      {activeTab === 'home' && (
        <Home
          hideNavBar={hideNavBar}
          showNavBar={showNavBar}
          currentUser={currentUser} // Truyền currentUser ở đây
        />
      )}
      {activeTab === 'profile' && <Profile />}
      {activeTab === 'story' && (
        // Truyền currentUser cho component Story
        <Story hideNavBar={hideNavBar} showNavBar={showNavBar} currentUser={currentUser} />
      )}
      {activeTab === 'quiz' && <Quiz />}
      {activeTab === 'game' && (
        // Truyền hideNavBar và showNavBar cho GameBrowser
        <GameBrowser hideNavBar={hideNavBar} showNavBar={showNavBar} />
      )}

      {/* Hiển thị thanh điều hướng dưới cùng nếu isNavBarVisible là true */}
      {isNavBarVisible && (
        <NavigationBarBottom
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
};

// Lấy root element từ HTML
const container = document.getElementById('root');
// Báo lỗi nếu không tìm thấy root element
if (!container) {
  throw new Error('Root element with ID "root" not found in the document.');
}

// Tạo root và render App component
const root = createRoot(container);
root.render(<App />);

export default App;
