import React, { useState, useEffect, useMemo, FC, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { 
    listenToActiveAuctions, listenToUserAuctions, listAuctionItem, placeBidOnAuction, 
    claimAuctionWin, reclaimExpiredAuction, AuctionItem, fetchOrCreateUserGameData,
} from '../../gameDataService.ts'; // Thêm fetchOrCreateUserGameData
import type { OwnedItem, EquippedItems } from '../equipment/equipment-ui.tsx';
import { getItemDefinition, ItemRank, RARITY_ORDER } from '../equipment/item-database.ts';
import { uiAssets } from '../../game-assets.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import GemDisplay from '../../ui/display/gem-display.tsx';
import HomeButton from '../../ui/home-button.tsx';

// --- Helper Functions & Components ---
const getRarityColor = (rank: ItemRank): string => {
    const colors: Record<ItemRank, string> = { SSR: 'border-red-500', SR: 'border-orange-400', S: 'border-yellow-400', A: 'border-purple-500', B: 'border-blue-500', D: 'border-green-500', E: 'border-gray-500' };
    return colors[rank] || 'border-gray-600';
};
const getRarityTextColor = (rank: ItemRank): string => {
    const colors: Record<ItemRank, string> = { SSR: 'text-red-500', SR: 'text-orange-400', S: 'text-yellow-400', A: 'text-purple-400', B: 'text-blue-400', D: 'text-green-400', E: 'text-gray-400' };
    return colors[rank] || 'text-gray-500';
};

const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const CoinIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.coinIcon} alt="Vàng" className={className} /> );
const GemIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.gemIcon} alt="Gem" className={className} /> );

// --- START: HELPERS SAO CHÉP TỪ SHOP-UI ĐỂ HIỂN THỊ TIỀN TỆ ---
const useAnimateValue = (endValue: number, duration: number = 500) => {
    const [currentValue, setCurrentValue] = useState(0);
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);

    useEffect(() => {
        let frame = 0;
        const startValue = currentValue;
        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            const nextValue = Math.round(startValue + (endValue - startValue) * progress);

            if (frame >= totalFrames) {
                clearInterval(counter);
                setCurrentValue(endValue);
            } else {
                setCurrentValue(nextValue);
            }
        }, frameRate);

        return () => clearInterval(counter);
    }, [endValue, duration]); // Chỉ chạy lại khi endValue hoặc duration thay đổi

    return currentValue;
};
// --- END: HELPERS SAO CHÉP TỪ SHOP-UI ---

const useCountdown = (endTime: Timestamp | undefined) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!endTime) return;
        const interval = setInterval(() => {
            const diff = endTime.toMillis() - Date.now();
            if (diff <= 0) { setTimeLeft('Đã kết thúc'); clearInterval(interval); return; }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);

            if (d > 0) setTimeLeft(`${d}d ${h}h`);
            else if (h > 0) setTimeLeft(`${h}h ${m}m`); 
            else if (m > 0) setTimeLeft(`${m}m ${s}s`); 
            else setTimeLeft(`${s}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [endTime]);
    return timeLeft;
};

// --- Các component con (AuctionCard, CreateAuctionView) giữ nguyên, không thay đổi ---
const AuctionCard: FC<{ auction: AuctionItem; userId: string; onBid: (a: AuctionItem) => void; onClaim: (a: AuctionItem) => void; onReclaim: (a: AuctionItem) => void; }> = ({ auction, userId, onBid, onClaim, onReclaim }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    const timeLeft = useCountdown(auction.endTime);
    const isEnded = timeLeft === 'Đã kết thúc';

    const renderAction = () => {
        if (auction.status !== 'active') {
            if(auction.status === 'claimed') return <span className="text-center block text-green-400 font-bold">Đã nhận</span>;
            if(auction.status === 'sold') return <span className="text-center block text-yellow-400 font-bold">Đã bán</span>;
            return <span className="text-center block text-gray-400 font-bold">Đã hết hạn</span>;
        }
        if (isEnded) {
            if (auction.highestBidderId === userId) return <button onClick={() => onClaim(auction)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-2 rounded-md text-sm transition-colors">Nhận</button>;
            if (auction.sellerId === userId && !auction.highestBidderId) return <button onClick={() => onReclaim(auction)} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1.5 px-2 rounded-md text-sm transition-colors">Lấy Lại</button>;
            return <span className="text-center block text-gray-400">Đã kết thúc</span>;
        }
        if (auction.sellerId !== userId) return <button onClick={() => onBid(auction)} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 px-2 rounded-md text-sm transition-colors">Đấu Giá</button>;
        return <span className="text-center block text-gray-400 italic">Vật phẩm của bạn</span>;
    };

    if (!itemDef) return <div className="text-red-500 bg-slate-800/60 rounded-lg p-3">Lỗi vật phẩm không xác định</div>;

    return (
        <div className={`bg-slate-800/60 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} p-3 flex flex-col gap-2 transition-shadow hover:shadow-lg hover:shadow-cyan-500/10`}>
            <div className="flex items-center gap-3">
                <div className={`w-16 h-16 flex-shrink-0 bg-black/30 rounded-md border ${getRarityColor(itemDef.rarity)} flex items-center justify-center p-1`}>
                    <img src={itemDef.icon} alt={itemDef.name} className="w-full h-full object-contain" />
                </div>
                <div>
                    <p className={`font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name} <span className="text-white">Lv.{auction.item.level}</span></p>
                    <p className="text-xs text-slate-400">Người bán: {auction.sellerId === userId ? "Bạn" : auction.sellerName}</p>
                </div>
            </div>
            <div className="text-sm bg-black/20 rounded-md p-2 space-y-1 text-xs">
                <div className="flex justify-between items-center"><span className="text-slate-300">Giá hiện tại:</span><span className="font-bold text-yellow-400 flex items-center gap-1"><CoinIcon className="w-4 h-4" />{auction.currentBid.toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300">Người giữ giá:</span><span className="font-bold text-cyan-300">{auction.highestBidderId === userId ? "Bạn" : (auction.highestBidderName || 'Chưa có')}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-300">Thời gian:</span><span className={`font-bold ${isEnded ? 'text-red-500' : 'text-green-400'}`}>{timeLeft}</span></div>
            </div>
            <div className="mt-auto pt-2">{renderAction()}</div>
        </div>
    );
};
const CreateAuctionView: FC<{ ownedItems: OwnedItem[]; equippedItems: EquippedItems; onList: (item: OwnedItem, price: number, duration: number) => void; }> = ({ ownedItems, equippedItems, onList }) => {
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState(12);

    const unequippedItems = useMemo(() => {
        const equippedIds = Object.values(equippedItems).filter(Boolean);
        return ownedItems
            .filter(item => !equippedIds.includes(item.id))
            .sort((a, b) => {
                const itemDefA = getItemDefinition(a.itemId); const itemDefB = getItemDefinition(b.itemId);
                return (RARITY_ORDER.indexOf(itemDefB?.rarity || 'E') - RARITY_ORDER.indexOf(itemDefA?.rarity || 'E')) || (b.level - a.level);
            });
    }, [ownedItems, equippedItems]);

    const handleListClick = () => {
        if (selectedItem && price && Number(price) > 0) {
            onList(selectedItem, Number(price), duration);
            setSelectedItem(null);
            setPrice('');
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <div className="bg-black/20 rounded-lg p-4 flex flex-col">
                <h3 className="text-lg font-bold text-cyan-300 mb-3">Chọn vật phẩm để bán</h3>
                <div className="flex-grow overflow-y-auto pr-2">
                    {unequippedItems.length > 0 ? (
                        <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                            {unequippedItems.map(item => {
                                const itemDef = getItemDefinition(item.itemId);
                                return itemDef ? (
                                    <div key={item.id} onClick={() => setSelectedItem(item)} className={`relative aspect-square rounded-lg border-2 bg-slate-900/50 flex items-center justify-center cursor-pointer transition-all ${selectedItem?.id === item.id ? `scale-110 shadow-lg ${getRarityColor(itemDef.rarity).replace('border-','shadow-')}` : 'hover:scale-105'} ${getRarityColor(itemDef.rarity)}`}>
                                        <img src={itemDef.icon} alt={itemDef.name} className="w-3/4 h-3/4 object-contain" />
                                        <span className="absolute top-0.5 right-0.5 text-[10px] bg-black/70 px-1 rounded-sm font-bold">Lv.{item.level}</span>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-500">
                            <p>Không có vật phẩm nào để bán.</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4 flex flex-col justify-center items-center gap-4">
                {selectedItem ? (
                    <>
                        <h3 className="text-lg font-bold text-cyan-300">Thiết lập đấu giá</h3>
                        <div className={`w-24 h-24 bg-slate-800 rounded-lg border-2 ${getRarityColor(getItemDefinition(selectedItem.itemId)!.rarity)} flex items-center justify-center p-2`}>
                             <img src={getItemDefinition(selectedItem.itemId)!.icon} className="w-full h-full object-contain"/>
                        </div>
                        <p className="font-bold text-lg">{getItemDefinition(selectedItem.itemId)!.name} <span className="text-base font-normal">Lv.{selectedItem.level}</span></p>
                        
                        <div className="w-full max-w-xs space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Giá khởi điểm (Vàng)</label>
                                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400" placeholder="e.g., 1000" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Thời gian (Giờ)</label>
                                <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-white">
                                    <option value={6}>6 Giờ</option><option value={12}>12 Giờ</option><option value={24}>24 Giờ</option>
                                </select>
                            </div>
                        </div>
                        <div className="text-center mt-4">
                            <button onClick={handleListClick} disabled={!price || Number(price) <= 0} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                                Đăng Bán
                            </button>
                            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">Phí đăng: 1 <GemIcon className="w-3 h-3" /></p>
                        </div>
                    </>
                ) : <p className="text-slate-400">Vui lòng chọn một vật phẩm từ kho.</p>}
            </div>
        </div>
    );
};


// --- START: AUCTION HEADER COMPONENT MỚI ---
interface AuctionHeaderProps {
    onClose: () => void;
    userCoins: number;
    userGems: number;
    activeTab: 'browse' | 'my_auctions' | 'create';
    setActiveTab: (tab: 'browse' | 'my_auctions' | 'create') => void;
}

const AuctionHeader: FC<AuctionHeaderProps> = ({ onClose, userCoins, userGems, activeTab, setActiveTab }) => {
    const animatedCoins = useAnimateValue(userCoins);
    const animatedGems = useAnimateValue(userGems);

    const TabButton: FC<{tabId: typeof activeTab, text: string}> = ({ tabId, text }) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-bold transition-colors relative rounded-md ${activeTab === tabId ? 'text-cyan-300 bg-white/10' : 'text-slate-400 hover:text-white'}`}>
            {text}
        </button>
    );

    return (
        <header className="flex-shrink-0 bg-slate-900 border-b border-white/10 shadow-lg z-10">
            <div className="max-w-[1700px] mx-auto flex items-center justify-between h-[60px] px-4">
                <div className="flex items-center gap-4">
                    <HomeButton onClick={onClose} label="" title="Về trang chính" />
                    <div className="hidden md:flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg">
                        <TabButton tabId="browse" text="Sàn Đấu Giá"/>
                        <TabButton tabId="my_auctions" text="Đấu Giá Của Tôi"/>
                        <TabButton tabId="create" text="Đăng Bán"/>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <GemDisplay displayedGems={animatedGems} />
                    <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} />
                </div>
            </div>
             {/* Tab bar cho màn hình nhỏ */}
             <div className="md:hidden flex justify-center p-2 border-t border-slate-800 bg-black/20">
                 <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg">
                    <TabButton tabId="browse" text="Sàn"/>
                    <TabButton tabId="my_auctions" text="Của Tôi"/>
                    <TabButton tabId="create" text="Bán"/>
                </div>
            </div>
        </header>
    );
};
// --- END: AUCTION HEADER COMPONENT MỚI ---

interface AuctionHouseProps {
    userId: string; userName: string;
    ownedItems: OwnedItem[]; equippedItems: EquippedItems;
    onClose: () => void; onAuctionAction: () => void;
}

export default function AuctionHouse({ userId, userName, ownedItems, equippedItems, onClose, onAuctionAction }: AuctionHouseProps) {
    const [activeTab, setActiveTab] = useState<'browse' | 'my_auctions' | 'create'>('browse');
    const [activeAuctions, setActiveAuctions] = useState<AuctionItem[]>([]);
    const [userAuctions, setUserAuctions] = useState<AuctionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
    // State mới để lưu trữ tiền tệ
    const [coins, setCoins] = useState(0);
    const [gems, setGems] = useState(0);
    
    // Hàm mới để làm mới dữ liệu người dùng
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
    
    // Lấy dữ liệu ban đầu
    useEffect(() => {
        refreshUserData();
        const unsubActive = listenToActiveAuctions(setActiveAuctions);
        const unsubUser = listenToUserAuctions(userId, setUserAuctions);
        return () => { unsubActive(); unsubUser(); };
    }, [userId]);
    
    useEffect(() => {
        if(message) {
            const timer = setTimeout(() => setMessage(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        setIsLoading(true); setMessage(null);
        try {
            await action();
            setMessage({type: 'success', text: successMsg});
            onAuctionAction(); // Refresh parent state
            await refreshUserData(); // Cập nhật lại Vàng/Gem sau khi hành động thành công
        } catch (e: any) { setMessage({type: 'error', text: e.message || 'Có lỗi xảy ra.'});
        } finally { setIsLoading(false); }
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

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
            {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[101]"><div className="text-white text-xl animate-pulse">Đang xử lý...</div></div>}
            
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-[#110f21] flex flex-col">
                <AuctionHeader 
                    onClose={onClose}
                    userCoins={coins}
                    userGems={gems}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                
                <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 relative">
                    {message && <div className={`absolute top-4 left-1/2 -translate-x-1/2 p-3 rounded-lg text-white font-bold text-sm shadow-lg z-50 animate-pulse ${message.type === 'error' ? 'bg-red-600/90' : 'bg-green-600/90'}`}>{message.text}</div>}
                    
                    {activeTab === 'browse' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {activeAuctions.length > 0 ? activeAuctions.map(auction => (
                                <AuctionCard key={auction.id} auction={auction} userId={userId} 
                                    onBid={handleBid}
                                    onClaim={a => handleAction(() => claimAuctionWin(userId, a.id), "Nhận vật phẩm thành công!")}
                                    onReclaim={a => handleAction(() => reclaimExpiredAuction(userId, a.id), "Nhận lại vật phẩm thành công!")} />
                            )) : <p className="text-slate-500 col-span-full text-center mt-10">Sàn đấu giá hiện đang trống.</p>}
                        </div>
                    )}
                    {activeTab === 'my_auctions' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {userAuctions.length > 0 ? userAuctions.map(auction => (
                                <AuctionCard key={auction.id} auction={auction} userId={userId} 
                                    onBid={handleBid}
                                    onClaim={a => handleAction(() => claimAuctionWin(userId, a.id), "Nhận vật phẩm thành công!")}
                                    onReclaim={a => handleAction(() => reclaimExpiredAuction(userId, a.id), "Nhận lại vật phẩm thành công!")} />
                            )) : <p className="text-slate-500 col-span-full text-center mt-10">Bạn chưa có hoạt động đấu giá nào.</p>}
                        </div>
                    )}
                     {activeTab === 'create' && (
                        <CreateAuctionView 
                           ownedItems={ownedItems}
                           equippedItems={equippedItems}
                           onList={(item, price, duration) => handleAction(() => listAuctionItem(userId, userName, item, price, null, duration), "Đăng bán thành công!")}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
