// --- START OF FILE src/home/auction/AuctionHouseUI.tsx ---

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useGame } from '../../GameContext.tsx';
import { auth } from '../../firebase.js';
import { OwnedItem } from '../equipment/equipment-ui.tsx';
import { getItemDefinition, ItemRank } from '../item-database.ts';
import {
    Auction,
    fetchActiveAuctions,
    fetchUserRelatedAuctions,
    createAuction,
    placeBidOnAuction,
    claimAuctionResult
} from '../../gameDataService.ts';
import { uiAssets } from '../../game-assets.ts';

// --- Helper Functions & Icons ---

const getRarityColor = (rank: ItemRank): string => ({
    'SSR': 'border-red-500 text-red-400', 'SR': 'border-orange-400 text-orange-300', 'S': 'border-yellow-400 text-yellow-300',
    'A': 'border-purple-500 text-purple-400', 'B': 'border-blue-500 text-blue-400', 'D': 'border-green-500 text-green-400',
    'E': 'border-gray-500 text-gray-400'
}[rank] || 'border-gray-600 text-gray-500');

const CloseIcon = () => <img src={uiAssets.closeIcon} alt="Đóng" className="w-5 h-5" />;
const GoldIcon = () => <img src={uiAssets.goldIcon} alt="Vàng" className="w-5 h-5" />;
const GemIcon = () => <img src={uiAssets.gemIcon} alt="Gem" className="w-5 h-5" />;
const GavelIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M22.29 10.84 13.2 1.75a2.5 2.5 0 0 0-3.54 0L7.56 3.84 9.66 6l.71-.71a1 1 0 0 1 1.41 0l4.24 4.24a1 1 0 0 1 0 1.41l-.7.71 2.12 2.12 2.83-2.83a2.5 2.5 0 0 0 0-3.54ZM8.25 5.25 1.71 11.79a2.5 2.5 0 0 0 0 3.54l2.83 2.83a2.5 2.5 0 0 0 3.54 0L14.53 11.7l-2.12-2.12-3.45 3.45a.5.5 0 0 1-.71 0l-1.41-1.41a.5.5 0 0 1 0-.71l3.45-3.45-2.12-2.12-1.41 1.41ZM2 21h12v1H2z"/></svg>
);


const CountdownTimer = memo(({ endTime }: { endTime: Date }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +endTime - +new Date();
            if (difference > 0) {
                const hours = Math.floor(difference / (1000 * 60 * 60));
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            return 'Đã kết thúc';
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    return <span className="text-sm font-mono text-cyan-300">{timeLeft}</span>;
});


const AuctionItemCard = memo(({ auction, currentUserId, onBid, onClaim }: { auction: Auction, currentUserId: string, onBid: (auctionId: string, currentBid: number) => void, onClaim: (auctionId: string) => void }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    if (!itemDef) return null;
    
    const rarityClasses = getRarityColor(itemDef.rarity);
    const isOwner = auction.sellerId === currentUserId;
    const isHighestBidder = auction.highestBidderId === currentUserId;
    const isEnded = auction.endTime.toDate() < new Date();

    const getAction = () => {
        if (isEnded) {
            if (auction.status === 'claimed') return <button disabled className="btn-disabled w-full">Đã Nhận</button>;
            if (isOwner && auction.bidCount === 0) return <button onClick={() => onClaim(auction.id)} className="btn-primary w-full">Nhận Lại</button>;
            if (isOwner && auction.bidCount > 0) return <button onClick={() => onClaim(auction.id)} className="btn-success w-full">Nhận Vàng</button>;
            if (isHighestBidder && auction.bidCount > 0) return <button onClick={() => onClaim(auction.id)} className="btn-primary w-full">Nhận Vật Phẩm</button>;
            return <button disabled className="btn-disabled w-full">Đã Kết Thúc</button>;
        }

        if (isOwner) return <button disabled className="btn-disabled w-full">Vật Phẩm Của Bạn</button>;
        if (isHighestBidder) return <button disabled className="btn-success w-full">Bạn Đang Giữ Giá</button>;
        return <button onClick={() => onBid(auction.id, auction.currentBid)} className="btn-primary w-full">Đấu Giá</button>;
    }

    return (
        <div className={`bg-slate-800/50 border ${rarityClasses.split(' ')[0]} rounded-lg p-3 flex flex-col gap-2 transition-all hover:bg-slate-800`}>
            <div className="flex items-center gap-3">
                <div className={`w-16 h-16 flex-shrink-0 bg-black/30 rounded-md border ${rarityClasses.split(' ')[0]} flex items-center justify-center`}>
                    <img src={itemDef.icon} alt={itemDef.name} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base truncate ${rarityClasses.split(' ')[1]}`}>{itemDef.name} <span className="text-white font-semibold">Lv.{auction.item.level}</span></p>
                    <p className="text-xs text-slate-400 truncate">Người bán: {auction.sellerName}</p>
                </div>
            </div>
            <div className="bg-black/20 p-2 rounded-md text-xs space-y-1">
                <div className="flex justify-between">
                    <span className="text-slate-400">Thời gian còn lại:</span>
                    <CountdownTimer endTime={auction.endTime.toDate()} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Giá hiện tại:</span>
                    <div className="flex items-center gap-1 font-bold text-yellow-300">
                        <GoldIcon /> {auction.currentBid.toLocaleString()}
                    </div>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Người giữ giá:</span>
                    <span className="font-semibold text-white truncate max-w-[120px]">{auction.highestBidderName || 'Chưa có'}</span>
                </div>
            </div>
            <div className="mt-auto pt-2">
                {getAction()}
            </div>
        </div>
    );
});


const ListItemModal = memo(({ unequippedItems, onClose, onListItem }: { unequippedItems: OwnedItem[], onClose: () => void, onListItem: (item: OwnedItem, price: number) => void }) => {
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [price, setPrice] = useState('');

    const handleConfirm = () => {
        const numPrice = parseInt(price, 10);
        if (selectedItem && !isNaN(numPrice) && numPrice > 0) {
            onListItem(selectedItem, numPrice);
        } else {
            alert('Vui lòng chọn vật phẩm và nhập giá hợp lệ.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col p-5">
                <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-cyan-300">Đăng Bán Vật Phẩm</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700"><CloseIcon /></button>
                </div>
                <p className="text-sm text-slate-400 py-3">Chọn một vật phẩm từ kho của bạn để đăng bán. Phí đăng bán là 1 Gem và sẽ được hoàn lại nếu không có ai đấu giá sau 24 giờ.</p>
                
                <div className="flex-1 min-h-0 overflow-y-auto my-4 pr-2 space-y-2">
                    {unequippedItems.length > 0 ? unequippedItems.map(item => {
                        const itemDef = getItemDefinition(item.itemId);
                        if (!itemDef) return null;
                        const isSelected = selectedItem?.id === item.id;
                        return (
                            <div key={item.id} onClick={() => setSelectedItem(item)}
                                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all border-2 ${isSelected ? 'bg-cyan-900/50 border-cyan-500' : 'bg-slate-800 border-transparent hover:border-slate-600'}`}>
                                <div className={`w-14 h-14 flex-shrink-0 bg-black/30 rounded-md border ${getRarityColor(itemDef.rarity).split(' ')[0]} flex items-center justify-center`}>
                                    <img src={itemDef.icon} alt={itemDef.name} className="w-10 h-10 object-contain" />
                                </div>
                                <div>
                                    <p className={`font-bold ${getRarityColor(itemDef.rarity).split(' ')[1]}`}>{itemDef.name}</p>
                                    <p className="text-xs text-slate-300">Level: {item.level}</p>
                                </div>
                            </div>
                        )
                    }) : <p className="text-slate-500 text-center py-8">Không có vật phẩm nào để bán.</p>}
                </div>
                
                <div className="pt-4 border-t border-slate-700 flex items-center gap-4">
                    <div className="relative flex-1">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2"><GoldIcon /></span>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Giá khởi điểm"
                            className="w-full bg-slate-800 border border-slate-600 rounded-md pl-8 pr-3 py-2 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none" />
                    </div>
                    <button onClick={handleConfirm} disabled={!selectedItem || !price} className="btn-primary flex items-center gap-2 px-6">
                        <GemIcon /> Đăng Bán
                    </button>
                </div>
            </div>
        </div>
    );
});


// --- Main Component ---

interface AuctionHouseUIProps {
    onClose: () => void;
    userId: string;
}

export default function AuctionHouseUI({ onClose, userId }: AuctionHouseUIProps) {
    const { ownedItems, refreshUserData, equippedItems } = useGame();
    const user = auth.currentUser;
    const [activeTab, setActiveTab] = useState<'all' | 'selling' | 'bidding'>('all');
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [userAuctions, setUserAuctions] = useState<{ selling: Auction[], bidding: Auction[] }>({ selling: [], bidding: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    const unequippedItems = useMemo(() => {
        const equippedIds = new Set(Object.values(equippedItems));
        return ownedItems.filter(item => !equippedIds.has(item.id));
    }, [ownedItems, equippedItems]);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'all') {
                const data = await fetchActiveAuctions();
                setAuctions(data);
            } else {
                const data = await fetchUserRelatedAuctions(userId);
                setUserAuctions(data);
            }
        } catch (error) {
            console.error("Lỗi tải dữ liệu đấu giá:", error);
            alert(`Lỗi: ${error instanceof Error ? error.message : "Không thể tải dữ liệu."}`);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleBid = (auctionId: string, currentBid: number) => {
        const bidAmountStr = prompt(`Giá hiện tại là ${currentBid.toLocaleString()}. Nhập giá bạn muốn đặt:`, `${Math.floor(currentBid * 1.1)}`);
        if (bidAmountStr) {
            const bidAmount = parseInt(bidAmountStr, 10);
            if (!isNaN(bidAmount) && bidAmount > 0) {
                performAction(async () => {
                    await placeBidOnAuction(userId, user?.displayName || 'Anonymous', auctionId, bidAmount);
                    alert('Đặt giá thành công!');
                    await refreshUserData(); // Cập nhật lại tiền
                    fetchData(); // Tải lại danh sách
                });
            }
        }
    };

    const handleClaim = (auctionId: string) => {
        performAction(async () => {
            const message = await claimAuctionResult(userId, auctionId);
            alert(message);
            await refreshUserData(); // Cập nhật lại tiền, gem, vật phẩm
            fetchData();
        });
    };


    const handleListItem = (item: OwnedItem, price: number) => {
        performAction(async () => {
            await createAuction(userId, user?.displayName || 'Anonymous', item, price);
            alert('Đăng bán vật phẩm thành công!');
            setIsListModalOpen(false);
            await refreshUserData();
            fetchData();
        });
    };
    
    const performAction = async (action: () => Promise<void>) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await action();
        } catch (error) {
            console.error("Lỗi thực hiện hành động:", error);
            alert(`Thất bại: ${error instanceof Error ? error.message : "Có lỗi xảy ra."}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const renderContent = () => {
        if (isLoading) return <div className="text-center py-10 text-slate-400 animate-pulse">Đang tải danh sách...</div>;

        let dataToShow: Auction[] = [];
        if (activeTab === 'all') dataToShow = auctions;
        else if (activeTab === 'selling') dataToShow = userAuctions.selling;
        else if (activeTab === 'bidding') dataToShow = userAuctions.bidding;

        if (dataToShow.length === 0) return <div className="text-center py-10 text-slate-500">Không có vật phẩm nào.</div>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {dataToShow.map(auction => (
                    <AuctionItemCard key={auction.id} auction={auction} currentUserId={userId} onBid={handleBid} onClaim={handleClaim} />
                ))}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center font-sans text-white">
            {isProcessing && <div className="absolute inset-0 bg-black/70 z-[60] flex items-center justify-center"><div className="loader"></div></div>}
            {isListModalOpen && <ListItemModal unequippedItems={unequippedItems} onClose={() => setIsListModalOpen(false)} onListItem={handleListItem} />}

            <div className="bg-gradient-to-br from-[#110f21] to-[#2c0f52] w-full h-full max-w-6xl max-h-[95vh] rounded-xl border-2 border-slate-700 shadow-2xl flex flex-col">
                <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <GavelIcon className="w-8 h-8 text-cyan-300" />
                        <h1 className="text-2xl font-bold tracking-wider text-cyan-300 title-glow">Nhà Đấu Giá</h1>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors"><CloseIcon /></button>
                </header>

                <div className="flex-shrink-0 p-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 border border-slate-700 rounded-lg p-1">
                        <button onClick={() => setActiveTab('all')} className={`tab-btn ${activeTab === 'all' && 'active'}`}>Tất Cả</button>
                        <button onClick={() => setActiveTab('selling')} className={`tab-btn ${activeTab === 'selling' && 'active'}`}>Đang Bán</button>
                        <button onClick={() => setActiveTab('bidding')} className={`tab-btn ${activeTab === 'bidding' && 'active'}`}>Đang Đấu Giá</button>
                    </div>
                    <button onClick={() => setIsListModalOpen(true)} className="btn-primary flex items-center gap-2">
                        <GavelIcon className="w-4 h-4" /> Đăng Bán
                    </button>
                </div>

                <main className="flex-1 min-h-0 overflow-y-auto p-4 hide-scrollbar">
                    {renderContent()}
                </main>
            </div>
            <style>{`
                .title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                .tab-btn { padding: 6px 16px; font-semibold; border-radius: 6px; transition: all 0.2s; }
                .tab-btn.active { background-color: #0e7490; color: white; }
                .tab-btn:not(.active) { color: #94a3b8; }
                .tab-btn:not(.active):hover { background-color: #334155; }
                .btn-primary { background: linear-gradient(to right, #06b6d4, #3b82f6); color: white; padding: 10px 16px; border-radius: 8px; font-bold; transition: all 0.2s; transform: scale(1); }
                .btn-primary:hover { transform: scale(1.05); box-shadow: 0 0 15px #06b6d480; }
                .btn-primary:disabled { background: #475569; color: #94a3b8; cursor: not-allowed; transform: scale(1); box-shadow: none; }
                .btn-success { background: linear-gradient(to right, #16a34a, #10b981); color: white; padding: 10px 16px; border-radius: 8px; font-bold; }
                .btn-disabled { background: #475569; color: #94a3b8; cursor: not-allowed; padding: 10px 16px; border-radius: 8px; font-bold; }
                .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}

// --- END OF FILE src/home/auction/AuctionHouseUI.tsx ---
