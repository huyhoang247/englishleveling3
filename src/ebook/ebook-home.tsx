import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.js'; // Đảm bảo đường dẫn đúng

// Import các component con mới
import BookLibrary from './components/BookLibrary.tsx';
import BookReaderView from './components/BookReaderView.tsx';

// Import dữ liệu và types
import { defaultVocabulary } from '../voca-data/list-vocabulary.ts';
import { Book, sampleBooks as initialSampleBooks } from '../books-data.ts';

// --- Interfaces dùng chung ---
export interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp";
  synonyms: string[];
  antonyms: string[];
}

export interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  const [booksData] = useState<Book[]>(initialSampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Effect để quản lý NavBar dựa trên việc có sách được chọn hay không
  useEffect(() => {
    if (selectedBookId) {
      hideNavBar();
    } else {
      showNavBar();
    }
  }, [selectedBookId, hideNavBar, showNavBar]);

  // Effect để quản lý dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect để theo dõi trạng thái đăng nhập
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => setCurrentUser(user));
    return unsubscribeAuth;
  }, []);

  // Effect để lấy playlist của người dùng
  useEffect(() => {
    if (!currentUser) {
      setPlaylists([]);
      return;
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPlaylists(docSnap.data().playlists || []);
      } else {
        setPlaylists([]);
      }
    }, (error) => {
      console.error("Lỗi khi lấy dữ liệu playlist:", error);
    });
    return unsubscribeFirestore;
  }, [currentUser]);

  // Effect để khởi tạo vocabMap
  useEffect(() => {
    const tempMap = new Map<string, Vocabulary>();
    defaultVocabulary.forEach((word, index) => {
      tempMap.set(word.toLowerCase(), {
        word: word,
        meaning: `Nghĩa của từ "${word}" (ví dụ).`,
        example: `Đây là một câu ví dụ sử dụng từ "${word}".`,
        phrases: [`Cụm từ với ${word} A`, `Cụm từ với ${word} B`],
        popularity: (index % 3 === 0 ? "Cao" : (index % 2 === 0 ? "Trung bình" : "Thấp")),
        synonyms: [`Từ đồng nghĩa với ${word} 1`, `Từ đồng nghĩa với ${word} 2`],
        antonyms: [`Từ trái nghĩa với ${word} 1`, `Từ trái nghĩa với ${word} 2`],
      });
    });
    setVocabMap(tempMap);
    setIsLoadingVocab(false);
  }, []);
  
  // --- Handlers để chuyển đổi giữa các view ---
  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleBackToLibrary = () => {
    setSelectedBookId(null);
  };

  const currentBook = booksData.find(book => book.id === selectedBookId);

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {currentBook ? (
        <BookReaderView
          book={currentBook}
          onBackToLibrary={handleBackToLibrary}
          vocabMap={vocabMap}
          isLoadingVocab={isLoadingVocab}
          currentUser={currentUser}
          playlists={playlists}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
      ) : (
        <BookLibrary
          books={booksData}
          onSelectBook={handleSelectBook}
        />
      )}
    </div>
  );
};

export default EbookReader;
