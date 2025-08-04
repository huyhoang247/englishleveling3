// --- START OF FILE game.tsx (Full, Integrated Version) ---

import React, { useState, useEffect, useRef, useMemo } from 'react';
import YouTube from 'react-youtube'; // THÊM IMPORT MỚI
import FlashcardDetailModal from './story/flashcard.tsx';
import { defaultVocabulary } from './list-vocabulary.ts';
import { defaultImageUrls as gameImageUrls } from './image-url.ts';
import { Book, sampleBooks as initialSampleBooks } from './books-data.ts';
import { Video, sampleVideos } from './video-data.ts'; // THÊM IMPORT MỚI
import { auth, db } from './firebase.js'; 
import { User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import AddToPlaylistModal from './AddToPlaylistModal.tsx';

// --- Icons (GIỮ NGUYÊN TOÀN BỘ) ---
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
  </svg>
);
const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Zm9 0a.75.75 0 0 1 .75.75V18a.75.75 0 0 1-1.5 0V6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
  </svg>
);
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);
const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const StatsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zM9 9a1 1 0 00-1 1v6a1 1 0 102 0v-6a1 1 0 00-1-1zm4-5a1 1 0 00-1 1v10a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
// --- Interfaces (GIỮ NGUYÊN VÀ BỔ SUNG) ---
interface Vocabulary { /* ... */ word: string; meaning: string; example: string; phrases: string[]; popularity: "Cao" | "Trung bình" | "Thấp"; synonyms: string[]; antonyms: string[]; }
interface Flashcard { /* ... */ id: number; imageUrl: { default: string; anime?: string; comic?: string; realistic?: string; }; isFavorite: boolean; vocabulary: Vocabulary; }
interface Playlist { /* ... */ id: string; name: string; cardIds: number[]; }
interface EbookReaderProps { hideNavBar: () => void; showNavBar: () => void; }
interface BookStats { /* ... */ totalWords: number; uniqueWordsCount: number; vocabMatchCount: number; vocabMismatchCount: number; wordFrequencies: Map<string, number>; }
// THÊM INTERFACE CHO PHỤ ĐỀ
interface Subtitle { start: number; dur: number; text: string; }

// --- Utility Functions (GIỮ NGUYÊN VÀ BỔ SUNG) ---
const groupBooksByCategory = (books: Book[]): Record<string, Book[]> => { /* ... */ return books.reduce((acc, book) => { const category = book.category || 'Uncategorized'; if (!acc[category]) { acc[category] = []; } acc[category].push(book); return acc; }, {} as Record<string, Book[]>); };
const groupVideosByCategory = (videos: Video[]): Record<string, Video[]> => { return videos.reduce((acc, video) => { const category = video.category || 'Uncategorized'; if (!acc[category]) { acc[category] = []; } acc[category].push(video); return acc; }, {} as Record<string, Video[]>); };

// --- Sub-Components (BookSidebar, BookStatsModal - GIỮ NGUYÊN TOÀN BỘ) ---
const BookSidebar: React.FC<any> = ({ isOpen, onClose, book, isDarkMode, toggleDarkMode }) => { /* ... giữ nguyên toàn bộ code của BookSidebar ... */ return ( <> <div className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ease-in-out ${ isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none' }`} onClick={onClose} aria-hidden="true" /> <div className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${ isOpen ? 'translate-x-0' : '-translate-x-full' }`} role="dialog" aria-modal="true" aria-labelledby="sidebar-title" > <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0"> <h2 id="sidebar-title" className="text-lg font-semibold text-gray-800 dark:text-white truncate"> {book?.title || "Menu"} </h2> <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Đóng menu" > <XIcon /> </button> </div> <div className="p-4 space-y-6 overflow-y-auto flex-grow"> <div> <h3 className="mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nội dung sách</h3> <ul className="space-y-1"> {['Chương 1: Giới thiệu', 'Chương 2: Phát triển câu chuyện', 'Chương 3: Cao trào', 'Chương 4: Kết luận', 'Phụ lục'].map(item => ( <li key={item}> <a href="#" className="block px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"> {item} </a> </li> ))} </ul> </div> <hr className="border-gray-200 dark:border-gray-700" /> <div> <h3 className="mb-3 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cài đặt hiển thị</h3> <div className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"> <span className="text-gray-700 dark:text-gray-300">Chế độ tối</span> <button onClick={toggleDarkMode} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 ${ isDarkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600' }`} role="switch" aria-checked={isDarkMode} > <span className="sr-only">Chuyển đổi chế độ tối</span> <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${ isDarkMode ? 'translate-x-6' : 'translate-x-1' }`} /> </button> </div> </div> </div> <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0"> <p className="text-xs text-gray-500 dark:text-gray-400 text-center">© 2024 Ebook Reader</p> </div> </div> </> ); };
const BookStatsModal: React.FC<any> = ({ isOpen, onClose, stats, bookTitle, vocabMap }) => { /* ... giữ nguyên toàn bộ code của BookStatsModal ... */  const [activeTab, setActiveTab] = useState<'in' | 'out'>('in'); const { inDictionaryWords, outOfDictionaryWords } = useMemo(() => { const inDict: [string, number][] = []; const outDict: [string, number][] = []; if (stats) { for (const [word, count] of stats.wordFrequencies.entries()) { if (vocabMap.has(word)) { inDict.push([word, count]); } else { outDict.push([word, count]); } } } return { inDictionaryWords: inDict, outOfDictionaryWords: outDict }; }, [stats, vocabMap]); useEffect(() => { if(isOpen) { setActiveTab('in'); } }, [isOpen]); if (!isOpen || !stats) return null; const StatCard = ({ label, value }: { label: string, value: string | number }) => ( <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center shadow"> <p className="text-sm text-gray-600 dark:text-gray-300">{label}</p> <p className="text-2xl font-bold text-gray-900 dark:text-white">{value.toLocaleString()}</p> </div> ); const TabButton = ({ isActive, onClick, label, count }: { isActive: boolean, onClick: () => void, label: string, count: number }) => ( <button onClick={onClick} className={`flex-1 text-center px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${ isActive ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-gray-600/50' }`} aria-current={isActive ? 'page' : undefined} > {label} <span className={`ml-2 py-0.5 px-2 rounded-full text-xs font-medium transition-colors ${ isActive ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-200' }`}> {count} </span> </button> ); return ( <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}> <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()} > <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"> <h2 className="text-lg font-semibold text-gray-800 dark:text-white"> Thống kê </h2> <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors" aria-label="Đóng" > <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png" alt="Đóng" className="w-6 h-6 flex-shrink-0" /> </button> </div> <div className="p-6 overflow-y-auto space-y-6 pb-6"> <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> <StatCard label="Tổng số từ" value={stats.totalWords} /> <StatCard label="Từ vựng duy nhất" value={stats.uniqueWordsCount} /> <StatCard label="Có sẵn" value={stats.vocabMatchCount} /> <StatCard label="Chưa có" value={stats.vocabMismatchCount} /> </div> <div> <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Tần suất từ vựng</h3> <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1 mb-4"> <TabButton isActive={activeTab === 'in'} onClick={() => setActiveTab('in')} label="Có sẵn" count={inDictionaryWords.length} /> <TabButton isActive={activeTab === 'out'} onClick={() => setActiveTab('out')} label="Chưa có" count={outOfDictionaryWords.length} /> </div> <div className="p-1 max-h-64 overflow-y-auto min-h-[10rem]"> <ul className="space-y-1"> {activeTab === 'in' && inDictionaryWords.map(([word, count]) => ( <li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60"> <span className="font-medium text-blue-600 dark:text-blue-400">{word}</span> <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-0.5 rounded-full">{count} lần</span> </li> ))} {activeTab === 'out' && outOfDictionaryWords.map(([word, count]) => ( <li key={word} className="flex justify-between items-center text-sm p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/60"> <span className="font-medium text-gray-700 dark:text-gray-300">{word}</span> <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 px-2 py-0.5 rounded-full">{count} lần</span> </li> ))} </ul> {activeTab === 'in' && inDictionaryWords.length === 0 && ( <div className="flex items-center justify-center h-full min-h-[8rem]"> <p className="text-center text-gray-500 dark:text-gray-400">Không có từ nào có sẵn được tìm thấy.</p> </div> )} {activeTab === 'out' && outOfDictionaryWords.length === 0 && ( <div className="flex items-center justify-center h-full min-h-[8rem]"> <p className="text-center text-gray-500 dark:text-gray-400">Tất cả các từ duy nhất đều đã có sẵn.</p> </div> )} </div> </div> </div> </div> </div> );};

// --- Main Component ---
const EbookReaderAndYoutubePlayer: React.FC<EbookReaderProps> = ({ hideNavBar, showNavBar }) => {
  // --- STATE ---
  // Chế độ xem: 'books' hoặc 'videos'
  const [viewMode, setViewMode] = useState<'books' | 'videos'>('books');

  // State chung
  const [vocabMap, setVocabMap] = useState<Map<string, Vocabulary>>(new Map());
  const [isLoadingVocab, setIsLoadingVocab] = useState(true);
  const [selectedVocabCard, setSelectedVocabCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isBatchPlaylistModalOpen, setIsBatchPlaylistModalOpen] = useState(false);

  // State cho chế độ đọc sách (giữ nguyên)
  const [booksData, setBooksData] = useState<Book[]>(initialSampleBooks);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  // State cho chế độ xem video (THÊM MỚI)
  const [videosData, setVideosData] = useState<Video[]>(sampleVideos);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState<Subtitle | null>(null);
  const [isLoadingSubtitles, setIsLoadingSubtitles] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- useEffects ---
  // Auth, Playlist, VocabMap, DarkMode (giữ nguyên)
  useEffect(() => { const unsubscribeAuth = auth.onAuthStateChanged(user => setCurrentUser(user)); return unsubscribeAuth; }, []);
  useEffect(() => { if (!currentUser) { setPlaylists([]); return; } const userDocRef = doc(db, 'users', currentUser.uid); const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => { setPlaylists(docSnap.exists() ? (docSnap.data().playlists || []) : []); }, (error) => console.error("Lỗi:", error)); return unsubscribeFirestore; }, [currentUser]);
  useEffect(() => { const tempMap = new Map<string, Vocabulary>(); defaultVocabulary.forEach((word, index) => { tempMap.set(word.toLowerCase(), { word, meaning: `Nghĩa của từ "${word}".`, example: `Ví dụ cho từ "${word}".`, phrases: [], popularity: "Cao", synonyms: [], antonyms: [], }); }); setVocabMap(tempMap); setIsLoadingVocab(false); }, []);
  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  // useEffect để quản lý NavBar và dọn dẹp (CẬP NHẬT)
  useEffect(() => {
    const isReadingOrWatching = selectedBookId || selectedVideoId;
    if (isReadingOrWatching) {
      hideNavBar();
    } else {
      showNavBar();
    }
    // Dọn dẹp
    return () => {
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedBookId, selectedVideoId, hideNavBar, showNavBar]);

  // useEffect cho logic SÁCH (giữ nguyên, chỉ thêm điều kiện)
  useEffect(() => {
    if (viewMode === 'books' && selectedBookId) {
      if (audioPlayerRef.current && currentBook?.audioUrl) {
        audioPlayerRef.current.src = currentBook.audioUrl;
        audioPlayerRef.current.playbackRate = playbackSpeed;
      }
    } else if (audioPlayerRef.current?.src) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.removeAttribute('src');
    }
  }, [selectedBookId, viewMode]);
  
  // useEffect để tải phụ đề cho VIDEO (THÊM MỚI)
  useEffect(() => {
    if (viewMode !== 'videos' || !selectedVideoId) return;
    
    const fetchSubtitles = async () => {
      setIsLoadingSubtitles(true);
      setSubtitles([]);
      setCurrentSubtitle(null);
      try {
        const response = await fetch(`/api/captions?videoID=${selectedVideoId}`);
        if (!response.ok) throw new Error('Không thể tải phụ đề.');
        const data = await response.json();
        const formattedSubtitles = data.map((sub: any) => ({
          start: parseFloat(sub.start),
          dur: parseFloat(sub.dur),
          text: sub.text,
        }));
        setSubtitles(formattedSubtitles);
      } catch (error) {
        console.error("Lỗi tải phụ đề:", error);
      } finally {
        setIsLoadingSubtitles(false);
      }
    };
    fetchSubtitles();
  }, [selectedVideoId, viewMode]);

  // --- MEMOIZED VALUES (cho sách) ---
  const currentBook = useMemo(() => booksData.find(book => book.id === selectedBookId), [booksData, selectedBookId]);
  const bookVocabularyCardIds = useMemo(() => { /* ... giữ nguyên logic ... */  if (!currentBook || vocabMap.size === 0) return []; const wordsInBook = new Set<string>(); (currentBook.content.match(/\b\w+\b/g) || []).forEach(word => { const normalizedWord = word.toLowerCase(); if (vocabMap.has(normalizedWord)) wordsInBook.add(normalizedWord); }); const cardIdMap = new Map(defaultVocabulary.map((word, index) => [word.toLowerCase(), index + 1])); return Array.from(wordsInBook).map(word => cardIdMap.get(word)).filter((id): id is number => id !== undefined); }, [currentBook, vocabMap]);
  const bookStats = useMemo<BookStats | null>(() => { /* ... giữ nguyên logic ... */ if (!currentBook || vocabMap.size === 0) return null; const words = currentBook.content.match(/\b\w+\b/g) || []; const totalWords = words.length; const wordFrequencies = new Map<string, number>(); const uniqueWords = new Set<string>(); words.forEach(word => { const normalizedWord = word.toLowerCase(); wordFrequencies.set(normalizedWord, (wordFrequencies.get(normalizedWord) || 0) + 1); uniqueWords.add(normalizedWord); }); let vocabMatchCount = 0; uniqueWords.forEach(word => { if (vocabMap.has(word)) vocabMatchCount++; }); const uniqueWordsCount = uniqueWords.size; const vocabMismatchCount = uniqueWordsCount - vocabMatchCount; const sortedFrequencies = new Map([...wordFrequencies.entries()].sort((a, b) => b[1] - a[1])); return { totalWords, uniqueWordsCount, vocabMatchCount, vocabMismatchCount, wordFrequencies: sortedFrequencies }; }, [currentBook, vocabMap]);
  
  // --- HANDLERS ---
  const handleWordClick = (word: string) => { /* ... giữ nguyên logic ... */ const normalizedWord = word.toLowerCase(); const foundVocab = vocabMap.get(normalizedWord); if (foundVocab) { let cardImageUrl = `https://placehold.co/1024x1536/E0E0E0/333333?text=${encodeURIComponent(foundVocab.word)}`; const vocabIndex = defaultVocabulary.findIndex(v => v.toLowerCase() === normalizedWord); if (vocabIndex !== -1 && vocabIndex < gameImageUrls.length) cardImageUrl = gameImageUrls[vocabIndex]; const tempFlashcard: Flashcard = { id: vocabIndex !== -1 ? vocabIndex + 1 : Date.now(), imageUrl: { default: cardImageUrl }, isFavorite: false, vocabulary: foundVocab }; setSelectedVocabCard(tempFlashcard); setShowVocabDetail(true); } };
  const closeVocabDetail = () => { setShowVocabDetail(false); setSelectedVocabCard(null); };
  const handleBackToLibrary = () => { setSelectedBookId(null); setSelectedVideoId(null); };
  
  // Handlers cho SÁCH
  const handleSelectBook = (bookId: string) => setSelectedBookId(bookId);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const togglePlayPause = () => { if (audioPlayerRef.current) { if(isAudioPlaying) audioPlayerRef.current.pause(); else audioPlayerRef.current.play(); setIsAudioPlaying(!isAudioPlaying); }};
  const handleTimeUpdate = () => { if (audioPlayerRef.current) setAudioCurrentTime(audioPlayerRef.current.currentTime); };
  const handleLoadedMetadata = () => { if (audioPlayerRef.current) setAudioDuration(audioPlayerRef.current.duration); };
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => { if (audioPlayerRef.current) { audioPlayerRef.current.currentTime = Number(e.target.value); }};
  const togglePlaybackSpeed = () => { setPlaybackSpeed(s => s >= 1.5 ? 1.0 : s + 0.25); };
  const formatTime = (time: number) => { if(isNaN(time)) return "00:00"; const mins = Math.floor(time / 60); const secs = Math.floor(time % 60); return `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`; };

  // Handlers cho VIDEO (THÊM MỚI)
  const handleSelectVideo = (videoId: string) => setSelectedVideoId(videoId);
  const onPlayerReady = (event: { target: any }) => { playerRef.current = event.target; };
  const onPlayerStateChange = (event: { data: number }) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (event.data === 1) { // Playing
      intervalRef.current = setInterval(() => {
        if (!playerRef.current || subtitles.length === 0) return;
        const currentTime = playerRef.current.getCurrentTime();
        const activeSubtitle = subtitles.find(sub => currentTime >= sub.start && currentTime < (sub.start + sub.dur));
        if (activeSubtitle?.text !== currentSubtitle?.text) {
          const decodedText = new DOMParser().parseFromString(activeSubtitle.text, "text/html").documentElement.textContent || "";
          setCurrentSubtitle({ ...activeSubtitle, text: decodedText });
        } else if (!activeSubtitle && currentSubtitle !== null) {
          setCurrentSubtitle(null);
        }
      }, 200);
    }
  };

  // --- RENDER FUNCTIONS ---

  // Render phụ đề tương tác cho video
  const renderInteractiveSubtitle = () => { /* ... giữ nguyên từ lần trước ... */ if (isLoadingSubtitles) return <span className="animate-pulse text-gray-500">Đang tải phụ đề...</span>; if (!currentSubtitle) return <span className="text-gray-400">...</span>; const parts = currentSubtitle.text.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g); return parts.map((part, index) => { if (!part) return null; const normalizedPart = part.toLowerCase(); const isVocabWord = /^\w+$/.test(part) && vocabMap.has(normalizedPart); if (isVocabWord) { return ( <span key={index} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline underline-offset-2 cursor-pointer" onClick={() => handleWordClick(part)} > {part} </span> ); } return <span key={index}>{part}</span>; }).filter(Boolean); };

  // Render nội dung sách
  const renderBookContent = () => { /* ... giữ nguyên toàn bộ logic renderBookContent ... */ if (isLoadingVocab) return <div className="text-center p-10 animate-pulse">Đang tải nội dung sách...</div>; if (!currentBook) return <div className="text-center p-10">Không tìm thấy nội dung sách.</div>; const contentLines = currentBook.content.trim().split(/\n+/); return ( <div className="font-['Inter',_sans-serif] text-gray-800 dark:text-gray-200 px-2 sm:px-4 pb-24"> {contentLines.map((line, index) => { if (line.trim() === '') return <div key={`blank-${index}`} className="h-4"></div>; const parts = line.split(/(\b\w+\b|[.,!?;:()'"\s`‘’“”])/g); const renderableParts = parts.map((part, partIndex) => { if (!part) return null; const isWord = /^\w+$/.test(part); const normalizedPart = part.toLowerCase(); const isVocabWord = isWord && vocabMap.has(normalizedPart); if (isVocabWord) { return ( <span key={`${index}-${partIndex}`} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer" onClick={() => handleWordClick(part)} > {part} </span> ); } return <span key={`${index}-${partIndex}`}>{part}</span>; }).filter(Boolean); const isLikelyChapterTitle = index === 0 && line.length < 60; if (isLikelyChapterTitle) return <h2 key={`line-${index}`} className="text-3xl font-bold text-gray-900 dark:text-white mt-2 mb-6 text-center">{renderableParts}</h2>; return <p key={`line-${index}`} className="text-lg leading-loose text-gray-700 dark:text-gray-300 mb-4">{renderableParts}</p>; })} </div> ); };
  
  // Render giao diện chính khi đang đọc sách
  const renderBookReader = () => (
    <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 sm:p-8 md:p-10 relative">
        {currentBook && (
          <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-center mb-2">{currentBook.title}</h1>
            <p className="text-md text-center text-gray-500 dark:text-gray-400">Tác giả: {currentBook.author}</p>
            <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
              {currentUser && bookVocabularyCardIds.length > 0 && (
                <button onClick={() => setIsBatchPlaylistModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 8h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" /><path d="M9 12a1 1 0 00-1 1v1a1 1 0 102 0v-1a1 1 0 00-1-1z" /></svg>
                  Lưu {bookVocabularyCardIds.length} từ vựng
                </button>
              )}
              <button onClick={() => setIsStatsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white hover:bg-gray-50">
                <StatsIcon /> Thống kê Sách
              </button>
            </div>
          </div>
        )}
        {renderBookContent()}
      </div>
    </main>
  );

  // Render thư viện SÁCH
  const renderBookLibrary = () => {
    const groupedBooks = groupBooksByCategory(booksData);
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {Object.entries(groupedBooks).map(([category, booksInCategory]) => (
          <section key={category}>
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 px-4">
              {booksInCategory.map(book => (
                <div key={book.id} className="flex-shrink-0 w-40 cursor-pointer group" onClick={() => handleSelectBook(book.id)}>
                  <div className="aspect-[2/3] bg-gray-200 rounded-lg shadow-lg mb-2 group-hover:shadow-xl"><img src={book.coverImageUrl} alt={book.title} className="w-full h-full object-cover rounded-lg" /></div>
                  <h3 className="font-semibold truncate">{book.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{book.author}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };
  
  // Render giao diện chính khi đang xem VIDEO
  const renderVideoPlayer = () => {
    const currentVideo = videosData.find(v => v.id === selectedVideoId);
    return (
      <main className="flex-grow overflow-y-auto w-full bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto flex flex-col h-full">
          {currentVideo && <h1 className="text-2xl font-bold text-center mb-4">{currentVideo.title}</h1>}
          <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl flex-shrink-0">
            <YouTube videoId={selectedVideoId!} opts={{ width: '100%', height: '100%' }} onReady={onPlayerReady} onStateChange={onPlayerStateChange} className="w-full h-full"/>
          </div>
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-center text-xl md:text-2xl font-semibold min-h-[8rem] flex items-center justify-center shadow-inner flex-grow">
            {renderInteractiveSubtitle()}
          </div>
        </div>
      </main>
    );
  };

  // Render thư viện VIDEO
  const renderVideoLibrary = () => {
    const groupedVideos = groupVideosByCategory(videosData);
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-8">
        {Object.entries(groupedVideos).map(([category, videosInCategory]) => (
          <section key={category}>
            <h2 className="text-2xl font-bold mb-4">{category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {videosInCategory.map(video => (
                <div key={video.id} className="cursor-pointer group" onClick={() => handleSelectVideo(video.id)}>
                  <div className="aspect-video bg-gray-200 rounded-lg shadow-lg mb-2 group-hover:shadow-xl"><img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover rounded-lg" /></div>
                  <h3 className="font-semibold truncate">{video.title}</h3>
                  <p className="text-sm text-gray-500 truncate">{video.author}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  };

  const isReadingOrWatching = selectedBookId || selectedVideoId;

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white`}>
      {/* Header */}
      {isReadingOrWatching ? (
        <header className="flex items-center justify-between p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md flex-shrink-0 sticky top-0 z-20">
          {selectedBookId && (
            <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><MenuIcon /></button>
          )}
          <button onClick={handleBackToLibrary} className="flex items-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700">
            ← Quay lại
          </button>
           <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">{isDarkMode ? '☀️' : '🌙'}</button>
        </header>
      ) : (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-center items-center gap-4">
           <h1 className="text-2xl font-bold">Thư viện của bạn</h1>
            <div className="bg-gray-200 dark:bg-gray-700 p-1 rounded-lg flex">
                <button onClick={() => setViewMode('books')} className={`px-4 py-1 rounded-md text-sm font-medium ${viewMode === 'books' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>Đọc Sách</button>
                <button onClick={() => setViewMode('videos')} className={`px-4 py-1 rounded-md text-sm font-medium ${viewMode === 'videos' ? 'bg-white dark:bg-gray-900 shadow' : ''}`}>Xem Video</button>
            </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-grow overflow-y-auto">
        {viewMode === 'books' ? (
          selectedBookId ? renderBookReader() : renderBookLibrary()
        ) : (
          selectedVideoId ? renderVideoPlayer() : renderVideoLibrary()
        )}
      </div>

      {/* Audio Player for Books */}
      {selectedBookId && currentBook?.audioUrl && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-md p-3 z-30">
          <div className="max-w-3xl mx-auto flex items-center space-x-4">
            <button onClick={togglePlayPause} className="p-2 rounded-full">{isAudioPlaying ? <PauseIcon /> : <PlayIcon />}</button>
            <span className="text-xs w-10 text-center">{formatTime(audioCurrentTime)}</span>
            <input type="range" min="0" max={audioDuration || 0} value={audioCurrentTime} onChange={handleSeek} className="w-full"/>
            <span className="text-xs w-10 text-center">{formatTime(audioDuration)}</span>
            <button onClick={togglePlaybackSpeed} className="px-4 py-2 text-sm font-semibold rounded-full border">{playbackSpeed}x</button>
          </div>
        </div>
      )}
      <audio ref={audioPlayerRef} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} onPlay={() => setIsAudioPlaying(true)} onPause={() => setIsAudioPlaying(false)} onEnded={() => setIsAudioPlaying(false)} />

      {/* Modals and Sidebars */}
      {currentBook && <BookSidebar isOpen={isSidebarOpen} onClose={toggleSidebar} book={currentBook} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} />}
      {selectedVocabCard && <FlashcardDetailModal selectedCard={selectedVocabCard} showVocabDetail={showVocabDetail} exampleSentencesData={[]} onClose={closeVocabDetail} currentVisualStyle="default" />}
      {isBatchPlaylistModalOpen && <AddToPlaylistModal isOpen={isBatchPlaylistModalOpen} onClose={() => setIsBatchPlaylistModalOpen(false)} cardIds={bookVocabularyCardIds} currentUser={currentUser} existingPlaylists={playlists} />}
      <BookStatsModal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} stats={bookStats} bookTitle={currentBook?.title || ''} vocabMap={vocabMap} />
    </div>
  );
};

export default EbookReaderAndYoutubePlayer;
// --- END OF FILE game.tsx ---
