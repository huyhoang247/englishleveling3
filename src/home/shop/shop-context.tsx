// --- START OF FILE shop-context.tsx ---

import React, { createContext, useState, useEffect, useContext, ReactNode, FC } from 'react';
import { auth } from '../../firebase.js';
import { processGemToCoinExchange, processShopPurchase, createGemTransaction, confirmUserPayment } from './shop-service.ts'; 
import { useGame } from '../../GameContext.tsx'; 
import { itemDatabase } from '../equipment/item-database.ts';
import type { User } from 'firebase/auth';

// --- Static Data ---
const sampleItemsNonWeapons = [
  { id: 1002, name: 'Giáp Thiên Thần', type: 'Trang bị', rarity: 'S', price: 1820, image: 'https://placehold.co/600x600/1a1a2e/87ceeb?text=🛡️', description: 'Bộ giáp mang lại sự bảo vệ tối thượng và khả năng hồi phục máu theo thời gian.' },
  { id: 1006, name: 'Khiên Bất Diệt', type: 'Trang bị', rarity: 'SR', price: 2000, image: 'https://placehold.co/600x600/1a1a2e/c0c0c0?text=🛡️', description: 'Một chiếc khiên không thể bị phá hủy, chặn mọi đòn tấn công từ phía trước.' },
  { id: 1009, name: 'Ancient Book', type: 'Item', rarity: 'A', price: 1500, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1859_Icon%20S%C3%A1ch%20C%E1%BB%95%20Anime_simple_compose_01k0kv0rg5fhzrx8frbtsgqk33.png', description: 'Dùng để học và nâng cấp các kỹ năng đặc biệt.', stackable: true },
  { id: 2001, name: 'Card Capacity', type: 'Item', rarity: 'A', price: 100, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000006160622f8a01c95a4a8eb982.png', description: 'Tăng giới hạn số lượng thẻ từ vựng có thể sở hữu. Giá được tính trên mỗi đơn vị sức chứa.', stackable: true, quantityOptions: [50, 100, 200] },
  { id: 2002, name: 'Equipment Piece', type: 'Item', rarity: 'B', price: 10, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/equipment-piece.webp', description: 'Nguyên liệu cốt lõi dùng để chế tạo và hợp nhất trang bị.', stackable: true, quantityOptions: [10, 50, 100] },
  { id: 2003, name: 'Pickaxe', type: 'Item', rarity: 'B', price: 50, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/pickaxe-icon.webp', description: 'Dùng để khai thác tài nguyên và khoáng sản.', stackable: true, quantityOptions: [10, 50, 100], },
];

// --- Type Definitions ---
interface ToastState { show: boolean; message: string; showIcon: boolean; }
interface ShopContextType {
  currentUser: User | null;
  coins: number;
  gems: number;
  isLoading: boolean;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  allItems: any[];
  selectedItem: any | null;
  selectedGemPackage: any | null;
  selectedExchangePackage: any | null;
  activeTransaction: any | null;
  toastState: ToastState;
  triggerToast: (message: string, showIcon?: boolean, duration?: number) => void;
  handlePurchaseItem: (item: any, quantity: number) => Promise<void>;
  handleGemExchange: (pkg: any) => Promise<void>;
  handleSelectItem: (shopItem: any) => void;
  handleSelectGemPackage: (pkg: any) => Promise<void>;
  handleConfirmPayment: () => Promise<void>;
  handleSelectExchangePackage: (pkg: any) => void;
  handleCloseModals: () => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps { children: ReactNode; getShopItemsFunction: () => any[]; }
export const ShopProvider: FC<ShopProviderProps> = ({ children, getShopItemsFunction }) => {
  const currentUser = auth.currentUser;
  const { coins, gems, isLoadingUserData, updateUserCurrency, setIsSyncingData } = useGame();

  const [activeCategory, setActiveCategory] = useState('Nạp Gems');
  const [allItems, setAllItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedGemPackage, setSelectedGemPackage] = useState<any | null>(null);
  const [selectedExchangePackage, setSelectedExchangePackage] = useState<any | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<any | null>(null);
  const [toastState, setToastState] = useState<ToastState>({ show: false, message: '', showIcon: true });

  const triggerToast = (message: string, showIcon = true, duration = 3000) => {
    setToastState({ show: true, message, showIcon });
    setTimeout(() => { setToastState(prevState => ({ ...prevState, show: false })); }, duration);
  };

  useEffect(() => {
    const dailyWeapons = getShopItemsFunction();
    setAllItems([...dailyWeapons, ...sampleItemsNonWeapons]);
  }, [getShopItemsFunction]);
  
  const handlePurchaseItem = async (item: any, quantity: number) => {
    if (!currentUser) { triggerToast("Mua thất bại: Người dùng chưa đăng nhập.", true); throw new Error("User not authenticated."); }
    if (!item || typeof item.price !== 'number' || !item.id || typeof quantity !== 'number' || quantity <= 0) { throw new Error("Dữ liệu vật phẩm hoặc số lượng không hợp lệ."); }
    setIsSyncingData(true);
    try {
      const { newCoins, newBooks, newCapacity, newPieces } = await processShopPurchase(currentUser.uid, item, quantity);
      const updates: { coins?: number; ancientBooks?: number; cardCapacity?: number; equipmentPieces?: number; } = { coins: newCoins };
      if (item.id === 1009) { updates.ancientBooks = newBooks; } else if (item.id === 2001) { updates.cardCapacity = newCapacity; } else if (item.id === 2002) { updates.equipmentPieces = newPieces; }
      updateUserCurrency(updates);
      triggerToast(`Mua thành công x${quantity} ${item.name}!`, false);
    } catch (error) { const errorMessage = error instanceof Error ? error.message : String(error); console.error("Shop purchase failed:", error); triggerToast(`Mua thất bại: ${errorMessage}`, true); throw error; } finally { setIsSyncingData(false); }
  };
  
  const handleGemExchange = async (pkg: any) => {
    if (!currentUser) throw new Error("User not authenticated.");
    try {
      const { newGems, newCoins } = await processGemToCoinExchange(currentUser.uid, pkg.gems);
      updateUserCurrency({ coins: newCoins, gems: newGems });
      triggerToast('Đổi thành công!', false);
    } catch (error) { const errorMessage = error instanceof Error ? error.message : String(error); console.error("Gem exchange failed:", error); triggerToast(`Đổi thất bại: ${errorMessage}`, true); throw error; }
  };
  
  const handleSelectGemPackage = async (pkg: any) => {
    if (!currentUser) { triggerToast("Vui lòng đăng nhập để nạp Gem.", true); return; }
    triggerToast("Đang tạo giao dịch, vui lòng chờ...", true);
    try {
      const transaction = await createGemTransaction(currentUser.uid, currentUser.email, pkg);
      setActiveTransaction(transaction);
      setSelectedGemPackage(pkg);
    } catch (error) {
      console.error("Failed to create transaction:", error);
      triggerToast("Không thể tạo giao dịch. Vui lòng thử lại.", true);
    }
  };
  
  const handleConfirmPayment = async () => {
    if (!activeTransaction) { triggerToast("Không có giao dịch nào để xác nhận.", true); return; }
    try {
      await confirmUserPayment(activeTransaction.transactionId);
      triggerToast("Đã gửi yêu cầu xác nhận. Vui lòng chờ admin xử lý.", false, 5000);
      handleCloseModals();
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      triggerToast("Xác nhận thất bại. Vui lòng thử lại.", true);
    }
  };

  const handleSelectItem = (shopItem: any) => {
    const baseItem = itemDatabase.get(shopItem.id);
    const detailedItem = { ...(baseItem || {}), ...shopItem };
    setSelectedItem(detailedItem);
  };
  
  const handleSelectExchangePackage = (pkg: any) => setSelectedExchangePackage(pkg);
  
  const handleCloseModals = () => {
    setSelectedItem(null);
    setSelectedGemPackage(null);
    setSelectedExchangePackage(null);
    setActiveTransaction(null);
  };

  const value = {
    currentUser, coins, gems, isLoading: isLoadingUserData, activeCategory, setActiveCategory, allItems,
    selectedItem, selectedGemPackage, selectedExchangePackage, toastState, triggerToast,
    handlePurchaseItem, handleGemExchange, handleSelectItem, handleSelectExchangePackage, handleCloseModals,
    activeTransaction,
    handleSelectGemPackage,
    handleConfirmPayment,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (context === undefined) throw new Error('useShop must be used within a ShopProvider');
  return context;
};
// --- END OF FILE shop-context.tsx ---
