// ========================================================================
// FILE: VerticalFlashcardGallery.tsx
// ========================================================================

import { useRef, useState, useEffect } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx';
import AddToPlaylistModal from './AddToPlaylistModal'; // Import modal mới
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

// --- Dữ liệu Ảnh và Từ vựng Mẫu ---
const generatePlaceholderUrls = (count: number, text: string, color: string): string[] => {
  const urls: string[] = [];
  for (let i = 1; i <= count; i++) {
    urls.push(`https://placehold.co/1024x1536/${color}/FFFFFF?text=${text}+${i}`);
  }
  return urls;
};
const numberOfSampleFlashcards = 200;
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

const exampleImages = ["https://placehold.co/1024x1536/FF5733/FFFFFF?text=Example+1"];

const animations = `/* ... Dán các animation của bạn vào đây ... */`;

export default function VerticalFlashcardGallery({ hideNavBar, showNavBar, currentUser }: VerticalFlashcardGalleryProps) {
  // --- States ---
  const scrollContainerRef = useRef(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(ALL_POSSIBLE_FLASHCARDS);
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const [activeTab, setActiveTab] = useState('collection');
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState('single');
  const [visualStyle, setVisualStyle] = useState('default');
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  // States cho dữ liệu người dùng từ Firestore
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);
  const [favoriteCardIds, setFavoriteCardIds] = useState<number[]>([]);
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
  
  // --- Effects ---
  // Lắng nghe dữ liệu người dùng từ Firestore
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setOpenedImageIds([]); setFavoriteCardIds([]); setPlaylists([]);
      return;
    }

    setLoading(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const fetchedOpenedIds = Array.isArray(userData.openedImageIds) ? userData.openedImageIds : [];
        setOpenedImageIds(fetchedOpenedIds);
        const fetchedFavoriteIds = Array.isArray(userData.favoriteCardIds) ? userData.favoriteCardIds : [];
        setFavoriteCardIds(fetchedFavoriteIds);
        const fetchedPlaylists = Array.isArray(userData.playlists) ? userData.playlists : [];
        setPlaylists(fetchedPlaylists);
        
        const listVocabulary = fetchedOpenedIds.map(id => (defaultVocabulary[id - 1]?.toLowerCase() ?? '').trim());
        if (JSON.stringify(listVocabulary) !== JSON.stringify(userData.listVocabulary)) {
            await updateDoc(userDocRef, { listVocabulary });
        }
      } else {
        setOpenedImageIds([]); setFavoriteCardIds([]); setPlaylists([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Lỗi onSnapshot:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Cập nhật trạng thái isFavorite của flashcards khi favoriteCardIds thay đổi
  useEffect(() => {
    setFlashcards(prev => prev.map(card => ({...card, isFavorite: favoriteCardIds.includes(card.id)})));
  }, [favoriteCardIds]);

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
  const favoriteCount = favoriteCardIds.length;

  // --- Handlers ---
  const handleShowHome = () => setActiveScreen('home');
  // ... (các hàm handleShow... khác)

  const toggleFavorite = async (id: number) => {
    if (!currentUser) return;
    const userDocRef = doc(db, 'users', currentUser.uid);
    const newFavoriteIds = favoriteCardIds.includes(id) ? favoriteCardIds.filter(favId => favId !== id) : [...favoriteCardIds, id];
    let updatedPlaylists = playlists;
    if (!newFavoriteIds.includes(id)) {
        updatedPlaylists = playlists.map(p => ({...p, cardIds: p.cardIds.filter(cardId => cardId !== id)}));
    }
    try {
      await updateDoc(userDocRef, { favoriteCardIds: newFavoriteIds, playlists: updatedPlaylists });
      setShowFavoriteToast(true);
      setTimeout(() => setShowFavoriteToast(false), 2000);
    } catch (error) { console.error("Lỗi toggleFavorite:", error); }
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

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    if (scrollContainerRef.current) {
      (scrollContainerRef.current as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">Đang tải bộ sưu tập...</div>;
  }

  return (
    <SidebarLayout
      setToggleSidebar={setToggleSidebar}
      onShowHome={handleShowHome}
      // ... (các props khác cho SidebarLayout)
      activeScreen={activeScreen}
    >
      <div className="flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900">
        <style>{animations}</style>

        {activeScreen === 'home' && (
          <>
            <div className="w-full max-w-6xl py-6 mx-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-4 px-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Flashcard Gallery</h1>
                {/* ... (các nút sidebar, settings) ... */}
              </div>

              {/* Tabs */}
              <div className="inline-flex rounded-lg bg-white dark:bg-gray-800 p-1 mb-4 shadow-sm border border-gray-200 dark:border-gray-700 mx-4">
                <button
                  onClick={() => { setActiveTab('collection'); setCurrentPage(1); }}
                  className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'collection' ? 'bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <span>Collection</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'collection' ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{totalFlashcardsInCollection}</span>
                </button>
                <button
                  onClick={() => { setActiveTab('favorite'); setCurrentPage(1); setSelectedPlaylistId('all'); }}
                  className={`flex items-center space-x-1.5 px-4 py-2 text-sm rounded-lg transition-all duration-300 ${activeTab === 'favorite' ? 'bg-pink-50 dark:bg-pink-900 text-pink-700 dark:text-pink-300 font-medium shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <span>Favorite</span>
                  <span className={`inline-flex items-center justify-center ${activeTab === 'favorite' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} text-xs font-medium px-1.5 py-0.5 rounded-full ml-1`}>{favoriteCount}</span>
                </button>
              </div>

              {/* Playlist Controls */}
              {activeTab === 'favorite' && (
                <div className="px-4 mb-4">
                  <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-grow">
                      <label htmlFor="playlist-select" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Chọn Playlist
                      </label>
                      <select
                        id="playlist-select" value={selectedPlaylistId} onChange={(e) => { setSelectedPlaylistId(e.target.value); setCurrentPage(1); }}
                        className="w-full md:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                      >
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
                  <div ref={scrollContainerRef} className={`grid gap-4 px-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {flashcardsForCurrentPage.map((card) => (
                      <div key={card.id}>
                        <div id={`flashcard-${card.id}`} className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative group">
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                          <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
                            {card.isFavorite && (
                                <button
                                    onClick={() => openPlaylistModal(card.id)}
                                    className="p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 transition-all"
                                    aria-label="Thêm vào playlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                                    </svg>
                                </button>
                            )}
                            <button
                                className={`transition-all duration-300 flex items-center justify-center p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 ${card.isFavorite ? 'scale-110' : 'scale-100'}`}
                                onClick={() => toggleFavorite(card.id)}
                                aria-label={card.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
                            >
                                <img
                                    src={card.isFavorite ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"}
                                    alt={card.isFavorite ? "Favorite icon" : "Unfavorite icon"}
                                    className={`h-4 w-4 transition-all duration-300 ${card.isFavorite ? 'opacity-100' : 'opacity-75'}`}
                                />
                            </button>
                          </div>
                          <div className="w-full">
                            <img
                              src={getImageUrlForStyle(card, visualStyle)}
                              alt={`Flashcard ${card.id}`}
                              className="w-full h-auto cursor-pointer"
                              style={{ aspectRatio: '1024/1536' }}
                              onClick={() => openVocabDetail(card)}
                              onError={(e) => { e.currentTarget.src = card.imageUrl.default; }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                      <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                          {activeTab === 'collection' ? 'Bộ sưu tập trống' : selectedPlaylistId === 'all' ? 'Chưa có từ yêu thích' : 'Playlist này trống'}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 max-w-md">
                          {activeTab === 'collection' ? 'Hãy mở rương để nhận thêm flashcard mới!' : selectedPlaylistId === 'all' ? 'Nhấn vào biểu tượng trái tim để thêm từ vào mục yêu thích.' : 'Hãy thêm các từ yêu thích vào playlist này.'}
                      </p>
                  </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-4 pb-24 px-4">
                    {/* ... (Code phân trang của bạn) ... */}
                  </div>
                )}
              </div>
            </div>
            
            {/* Popups, Toasts, and Modals */}
            {/* ... (Popup Cài đặt) ... */}
            {/* ... (Toast Yêu thích) ... */}
            <FlashcardDetailModal selectedCard={selectedCard} showVocabDetail={showVocabDetail} exampleImages={exampleImages} onClose={closeVocabDetail} currentVisualStyle={visualStyle} />
            
            {isPlaylistModalOpen && selectedCardForPlaylist && (
              <AddToPlaylistModal
                isOpen={isPlaylistModalOpen}
                onClose={closePlaylistModal}
                cardId={selectedCardForPlaylist}
                currentUser={currentUser}
                existingPlaylists={playlists}
              />
            )}
          </>
        )}
        
        {/* Other Screens */}
        {/* ... (Code cho các màn hình khác như Stats, Rank, v.v...) ... */}
      </div>
    </SidebarLayout>
  );
}
