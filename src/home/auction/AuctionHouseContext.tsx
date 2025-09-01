// --- START OF FILE src/home/auction/AuctionHouseContext.tsx ---

import React, { createContext, useState, useContext, useEffect, useCallback, type ReactNode, type FC } from 'react';
import { auth } from '../../firebase.js';
import { 
    fetchActiveAuctions, 
    listAuctionItem,
    placeBidOnItem,
    processExpiredAuctions,
    type AuctionListing 
} from '../../gameDataService.ts';
import type { OwnedItem } from '../equipment/equipment-ui.tsx';
import { useGame } from '../../GameContext.tsx';

interface AuctionHouseContextType {
    isLoading: boolean;
    isProcessing: boolean;
    auctions: AuctionListing[];
    myItems: OwnedItem[];
    listAnItem: (item: OwnedItem, startPrice: number, buyoutPrice: number | null) => Promise<boolean>;
    placeBid: (auction: AuctionListing, amount: number) => Promise<boolean>;
    refreshAuctions: (showLoading?: boolean) => Promise<void>;
}

const AuctionHouseContext = createContext<AuctionHouseContextType | undefined>(undefined);

interface AuctionHouseProviderProps {
    children: ReactNode;
    onTransactionComplete: () => void;
}

export const AuctionHouseProvider: FC<AuctionHouseProviderProps> = ({ children, onTransactionComplete }) => {
    const { ownedItems, equippedItems } = useGame();

    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [auctions, setAuctions] = useState<AuctionListing[]>([]);

    const myItems = useMemo(() => 
        ownedItems.filter(item => !Object.values(equippedItems).includes(item.id)),
        [ownedItems, equippedItems]
    );

    const refreshAuctions = useCallback(async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const processedIds = await processExpiredAuctions();
            if (processedIds.length > 0) {
                onTransactionComplete();
            }

            const activeAuctions = await fetchActiveAuctions();
            setAuctions(activeAuctions);
        } catch (error) {
            console.error("Error refreshing auctions:", error);
            alert("Lỗi: Không thể tải dữ liệu nhà đấu giá.");
        } finally {
            if (showLoading) setIsLoading(false);
        }
    }, [onTransactionComplete]);

    useEffect(() => {
        refreshAuctions();
    }, [refreshAuctions]);

    const listAnItem = async (item: OwnedItem, startPrice: number, buyoutPrice: number | null): Promise<boolean> => {
        const user = auth.currentUser;
        if (!user || isProcessing) return false;
        setIsProcessing(true);
        try {
            await listAuctionItem(user.uid, user.displayName || 'Player', item, startPrice, buyoutPrice);
            alert("Đăng bán vật phẩm thành công!");
            onTransactionComplete();
            await refreshAuctions(false);
            return true;
        } catch (error: any) {
            console.error("Error listing item:", error);
            alert(`Đăng bán thất bại: ${error.message}`);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };
    
    const placeBid = async (auction: AuctionListing, amount: number): Promise<boolean> => {
        const user = auth.currentUser;
        if (!user || isProcessing) return false;
        setIsProcessing(true);
        try {
            await placeBidOnItem(user.uid, user.displayName || 'Player', auction.id, amount);
            alert("Đặt giá thành công!");
            onTransactionComplete();
            await refreshAuctions(false);
            return true;
        } catch (error: any) {
            console.error("Error placing bid:", error);
            alert(`Đặt giá thất bại: ${error.message}`);
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    const value = {
        isLoading,
        isProcessing,
        auctions,
        myItems,
        listAnItem,
        placeBid,
        refreshAuctions,
    };

    return (
        <AuctionHouseContext.Provider value={value}>
            {children}
        </AuctionHouseContext.Provider>
    );
};

export const useAuctionHouse = (): AuctionHouseContextType => {
    const context = useContext(AuctionHouseContext);
    if (context === undefined) {
        throw new Error('useAuctionHouse must be used within an AuctionHouseProvider');
    }
    return context;
};

// --- END OF FILE src/home/auction/AuctionHouseContext.tsx ---
