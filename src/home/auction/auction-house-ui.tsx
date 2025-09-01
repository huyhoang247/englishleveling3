// --- START OF FILE src/home/auction/auction-house-ui.tsx ---

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useAnimateValue } from '../../ui/useAnimateValue';
import { uiAssets, equipmentUiAssets } from '../../game-assets';
import CoinDisplay from '../../ui/display/coin-display';
import GemDisplay from '../../ui/display/gem-display';
import { OwnedItem, getRarityColor, getRarityTextColor, getRarityGradient } from '../equipment/equipment-ui';
import { getItemDefinition, ItemDefinition } from '../equipment/item-database';
import { createAuctionListing, placeBidOnAuction, claimAuctionResult } from '../../gameDataService';
import { User } from 'firebase/auth';

// --- Interfaces (Cần khớp với gameDataService) ---
export interface Auction {
    id: string;
    sellerId: string;
    sellerName: string;
    item: OwnedItem;
    startingBid: number;
    currentBid: number;
    highestBidderId?: string | null;
    highestBidderName?: string | null;
    expiresAt: { seconds: number; nanoseconds: number; };
    status: 'active' | 'completed' | 'expired' | 'claimed';
}
export interface AuctionHouseExitData {
    gold: number;
    gems: number;
    ownedItems: OwnedItem[];
}

// --- Icons & Utilities ---
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <img src={equipmentUiAssets.goldIcon} alt="Vàng" className={className} /> );
const GemIcon = () => <img src={uiAssets.gemIcon} alt="Gem" className="w-5 h-5" />;
const GavelIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M22.29 11.2l-9.53-9.53a1 1 0 00-1.41 0l-2 2a1 1 0 000 1.41l5.33 5.33-8.39 8.39a1 1 0 000 1.41l2.12 2.12a1 1 0 001.41 0l8.39-8.39 5.33 5.33a1 1 0 001.41 0l2-2a1 1 0 000-1.41zM5.21 15.34l-1.41 1.41L2.38 18.17a2.5 2.5 0 003.54 3.54l1.41-1.41-2.12-2.12z"/> </svg>);

const formatTimeLeft = (expiresAtSeconds: number) => {
    const now = Date.now() / 1000;
    const secondsLeft = expiresAtSeconds - now;
    if (secondsLeft <= 0) return "Đã kết thúc";
    const d = Math.floor(secondsLeft / 86400);
    const h = Math.floor((secondsLeft % 86400) / 3600);
    const m = Math.floor((secondsLeft % 3600) / 60);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${Math.floor(secondsLeft)}s`;
};

// --- Sub-components ---
const Header = memo(({ gold, gems, onClose }: { gold: number; gems: number; onClose: () => void }) => {
    const animatedGold = useAnimateValue(gold);
    return ( <header className="flex-shrink-0 w-full bg-black/30 border-b-2 border-slate-800/50 backdrop-blur-sm p-4 flex justify-between items-center"> <div className="flex items-center gap-3"> <GavelIcon className="w-8 h-8 text-yellow-400" /> <h1 className="text-2xl font-bold text-yellow-300 tracking-wider">Sàn Đấu Giá</h1> </div> <div className="flex items-center gap-4"> <GemDisplay displayedGems={gems} /> <CoinDisplay displayedCoins={animatedGold} isStatsFullscreen={false} /> <button onClick={onClose} className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors" aria-label="Đóng"> <CloseIcon className="w-5 h-5" /> </button> </div> </header> );
});

const AuctionItemCard = memo(({ auction, onSelect, onClaim, userId, isProcessing }: { auction: Auction; onSelect: (auc: Auction) => void; onClaim: (auc: Auction) => void; userId: string; isProcessing: boolean }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(auction.expiresAt.seconds));
    const isExpired = useMemo(() => (auction.expiresAt.seconds * 1000) < Date.now(), [auction.expiresAt.seconds]);
    
    useEffect(() => {
        if (isExpired) { setTimeLeft("Đã kết thúc"); return; }
        const timer = setInterval(() => setTimeLeft(formatTimeLeft(auction.expiresAt.seconds)), 1000);
        return () => clearInterval(timer);
    }, [isExpired, auction.expiresAt.seconds]);

    if (!itemDef) return null;

    const isMyItem = auction.sellerId === userId;
    const isWinning = auction.highestBidderId === userId;
    const canClaim = isExpired && auction.status !== 'claimed' && (isMyItem || isWinning);
    
    const statusText = () => {
        if (auction.status === 'claimed') return <span className="text-slate-500">Đã nhận</span>;
        if (canClaim) {
            if (isWinning) return <span className="text-green-400">Thắng!</span>;
            if (isMyItem && auction.highestBidderId) return <span className="text-cyan-400">Đã bán</span>;
            if (isMyItem && !auction.highestBidderId) return <span className="text-yellow-400">Hết hạn</span>;
        }
        return <span className="font-bold text-yellow-400">{timeLeft}</span>;
    };

    return (
        <div className={`relative bg-slate-800/50 border-2 ${getRarityColor(itemDef.rarity)} rounded-lg p-3 flex flex-col gap-2 transition-colors ${!canClaim && 'cursor-pointer hover:bg-slate-700/50'}`} onClick={!canClaim ? () => onSelect(auction) : undefined}>
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center bg-black/30 rounded-md border ${getRarityColor(itemDef.rarity)}`}><img src={itemDef.icon} alt={itemDef.name} className="w-10 h-10 object-contain" /></div>
                <div className="flex-1 min-w-0"><p className={`font-bold truncate ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</p><p className="text-xs text-slate-400">Lv. {auction.item.level} | Bán bởi: {isMyItem ? "Bạn" : auction.sellerName}</p></div>
            </div>
            <div className="bg-black/20 rounded p-2 flex justify-between items-center text-sm mt-auto">
                <div className="flex flex-col"><span className="text-xs text-slate-500">Giá hiện tại</span><div className={`flex items-center gap-1 font-bold ${isWinning ? 'text-green-400' : 'text-slate-300'}`}><GoldIcon className="w-4 h-4" /><span>{auction.currentBid.toLocaleString()}</span></div></div>
                <div className="flex flex-col items-end"><span className="text-xs text-slate-500">Trạng thái</span>{statusText()}</div>
            </div>
            {isWinning && !isExpired && <div className="absolute top-1 right-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">Đang thắng</div>}
            {canClaim && <button onClick={() => onClaim(auction)} disabled={isProcessing} className="w-full mt-2 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-md text-sm hover:scale-105 transition-transform disabled:opacity-50">Nhận</button>}
        </div>
    );
});

// --- Modals ---
const CreateListingModal = ({ isOpen, onClose, unequippedItems, onConfirm, isProcessing }: any) => { /* Omitted for brevity, code is unchanged from previous response */ };
const AuctionDetailModal = ({ isOpen, onClose, auction, onBid, gold, userId, isProcessing }: any) => { /* Code to be added */ };

// --- Main Component ---
interface AuctionHouseProps {
    onClose: (data: AuctionHouseExitData) => void;
    user: User;
    initialData: { gold: number, gems: number, unequippedItems: OwnedItem[], allAuctions: Auction[], myAuctions: Auction[] };
}

export default function AuctionHouseScreen({ onClose, user, initialData }: AuctionHouseProps) {
    const [gold, setGold] = useState(initialData.gold);
    const [gems, setGems] = useState(initialData.gems);
    const [unequippedItems, setUnequippedItems] = useState(initialData.unequippedItems);
    const [allAuctions, setAllAuctions] = useState<Auction[]>(initialData.allAuctions);
    const [myAuctions, setMyAuctions] = useState<Auction[]>(initialData.myAuctions);

    const [activeTab, setActiveTab] = useState<'listings' | 'myAuctions'>('listings');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const refreshData = (updatedData: any) => {
        setGold(updatedData.newGold);
        setGems(updatedData.newGems);
        if(updatedData.newOwnedItems) setUnequippedItems(updatedData.newOwnedItems.filter((i: OwnedItem) => !Object.values(i).includes(i.id)));
        setAllAuctions(updatedData.newAllAuctions);
        setMyAuctions(updatedData.newUserAuctions);
    };

    const handleCreateAuction = async (item: OwnedItem, startBid: number) => {
        if (gems < 1) { alert("Không đủ Gem để đăng bán."); return; }
        setIsProcessing(true);
        try {
            const result = await createAuctionListing(user.uid, user.displayName || "Anonymous", item, startBid, unequippedItems);
            refreshData(result);
            setCreateModalOpen(false);
            alert("Đăng bán vật phẩm thành công!");
        } catch (error: any) { alert(`Lỗi: ${error.message}`);
        } finally { setIsProcessing(false); }
    };

    const handlePlaceBid = async (auction: Auction, bidAmount: number) => {
        if (gold < bidAmount) { alert("Không đủ vàng."); return; }
        setIsProcessing(true);
        try {
            const result = await placeBidOnAuction(auction.id, user.uid, user.displayName || "Anonymous", bidAmount);
            refreshData(result);
            setSelectedAuction(null);
            alert("Đặt giá thành công!");
        } catch (error: any) { alert(`Lỗi: ${error.message}`);
        } finally { setIsProcessing(false); }
    };

    const handleClaim = async (auction: Auction) => {
        setIsProcessing(true);
        try {
            const result = await claimAuctionResult(auction.id, user.uid);
            refreshData(result);
            alert("Nhận thành công!");
        } catch (error: any) { alert(`Lỗi: ${error.message}`);
        } finally { setIsProcessing(false); }
    };

    const handleClose = () => {
        onClose({ gold, gems, ownedItems: unequippedItems });
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-[#110f21] to-[#2c0f52] z-50 flex flex-col font-sans text-white">
            <Header gold={gold} gems={gems} onClose={handleClose} />
            <main className="w-full max-w-5xl mx-auto flex flex-col flex-grow min-h-0 p-4 gap-4">
                <div className="flex-shrink-0 flex justify-between items-center border-b border-slate-700 pb-3">
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab('listings')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'listings' ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Sàn Đấu Giá</button>
                        <button onClick={() => setActiveTab('myAuctions')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'myAuctions' ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>Quản lý</button>
                    </div>
                    <button onClick={() => setCreateModalOpen(true)} disabled={isProcessing} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-transform disabled:opacity-50">+ Đăng bán</button>
                </div>
                <div className="flex-grow min-h-0 overflow-y-auto hide-scrollbar -m-2 p-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTab === 'listings' && allAuctions.map(auction => <AuctionItemCard key={auction.id} auction={auction} onSelect={setSelectedAuction} onClaim={handleClaim} userId={user.uid} isProcessing={isProcessing} />)}
                        {activeTab === 'myAuctions' && myAuctions.map(auction => <AuctionItemCard key={auction.id} auction={auction} onSelect={setSelectedAuction} onClaim={handleClaim} userId={user.uid} isProcessing={isProcessing} />)}
                    </div>
                     {activeTab === 'listings' && allAuctions.length === 0 && <p className="text-center text-slate-500 mt-10 col-span-full">Sàn đấu giá hiện đang trống.</p>}
                     {activeTab === 'myAuctions' && myAuctions.length === 0 && <p className="text-center text-slate-500 mt-10 col-span-full">Bạn chưa có hoạt động đấu giá nào.</p>}
                </div>
            </main>
            {isCreateModalOpen && <CreateListingModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} unequippedItems={unequippedItems} onConfirm={handleCreateAuction} isProcessing={isProcessing} />}
            {selectedAuction && <AuctionDetailModal isOpen={!!selectedAuction} onClose={() => setSelectedAuction(null)} auction={selectedAuction} onBid={handlePlaceBid} gold={gold} userId={user.uid} isProcessing={isProcessing} />}
        </div>
    );
}

// --- FULL MODAL IMPLEMENTATIONS ---

const CreateListingModal = ({ isOpen, onClose, unequippedItems, onConfirm, isProcessing }: any) => {
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [startBid, setStartBid] = useState('');
    const handleConfirm = () => { if (!selectedItem || !startBid || parseInt(startBid) <= 0) { alert("Vui lòng chọn vật phẩm và nhập giá khởi điểm hợp lệ."); return; } onConfirm(selectedItem, parseInt(startBid)); }
    if(!isOpen) return null;
    return ( <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"> <div className="bg-slate-900 border-2 border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-5"> <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4"> <h2 className="text-xl font-bold text-green-400">Đăng bán vật phẩm</h2> <button onClick={onClose}><CloseIcon className="w-6 h-6" /></button> </div> <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow min-h-0"> <div className="bg-slate-800/50 p-3 rounded-lg flex flex-col"> <h3 className="text-sm font-semibold text-slate-300 mb-2">Chọn vật phẩm từ kho (chưa trang bị)</h3> <div className="flex-grow overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2 pr-1"> {unequippedItems.map((item: OwnedItem) => { const itemDef = getItemDefinition(item.itemId); return ( <div key={item.id} onClick={() => setSelectedItem(item)} className={`relative aspect-square rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedItem?.id === item.id ? `ring-2 ring-green-400 ${getRarityColor(itemDef!.rarity)}` : `bg-black/20 ${getRarityColor(itemDef!.rarity)}`}`}> <img src={itemDef!.icon} className="w-3/4 h-3/4 object-contain" /> <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">Lv.{item.level}</span> </div> ) })} </div> </div> <div className="bg-slate-800/50 p-4 rounded-lg flex flex-col justify-between"> {selectedItem ? ( <div className="text-center flex flex-col items-center gap-4"> <div className={`w-28 h-28 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(getItemDefinition(selectedItem.itemId)!.rarity)}`}> <img src={getItemDefinition(selectedItem.itemId)!.icon} alt="" className="w-20 h-20 object-contain" /> </div> <p className={`font-bold text-lg ${getRarityTextColor(getItemDefinition(selectedItem.itemId)!.rarity)}`}>{getItemDefinition(selectedItem.itemId)!.name} <span className="text-white">Lv.{selectedItem.level}</span></p> <div className="w-full space-y-4 mt-4"> <div> <label className="text-sm font-semibold text-slate-300 mb-1 block">Giá khởi điểm</label> <div className="relative"> <input type="number" value={startBid} onChange={e => setStartBid(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white font-bold" placeholder="VD: 1000" /> <GoldIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" /> </div> </div> <div className="text-xs text-center text-slate-400">Thời gian đấu giá: 24 giờ</div> </div> </div> ) : ( <div className="flex items-center justify-center h-full text-slate-500">Vui lòng chọn một vật phẩm</div> )} <div className="mt-auto pt-4"> <div className="flex items-center justify-center gap-2 text-sm text-yellow-400 p-2 bg-yellow-900/30 rounded-lg border border-yellow-800/50 mb-4"> <GemIcon /> <span>Phí đăng bán: 1 Gem</span> </div> <button onClick={handleConfirm} disabled={isProcessing || !selectedItem} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"> {isProcessing ? "Đang xử lý..." : "Xác nhận đăng bán"} </button> </div> </div> </div> </div> </div> );
};

const AuctionDetailModal = ({ isOpen, onClose, auction, onBid, gold, userId, isProcessing }: any) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    const minBid = Math.floor(auction.currentBid * 1.1) + 1;
    const [bidAmount, setBidAmount] = useState(minBid);
    const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(auction.expiresAt.seconds));

    useEffect(() => { const timer = setInterval(() => setTimeLeft(formatTimeLeft(auction.expiresAt.seconds)), 1000); return () => clearInterval(timer); }, [auction.expiresAt.seconds]);
    useEffect(() => setBidAmount(Math.floor(auction.currentBid * 1.1) + 1), [auction.currentBid]);
    if (!isOpen || !itemDef) return null;

    const isMyItem = auction.sellerId === userId;
    const isWinning = auction.highestBidderId === userId;
    const canBid = !isMyItem && gold >= bidAmount && bidAmount > auction.currentBid;
    
    return ( <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"> <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md z-50 flex flex-col`}> <div className="flex justify-between items-start mb-2 border-b border-gray-700/50 pb-4"> <div> <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3> <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {auction.item.level}</span> </div> <button onClick={onClose}><CloseIcon className="w-6 h-6" /></button> </div> <div className="flex flex-col items-center text-center gap-4 py-4"> <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}> <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" /> </div> <div className="w-full p-3 bg-black/20 rounded-lg border border-slate-700/50 text-sm"> <div className="flex justify-between"><span className="text-slate-400">Người bán:</span><span className="font-semibold text-white">{auction.sellerName}</span></div> <div className="flex justify-between"><span className="text-slate-400">Giá hiện tại:</span><span className="font-bold text-green-400">{auction.currentBid.toLocaleString()}</span></div> <div className="flex justify-between"><span className="text-slate-400">Người giữ giá:</span><span className="font-semibold text-white">{auction.highestBidderName || 'Chưa có'}</span></div> <div className="flex justify-between"><span className="text-slate-400">Thời gian còn lại:</span><span className="font-bold text-yellow-400">{timeLeft}</span></div> </div> {isWinning && <p className="text-green-400 font-bold">Bạn đang là người trả giá cao nhất.</p>} {isMyItem && <p className="text-cyan-400 font-bold">Đây là vật phẩm của bạn.</p>} {!isMyItem && !isWinning && ( <> <div className="w-full"> <label className="text-sm font-semibold text-slate-300 mb-1 block">Giá bạn muốn đặt (Tối thiểu: {minBid.toLocaleString()})</label> <div className="relative"> <input type="number" value={bidAmount} onChange={e => setBidAmount(parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white font-bold text-center" /> <GoldIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" /> </div> </div> <button onClick={() => onBid(auction, bidAmount)} disabled={!canBid || isProcessing} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"> {isProcessing ? "Đang xử lý..." : `Đặt giá ${bidAmount.toLocaleString()}`} </button> </> )} </div> </div> </div> );
};
