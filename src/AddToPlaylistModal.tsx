// FILE: AddToPlaylistModal_FIXED.tsx

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase.js';
import { User } from 'firebase/auth';

interface Playlist {
  id: string;
  name: string;
  cardIds: number[];
  // <<< THAY ĐỔI 1: Thêm isPinned để đồng bộ với interface ở Gallery >>>
  isPinned?: boolean;
}

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardIds: number[]; 
  currentUser: User | null;
  existingPlaylists: Playlist[];
}

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  cardIds,
  currentUser,
  existingPlaylists,
}: AddToPlaylistModalProps) {
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Logic khởi tạo state khi modal mở, không thay đổi
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
        setSelectedPlaylistIds(new Set());
      }
      setNewPlaylistName('');
      setIsSaving(false);
    }
  }, [isOpen, cardIds, existingPlaylists]);

  if (!isOpen || !currentUser) return null;

  const handleTogglePlaylist = (playlistId: string) => {
    const newSelectedIds = new Set(selectedPlaylistIds);
    if (newSelectedIds.has(playlistId)) {
      newSelectedIds.delete(playlistId);
    } else {
      newSelectedIds.add(playlistId);
    }
    setSelectedPlaylistIds(newSelectedIds);
  };

  // <<< THAY ĐỔI 2: Loại bỏ hoàn toàn hàm handleCreateNewPlaylist >>>
  // Hàm này gây ra race condition, logic của nó sẽ được tích hợp vào handleSave

  const handleSave = async () => {
    // Nếu không có card nào để thêm và không tạo playlist mới, thì không làm gì cả
    if ((!cardIds || cardIds.length === 0) && newPlaylistName.trim() === '') {
      onClose();
      return;
    }
    
    setIsSaving(true);
    const userDocRef = doc(db, 'users', currentUser.uid);

    // Bắt đầu với một bản sao của các playlist hiện có
    let playlistsToWrite = [...existingPlaylists];

    // <<< THAY ĐỔI 3: Tích hợp logic tạo playlist mới vào đây >>>
    // Bước 1: Nếu người dùng có nhập tên playlist mới, tạo nó và thêm vào mảng
    if (newPlaylistName.trim() !== '') {
      const newPlaylist: Playlist = {
        id: `playlist_${Date.now()}`, // Dùng ID dựa trên thời gian cho đơn giản
        name: newPlaylistName.trim(),
        cardIds: [...cardIds], // Thêm các card đang chọn vào playlist mới
        isPinned: false, // Mặc định không ghim
      };
      playlistsToWrite.push(newPlaylist);
      // Tự động chọn playlist vừa tạo
      selectedPlaylistIds.add(newPlaylist.id);
    }

    // <<< THAY ĐỔI 4: Cập nhật logic xử lý các playlist hiện có >>>
    // Bước 2: Duyệt qua mảng playlist (đã có thể bao gồm playlist mới) và cập nhật cardIds
    playlistsToWrite = playlistsToWrite.map(playlist => {
      const isSelected = selectedPlaylistIds.has(playlist.id);
      const currentCardIds = new Set(playlist.cardIds);
      let changed = false;

      // Xử lý thêm hoặc bớt từng card
      cardIds.forEach(cardId => {
        const alreadyContainsCard = currentCardIds.has(cardId);
        if (isSelected && !alreadyContainsCard) {
          // Nếu được chọn và chưa có card -> thêm vào
          currentCardIds.add(cardId);
          changed = true;
        } else if (!isSelected && alreadyContainsCard) {
          // Nếu không được chọn và đã có card -> xóa đi
          currentCardIds.delete(cardId);
          changed = true;
        }
      });
      
      // Chỉ tạo object mới nếu có sự thay đổi để tối ưu hiệu suất
      if (changed) {
        return { ...playlist, cardIds: Array.from(currentCardIds) };
      }
      
      return playlist;
    });

    // Bước 3: Ghi toàn bộ mảng đã được cập nhật lên Firestore một lần duy nhất
    try {
      await updateDoc(userDocRef, {
        playlists: playlistsToWrite,
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
  const canCreate = !isSaving && newPlaylistName.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{modalTitle}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Tạo Playlist Mới */}
          <div>
            <label htmlFor="new-playlist" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tạo playlist mới</label>
            <div className="flex space-x-2">
              <input
                id="new-playlist"
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                // <<< THAY ĐỔI 5: Cho phép nhấn Enter để lưu thay vì tạo ngay >>>
                onKeyDown={(e) => e.key === 'Enter' && canCreate && handleSave()}
                placeholder="Tên playlist..."
                className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm px-3 py-2 transition-all"
              />
              {/* <<< THAY ĐỔI 6: Nút này không còn tác dụng, có thể ẩn hoặc vô hiệu hóa hoàn toàn >>>
                  Trong trường hợp này, chúng ta vô hiệu hóa nó và không gán sự kiện onClick */}
              <button
                disabled={true} // Nút này không còn cần thiết
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-md disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                aria-hidden="true" // Ẩn khỏi trình đọc màn hình
                tabIndex={-1} // Loại bỏ khỏi tab order
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="ml-1.5 hidden sm:inline">Tạo</span>
              </button>
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Nhập tên và nhấn 'Lưu thay đổi' để tạo.</p>
          </div>
          
          {/* Danh sách Playlist hiện có */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Hoặc thêm vào playlist đã có</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 -mr-2 border-t border-b border-gray-200 dark:border-gray-700 py-3">
              {existingPlaylists.length > 0 ? (
                existingPlaylists.map(playlist => {
                  const isSelected = selectedPlaylistIds.has(playlist.id);
                  return (
                    <div 
                      key={playlist.id} 
                      onClick={() => handleTogglePlaylist(playlist.id)}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ease-in-out
                        ${isSelected 
                          ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 shadow-sm' 
                          : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-700/50'}`
                      }
                    >
                      <div className={`flex-shrink-0 mr-4 p-2 rounded-full ${isSelected ? 'bg-indigo-100 dark:bg-indigo-800' : 'bg-gray-100 dark:bg-gray-700'}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSelected ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5z" />
                          </svg>
                      </div>

                      <div className="flex-grow">
                        <p className={`font-medium ${isSelected ? 'text-indigo-800 dark:text-indigo-200' : 'text-gray-800 dark:text-gray-200'}`}>{playlist.name}</p>
                        <p className={`text-xs ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>{playlist.cardIds.length} từ</p>
                      </div>

                      <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out
                        ${isSelected 
                          ? 'bg-indigo-600 text-white scale-100' 
                          : 'bg-white dark:bg-gray-600 ring-2 ring-gray-300 dark:ring-gray-500 scale-90 opacity-50'}`
                      }>
                        {isSelected && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Bạn chưa có playlist nào.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Hãy tạo một playlist mới ở trên nhé!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
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
