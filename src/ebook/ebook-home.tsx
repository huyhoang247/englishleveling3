// --- START OF FILE GamePage.tsx ---

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase.js'; 

import Library from './Library.tsx';
import EbookReader from './EbookReader.tsx';

import { defaultVocabulary } from './voca-data/list-vocabulary.ts';
import { Book, sampleBooks as initialSampleBooks } from './books-data.ts';

// --- Interfaces (có thể chuyển vào file types.ts) ---
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

interface GamePageProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

const GamePage: React.FC<GamePageProps> = ({ hideNavBar, showNavBar }) => {
  const [booksData] = useState<Book[]>(initialSampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Effect to manage navbar visibility based on book selection
  useEffect(() => {
    if (selectedBookId) {
      hideNavBar();
    } else {
      showNavBar();
    }
  }, [selectedBookId, hideNavBar, showNavBar]);

  // Effect for authentication state
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => setCurrentUser(user));
    return unsubscribeAuth;
  }, []);

  // Effect to fetch user playlists from Firestore
  useEffect(() => {
    if (!currentUser) {
      setPlaylists([]);
      return;
    }
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
      setPlaylists(docSnap.exists() ? docSnap.data().playlists || [] : []);
    }, (error) => {
      console.error("Error fetching playlists:", error);
    });
    return unsubscribeFirestore;
  }, [currentUser]);

  // Effect to prepare vocabulary map
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
  
  // Effect for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
  };

  const handleBackToLibrary = () => {
    setSelectedBookId(null);
  };
  
  const currentBook = useMemo(() => 
    booksData.find(book => book.id === selectedBookId)
  , [booksData, selectedBookId]);

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {currentBook ? (
        <EbookReader
          book={currentBook}
          vocabMap={vocabMap}
          isLoadingVocab={isLoadingVocab}
          currentUser={currentUser}
          playlists={playlists}
          isDarkMode={isDarkMode}
          toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onBackToLibrary={handleBackToLibrary}
        />
      ) : (
        <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-850">
          <Library books={booksData} onSelectBook={handleSelectBook} />
        </main>
      )}
    </div>
  );
};

export default GamePage;
// --- END OF FILE GamePage.tsx ---
