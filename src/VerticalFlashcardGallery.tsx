// ========================================================================
// FILE: VerticalFlashcardGallery.tsx (FIXED: Instant Scroll on Page Change)
// ========================================================================

import { useRef, useState, useEffect, useMemo } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx';
import AddToPlaylistModal from './AddToPlaylistModal.tsx';
import { defaultImageUrls as initialDefaultImageUrls } from './image-url.ts';
import { auth, db } from './firebase.js';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore'; 
import { User } from 'firebase/auth';
import { defaultVocabulary } from './list-vocabulary.ts';
import { SidebarLayout } from './sidebar-story.tsx';

// --- Định nghĩa Interfaces ---
interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

interface VerticalFlashcardGalleryProps {
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
}

interface StyledImageUrls {
  default: string;
  anime?: string;
  comic?: string;
  realistic?: string;
}

interface VocabularyData {
  word: string;
  meaning: string;
  example: string;
  phrases: string[];
  popularity: string;
  synonyms: string[];
  antonyms: string[];
}

interface Flashcard {
  id: number;
  imageUrl: StyledImageUrls;
  isFavorite: boolean;
  vocabulary: VocabularyData;
}

// --- Dữ liệu Ảnh và Từ vựng Mẫu (Giữ nguyên) ---
const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`);
  }
  return urls;
};
const numberOfSampleFlashcards = 3200;
const defaultImageUrls: string[] = [
  ...initialDefaultImageUrls,
  ...generatePlaceholderUrls(Math.max(0, numberOfSampleFlashcards - initialDefaultImageUrls.length), 'Default', 'A0A0A0')
];
const animeImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Anime', 'FF99CC');
const comicImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Comic', '66B2FF');
const realisticImageUrls: string[] = generatePlaceholderUrls(numberOfSampleFlashcards, 'Realistic', 'A0A0A0');

const generatePlaceholderVocabulary = (count: number): VocabularyData[] => {
  const data: VocabularyData[] = [];
  for (let i = 1; i <= count; i++) {
    data.push({
      word: `Word ${i}`,
      meaning: `Meaning of Word ${i}`,
      example: `Example sentence for Word ${i}.`,
      phrases: [`Phrase A ${i}`, `Phrase B ${i}`],
      popularity: i % 3 === 0 ? "Cao" : i % 2 === 0 ? "Trung bình" : "Thấp",
      synonyms: [`Synonym 1.${i}`, `Synonym 2.${i}`],
      antonyms: [`Antonym 1.${i}`, `Antonym 2.${i}`]
    });
  }
  return data;
};
const initialVocabularyData: VocabularyData[] = [
  { word: "Source", meaning: "Nguồn, gốc", example: "What is the source of this information?", phrases: ["Information source", "Primary source"], popularity: "Cao", synonyms: ["Origin", "Root", "Beginning"], antonyms: ["Result", "Outcome", "End"] },
  { word: "Insurance", meaning: "Bảo hiểm", example: "You should buy travel insurance before your trip.", phrases: ["Health insurance", "Car insurance"], popularity: "Cao", synonyms: ["Assurance", "Coverage", "Protection"], antonyms: ["Risk", "Danger", "Exposure"] },
  { word: "Argument", meaning: "Cuộc tranh luận, lý lẽ", example: "They had a heated argument about politics.", phrases: ["Strong argument", "Logical argument"], popularity: "Trung bình", synonyms: ["Dispute", "Debate", "Reasoning"], antonyms: ["Agreement", "Harmony", "Peace"] },
  { word: "Influence", meaning: "Ảnh hưởng", example: "His parents had a strong influence on his career choice.", phrases: ["Direct influence", "Negative influence"], popularity: "Cao", synonyms: ["Impact", "Effect", "Control"], antonyms: ["Lack of effect", "Insignificance"] },
  { word: "Vocabulary 5", meaning: "Nghĩa của từ vựng 5", example: "Ví dụ cho từ vựng 5.", phrases: ["Cụm từ 1", "Cụm từ 2"], popularity: "Thấp", synonyms: ["Từ đồng nghĩa 1", "Từ trái nghĩa 2"], antonyms: ["Từ trái nghĩa 1", "Từ trái nghĩa 2"] }
];
const vocabularyData: VocabularyData[] = [
  ...initialVocabularyData,
  ...generatePlaceholderVocabulary(Math.max(0, numberOfSampleFlashcards - initialVocabularyData.length))
];

const ALL_POSSIBLE_FLASHCARDS: Flashcard[] = Array.from({ length: numberOfSampleFlashcards }, (_, i) => {
    const vocab = vocabularyData[i] || { word: `Word ${i + 1}`, meaning: `Meaning ${i + 1}`, example: `Example ${i + 1}`, phrases:[], popularity: 'Thấp', synonyms:[], antonyms:[] };
    const imageUrls: StyledImageUrls = {
        default: defaultImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Default+${i + 1}`,
        anime: animeImageUrls[i] || `https://placehold.co/1024x1536/FF99CC/FFFFFF?text=Anime+${i + 1}`,
        comic: comicImageUrls[i] || `https://placehold.co/1024x1536/66B2FF/FFFFFF?text=Comic+${i + 1}`,
        realistic: realisticImageUrls[i] || `https://placehold.co/1024x1536/A0A0A0/FFFFFF?text=Realistic+${i + 1}`,
    };
    return { id: i + 1, imageUrl: imageUrls, isFavorite: false, vocabulary: vocab };
});

const exampleImages = [
  "https://placehold.co/1024x1536/FF5733/FFFFFF?text=Example+1",
  "https://placehold.co/1024x1536/33FF57/FFFFFF?text=Example+2",
  "https://placehold.co/1024x1536/3357FF/FFFFFF?text=Example+3",
  "https://placehold.co/1024x1536/FF33A1/FFFFFF?text=Example+4",
  "https://placehold.co/1024x1536/A133FF/FFFFFF?text=Example+5",
];

const animations = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  @keyframes slideIn { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes scaleIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes modalBackdropIn { 0% { opacity: 0; } 100% { opacity: 0.4; } }
  @keyframes modalIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes animeSparkle { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
  @keyframes comicPop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  @keyframes realisticShine { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }
`;

export default function VerticalFlashcardGallery({ hideNavBar, showNavBar, currentUser }: VerticalFlashcardGalleryProps) {
  // --- States ---
  // *** THAY ĐỔI 1: Đổi tên ref để chỉ container chính và đặt đúng kiểu dữ liệu ***
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(ALL_POSSIBLE_FLASHCARDS);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('collection');
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState('single');
  const [visualStyle, setVisualStyle] = useState('default');
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  // States cho dữ liệu người dùng từ Firestore
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  
  // State cho bộ lọc playlist
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all'); 
  
  // States để quản lý modal playlist
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedCardForPlaylist, setSelectedCardForPlaylist] = useState<number | null>(null);

  // States cho phân trang và sidebar
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [activeScreen, setActiveScreen] = useState('home');
  const [toggleSidebar, setToggleSidebar] = useState<(() => void) | null>(null);
  
  // --- Derived State ---
  const allFavoriteCardIds = useMemo(() => {
    return new Set(playlists.flatMap(p => p.cardIds));
  }, [playlists]);

  // --- Effects ---
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setOpenedImageIds([]); setPlaylists([]);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const fetchedOpenedIds = Array.isArray(userData.openedImageIds) ? userData.openedImageIds : [];
        setOpenedImageIds(fetchedOpenedIds);
        const fetchedPlaylists = Array.isArray(userData.playlists) ? userData.playlists : [];
        setPlaylists(fetchedPlaylists);
        
        const listVocabulary = fetchedOpenedIds.map(id => (defaultVocabulary[id - 1]?.toLowerCase() ?? '').trim());
        if (JSON.stringify(listVocabulary) !== JSON.stringify(userData.listVocabulary)) {
            await updateDoc(userDocRef, { listVocabulary });
        }
      } else {
        console.log("Tài liệu người dùng không tồn tại. Có thể tạo mới ở đây.");
        setOpenedImageIds([]); setPlaylists([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Lỗi khi lắng nghe dữ liệu Firestore (onSnapshot):", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    setFlashcards(prev => prev.map(card => ({...card, isFavorite: allFavoriteCardIds.has(card.id)})));
  }, [allFavoriteCardIds]);

  // --- Logic lọc và phân trang ---
  const filteredFlashcardsByTab = (() => {
    if (activeTab === 'collection') {
      return [...openedImageIds].reverse()
        .map(id => flashcards.find(card => card.id === id))
        .filter((card): card is Flashcard => card !== undefined);
    }
    if (activeTab === 'favorite') {
      const allFavorites = flashcards.filter(card => card.isFavorite);
      if (selectedPlaylistId === 'all') return allFavorites;
      const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
      if (selectedPlaylist) return allFavorites.filter(card => selectedPlaylist.cardIds.includes(card.id));
      return [];
    }
    return [];
  })();

  const totalPages = Math.ceil(filteredFlashcardsByTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const flashcardsForCurrentPage = filteredFlashcardsByTab.slice(startIndex, endIndex);
  const totalFlashcardsInCollection = openedImageIds.length;
  const favoriteCount = allFavoriteCardIds.size; // Cập nhật số lượng yêu thích

  // --- Handlers ---
  const handleShowHome = () => setActiveScreen('home');
  const handleShowStats = () => setActiveScreen('stats');
  const handleShowRank = () => setActiveScreen('rank');
  const handleShowGoldMine = () => setActiveScreen('goldMine');
  const handleShowTasks = () => setActiveScreen('tasks');
  const handleShowPerformance = () => setActiveScreen('performance');
  const handleShowSettings = () => setActiveScreen('settings');
  const handleShowHelp = () => setActiveScreen('help');

  const handleFavoriteClick = (id: number) => {
    if (!currentUser) return;
    openPlaylistModal(id);
  };
  
  const openPlaylistModal = (cardId: number) => {
    setSelectedCardForPlaylist(cardId);
    setIsPlaylistModalOpen(true);
  };
  
  const closePlaylistModal = () => {
    setIsPlaylistModalOpen(false);
    setSelectedCardForPlaylist(null);
  };

  const openVocabDetail = (card: Flashcard) => {
    setSelectedCard(card);
    setShowVocabDetail(true);
    hideNavBar();
  };

  const closeVocabDetail = () => {
    setShowVocabDetail(false);
    setSelectedCard(null);
    showNavBar();
  };

  const getImageUrlForStyle = (card: Flashcard, style: string): string => {
    switch (style) {
        case 'anime': return card.imageUrl.anime || card.imageUrl.default;
        case 'comic': return card.imageUrl.comic || card.imageUrl.default;
        case 'realistic': return card.imageUrl.realistic || card.imageUrl.default;
        default: return card.imageUrl.default;
    }
  };

  // *** THAY ĐỔI 3: Sửa hàm chuyển trang để cuộn ngay lập tức ***
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Cuộn container chính lên đầu ngay lập tức, không có hiệu ứng "mượt"
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">Đang tải bộ sưu tập...</div>;
  }

  return (
    <SidebarLayout
      setToggleSidebar={setToggleSidebar}
      onShowHome={handleShowHome}
      onShowStats={handleShowStats}
      onShowRank={handleShowRank}
      onShowGoldMine={handleShowGoldMine}
      onShowTasks={handleShowTasks}
      onShowPerformance={handleShowPerformance}
      onShowSettings={handleShowSettings}
      onShowHelp={handleShowHelp}
      activeScreen={activeScreen}
    >
      {/* *** THAY ĐỔI 2: Gắn ref vào đúng container có thanh cuộn *** */}
      <div ref={mainContainerRef} className="flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
        <style>{animations}</style>

        {activeScreen === 'home' && (
          <>
            {/* Header and Tabs - No changes needed here */}
            <div className="w-full max-w-6xl py-6 mx-auto">
              <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Flashcard Gallery</h1>
                <div className="flex items-center space-x-2">
                  <button onClick={() => toggleSidebar?.()} className="relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800" aria-label="Toggle Sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-400 transition-all duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                  </button>
                  <div id="settings-button" className={`relative flex items-center justify-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 cursor-pointer ${isSettingsHovered || showSettings ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900 ring-2 ring-indigo-100 dark:ring-indigo-800' : 'border-gray-100 dark:border-gray-700'}`} onMouseEnter={() => setIsSettingsHovered(true)} onMouseLeave={() => setIsSettingsHovered(false)} onClick={() => setShowSettings(!showSettings)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSettingsHovered || showSettings ? 'text-indigo-600 dark:text-indigo-400 rotate-45' : 'text-gray-600 dark:text-gray-400'} transition-all duration-300`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 mx-4">
                <button onClick={() => { setActiveTab('collection'); handlePageChange(1); }} className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'collection' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'collection' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h10M7 13h6" /></svg>
                  <span>Collection</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'collection' ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{totalFlashcardsInCollection}</span>
                </button>
                <button onClick={() => { setActiveTab('favorite'); handlePageChange(1); setSelectedPlaylistId('all'); }} className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'favorite' ? 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${activeTab === 'favorite' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 24 24" fill={activeTab === 'favorite' ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                  <span>Favorite</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'favorite' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{favoriteCount}</span>
                </button>
              </div>

              {activeTab === 'favorite' && (
                <div className="px-4 mb-4">
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-grow">
                      <label htmlFor="playlist-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Chọn Playlist</label>
                      <select id="playlist-select" value={selectedPlaylistId} onChange={(e) => { setSelectedPlaylistId(e.target.value); handlePageChange(1); }} className="w-full md:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3">
                        <option value="all">Tất cả từ yêu thích ({favoriteCount})</option>
                        {playlists.map(p => <option key={p.id} value={p.id}>{p.name} ({p.cardIds.length})</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="min-h-0">
              <div className="w-full max-w-6xl mx-auto">
                {flashcardsForCurrentPage.length > 0 ? (
                  // *** THAY ĐỔI 4: Xóa ref cũ khỏi đây ***
                  <div className={`grid gap-4 px-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {flashcardsForCurrentPage.map((card) => (
                      <div key={card.id}>
                        <div id={`flashcard-${card.id}`} className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative group">
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                          <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
                            <button className={`transition-all duration-300 flex items-center justify-center p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 ${card.isFavorite ? 'scale-110' : 'scale-100'}`} 
                                    onClick={() => handleFavoriteClick(card.id)} 
                                    aria-label={card.isFavorite ? "Quản lý trong Playlist" : "Thêm vào Playlist"}>
                                <img src={card.isFavorite ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"} alt={card.isFavorite ? "Favorite icon" : "Unfavorite icon"} className={`h-4 w-4 transition-all duration-300 ${card.isFavorite ? 'opacity-100' : 'opacity-75'}`} />
                            </button>
                          </div>
                          <div className="w-full">
                            <div className={`relative w-full ${visualStyle === 'realistic' ? 'p-2 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900 dark:to-amber-800' : ''}`}>
                              {visualStyle === 'anime' && <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-purple-100 opacity-30 mix-blend-overlay pointer-events-none"></div>}
                              {visualStyle === 'comic' && <div className="absolute inset-0 bg-blue-100 opacity-20 mix-blend-multiply pointer-events-none dark:bg-blue-900" style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.2) 1px, transparent 1px)', backgroundSize: '4px 4px'}}></div>}
                              {visualStyle === 'realistic' && <div className="absolute inset-0 shadow-inner pointer-events-none"></div>}
                              <img src={getImageUrlForStyle(card, visualStyle)} alt={`Flashcard ${card.id}`} className={`w-full h-auto ${visualStyle === 'anime' ? 'saturate-150 contrast-105' : visualStyle === 'comic' ? 'contrast-125 brightness-105' : visualStyle === 'realistic' ? 'saturate-105 contrast-110 shadow-md' : ''} cursor-pointer`} style={{aspectRatio: '1024/1536', filter: visualStyle === 'comic' ? 'grayscale(0.1)' : 'none'}} onClick={() => openVocabDetail(card)} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = card.imageUrl.default; }}/>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                    <div className="bg-pink-50 dark:bg-pink-900 p-6 rounded-full mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300 dark:text-pink-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div>
                    <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{activeTab === 'collection' ? 'Bộ sưu tập trống' : selectedPlaylistId === 'all' ? 'Chưa có từ yêu thích' : 'Playlist này trống'}</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">{activeTab === 'collection' ? 'Hãy mở rương để nhận thêm flashcard mới!' : selectedPlaylistId === 'all' ? 'Nhấn vào biểu tượng trái tim để thêm từ vào mục yêu thích.' : 'Hãy thêm các từ yêu thích vào playlist này.'}</p>
                  </div>
                )}
                {/* Pagination - No changes needed */}
                {totalPages > 1 && (
                  <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-4 pb-24 px-4">
                    <nav className="flex space-x-2" aria-label="Pagination">
                      <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === 1 ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Trước</button>
                      {Array.from({ length: totalPages }, (_, index) => (
                        <button key={index + 1} onClick={() => handlePageChange(index + 1)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === index + 1 ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>{index + 1}</button>
                      ))}
                      <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === totalPages ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>Sau</button>
                    </nav>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Modal - No changes needed */}
            {showSettings && (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300" style={{ animation: 'modalBackdropIn 0.3s ease-out forwards' }}></div>
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ animation: 'scaleIn 0.3s ease-out forwards' }} id="settings-panel">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex-shrink-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 01 0 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01 0-2.83 2 2 0 01 0-2.83l-.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 01 0-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l-.06-.06a2 2 0 01 2.83 0 2 2 0 01 0 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path></svg>Cài đặt hiển thị</h3>
                        <button onClick={() => setShowSettings(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[70vh] flex-grow">
                      {/* Layout Mode */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                          Bố cục hiển thị
                        </h4>
                        <div className="flex space-x-2">
                          <div className={`flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${layoutMode === 'single' ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600'}`} onClick={() => setLayoutMode('single')}>
                            <div className="w-8 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm mb-1"></div>
                            <span className={`text-xs ${layoutMode === 'single' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>1 Cột</span>
                          </div>
                          <div className={`flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${layoutMode === 'double' ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600'}`} onClick={() => setLayoutMode('double')}>
                            <div className="flex space-x-1 mb-1">
                              <div className="w-4 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm"></div><div className="w-4 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm"></div>
                            </div>
                            <span className={`text-xs ${layoutMode === 'double' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>2 Cột</span>
                          </div>
                        </div>
                      </div>
                      {/* Visual Style */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" /></svg>
                          Phong cách hiển thị
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'default' ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200'}`} onClick={() => setVisualStyle('default')}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'default' ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'default' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" /></svg></div>
                            <span className={`text-xs ${visualStyle === 'default' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Mặc định</span>
                          </div>
                          <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'anime' ? 'border-pink-500 bg-pink-50 dark:border-pink-900' : 'border-gray-200 dark:border-gray-700 hover:border-pink-200'}`} onClick={() => setVisualStyle('anime')}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'anime' ? 'bg-pink-100 dark:bg-pink-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'anime' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></div>
                            <span className={`text-xs ${visualStyle === 'anime' ? 'text-pink-700 dark:text-pink-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Anime</span>
                          </div>
                          <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'comic' ? 'border-blue-500 bg-blue-50 dark:border-blue-900' : 'border-gray-200 dark:border-gray-700 hover:border-blue-200'}`} onClick={() => setVisualStyle('comic')}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'comic' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'comic' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg></div>
                            <span className={`text-xs ${visualStyle === 'comic' ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Comic</span>
                          </div>
                          <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'realistic' ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-900' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200'}`} onClick={() => setVisualStyle('realistic')}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'realistic' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'realistic' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></div>
                            <span className={`text-xs ${visualStyle === 'realistic' ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Realistic</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="sticky bottom-0 left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 flex space-x-3 flex-shrink-0">
                      <button className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-lg" onClick={() => setShowSettings(false)}>Hủy</button>
                      <button className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg flex items-center justify-center" onClick={() => setShowSettings(false)}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Áp dụng</button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <FlashcardDetailModal selectedCard={selectedCard} showVocabDetail={showVocabDetail} exampleImages={exampleImages} onClose={closeVocabDetail} currentVisualStyle={visualStyle} />
            
            {isPlaylistModalOpen && selectedCardForPlaylist && (
              <AddToPlaylistModal 
                isOpen={isPlaylistModalOpen} 
                onClose={closePlaylistModal} 
                cardIds={[selectedCardForPlaylist]} 
                currentUser={currentUser} 
                existingPlaylists={playlists} 
              />
            )}
          </>
        )}
        
        {/* Other screens - No changes needed */}
        {activeScreen !== 'home' && (
            <div className="flex items-center justify-center h-full text-2xl text-gray-600 dark:text-gray-300">
                {activeScreen === 'stats' && 'Màn hình Stats'}
                {activeScreen === 'rank' && 'Màn hình Rank'}
                {activeScreen === 'goldMine' && 'Màn hình Mỏ vàng'}
                {activeScreen === 'tasks' && 'Màn hình Công việc'}
                {activeScreen === 'performance' && 'Màn hình Hiệu suất'}
                {activeScreen === 'settings' && 'Màn hình Cài đặt'}
                {activeScreen === 'help' && 'Màn hình Trợ giúp'}
            </div>
        )}
      </div>
    </SidebarLayout>
  );
}
