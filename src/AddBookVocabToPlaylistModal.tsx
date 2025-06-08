// TẠO FILE MỚI: AddBookVocabToPlaylistModal.tsx

import { useState, useEffect, useMemo } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { User } from 'firebase/auth';

interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

interface AddBookVocabToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  cardIdsToAdd: number[];
  currentUser: User | null;
  existingPlaylists: Playlist[];
}

export default function AddBookVocabToPlaylistModal({
  isOpen,
  onClose,
  bookTitle,
  cardIdsToAdd,
  currentUser,
  existingPlaylists,
}: AddBookVocabToPlaylistModalProps) {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('new');
  const [newPlaylistName, setNewPlaylistName] = useState(`Từ vựng: ${bookTitle}`);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset state khi modal mở
    if (isOpen) {
      setSelectedPlaylistId(existingPlaylists.length > 0 ? existingPlaylists[0].id : 'new');
      setNewPlaylistName(`Từ vựng: ${bookTitle}`);
    }
  }, [isOpen, bookTitle, existingPlaylists]);

  const newWordsCount = useMemo(() => {
    if (!selectedPlaylistId || selectedPlaylistId === 'new') {
        return cardIdsToAdd.length;
    }
    const targetPlaylist = existingPlaylists.find(p => p.id === selectedPlaylistId);
    if (!targetPlaylist) return cardIdsToAdd.length;

    const existingIds = new Set(targetPlaylist.cardIds);
    const newIds = cardIdsToAdd.filter(id => !existingIds.has(id));
    return newIds.length;
  }, [selectedPlaylistId, cardIdsToAdd, existingPlaylists]);

  if (!isOpen || !currentUser) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    try {
        let finalPlaylists: Playlist[];

        if (selectedPlaylistId === 'new') {
            // Tạo playlist mới
            if (newPlaylistName.trim() === '') {
                alert("Vui lòng nhập tên playlist.");
                setIsSaving(false);
                return;
            }
            const newPlaylist: Playlist = {
                id: Date.now().toString(),
                name: newPlaylistName.trim(),
                cardIds: [...new Set(cardIdsToAdd)], // Đảm bảo không có ID trùng
            };
            finalPlaylists = [...existingPlaylists, newPlaylist];
        } else {
            // Thêm vào playlist đã có
            finalPlaylists = existingPlaylists.map(p => {
                if (p.id === selectedPlaylistId) {
                    const combinedIds = [...p.cardIds, ...cardIdsToAdd];
                    const uniqueIds = [...new Set(combinedIds)]; // Hợp nhất và loại bỏ trùng lặp
                    return { ...p, cardIds: uniqueIds };
                }
                return p;
            });
        }

        await updateDoc(userDocRef, {
            playlists: finalPlaylists,
        });
        onClose();
    } catch (error) {
        console.error("Lỗi khi lưu từ vựng sách vào playlist:", error);
        alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Lưu từ vựng sách</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
            <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sách <span className="font-semibold text-indigo-600 dark:text-indigo-400">{bookTitle}</span> có <span className="font-semibold">{cardIdsToAdd.length}</span> từ vựng có thể lưu.
                </p>
            </div>
            {/* Lựa chọn playlist */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chọn nơi lưu:</label>
                <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                    {existingPlaylists.map(playlist => (
                        <div key={playlist.id} className="flex items-center">
                            <input id={`radio-${playlist.id}`} name="playlist-selection" type="radio" 
                                   checked={selectedPlaylistId === playlist.id} 
                                   onChange={() => setSelectedPlaylistId(playlist.id)}
                                   className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                            <label htmlFor={`radio-${playlist.id}`} className="ml-3 block text-sm text-gray-800 dark:text-gray-200">{playlist.name}</label>
                        </div>
                    ))}
                </div>
                 {/* Lựa chọn tạo mới */}
                <div className="flex items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <input id="radio-new" name="playlist-selection" type="radio" 
                           checked={selectedPlaylistId === 'new'} 
                           onChange={() => setSelectedPlaylistId('new')}
                           className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                    <label htmlFor="radio-new" className="ml-3 block text-sm text-gray-800 dark:text-gray-200">Tạo playlist mới</label>
                </div>
                {selectedPlaylistId === 'new' && (
                    <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Tên playlist mới..."
                           className="mt-2 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2" />
                )}
            </div>
             {/* Thông báo số từ sẽ thêm */}
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/50 rounded-lg text-center">
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    {newWordsCount > 0 ? `Sẽ thêm ${newWordsCount} từ mới vào playlist.` : `Tất cả từ vựng đã có trong playlist này.`}
                </p>
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">Hủy</button>
            <button onClick={handleSave} disabled={isSaving || newWordsCount === 0} className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                {isSaving && <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {isSaving ? 'Đang lưu...' : 'Lưu'}
            </button>
        </div>
      </div>
    </div>
  );
}
