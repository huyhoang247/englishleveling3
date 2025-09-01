// --- START OF FILE src/home/auction/AuctionHouseScreen.tsx ---

import React, { useState, useMemo, FC, memo, useCallback } from 'react';
import { auth } from '../../firebase.js';
import { AuctionHouseProvider, useAuctionHouse } from './AuctionHouseContext.tsx';
import type { OwnedItem } from '../equipment/equipment-ui.tsx';
import { getItemDefinition, type ItemRank } from '../equipment/item-database.ts';
import { uiAssets } from '../../game-assets.ts';
import { useGame } from '../../GameContext.tsx';

const getRarityColor = (rank: ItemRank): string => {
    const colors: Record<ItemRank, string> = { SSR: 'border-red-500', SR: 'border-orange-400', S: 'border-yellow-400', A: 'border-purple-500', B: 'border-blue-500', D: 'border-green-500', E: 'border-gray-500' };
    return colors[rank] || 'border-gray-600';
};
const getRarityTextColor = (rank: ItemRank): string => {
    const colors: Record<ItemRank, string> = { SSR: 'text-red-500', SR: 'text-orange-400', S: 'text-yellow-400', A: 'text-purple-400', B: 'text-blue-400', D: 'text-green-400', E: 'text-gray-400' };
    return colors[rank] || 'text-gray-500';
};
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const GoldIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.goldIcon} alt="Vàng" className={className} /> );

const formatTimeLeft = (endTime: Date): { text: string; color: string } => {
    const diff = endTime.getTime() - Date.now();
    if (diff <= 0) return { text: "Kết thúc", color: "text-red-400" };
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return { text: `${hours} giờ`, color: "text-green-400" };
    const minutes = Math.floor(diff / 60000);
    if (minutes > 0) return { text: `${minutes} phút`, color: "text-yellow-400" };
    return { text: "< 1 phút", color: "text-orange-400" };
};

const ItemSlot: FC<{ item: OwnedItem; className?: string }> = memo(({ item, className = "w-16 h-16" }) => {
    const itemDef = getItemDefinition(item.itemId);
    if (!itemDef) return <div className={`bg-red-500/20 border-2 border-red-500 rounded-md flex items-center justify-center text-xs text-red-300 ${className}`}>Lỗi ID</div>;
    return (
        <div className={`relative flex items-center justify-center rounded-md border-2 ${getRarityColor(itemDef.rarity)} bg-slate-900/70 ${className}`}>
            <img src={itemDef.icon} alt={itemDef.name} className="w-3/4 h-3/4 object-contain" />
            <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">
                Lv.{item.level}
            </span>
        </div>
    );
});

const ListAnItemModal: FC<{ myItems: OwnedItem[], onClose: () => void, onList: Function, isProcessing: boolean }> = memo(({ myItems, onClose, onList, isProcessing }) => {
    const [selectedItem, setSelectedItem] = useState<OwnedItem | null>(null);
    const [startPrice, setStartPrice] = useState('');

    const handleList = async () => {
        if (!selectedItem || !startPrice || parseInt(startPrice) <= 0) {
            alert("Vui lòng chọn vật phẩm và nhập giá khởi điểm hợp lệ.");
            return;
        }
        const success = await onList(selectedItem, parseInt(startPrice), null);
        if (success) onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg w-full max-w-lg border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-cyan-300">Đăng bán vật phẩm (Phí: 1 Gem)</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700"><CloseIcon className="w-5 h-5"/></button>
                </div>
                <p className="text-sm text-slate-400 mb-4">Chọn một vật phẩm từ kho của bạn để đăng bán. Thời gian đấu giá là 24 giờ. Nếu không có ai đấu giá, vật phẩm và phí sẽ được hoàn lại.</p>
                
                <div className="h-48 overflow-y-auto border border-slate-600 rounded p-2 mb-4 grid grid-cols-5 gap-2 bg-black/20">
                    {myItems.length > 0 ? myItems.map(item => (
                        <div key={item.id} onClick={() => setSelectedItem(item)} className={`cursor-pointer rounded-md transition-all ${selectedItem?.id === item.id ? 'ring-2 ring-cyan-400' : ''}`}>
                            <ItemSlot item={item} className="w-full aspect-square" />
                        </div>
                    )) : <p className="col-span-5 text-center self-center text-slate-500">Không có vật phẩm để bán.</p>}
                </div>
                
                {selectedItem && (
                    <div className="flex items-center gap-4 p-2 bg-slate-700/50 rounded-md mb-4">
                        <ItemSlot item={selectedItem} />
                        <div className="flex-1">
                            <p className={`font-bold ${getRarityTextColor(getItemDefinition(selectedItem.itemId)!.rarity)}`}>{getItemDefinition(selectedItem.itemId)!.name}</p>
                            <input type="number" placeholder="Giá khởi điểm (vàng)" value={startPrice} onChange={e => setStartPrice(e.target.value)} className="w-full bg-slate-900 border border-slate-600 p-2 rounded mt-1" />
                        </div>
                    </div>
                )}
                
                <div className="flex gap-4 mt-6">
                    <button onClick={onClose} disabled={isProcessing} className="flex-1 py-3 bg-slate-600 hover:bg-slate-500 rounded-md font-bold text-sm uppercase transition-colors">Hủy</button>
                    <button onClick={handleList} disabled={isProcessing || !selectedItem || !startPrice} className="flex-1 py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-md font-bold text-sm uppercase transition-all hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:scale-100">{isProcessing ? 'Đang xử lý...' : 'Đăng bán'}</button>
                </div>
            </div>
        </div>
    );
});

const AuctionHouseContent: FC<{ onClose: () => void }> = () => {
    const { isLoading, isProcessing, auctions, myItems, placeBid, refreshAuctions } = useAuctionHouse();
    const { coins } = useGame();
    const [activeTab, setActiveTab] = useState<'browse' | 'my_auctions'>('browse');
    const [selectedAuction, setSelectedAuction] = useState<any | null>(null);
    const [isListModalOpen, setListModalOpen] = useState(false);
    const [bidAmount, setBidAmount] = useState('');

    const currentUser = auth.currentUser;
    const currentUserAuctions = useMemo(() => auctions.filter(a => a.sellerId === currentUser?.uid), [auctions, currentUser]);
    const otherAuctions = useMemo(() => auctions.filter(a => a.sellerId !== currentUser?.uid), [auctions, currentUser]);

    const handleSelectAuction = useCallback((auction: any) => {
        setSelectedAuction(auction);
        const suggestedBid = Math.max(auction.currentBid + 1, Math.floor(auction.currentBid * 1.05));
        setBidAmount(suggestedBid.toString());
    }, []);
    
    const handlePlaceBid = async () => {
        if (!selectedAuction || !bidAmount || parseInt(bidAmount) <= selectedAuction.currentBid) {
            alert("Giá đặt phải cao hơn giá hiện tại.");
            return;
        }
        const success = await placeBid(selectedAuction, parseInt(bidAmount));
        if (success) {
            const updatedAuction = { ...selectedAuction, currentBid: parseInt(bidAmount), highestBidderId: currentUser?.uid, highestBidderName: currentUser?.displayName || "Player" };
            setSelectedAuction(updatedAuction);
        }
    };

    const activeList = activeTab === 'browse' ? otherAuctions : currentUserAuctions;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-5xl h-[90vh] bg-gradient-to-br from-slate-900 to-[#110f21] border-2 border-slate-700 rounded-2xl shadow-2xl flex flex-col">
                <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <img src={uiAssets.auctionIcon} alt="Auction" className="w-8 h-8"/>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Nhà Đấu Giá</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 transition-colors"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <main className="flex-1 flex min-h-0">
                    <div className="w-3/5 border-r border-slate-700/50 flex flex-col">
                        <div className="flex-shrink-0 p-3 border-b border-slate-700/50 flex justify-between items-center">
                            <div className="flex gap-2">
                                <button onClick={() => setActiveTab('browse')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'browse' ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}>Duyệt ({otherAuctions.length})</button>
                                <button onClick={() => setActiveTab('my_auctions')} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${activeTab === 'my_auctions' ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}>Của tôi ({currentUserAuctions.length})</button>
                            </div>
                            <button onClick={() => refreshAuctions()} disabled={isLoading} className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50"><svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5m11 2a9 9 0 11-2-6.32M15 15v5h5" /></svg></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {isLoading ? <div className="text-center p-10 text-slate-400 animate-pulse">Đang tải danh sách...</div> : (
                                activeList.length > 0 ? activeList.map(auction => {
                                    const itemDef = getItemDefinition(auction.item.itemId)!;
                                    const time = formatTimeLeft(auction.endTime.toDate());
                                    const isMyBid = auction.highestBidderId === currentUser?.uid;
                                    return (
                                    <div key={auction.id} onClick={() => handleSelectAuction(auction)} className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all border ${selectedAuction?.id === auction.id ? 'bg-slate-700/80 border-cyan-500' : `bg-slate-800/50 hover:bg-slate-700/50 border-transparent`}`}>
                                        <ItemSlot item={auction.item} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold truncate ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</p>
                                            <p className="text-xs text-slate-400">Người bán: {auction.sellerId === currentUser?.uid ? "Bạn" : auction.sellerName}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="flex items-center justify-end gap-1 font-semibold text-yellow-400">
                                                <GoldIcon className="w-4 h-4" /> {auction.currentBid.toLocaleString()}
                                            </div>
                                            <p className={`text-xs font-medium ${time.color}`}>{time.text}</p>
                                            {isMyBid && <span className="text-[10px] text-green-400 font-bold">GIÁ CỦA BẠN</span>}
                                        </div>
                                    </div>
                                )}) : <div className="h-full flex items-center justify-center text-slate-500">Không có vật phẩm nào.</div>
                            )}
                        </div>
                         {activeTab === 'my_auctions' && 
                            <div className="flex-shrink-0 p-3 border-t border-slate-700/50">
                                <button onClick={() => setListModalOpen(true)} className="w-full py-3 bg-gradient-to-r from-green-500 to-cyan-500 rounded-md font-bold text-sm uppercase transition-all hover:scale-105 shadow-lg">Đăng bán vật phẩm mới</button>
                            </div>
                        }
                    </div>

                    <div className="w-2/5 p-4 flex flex-col items-center justify-center">
                        {selectedAuction ? (
                             <div className="w-full max-w-xs text-center flex flex-col gap-4">
                                <ItemSlot item={selectedAuction.item} className="w-32 h-32 mx-auto"/>
                                <div>
                                    <h3 className={`text-xl font-bold ${getRarityTextColor(getItemDefinition(selectedAuction.item.itemId)!.rarity)}`}>{getItemDefinition(selectedAuction.item.itemId)!.name}</h3>
                                    <p className="text-sm text-slate-400">Level {selectedAuction.item.level}</p>
                                </div>
                                <div className="w-full p-3 bg-black/20 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-sm text-slate-400">Giá hiện tại:</span>
                                        <span className="font-bold text-lg text-yellow-300">{selectedAuction.currentBid.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline mt-1">
                                        <span className="text-sm text-slate-400">Người giữ giá:</span>
                                        <span className="font-bold text-sm text-white truncate">{selectedAuction.highestBidderId === currentUser?.uid ? "Bạn" : (selectedAuction.highestBidderName || "Không có")}</span>
                                    </div>
                                </div>
                                {activeTab === 'browse' && (
                                    <div className="w-full flex flex-col gap-2">
                                        <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="Giá bạn muốn đặt" className="w-full text-center bg-slate-900 border border-slate-600 p-3 rounded" />
                                        <button onClick={handlePlaceBid} disabled={isProcessing || parseInt(bidAmount) > coins} className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md font-bold text-sm uppercase transition-all hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed">
                                            {isProcessing ? 'Đang xử lý...' : 'Đặt giá'}
                                        </button>
                                        {parseInt(bidAmount) > coins && <p className="text-xs text-red-400">Không đủ vàng</p>}
                                    </div>
                                )}
                             </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
                                <img src={uiAssets.auctionIcon} alt="Auction" className="w-24 h-24 opacity-20 mb-4"/>
                                <p>Chọn một vật phẩm để xem chi tiết</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
             {isListModalOpen && <ListAnItemModal myItems={myItems} onList={listAnItem} onClose={() => setListModalOpen(false)} isProcessing={isProcessing} />}
        </div>
    );
};


interface AuctionHouseScreenProps {
    onClose: () => void;
    onTransactionComplete: () => void;
}

export default function AuctionHouseScreen({ onClose, onTransactionComplete }: AuctionHouseScreenProps) {
    return (
        <AuctionHouseProvider onTransactionComplete={onTransactionComplete}>
            <AuctionHouseContent onClose={onClose} />
        </AuctionHouseProvider>
    );
}

// --- END OF FILE src/home/auction/AuctionHouseScreen.tsx ---
