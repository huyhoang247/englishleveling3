// --- START OF FILE auction-house-context.tsx ---

import React, { useState, useEffect, useMemo, createContext, useContext, FC, ReactNode } from 'react';
import {
    listenToActiveAuctions, listenToUserAuctions, listAuctionItem, placeBidOnAuction,
    claimAuctionWin, reclaimExpiredAuction, AuctionItem, fetchOrCreateUserGameData,
} from '../../gameDataService.ts';
import type { OwnedItem, EquippedItems } from '../equipment/equipment-ui.tsx';

// --- 1. DEFINE THE CONTEXT TYPE ---
interface AuctionHouseContextType {
    userId: string;
    userName: string;
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
    onClose: () => void;
    activeTab: 'browse' | 'my_auctions' | 'create';
    setActiveTab: (tab: 'browse' | 'my_auctions' | 'create') => void;
    activeAuctions: AuctionItem[];
    userAuctions: AuctionItem[];
    isLoading: boolean;
    message: { type: 'error' | 'success', text: string } | null;
    coins: number;
    gems: number;
    selectedAuction: AuctionItem | null;
    setSelectedAuction: (auction: AuctionItem | null) => void;
    handleAction: (action: () => Promise<any>, successMsg: string) => Promise<void>;
    handleBid: (auction: AuctionItem) => void;
}

// --- 2. CREATE THE CONTEXT ---
const AuctionHouseContext = createContext<AuctionHouseContextType | null>(null);

// --- 3. CREATE THE CUSTOM HOOK for easy access ---
export const useAuctionHouse = () => {
    const context = useContext(AuctionHouseContext);
    if (!context) {
        throw new Error('useAuctionHouse must be used within an AuctionHouseProvider');
    }
    return context;
};

// --- 4. CREATE THE PROVIDER COMPONENT ---
interface AuctionHouseProviderProps {
    children: ReactNode;
    userId: string;
    userName: string;
    ownedItems: OwnedItem[];
    equippedItems: EquippedItems;
    onClose: () => void;
    onAuctionAction: () => void;
}

export const AuctionHouseProvider: FC<AuctionHouseProviderProps> = ({
    children, userId, userName, ownedItems, equippedItems, onClose, onAuctionAction
}) => {
    const [activeTab, setActiveTab] = useState<'browse' | 'my_auctions' | 'create'>('browse');
    const [activeAuctions, setActiveAuctions] = useState<AuctionItem[]>([]);
    const [userAuctions, setUserAuctions] = useState<AuctionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [coins, setCoins] = useState(0);
    const [gems, setGems] = useState(0);
    const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);

    const refreshUserData = async () => {
        try {
            const data = await fetchOrCreateUserGameData(userId);
            setCoins(data.coins);
            setGems(data.gems);
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            setMessage({ type: 'error', text: 'Lỗi cập nhật dữ liệu người dùng.' });
        }
    };

    useEffect(() => {
        refreshUserData();
        const unsubActive = listenToActiveAuctions(setActiveAuctions);
        const unsubUser = listenToUserAuctions(userId, setUserAuctions);
        return () => {
            unsubActive();
            unsubUser();
        };
    }, [userId]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        setIsLoading(true);
        setMessage(null);
        try {
            await action();
            setMessage({ type: 'success', text: successMsg });
            onAuctionAction();
            await refreshUserData();
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message || 'Có lỗi xảy ra.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleBid = (auction: AuctionItem) => {
        const bidAmountStr = prompt(`Giá hiện tại: ${auction.currentBid.toLocaleString()}. Nhập giá của bạn:`);
        if (bidAmountStr) {
            const bidAmount = parseInt(bidAmountStr, 10);
            if (!isNaN(bidAmount) && bidAmount > 0) {
                handleAction(() => placeBidOnAuction(userId, userName, auction.id, bidAmount), "Đặt giá thành công!");
            } else {
                setMessage({ type: 'error', text: 'Giá đặt không hợp lệ.' });
            }
        }
    };

    const contextValue = useMemo(() => ({
        userId, userName, ownedItems, equippedItems, onClose,
        activeTab, setActiveTab,
        activeAuctions, userAuctions,
        isLoading, message,
        coins, gems,
        selectedAuction, setSelectedAuction,
        handleAction, handleBid
    }), [
        userId, userName, ownedItems, equippedItems, onClose,
        activeTab, activeAuctions, userAuctions, isLoading, message, coins, gems, selectedAuction
    ]);

    return (
        <AuctionHouseContext.Provider value={contextValue}>
            {children}
        </AuctionHouseContext.Provider>
    );
};

// --- END OF FILE auction-house-context.tsx ---
