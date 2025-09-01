// --- START OF FILE shop-context.tsx ---

import React, { createContext, useState, useEffect, useContext, ReactNode, FC } from 'react';
import { auth } from '../../firebase.js';
import { fetchOrCreateUserGameData, processShopPurchase, processGemToCoinExchange } from './gameDataService.ts';
import { itemDatabase } from '../equipment/item-database.ts';
import type { User } from 'firebase/auth';

// --- Static Data (copied from shop.tsx for self-containment) ---
const sampleItemsNonWeapons = [ { id: 1002, name: 'Giáp Thiên Thần', type: 'Trang bị', rarity: 'S', price: 1820, image: 'https://placehold.co/600x600/1a1a2e/87ceeb?text=🛡️', description: 'Bộ giáp mang lại sự bảo vệ tối thượng và khả năng hồi phục máu theo thời gian.' }, { id: 1006, name: 'Khiên Bất Diệt', type: 'Trang bị', rarity: 'SR', price: 2000, image: 'https://placehold.co/600x600/1a1a2e/c0c0c0?text=🛡️', description: 'Một chiếc khiên không thể bị phá hủy, chặn mọi đòn tấn công từ phía trước.' }, { id: 1004, name: 'Gói Trang Phục Hắc Tinh', type: 'Trang phục', rarity: 'S', price: 2200, image: 'https://placehold.co/600x600/1a1a2e/9370db?text=✨', description: 'Thay đổi ngoại hình của bạn thành một thực thể vũ trụ bí ẩn và quyền năng.' }, { id: 1003, name: 'Ngọc Tái Sinh', type: 'Item', rarity: 'A', price: 975, image: 'https://placehold.co/600x600/1a1a2e/32cd32?text=💎', description: 'Hồi sinh ngay lập tức tại chỗ khi bị hạ gục. Chỉ có thể sử dụng một lần mỗi trận.' }, { id: 1009, name: 'Sách Cổ', type: 'Item', rarity: 'A', price: 1500, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1859_Icon%20S%C3%A1ch%20C%E1%BB%95%20Anime_simple_compose_01k0kv0rg5fhzrx8frbtsgqk33.png', description: 'Dùng để học và nâng cấp các kỹ năng đặc biệt.', stackable: true }, { id: 1007, name: 'Vé Nâng Cấp VIP', type: 'Item', rarity: 'B', price: 500, image: 'https://placehold.co/600x600/1a1a2e/f0e68c?text=🎟️', description: 'Nhận đặc quyền VIP trong 30 ngày, bao gồm tăng kinh nghiệm và vật phẩm nhận được.' }, { id: 1008, name: 'Rương Kho Báu Bí Ẩn', type: 'Rương', rarity: 'A', price: 750, image: 'https://placehold.co/600x600/1a1a2e/d2b48c?text=📦', description: 'Mở để có cơ hội nhận được một vật phẩm quý hiếm ngẫu nhiên từ danh sách phần thưởng.' }, { id: 2001, name: 'Nâng Cấp Sức Chứa Thẻ', type: 'Item', rarity: 'A', price: 100, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000006160622f8a01c95a4a8eb982.png', description: 'Tăng giới hạn số lượng thẻ từ vựng có thể sở hữu. Giá được tính trên mỗi đơn vị sức chứa.', stackable: true, quantityOptions: [50, 100, 200] }, ];

// --- Type Definitions ---
interface ToastState {
  show: boolean;
  message: string;
  showIcon: boolean;
}

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
  toastState: ToastState;
  triggerToast: (message: string, showIcon?: boolean, duration?: number) => void;
  handleLocalPurchase: (item: any, quantity: number) => Promise<void>;
  handleGemExchange: (pkg: any) => Promise<void>;
  handleSelectItem: (shopItem: any) => void;
  handleSelectGemPackage: (pkg: any) => void;
  handleSelectExchangePackage: (pkg: any) => void;
  handleCloseModals: () => void;
}

// --- Context Creation ---
const ShopContext = createContext<ShopContextType | undefined>(undefined);

// --- Provider Component ---
interface ShopProviderProps {
  children: ReactNode;
  onCurrencyUpdate: (updates: { coins?: number; gems?: number }) => void;
  getShopItemsFunction: () => any[]; // Pass the function as a prop
}

export const ShopProvider: FC<ShopProviderProps> = ({ children, onCurrencyUpdate, getShopItemsFunction }) => {
  const currentUser = auth.currentUser;
  const [coins, setCoins] = useState(0);
  const [gems, setGems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Nạp Gems');
  const [allItems, setAllItems] = useState<any[]>([]);
  
  // Modal states
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [selectedGemPackage, setSelectedGemPackage] = useState<any | null>(null);
  const [selectedExchangePackage, setSelectedExchangePackage] = useState<any | null>(null);

  // Toast state
  const [toastState, setToastState] = useState<ToastState>({
    show: false,
    message: '',
    showIcon: true,
  });

  const triggerToast = (message: string, showIcon = true, duration = 3000) => {
    setToastState({ show: true, message, showIcon });
    setTimeout(() => {
      setToastState(prevState => ({ ...prevState, show: false }));
    }, duration);
  };

  useEffect(() => {
    const fetchShopData = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const gameData = await fetchOrCreateUserGameData(currentUser.uid);
        setCoins(gameData.coins);
        setGems(gameData.gems);
        const dailyWeapons = getShopItemsFunction();
        setAllItems([...dailyWeapons, ...sampleItemsNonWeapons]);
      } catch (error) {
        console.error("Failed to fetch shop data:", error);
        triggerToast("Lỗi tải dữ liệu cửa hàng", true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShopData();
  }, [currentUser, getShopItemsFunction]);

  const handleLocalPurchase = async (item: any, quantity: number) => {
    if (!currentUser) throw new Error("User not authenticated.");
    try {
      const { newCoins } = await processShopPurchase(currentUser.uid, item, quantity);
      setCoins(newCoins);
      onCurrencyUpdate({ coins: newCoins });
      triggerToast('Mua thành công!', false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Shop purchase transaction failed:", error);
      triggerToast(`Mua thất bại: ${errorMessage}`, true);
      throw error; // Re-throw to be caught by the modal
    }
  };

  const handleGemExchange = async (pkg: any) => {
    if (!currentUser) throw new Error("User not authenticated.");
    try {
      const { newGems, newCoins } = await processGemToCoinExchange(currentUser.uid, pkg.gems);
      setGems(newGems);
      setCoins(newCoins);
      onCurrencyUpdate({ coins: newCoins, gems: newGems });
      triggerToast('Đổi thành công!', false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Gem to Coin exchange failed:", error);
      triggerToast(`Đổi thất bại: ${errorMessage}`, true);
      throw error; // Re-throw to be caught by the modal
    }
  };

  const handleSelectItem = (shopItem: any) => {
    const baseItem = itemDatabase.get(shopItem.id);
    if (!baseItem && !shopItem.stackable && ['Vũ khí'].includes(shopItem.type)) {
      console.error(`Vật phẩm với ID ${shopItem.id} không tìm thấy trong database.`);
      setSelectedItem(shopItem);
      return;
    }
    const detailedItem = { ...(baseItem || {}), ...shopItem };
    setSelectedItem(detailedItem);
  };

  const handleSelectGemPackage = (pkg: any) => setSelectedGemPackage(pkg);
  const handleSelectExchangePackage = (pkg: any) => setSelectedExchangePackage(pkg);
  
  const handleCloseModals = () => {
    setSelectedItem(null);
    setSelectedGemPackage(null);
    setSelectedExchangePackage(null);
  };

  const value = {
    currentUser,
    coins,
    gems,
    isLoading,
    activeCategory,
    setActiveCategory,
    allItems,
    selectedItem,
    selectedGemPackage,
    selectedExchangePackage,
    toastState,
    triggerToast,
    handleLocalPurchase,
    handleGemExchange,
    handleSelectItem,
    handleSelectGemPackage,
    handleSelectExchangePackage,
    handleCloseModals,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

// --- Custom Hook ---
export const useShop = (): ShopContextType => {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

// --- END OF FILE shop-context.tsx ---
