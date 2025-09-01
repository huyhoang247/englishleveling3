import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useGame } from '../../GameContext.tsx';
import type { OwnedItem, ItemRank } from '../equipment/equipment-ui.tsx';
import { getItemDefinition } from '../equipment/item-database.ts';
import { uiAssets, equipmentUiAssets } from '../../game-assets.ts';
import * as gameDataService from '../../gameDataService.ts';
import { useAnimateValue } from '../../ui/useAnimateValue.ts';
import { Timestamp } from 'firebase/firestore';

// --- Interfaces & Constants ---
export interface AuctionItem {
    id: string; 
    sellerId: string;
    sellerName: string;
    item: OwnedItem;
    startingPrice: number;
    currentBid: number;
    buyoutPrice?: number;
    currentBidderId: string | null;
    currentBidderName: string | null;
    startTime: Timestamp;
    endTime: Timestamp;
    status: 'active' | 'ended' | 'cancelled';
}
const LISTING_FEE = 1000;
const BID_FEE = 1;

// --- Helper Functions ---
const getRarityColor = (rank: ItemRank) => ({ SSR: 'border-red-500', SR: 'border-orange-400', S: 'border-yellow-400', A: 'border-purple-500', B: 'border-blue-500', D: 'border-green-500', E: 'border-gray-500' }[rank] || 'border-gray-600');
const getRarityTextColor = (rank: ItemRank) => ({ SSR: 'text-red-500', SR: 'text-orange-400', S: 'text-yellow-400', A: 'text-purple-400', B: 'text-blue-400', D: 'text-green-400', E: 'text-gray-400' }[rank] || 'text-gray-500');
const formatTimeLeft = (endTime: Timestamp) => {
    const diff = endTime.toMillis() - Date.now();
    if (diff <= 0) return { text: "Kết thúc", color: "text-red-400" };
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 23) return { text: `> 24h`, color: "text-green-400" };
    if (hours > 0) return { text: `${hours}h ${minutes}m`, color: "text-yellow-400" };
    if (minutes > 0) return { text: `${minutes}m`, color: "text-orange-400" };
    return { text: `< 1m`, color: "text-red-500" };
};
const formatNumber = (num: number) => num.toLocaleString();

// --- Child Components ---
const CloseIcon = ({ className = '' }) => <img src={uiAssets.closeIcon} alt="Đóng" className={className} />;
const GoldIcon = ({ className = '' }) => <img src={equipmentUiAssets.goldIcon} alt="Vàng" className={className} />;
const GemIcon = ({ className = '' }) => <img src={uiAssets.gemIcon} alt="Gem" className={className} />;
const StatIcon = ({ statKey }: { statKey: string }) => {
    const icons: Record<string, string> = { hp: '❤️', atk: '⚔️', def: '🛡️' };
    return <span className="mr-1">{icons[statKey] || '✨'}</span>;
};

const AuctionItemCard = memo(({ auction, onSelect, isSelected }: { auction: AuctionItem, onSelect: () => void, isSelected: boolean }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    const [timeInfo, setTimeInfo] = useState(() => formatTimeLeft(auction.endTime));
    useEffect(() => {
        setTimeInfo(formatTimeLeft(auction.endTime));
        const interval = setInterval(() => setTimeInfo(formatTimeLeft(auction.endTime)), 30000);
        return () => clearInterval(interval);
    }, [auction.endTime]);
    if (!itemDef) return null;
    return (
        <div onClick={onSelect} className={`p-2.5 bg-slate-800/50 rounded-lg border-2 ${isSelected ? 'border-cyan-400 shadow-cyan-400/30 shadow-lg' : getRarityColor(itemDef.rarity)} cursor-pointer transition-all hover:bg-slate-800/80 hover:scale-[1.02]`}>
            <div className="flex items-center gap-3"><div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center bg-black/30 rounded-md border ${getRarityColor(itemDef.rarity)}`}><img src={itemDef.icon} alt={itemDef.name} className="w-12 h-12 object-contain" /></div><div className="flex-1 min-w-0"><p className={`font-bold truncate ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name} <span className="text-white">Lv.{auction.item.level}</span></p><div className="flex items-center gap-2 mt-1"><GoldIcon className="w-4 h-4" /><span className="text-sm font-semibold text-yellow-300">{formatNumber(auction.currentBid)}</span></div><p className={`text-xs mt-1 font-semibold ${timeInfo.color}`}>{timeInfo.text}</p></div></div>
        </div>
    );
});

const AuctionDetailView = memo(({ auction, userId, onActionSuccess }: { auction: AuctionItem, userId: string, onActionSuccess: () => void }) => {
    const { gold: userGold, gems: userGems, refreshUserData, userName } = useGame();
    const itemDef = getItemDefinition(auction.item.itemId);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(() => formatTimeLeft(auction.endTime).text);
    useEffect(() => {
        const interval = setInterval(() => setTimeLeft(formatTimeLeft(auction.endTime).text), 1000);
        return () => clearInterval(interval);
    }, [auction.endTime]);
    if (!itemDef) return <p className="text-red-500">Lỗi: Không tìm thấy vật phẩm.</p>;
    const minBid = auction.currentBid > 0 ? Math.ceil(auction.currentBid * 1.05) : auction.startingPrice;
    const canAffordBid = userGold >= minBid && userGems >= BID_FEE;
    const isMyBid = auction.currentBidderId === userId;
    const isMyAuction = auction.sellerId === userId;
    const handlePlaceBid = async () => {
        if (isProcessing || !canAffordBid || isMyBid || isMyAuction) return;
        setIsProcessing(true); setError('');
        try {
            await gameDataService.placeBidOnAuction(userId, userName, auction.id, minBid);
            alert(`Đặt giá thành công ${formatNumber(minBid)} Gold!`);
            await refreshUserData(); onActionSuccess();
        } catch (err: any) { setError(err.message || "Đặt giá thất bại.");
        } finally { setIsProcessing(false); }
    };
    return (
        <div className="flex flex-col h-full text-white"><div className="flex-shrink-0 border-b border-slate-700 pb-3 mb-3"><h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name} <span className="text-white text-xl">Lv.{auction.item.level}</span></h3><p className="text-sm text-slate-400 mt-1">Người bán: <span className="font-semibold text-white">{auction.sellerName}</span></p></div><div className="flex-1 flex gap-4 min-h-0"><div className="w-1/3 flex flex-col items-center gap-3"><div className={`w-32 h-32 flex items-center justify-center bg-black/40 rounded-lg border-2 ${getRarityColor(itemDef.rarity)}`}><img src={itemDef.icon} alt={itemDef.name} className="w-28 h-28 object-contain" /></div><div className="text-center p-2 bg-slate-900/50 rounded-lg w-full"><p className="text-xs text-cyan-300">Thời gian còn lại</p><p className="text-lg font-bold">{timeLeft}</p></div></div><div className="w-2/3 flex flex-col overflow-y-auto pr-2"><h4 className="font-bold text-slate-300 mb-1">Thông số</h4><div className="space-y-1 bg-slate-900/50 p-2 rounded-md">{Object.entries(auction.item.stats).map(([key, value]) => (<div key={key} className="flex justify-between items-center text-sm"><span className="capitalize text-slate-400 flex items-center"><StatIcon statKey={key}/>{key}</span><span className="font-bold">{typeof value === 'number' ? formatNumber(value) : value}</span></div>))}</div></div></div><div className="flex-shrink-0 mt-auto border-t border-slate-700 pt-3"><div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-lg"><div><p className="text-sm text-slate-300">{isMyBid ? "Giá bạn đang giữ" : "Giá hiện tại"}</p><div className="flex items-center gap-2 mt-1"><GoldIcon className="w-6 h-6" /><span className="text-2xl font-bold text-yellow-300">{formatNumber(auction.currentBid)}</span></div></div>{!isMyAuction && (<button onClick={handlePlaceBid} disabled={isProcessing || !canAffordBid || isMyBid} className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:scale-100">{isProcessing ? "Đang xử lý..." : isMyBid ? "Đang dẫn đầu" : `Đặt giá (${formatNumber(minBid)})`}</button>)}</div><div className="text-center text-xs text-slate-500 mt-2">Phí đặt giá: 1 Gem. Giá đặt tiếp theo sẽ cao hơn 5%.</div>{error && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}</div></div>
    );
});

const CreateAuctionView = memo(({ uneqquipedItems, userId, userName, onAuctionCreated }: { uneqquipedItems: OwnedItem[], userId: string, userName: string, onAuctionCreated: () => void }) => {
    const { gold, refreshUserData } = useGame();
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [price, setPrice] = useState(1000);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const itemDef = selectedItem ? getItemDefinition(selectedItem.itemId) : null;
    const handleCreate = async () => {
        if (!selectedItem || price <= 0 || isProcessing || gold < LISTING_FEE) return;
        setIsProcessing(true); setError('');
        try {
            await gameDataService.createAuction(userId, userName, selectedItem, price);
            alert("Đăng bán vật phẩm thành công!");
            await refreshUserData(); onAuctionCreated();
        } catch(err: any) { setError(err.message || 'Đăng bán thất bại.');
        } finally { setIsProcessing(false); }
    };
    return (
        <div className="md:col-span-3 bg-black/20 p-4 rounded-lg border border-slate-800 flex flex-col h-full gap-4">
            <div className="flex-shrink-0"><h3 className="text-xl font-bold text-cyan-300">Đăng bán vật phẩm</h3><p className="text-sm text-slate-400">Chọn vật phẩm từ kho của bạn để bắt đầu đấu giá.</p></div>
            <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
                <div className="bg-slate-900/50 p-3 rounded-lg flex flex-col"><h4 className="text-slate-300 font-semibold mb-2 flex-shrink-0">Chọn vật phẩm</h4><div className="flex-1 overflow-y-auto pr-2 grid grid-cols-4 gap-2 content-start">{uneqquipedItems.map(item => { const def = getItemDefinition(item.itemId); if(!def) return null; return <div key={item.id} onClick={() => setSelectedItem(item)} className={`relative aspect-square rounded-md border-2 ${selectedItem?.id === item.id ? 'border-cyan-400 scale-105' : getRarityColor(def.rarity)} bg-black/40 cursor-pointer transition-all flex items-center justify-center`}><img src={def.icon} alt={def.name} className="w-3/4 h-3/4 object-contain" /><span className="absolute top-0.5 right-0.5 px-1 text-[9px] font-bold bg-black/70 text-white rounded-sm">Lv.{item.level}</span></div> })}</div></div>
                <div className="bg-slate-900/50 p-3 rounded-lg flex flex-col gap-4">{itemDef ? (<><div className="flex items-center gap-4 p-2 bg-slate-800 rounded-lg"><div className={`flex-shrink-0 w-20 h-20 flex items-center justify-center bg-black/30 rounded-md border-2 ${getRarityColor(itemDef.rarity)}`}><img src={itemDef.icon} alt={itemDef.name} className="w-16 h-16 object-contain" /></div><div><p className={`font-bold text-lg ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</p><p className="text-white">Level {selectedItem?.level}</p></div></div><div><label className="text-sm font-semibold text-slate-300">Giá khởi điểm</label><div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg mt-1"><input type="number" value={price} onChange={e => setPrice(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-transparent p-2 font-bold text-lg text-yellow-300 focus:outline-none" /><GoldIcon className="w-6 h-6 mr-3" /></div></div><div className="mt-auto"><p className="text-xs text-slate-400 text-center">Phí đăng bán: {formatNumber(LISTING_FEE)} vàng. Thời gian đấu giá: 24 giờ.</p><button onClick={handleCreate} disabled={!selectedItem || isProcessing || gold < LISTING_FEE} className="w-full mt-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed">Đăng Bán</button>{error && <p className="text-red-400 text-xs mt-1 text-center">{error}</p>}</div></>) : <div className="flex items-center justify-center h-full text-slate-500">Chưa chọn vật phẩm</div>}</div>
            </div>
        </div>
    );
});

export default function AuctionHouse({ onClose, userId, userName }: { onClose: (dataUpdated: boolean) => void; userId: string; userName: string }) {
    const { gold, gems, ownedItems, equippedItems } = useGame();
    const [activeTab, setActiveTab] = useState<'browse' | 'my_auctions' | 'create'>('browse');
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const animatedGold = useAnimateValue(gold); const animatedGems = useAnimateValue(gems);
    const fetchAllAuctions = useCallback(async (selectFirst = false) => {
        setIsLoading(true);
        try {
            const activeAuctions = await gameDataService.fetchActiveAuctions();
            setAuctions(activeAuctions);
            if (selectFirst && activeAuctions.length > 0) setSelectedAuctionId(activeAuctions[0].id);
            else if (!activeAuctions.some(a => a.id === selectedAuctionId)) setSelectedAuctionId(activeAuctions[0]?.id || null);
        } catch (error) { console.error("Failed to fetch auctions:", error);
        } finally { setIsLoading(false); }
    }, [selectedAuctionId]);
    useEffect(() => { fetchAllAuctions(true); }, []);
    const selectedAuction = useMemo(() => auctions.find(a => a.id === selectedAuctionId), [auctions, selectedAuctionId]);
    const myAuctions = useMemo(() => auctions.filter(a => a.sellerId === userId), [auctions, userId]);
    const uneqquipedItems = useMemo(() => ownedItems.filter(item => !Object.values(equippedItems).includes(item.id)), [ownedItems, equippedItems]);
    const tabs = [{ key: 'browse', label: 'Sàn Đấu Giá' }, { key: 'my_auctions', label: `Của tôi (${myAuctions.length})` }, { key: 'create', label: 'Đăng Bán' }];
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center font-sans"><div className="w-full h-full max-w-6xl max-h-[95vh] bg-gradient-to-br from-[#1a1c32] to-[#110f21] rounded-2xl border-2 border-slate-700 shadow-2xl flex flex-col overflow-hidden"><header className="flex-shrink-0 w-full bg-black/30 border-b-2 border-slate-700/50 p-4 flex justify-between items-center"><h2 className="text-2xl font-black tracking-wider bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Nhà Đấu Giá</h2><div className="flex items-center gap-4"><div className="flex items-center gap-2 px-3 py-1 bg-slate-800/70 rounded-full border border-slate-700"><GemIcon className="w-5 h-5" /><span className="font-bold text-white">{formatNumber(animatedGems)}</span></div><div className="flex items-center gap-2 px-3 py-1 bg-slate-800/70 rounded-full border border-slate-700"><GoldIcon className="w-5 h-5" /><span className="font-bold text-white">{formatNumber(animatedGold)}</span></div><button onClick={() => onClose(false)} className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"><CloseIcon className="w-6 h-6" /></button></div></header><div className="flex flex-1 min-h-0"><nav className="w-52 bg-black/20 border-r border-slate-800 p-4 flex flex-col gap-2"><div className="flex-1 space-y-2">{tabs.map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`w-full text-left px-3 py-2 rounded-md font-semibold transition-colors ${activeTab === tab.key ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-700/50'}`}>{tab.label}</button>))}</div></nav><main className="flex-1 p-4 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">{(activeTab === 'browse' || activeTab === 'my_auctions') && (<><div className="md:col-span-1 bg-black/20 p-3 rounded-lg border border-slate-800 flex flex-col"><div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-2">{isLoading ? <p className="text-slate-400 text-center mt-4">Đang tải...</p> : (activeTab === 'browse' ? auctions : myAuctions).length > 0 ? (activeTab === 'browse' ? auctions : myAuctions).map(auction => (<AuctionItemCard key={auction.id} auction={auction} onSelect={() => setSelectedAuctionId(auction.id)} isSelected={selectedAuctionId === auction.id} />)) : <p className="text-slate-500 text-center mt-4">Không có vật phẩm nào.</p>}</div></div><div className="md:col-span-2 bg-black/20 p-4 rounded-lg border border-slate-800 flex flex-col">{selectedAuction ? <AuctionDetailView auction={selectedAuction} userId={userId} onActionSuccess={() => fetchAllAuctions()} /> : <div className="flex-1 flex items-center justify-center text-slate-500"><p>Chọn một vật phẩm để xem chi tiết.</p></div>}</div></>)}{activeTab === 'create' && <CreateAuctionView uneqquipedItems={uneqquipedItems} userId={userId} userName={userName} onAuctionCreated={() => { setActiveTab('my_auctions'); fetchAllAuctions(true); }} />} </main></div></div></div>
    );
}
