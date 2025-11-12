// --- START OF FILE VerticalFlashcardGallery.tsx ---

import { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react';
import FlashcardDetailModal from './story/flashcard.tsx';
import AddToPlaylistModal from './AddToPlaylistModal.tsx';
import { auth, db } from './firebase.js';
// <<< THAY ĐỔI 1: XÓA CÁC IMPORT KHÔNG CẦN THIẾT TỪ FIRESTORE (collection, query, orderBy) >>>
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { SidebarLayout } from './sidebar-story.tsx';

// <<< THAY ĐỔI 2: IMPORT localDB SERVICE ĐỂ ĐỌC DỮ LIỆU TỪ INDEXEDDB >>>
import { localDB } from './local-data/local-vocab-db.ts'; // <= CHÚ Ý: CHỈNH LẠI ĐƯỢNG DẪN NÀY NẾU CẦN

import { ALL_CARDS_MAP, exampleData, Flashcard } from './story/flashcard-data.ts';
import { quizHomeAssets } from './game-assets.ts';
import GallerySkeletonLoader from './GallerySkeletonLoader.tsx';


// --- Interfaces and Data ---
interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
  isPinned?: boolean;
}
interface VerticalFlashcardGalleryProps {
  hideNavBar: () => void;
  showNavBar: () => void;
  currentUser: User | null;
}
interface DisplayCard {
    card: Flashcard;
    isFavorite: boolean;
}

const animations = `
  @keyframes fadeInOut { 0% { opacity: 0; transform: translateY(-10px); } 10% { opacity: 1; transform: translateY(0); } 90% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-10px); } }
  @keyframes slideIn { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes scaleIn { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
  @keyframes modalBackdropIn { 0% { opacity: 0; } 100% { opacity: 0.5; } }
  @keyframes modalIn { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
  @keyframes animeSparkle { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
  @keyframes comicPop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
  @keyframes realisticShine { 0% { background-position: -100% 0; } 100% { background-position: 200% 0; } }
`;

// --- START: ICONS SAO CHÉP TỪ course-ui.tsx ---
const HomeIcon = ({ className = "h-6 w-6" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLineCap="round" strokeLineJoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
const BackIcon = ({ className = "h-6 w-6" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLineCap="round" strokeLineJoin="round" d="M15 19l-7-7 7-7" /></svg> );
const SettingsIcon = ({ className = "h-6 w-6" }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/settings.webp" alt="Settings Icon" className={className} /> );
const MenuIcon = ({ className = "h-6 w-6" }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLineCap="round" strokeLineJoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>);
// --- END: ICONS ---


// --- START: GALLERY HEADER COMPONENT MỚI ---
interface GalleryHeaderProps {
  activeScreen: string;
  onGoBack: () => void;
  onGoHome: () => void;
  toggleSidebar: (() => void) | null;
  setShowSettings: (show: boolean) => void;
}

function GalleryHeader({ activeScreen, onGoBack, onGoHome, toggleSidebar, setShowSettings }: GalleryHeaderProps) {
  const headerTitle = useMemo(() => {
    if (activeScreen === 'home') return null;
    return activeScreen.charAt(0).toUpperCase() + activeScreen.slice(1);
  }, [activeScreen]);

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm shadow-md">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center">
          <div className="w-24 flex justify-start">
            {activeScreen === 'home' ? (
              <button onClick={() => toggleSidebar?.()} className="p-2 -ml-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Mở menu"><MenuIcon /></button>
            ) : (
              <button onClick={onGoBack} className="p-2 -ml-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Quay lại"><BackIcon /></button>
            )}
          </div>
          <div className="flex-1 flex justify-center px-4">
             {activeScreen === 'home' ? (
              <a className="flex items-center" href="#" onClick={(e) => { e.preventDefault(); onGoHome(); }}>
                 <img src={quizHomeAssets.logoLarge} alt="Logo" className="h-10 w-auto" />
              </a>
            ) : (
                headerTitle && <h2 className="text-lg font-bold text-slate-200 truncate">{headerTitle}</h2>
            )}
          </div>
          <div className="w-24 flex items-center justify-end">
              {activeScreen === 'home' ? (
                  <button onClick={() => setShowSettings(true)} className="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Cài đặt hiển thị"><SettingsIcon /></button>
              ) : (
                 <button onClick={onGoHome} className="p-2 rounded-full text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Về trang chủ"><HomeIcon /></button>
              )}
          </div>
        </div>
      </div>
    </header>
  );
}
// --- END: GALLERY HEADER COMPONENT ---


// Tách FlashcardItem ra component riêng và memoize nó.
interface FlashcardItemProps {
  card: Flashcard;
  isFavorite: boolean;
  visualStyle: string;
  onImageClick: (card: Flashcard) => void;
  onFavoriteClick: (id: number) => void;
  getImageUrlForStyle: (card: Flashcard, style: string) => string;
}

const FlashcardItem = memo(({ card, isFavorite, visualStyle, onImageClick, onFavoriteClick, getImageUrlForStyle }: FlashcardItemProps) => {
  const comicDotPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Ccircle cx='2' cy='2' r='0.5' fill='rgba(0,0,0,0.2)'/%3E%3C/svg%3E")`,
  };

  const isPhotography = visualStyle === 'photography';

  return (
    <div id={`flashcard-${card.id}`} className="flex flex-col items-center bg-white dark:bg-gray-800 shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
        <button className={`transition-all duration-300 flex items-center justify-center p-1.5 bg-white/80 dark:bg-gray-900/80 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900 ${isFavorite ? 'scale-110' : 'scale-100'}`}
                onClick={() => onFavoriteClick(card.id)}
                aria-label={isFavorite ? "Quản lý trong Playlist" : "Thêm vào Playlist"}>
            <img src={isFavorite ? "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite-active.png" : "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/image/favorite.png"} alt={isFavorite ? "Favorite icon" : "Unfavorite icon"} className={`h-4 w-4 transition-all duration-300 ${isFavorite ? 'opacity-100' : 'opacity-75'}`} />
        </button>
      </div>
      <div className="w-full">
        <div className={`relative w-full ${visualStyle === 'realistic' ? 'p-2 bg-amber-50/70 dark:bg-gray-800' : ''}`}>
          {visualStyle === 'anime' && <div className="absolute inset-0 bg-pink-300/20 dark:bg-purple-400/10 pointer-events-none"></div>}
          {visualStyle === 'comic' && <div className="absolute inset-0 bg-blue-100 opacity-20 mix-blend-multiply pointer-events-none dark:bg-blue-900" style={comicDotPattern}></div>}
          {visualStyle === 'realistic' && <div className="absolute inset-2 shadow-inner rounded-md pointer-events-none"></div>}
          
          <img
            src={getImageUrlForStyle(card, visualStyle)}
            alt={`Flashcard ${card.id}`}
            className={`
              w-full h-auto
              ${isPhotography ? 'object-cover' : ''}
              ${visualStyle === 'anime' ? 'saturate-150 contrast-105' : ''}
              ${visualStyle === 'comic' ? 'contrast-125 brightness-105' : ''}
              ${visualStyle === 'realistic' ? 'saturate-105 contrast-110 shadow-md' : ''}
              cursor-pointer
            `}
            style={{
              aspectRatio: isPhotography ? '1 / 1' : '1024 / 1536',
              filter: visualStyle === 'comic' ? 'grayscale(0.1)' : 'none'
            }}
            onClick={() => onImageClick(card)}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = card.imageUrl.default; }}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
});


export default function VerticalFlashcardGallery({ hideNavBar, showNavBar, currentUser }: VerticalFlashcardGalleryProps) {
  // --- States ---
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('collection');
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'single' | 'double'>('single');
  const [visualStyle, setVisualStyle] = useState('default');
  const [selectedCard, setSelectedCard] = useState<Flashcard | null>(null);
  const [showVocabDetail, setShowVocabDetail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openedImageIds, setOpenedImageIds] = useState<number[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('all');
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [selectedCardForPlaylist, setSelectedCardForPlaylist] = useState<number[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [activeScreen, setActiveScreen] = useState('home');
  const [toggleSidebar, setToggleSidebar] = useState<(() => void) | null>(null);
  const [showAllPlaylistsModal, setShowAllPlaylistsModal] = useState(false);
  const [playlistSearch, setPlaylistSearch] = useState('');
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [isUpdatingPlaylists, setIsUpdatingPlaylists] = useState(false);

  // --- Derived State ---
  const allFavoriteCardIds = useMemo(() => {
    return new Set(playlists.flatMap(p => p.cardIds));
  }, [playlists]);

  // --- Effects ---
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      setOpenedImageIds([]);
      setPlaylists([]);
      return;
    }

    setLoading(true);
    let unsubscribePlaylists: () => void;
    // <<< THAY ĐỔI 3: XÓA BIẾN unsubscribeOpenedCards KHÔNG CẦN THIẾT >>>

    // Logic lấy playlists từ Firestore không thay đổi, vẫn giữ nguyên
    const userDocRef = doc(db, 'users', currentUser.uid);
    unsubscribePlaylists = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setPlaylists(Array.isArray(userData.playlists) ? userData.playlists : []);
      } else {
        setPlaylists([]);
      }
    }, (error) => {
      console.error("Error fetching user playlists:", error);
    });

    // <<< THAY ĐỔI 4: THAY THẾ TOÀN BỘ LOGIC LẤY DỮ LIỆU TỪ SUBCOLLECTION BẰNG LOCAL DB >>>
    const fetchOpenedCardsFromLocalDB = async () => {
        try {
            // Lấy toàn bộ object từ IndexedDB
            const openedItems = await localDB.getAllOpenedVocab();
            
            // Sắp xếp chúng theo ngày nhận giảm dần (mới nhất trước)
            const sortedItems = openedItems.sort((a, b) => b.collectedAt.getTime() - a.collectedAt.getTime());
            
            // Chỉ lấy ra ID và cập nhật state
            const ids = sortedItems.map(item => item.id);
            setOpenedImageIds(ids);
        } catch (error) {
            console.error("Error fetching opened cards from Local DB:", error);
            setOpenedImageIds([]); // Reset nếu có lỗi
        } finally {
            // Đánh dấu là đã tải xong, bất kể thành công hay thất bại
            setLoading(false);
        }
    };
    
    fetchOpenedCardsFromLocalDB();
    
    return () => {
      if (unsubscribePlaylists) unsubscribePlaylists();
      // <<< THAY ĐỔI 5: XÓA CLEANUP CỦA openedCards >>>
    };
  }, [currentUser]);


  const filteredFlashcardsByTab = useMemo((): DisplayCard[] => {
    const getDisplayCard = (id: number): DisplayCard | undefined => {
        const card = ALL_CARDS_MAP.get(id);
        if (!card) return undefined;
        return {
            card,
            isFavorite: allFavoriteCardIds.has(id)
        };
    };

    let cardIdsToShow: number[] = [];

    if (activeTab === 'collection') {
        cardIdsToShow = openedImageIds;
    } else if (activeTab === 'favorite') {
        if (selectedPlaylistId === 'all') {
            cardIdsToShow = Array.from(allFavoriteCardIds).sort((a,b) => b-a);
        } else {
            const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
            cardIdsToShow = selectedPlaylist ? [...selectedPlaylist.cardIds].sort((a,b) => b-a) : [];
        }
    }
    
    return cardIdsToShow
        .map(id => getDisplayCard(id))
        .filter((item): item is DisplayCard => item !== undefined);

  }, [activeTab, openedImageIds, allFavoriteCardIds, playlists, selectedPlaylistId]);

  const totalPages = Math.ceil(filteredFlashcardsByTab.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const flashcardsForCurrentPage = filteredFlashcardsByTab.slice(startIndex, endIndex);
  const totalFlashcardsInCollection = openedImageIds.length;
  const favoriteCount = allFavoriteCardIds.size;

  // --- Handlers ---
  const handleShowHome = useCallback(() => setActiveScreen('home'), []);
  const handleShowStats = useCallback(() => setActiveScreen('stats'), []);
  const handleShowRank = useCallback(() => setActiveScreen('rank'), []);
  const handleShowGoldMine = useCallback(() => setActiveScreen('goldMine'), []);
  const handleShowTasks = useCallback(() => setActiveScreen('tasks'), []);
  const handleShowPerformance = useCallback(() => setActiveScreen('performance'), []);
  const handleShowSettings = useCallback(() => setActiveScreen('settings'), []);
  const handleShowHelp = useCallback(() => setActiveScreen('help'), []);

  const closePlaylistModal = useCallback(() => { setIsPlaylistModalOpen(false); setSelectedCardForPlaylist(null); }, []);
  const closeVocabDetail = useCallback(() => { setShowVocabDetail(false); setSelectedCard(null); showNavBar(); }, [showNavBar]);

  const openPlaylistModal = useCallback((cardId: number) => {
    setSelectedCardForPlaylist([cardId]);
    setIsPlaylistModalOpen(true);
  }, []);

  const handleFavoriteClick = useCallback((id: number) => {
    if (!currentUser) return;
    openPlaylistModal(id);
  }, [currentUser, openPlaylistModal]);

  const openVocabDetail = useCallback((card: Flashcard) => {
    setSelectedCard(card);
    setShowVocabDetail(true);
    hideNavBar();
  }, [hideNavBar]);

  const getImageUrlForStyle = useCallback((card: Flashcard, style: string): string => {
    switch (style) {
        case 'photography': return card.imageUrl.photography || card.imageUrl.default;
        case 'anime': return card.imageUrl.anime || card.imageUrl.default;
        case 'comic': return card.imageUrl.comic || card.imageUrl.default;
        case 'realistic': return card.imageUrl.realistic || card.imageUrl.default;
        default: return card.imageUrl.default;
    }
  }, []);

  const handlePageChange = useCallback((pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [totalPages]);

  const paginationItems = useMemo(() => {
    const siblingCount = 1;
    const totalPageNumbers = siblingCount + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const range = (start: number, end: number) => {
      let length = end - start + 1;
      return Array.from({ length }, (_, idx) => idx + start);
    };

    if (!shouldShowLeftDots && shouldShowRightDots) {
      let leftItemCount = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCount);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      let rightItemCount = 3 + 2 * siblingCount;
      let rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, '...', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      let middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, '...', ...middleRange, '...', totalPages];
    }

    return [];

  }, [currentPage, totalPages]);

  const scrollbarHide = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  const pinnedCount = useMemo(() => playlists.filter(p => p.isPinned).length, [playlists]);

  const handleTogglePin = useCallback(async (playlistId: string) => {
    if (!currentUser) return;

    const originalPlaylists = [...playlists];
    const newPlaylists = originalPlaylists.map(p => {
        if (p.id === playlistId) {
            if (!p.isPinned && pinnedCount >= 2) {
                alert("Bạn chỉ có thể ghim tối đa 2 playlist.");
                return p;
            }
            return { ...p, isPinned: !p.isPinned };
        }
        return p;
    });

    if (JSON.stringify(newPlaylists) === JSON.stringify(originalPlaylists)) {
        return;
    }

    setIsUpdatingPlaylists(true);
    setPlaylists(newPlaylists);

    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { playlists: newPlaylists });
    } catch (error) {
        console.error("Lỗi khi ghim/bỏ ghim playlist:", error);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
        setPlaylists(originalPlaylists);
    } finally {
        setIsUpdatingPlaylists(false);
    }
  }, [playlists, pinnedCount, currentUser]);

  const pillsToDisplay = useMemo(() => {
    const pinned = playlists.filter(p => p.isPinned);
    const selected = playlists.find(p => p.id === selectedPlaylistId);

    const displaySet = new Set<Playlist>();
    pinned.forEach(p => displaySet.add(p));
    if (selected && !displaySet.has(selected) && selectedPlaylistId !== 'all') {
        displaySet.add(selected);
    }
    return Array.from(displaySet).sort((a,b) => a.name.localeCompare(b.name));
  }, [playlists, selectedPlaylistId]);

  const handleConfirmDelete = useCallback(async () => {
    if (!playlistToDelete || !currentUser) return;

    const originalPlaylists = [...playlists];
    const newPlaylists = originalPlaylists.filter(p => p.id !== playlistToDelete.id);

    setIsUpdatingPlaylists(true);

    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { playlists: newPlaylists });
        
        setPlaylists(newPlaylists);
        if (selectedPlaylistId === playlistToDelete.id) {
            setSelectedPlaylistId('all');
        }
        setPlaylistToDelete(null);
    } catch (error) {
        console.error("Lỗi khi xoá playlist:", error);
        alert("Đã xảy ra lỗi khi xoá playlist. Vui lòng thử lại.");
    } finally {
        setIsUpdatingPlaylists(false);
    }
  }, [playlistToDelete, currentUser, playlists, selectedPlaylistId]);

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
      <div className="flex flex-col bg-white dark:bg-gray-900">
        <style>{animations}</style>
        <style>{scrollbarHide}</style>
        
        <GalleryHeader 
          activeScreen={activeScreen}
          onGoBack={handleShowHome}
          onGoHome={handleShowHome}
          toggleSidebar={toggleSidebar}
          setShowSettings={setShowSettings}
        />

        <main ref={mainContainerRef}>
          {loading ? (
            <GallerySkeletonLoader layoutMode={layoutMode} />
          ) : (
            <>
              {activeScreen === 'home' && (
                <>
                  <div className="w-full max-w-6xl py-6 mx-auto">
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
                      <div className="px-4 mb-6">
                        <div className="w-full">
                          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                            Đang xem trong Playlist
                          </label>

                          <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                            <button
                              onClick={() => { setSelectedPlaylistId('all'); handlePageChange(1); }}
                              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                ${selectedPlaylistId === 'all'
                                  ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700 font-bold shadow-sm'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600'}`
                                }
                            >
                              <span>Tất cả</span>
                              <span className={`px-2 py-0.5 text-xs rounded-full
                                ${selectedPlaylistId === 'all' ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200'}`
                              }>
                                {favoriteCount}
                              </span>
                            </button>

                            {pillsToDisplay.map(p => (
                              <button
                                key={p.id}
                                onClick={() => { setSelectedPlaylistId(p.id); handlePageChange(1); }}
                                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border truncate max-w-[250px]
                                  ${selectedPlaylistId === p.id
                                    ? 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-700 font-bold shadow-sm'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-600'}`
                                  }
                              >
                                {p.isPinned && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                                <span className="truncate">{p.name}</span>
                                <span className={`flex-shrink-0 px-2 py-0.5 text-xs rounded-full
                                  ${selectedPlaylistId === p.id ? 'bg-pink-100 dark:bg-pink-800 text-pink-800 dark:text-pink-200' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-200'}`
                                }>
                                  {p.cardIds.length}
                                </span>
                              </button>
                            ))}

                            <button
                                onClick={() => setShowAllPlaylistsModal(true)}
                                className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 border bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                                aria-label="Xem tất cả playlist"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                              </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="min-h-0">
                    <div className="w-full max-w-6xl mx-auto">
                      {flashcardsForCurrentPage.length > 0 ? (
                        <div className={`grid gap-4 px-4 ${layoutMode === 'single' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {flashcardsForCurrentPage.map(({ card, isFavorite }) => (
                            <FlashcardItem
                              key={card.id}
                              card={card}
                              isFavorite={isFavorite}
                              visualStyle={visualStyle}
                              onImageClick={openVocabDetail}
                              onFavoriteClick={handleFavoriteClick}
                              getImageUrlForStyle={getImageUrlForStyle}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                          <div className="bg-pink-50 dark:bg-pink-900 p-6 rounded-full mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-pink-300 dark:text-pink-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></div>
                          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">{activeTab === 'collection' ? 'Bộ sưu tập trống' : selectedPlaylistId === 'all' ? 'Chưa có từ yêu thích' : 'Playlist này trống'}</h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-md">{activeTab === 'collection' ? 'Hãy mở rương để nhận thêm flashcard mới!' : selectedPlaylistId === 'all' ? 'Nhấn vào biểu tượng trái tim để thêm từ vào mục yêu thích.' : 'Hãy thêm các từ yêu thích vào playlist này.'}</p>
                        </div>
                      )}

                      {totalPages > 1 && (
                        <div className="bg-white dark:bg-gray-900 p-4 flex justify-center shadow-lg mt-4 pb-24 px-4">
                          <nav className="flex items-center space-x-1 sm:space-x-2" aria-label="Pagination">
                            {paginationItems.map((item, index) =>
                              typeof item === 'string' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">...</span>
                              ) : (
                                <button
                                  key={item}
                                  onClick={() => handlePageChange(item)}
                                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${currentPage === item ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                >
                                  {item}
                                </button>
                              )
                            )}
                          </nav>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modals and other UI */}
                  {showSettings && (
                    <>
                      <div className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300" style={{ animation: 'modalBackdropIn 0.3s ease-out forwards' }} onClick={() => setShowSettings(false)}></div>
                      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={(e) => {if(e.target === e.currentTarget) setShowSettings(false)}}>
                        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ animation: 'scaleIn 0.3s ease-out forwards' }} id="settings-panel">
                          <div className="bg-indigo-600 p-5 flex-shrink-0 border-b-2 border-indigo-500/50">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold text-white flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l-.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>Cài đặt hiển thị</h3>
                              <button onClick={() => setShowSettings(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                          </div>
                          <div className="p-6 overflow-y-auto max-h-[70vh] flex-grow">
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>Bố cục hiển thị</h4>
                              <div className="flex space-x-2">
                                <div className={`flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${layoutMode === 'single' ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600'}`} onClick={() => setLayoutMode('single')}>
                                  <div className="w-8 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm mb-1"></div>
                                  <span className={`text-xs ${layoutMode === 'single' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>1 Cột</span>
                                </div>
                                <div className={`flex-1 p-2 border-2 rounded-lg cursor-pointer transition-all flex flex-col items-center ${layoutMode === 'double' ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-600'}`} onClick={() => setLayoutMode('double')}>
                                  <div className="flex space-x-1 mb-1"><div className="w-4 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm"></div><div className="w-4 h-12 bg-indigo-200 dark:bg-indigo-700 rounded-md shadow-sm"></div></div>
                                  <span className={`text-xs ${layoutMode === 'double' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>2 Cột</span>
                                </div>
                              </div>
                            </div>
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-500 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" /></svg>Phong cách hiển thị</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'default' ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-200'}`} onClick={() => setVisualStyle('default')}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'default' ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'default' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" /></svg></div><span className={`text-xs ${visualStyle === 'default' ? 'text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Mặc định</span></div>
                                <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'photography' ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-900' : 'border-gray-200 dark:border-gray-700 hover:border-amber-200 dark:hover:border-amber-600'}`} onClick={() => setVisualStyle('photography')}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'photography' ? 'bg-amber-100 dark:bg-amber-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'photography' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></div><span className={`text-xs ${visualStyle === 'photography' ? 'text-amber-700 dark:text-amber-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Photography</span></div>
                                <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'anime' ? 'border-pink-500 bg-pink-50 dark:border-pink-400 dark:bg-pink-900' : 'border-gray-200 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-600'}`} onClick={() => setVisualStyle('anime')}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'anime' ? 'bg-pink-100 dark:bg-pink-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'anime' ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg></div><span className={`text-xs ${visualStyle === 'anime' ? 'text-pink-700 dark:text-pink-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Anime</span></div>
                                <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'comic' ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600'}`} onClick={() => setVisualStyle('comic')}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'comic' ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'comic' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg></div><span className={`text-xs ${visualStyle === 'comic' ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Comic</span></div>
                                <div className={`p-2 border-2 rounded-lg cursor-pointer transition-all flex items-center ${visualStyle === 'realistic' ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-900' : 'border-gray-200 dark:border-gray-700 hover:border-emerald-200 dark:hover:border-emerald-600'}`} onClick={() => setVisualStyle('realistic')}><div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${visualStyle === 'realistic' ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-gray-100 dark:bg-gray-700'}`}><svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${visualStyle === 'realistic' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg></div><span className={`text-xs ${visualStyle === 'realistic' ? 'text-emerald-700 dark:text-emerald-300 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>Realistic</span></div>
                              </div>
                            </div>
                          </div>
                          <div className="sticky bottom-0 left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 flex space-x-3 flex-shrink-0">
                            <button className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium rounded-lg" onClick={() => setShowSettings(false)}>Hủy</button>
                            <button className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg flex items-center justify-center" onClick={() => setShowSettings(false)}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Áp dụng
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <FlashcardDetailModal selectedCard={selectedCard} showVocabDetail={showVocabDetail} exampleSentencesData={exampleData} onClose={closeVocabDetail} currentVisualStyle={visualStyle} />

                  {isPlaylistModalOpen && selectedCardForPlaylist && (
                    <AddToPlaylistModal
                      isOpen={isPlaylistModalOpen}
                      onClose={closePlaylistModal}
                      cardIds={selectedCardForPlaylist}
                      currentUser={currentUser}
                      existingPlaylists={playlists}
                    />
                  )}

                  {showAllPlaylistsModal && (
                    <>
                      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => { if (!playlistToDelete) setShowAllPlaylistsModal(false); }} style={{ animation: 'modalBackdropIn 0.3s' }}></div>
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => { if(e.target === e.currentTarget && !playlistToDelete) setShowAllPlaylistsModal(false) }}>
                        <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl flex flex-col max-h-[80vh] relative" style={{ animation: 'modalIn 0.3s' }}>
                          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Chọn một Playlist</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Ghim (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block -mt-1 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ) tối đa 2 playlist để luôn hiển thị.</p>
                          </div>

                          <div className="p-4 flex-shrink-0">
                              <div className="relative">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                  </svg>
                                  <input
                                      type="text"
                                      placeholder="Tìm tên playlist..."
                                      value={playlistSearch}
                                      onChange={(e) => setPlaylistSearch(e.target.value)}
                                      className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  />
                              </div>
                          </div>

                          <div className="overflow-y-auto px-4 pb-4 flex-grow">
                            <ul className="space-y-1">
                              {playlists
                                .filter(p => p.name.toLowerCase().includes(playlistSearch.toLowerCase()))
                                .map(p => (
                                  <li key={p.id}>
                                    <div
                                      onClick={() => {
                                        setSelectedPlaylistId(p.id);
                                        handlePageChange(1);
                                        setShowAllPlaylistsModal(false);
                                        setPlaylistSearch('');
                                      }}
                                      className={`w-full flex items-center text-left p-3 rounded-lg transition-colors duration-200 group cursor-pointer
                                        ${selectedPlaylistId === p.id
                                          ? 'bg-pink-100 dark:bg-pink-900/60'
                                          : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'}`
                                      }
                                    >
                                      <div className="flex-grow pr-4">
                                        <p className={`font-medium truncate ${selectedPlaylistId === p.id ? 'text-pink-800 dark:text-pink-200' : 'text-gray-800 dark:text-gray-200'}`}>{p.name}</p>
                                        <span className={`text-xs ${selectedPlaylistId === p.id ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500 dark:text-gray-400'}`}>{p.cardIds.length} từ vựng</span>
                                      </div>
                                      <div className="flex items-center flex-shrink-0 space-x-1">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleTogglePin(p.id); }}
                                            disabled={(!p.isPinned && pinnedCount >= 2) || isUpdatingPlaylists}
                                            className="p-2 rounded-full transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                                            aria-label={p.isPinned ? "Bỏ ghim playlist" : "Ghim playlist"}
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-all duration-200 ${p.isPinned ? 'text-yellow-400 scale-110' : 'text-gray-400 dark:text-gray-500 group-hover:text-yellow-500'}`} viewBox="0 0 20 20" fill="currentColor">
                                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                              </svg>
                                          </button>
                                          <button
                                              onClick={(e) => { e.stopPropagation(); setPlaylistToDelete(p); }}
                                              disabled={isUpdatingPlaylists}
                                              className="p-2 rounded-full transition-colors duration-200 group-hover:bg-red-100 dark:group-hover:bg-red-900/50 disabled:opacity-30 disabled:cursor-not-allowed"
                                              aria-label={`Xoá playlist ${p.name}`}
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 group-hover:text-red-500 transition-colors" viewBox="0 0 20 20" fill="currentColor">
                                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                              </svg>
                                          </button>
                                      </div>
                                    </div>
                                  </li>
                                ))}
                            </ul>
                          </div>

                          {playlistToDelete && (
                              <div className="absolute inset-0 bg-gray-900/60 dark:bg-black/70 z-10 flex items-center justify-center p-4 rounded-2xl" style={{ animation: 'fadeIn 0.2s' }}>
                                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm text-center p-6" style={{ animation: 'scaleIn 0.2s' }}>
                                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
                                          <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                          </svg>
                                      </div>
                                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Xoá Playlist</h3>
                                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                          Bạn có chắc chắn muốn xoá playlist <strong className="font-semibold text-gray-800 dark:text-white">"{playlistToDelete.name}"</strong>? <br/>Hành động này không thể hoàn tác.
                                      </p>
                                      <div className="mt-6 flex justify-center space-x-4">
                                          <button type="button" onClick={() => setPlaylistToDelete(null)} disabled={isUpdatingPlaylists} className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                                              Huỷ
                                          </button>
                                          <button type="button" onClick={handleConfirmDelete} disabled={isUpdatingPlaylists} className="flex-1 rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                              {isUpdatingPlaylists ? 'Đang xoá...' : 'Xác nhận Xoá'}
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {activeScreen !== 'home' && (
                  <div className="flex items-center justify-center h-full text-2xl text-gray-600 dark:text-gray-300 p-8">
                      {activeScreen === 'stats' && 'Màn hình Stats'}
                      {activeScreen === 'rank' && 'Màn hình Rank'}
                      {activeScreen === 'goldMine' && 'Màn hình Mỏ vàng'}
                      {activeScreen === 'tasks' && 'Màn hình Công việc'}
                      {activeScreen === 'performance' && 'Màn hình Hiệu suất'}
                      {activeScreen === 'settings' && 'Màn hình Cài đặt'}
                      {activeScreen === 'help' && 'Màn hình Trợ giúp'}
                  </div>
              )}
            </>
          )}
        </main>
      </div>
    </SidebarLayout>
  );
}
