// --- START OF FILE EbookReader.tsx (formerly game.tsx) ---

import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { Book, sampleBooks as initialSampleBooks } from './books-data';
import { defaultVocabulary } from './voca-data/list-vocabulary';
import { phraseData } from './phrase-data-2';
import BookLibrary from './BookLibrary';
import BookReaderView from './BookReaderView';

// --- Interfaces needed by this container component ---
interface Vocabulary {
  word: string; meaning: string; example: string; phrases: string[];
  popularity: "Cao" | "Trung bình" | "Thấp"; synonyms: string[]; antonyms: string[];
}
interface Playlist { id: string; name: string; cardIds: number[]; }
interface PhraseSentence {
  parts: { english: string; vietnamese: string; }[]; fullEnglish: string; fullVietnamese: string;
}
interface EbookReaderProps {
  hideNavBar: () => void;
  showNavBar: () => void;
}

const EbookReader: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  const [booksData, setBooksData] = useState<Book[]>(initialSampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // --- Effects for fetching global data ---
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => setCurrentUser(user));
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!currentUser) { setPlaylists([]); return; }
    const userDocRef = doc(db, 'users', currentUser.uid);
    const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) setPlaylists(docSnap.data().playlists || []);
      else setPlaylists([]);
    }, (error) => console.error("Firestore snapshot error:", error));
    return unsubscribeFirestore;
  }, [currentUser]);

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

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);
  
  useEffect(() => {
    if (selectedBookId) hideNavBar(); else showNavBar();
  }, [selectedBookId, hideNavBar, showNavBar]);

  const { phraseMap, phraseRegex } = useMemo(() => {
    const sortedPhrases = [...phraseData].sort((a, b) => b.fullEnglish.length - a.fullEnglish.length);
    const tempMap = new Map<string, PhraseSentence>();
    const phraseStrings: string[] = [];
    sortedPhrases.forEach(phrase => {
      const lowerCasePhrase = phrase.fullEnglish.toLowerCase();
      tempMap.set(lowerCasePhrase, phrase);
      phraseStrings.push(lowerCasePhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    });
    if (phraseStrings.length === 0) return { phraseMap: tempMap, phraseRegex: null };
    const regex = new RegExp(`(${phraseStrings.join('|')})`, 'gi');
    return { phraseMap: tempMap, phraseRegex: regex };
  }, []);

  const handleSelectBook = (bookId: string) => setSelectedBookId(bookId);
  const handleBackToLibrary = () => setSelectedBookId(null);
  
  const currentBook = useMemo(() => booksData.find(book => book.id === selectedBookId), [booksData, selectedBookId]);

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {isLoadingVocab ? (
        <div className="flex-grow flex items-center justify-center"><p>Đang tải dữ liệu...</p></div>
      ) : !selectedBookId ? (
        <BookLibrary 
            books={booksData} 
            onSelectBook={handleSelectBook} 
        />
      ) : (
        currentBook && (
            <BookReaderView
                book={currentBook}
                onBackToLibrary={handleBackToLibrary}
                vocabMap={vocabMap}
                phraseMap={phraseMap}
                phraseRegex={phraseRegex}
                currentUser={currentUser}
                playlists={playlists}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            />
        )
      )}
    </div>
  );
};

export default EbookReader;
// --- END OF FILE EbookReader.tsx ---
