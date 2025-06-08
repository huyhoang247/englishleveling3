// FILE: AddToPlaylistModal.tsx

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { User } from 'firebase/auth';

// Định nghĩa lại interface Playlist ở đây để component độc lập
interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
}

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  // THAY ĐỔI: Chấp nhận một cardId hoặc một mảng cardIds
  cardIds: number[]; 
  currentUser: User | null;
  existingPlaylists: Playlist[];
}

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  cardIds, // Đã cập nhật
  currentUser,
  existingPlaylists,
}: AddToPlaylistModalProps) {
  // State để theo dõi các playlist được chọn (dùng Set để hiệu quả hơn)
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  // State cho input tạo playlist mới
  const [newPlaylistName, setNewPlaylistName] = useState('');
  // State để hiển thị trạng thái đang lưu
  const [isSaving, setIsSaving] = useState(false);

  // Effect này sẽ chạy mỗi khi modal mở ra
  useEffect(() => {
    if (isOpen) {
      // Nếu chỉ thêm một thẻ, hãy chọn trước các playlist đã chứa nó
      if (cardIds.length === 1) {
        const cardId = cardIds[0];
        const initialSelectedIds = new Set<string>();
        existingPlaylists.forEach(playlist => {
          if (playlist.cardIds.includes(cardId)) {
            initialSelectedIds.add(playlist.id);
          }
        });
        setSelectedPlaylistIds(initialSelectedIds);
      } else {
        // Nếu thêm hàng loạt, bắt đầu với lựa chọn trống
        setSelectedPlaylistIds(new Set());
      }
      setNewPlaylistName(''); // Reset input khi mở modal
    }
  }, [isOpen, cardIds, existingPlaylists]);

  if (!isOpen || !currentUser) return null;

  // Xử lý khi người dùng tick/bỏ tick một playlist
  const handleTogglePlaylist = (playlistId: string) => {
    const newSelectedIds = new Set(selectedPlaylistIds);
    if (newSelectedIds.has(playlistId)) {
      newSelectedIds.delete(playlistId);
    } else {
      newSelectedIds.add(playlistId);
    }
    setSelectedPlaylistIds(newSelectedIds);
  };

  // Xử lý tạo playlist mới
  const handleCreateNewPlaylist = async () => {
    if (newPlaylistName.trim() === '' || !cardIds || cardIds.length === 0) return;
    setIsSaving(true);
    
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      // Tự động thêm tất cả các thẻ hiện tại vào playlist mới
      cardIds: [...cardIds], 
    };

    const userDocRef = doc(db, 'users', currentUser.uid);
    try {
      // Cập nhật Firestore với playlist mới
      await updateDoc(userDocRef, {
        playlists: [...existingPlaylists, newPlaylist],
      });
      // Tự động chọn playlist mới này trong modal
      setSelectedPlaylistIds(prev => new Set(prev).add(newPlaylist.id));
      setNewPlaylistName(''); // Xóa input
    } catch (error) {
      console.error("Lỗi khi tạo playlist mới:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };


  // Xử lý khi nhấn nút "Lưu thay đổi"
  const handleSave = async () => {
    if (!cardIds || cardIds.length === 0) return;
    setIsSaving(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    // Tạo một mảng playlist mới dựa trên các lựa chọn
    const updatedPlaylists = existingPlaylists.map(playlist => {
      const isSelected = selectedPlaylistIds.has(playlist.id);

      if (cardIds.length === 1) {
        // --- LOGIC CŨ CHO MỘT THẺ (thêm và xóa) ---
        const cardId = cardIds[0];
        const alreadyContainsCard = playlist.cardIds.includes(cardId);
        
        if (isSelected && !alreadyContainsCard) {
          // Nếu được chọn và chưa chứa thẻ -> thêm vào
          return { ...playlist, cardIds: [...playlist.cardIds, cardId] };
        }
        
        if (!isSelected && alreadyContainsCard) {
          // Nếu không được chọn và đang chứa thẻ -> xóa đi
          return { ...playlist, cardIds: playlist.cardIds.filter(id => id !== cardId) };
        }
      } else {
        // --- LOGIC MỚI CHO NHIỀU THẺ (chỉ thêm) ---
        if (isSelected) {
          // Nếu được chọn, hợp nhất các cardIds mới vào, đảm bảo không trùng lặp
          const combinedIds = new Set([...playlist.cardIds, ...cardIds]);
          return { ...playlist, cardIds: Array.from(combinedIds) };
        }
      }
      
      // Không thay đổi
      return playlist;
    });

    try {
      await updateDoc(userDocRef, {
        playlists: updatedPlaylists,
      });
      onClose(); // Đóng modal sau khi lưu thành công
    } catch (error) {
      console.error("Lỗi khi lưu thay đổi vào playlist:", error);
      alert("Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const modalTitle = cardIds.length > 1 ? `Thêm ${cardIds.length} từ vào Playlist` : "Thêm vào Playlist";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          {/* TIÊU ĐỀ ĐỘNG */}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{modalTitle}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Chọn playlist</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {existingPlaylists.length > 0 ? (
                existingPlaylists.map(playlist => (
                  <div key={playlist.id} className="flex items-center">
                    <input
                      id={`playlist-${playlist.id}`}
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={selectedPlaylistIds.has(playlist.id)}
                      onChange={() => handleTogglePlaylist(playlist.id)}
                    />
                    <label htmlFor={`playlist-${playlist.id}`} className="ml-3 block text-sm text-gray-800 dark:text-gray-200">
                      {playlist.name}
                    </label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Bạn chưa có playlist nào.</p>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="new-playlist" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Hoặc tạo playlist mới</label>
            <div className="flex space-x-2">
              <input
                id="new-playlist"
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Tên playlist mới..."
                className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
              <button
                onClick={handleCreateNewPlaylist}
                disabled={isSaving || newPlaylistName.trim() === ''}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-sm font-semibold rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}
