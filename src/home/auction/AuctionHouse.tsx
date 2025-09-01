// --- START OF FILE src/home/auction/AuctionHouse.tsx ---

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { useGame } from '../../GameContext.tsx';
import { fetchActiveAuctions, placeBidOnAuction, type AuctionItem } from '../../gameDataService.ts';
import { getItemDefinition, type ItemDefinition, type ItemRank } from '../equipment/item-database.ts';
import { uiAssets } from '../../game-assets.ts';

// --- Các hàm và component tiện ích ---
const getRarityColor = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'border-red-500'; case 'SR': return 'border-orange-400';
        case 'S': return 'border-yellow-400'; case 'A': return 'border-purple-500';
        case 'B': return 'border-blue-500'; case 'D': return 'border-green-500';
        case 'E': return 'border-gray-500'; default: return 'border-gray-600';
    }
};
const getRarityTextColor = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'text-red-500'; case 'SR': return 'text-orange-400';
        case 'S': return 'text-yellow-400'; case 'A': return 'text-purple-400';
        case 'B': return 'text-blue-400'; case 'D': return 'text-green-400';
        case 'E': return 'text-gray-400'; default: return 'text-gray-500';
    }
};
const getRarityGradient = (rank: ItemRank): string => {
    switch (rank) {
        case 'SSR': return 'from-red-900/80 to-slate-900'; case 'SR': return 'from-orange-900/80 to-slate-900';
        case 'S': return 'from-yellow-900/80 to-slate-900'; case 'A': return 'from-purple-900/80 to-slate-900';
        case 'B': return 'from-blue-900/80 to-slate-900'; case 'D': return 'from-green-900/80 to-slate-900';
        case 'E': return 'from-gray-800/80 to-slate-900'; default: return 'from-gray-900 to-slate-900';
    }
};
const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const CoinIcon = () => <img src={uiAssets.coinIcon} alt="Vàng" className="w-5 h-5 inline-block" />;
const GemIcon = () => <img src={uiAssets.gemIcon} alt="Gem" className="w-4 h-4 inline-block" />;

const Timer = memo(({ endTime }: { endTime: Timestamp }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const totalSeconds = Math.max(0, Math.floor((endTime.toMillis() - Date.now()) / 1000));
            if (totalSeconds === 0) return 'Kết thúc';
            
            const d = Math.floor(totalSeconds / (3600*24));
            const h = Math.floor(totalSeconds % (3600*24) / 3600);
            const m = Math.floor(totalSeconds % 3600 / 60);
            const s = Math.floor(totalSeconds % 60);

            if (d > 0) return `${d}d ${h}h`;
            if (h > 0) return `${h}h ${m}m`;
            if (m > 0) return `${m}m ${s}s`;
            return `${s}s`;
        };
        
        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    const isEndingSoon = endTime.toMillis() - Date.now() < 5 * 60 * 1000;

    return <span className={`font-mono text-sm ${isEndingSoon ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>{timeLeft}</span>;
});

const AuctionListItem = memo(({ auction, onSelect, isSelected }: { auction: AuctionItem, onSelect: () => void, isSelected: boolean }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    if (!itemDef) return null;

    return (
        <div 
            onClick={onSelect}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 border ${isSelected ? `bg-slate-700/50 border-cyan-400` : `bg-slate-800/50 border-slate-700 hover:border-slate-500`}`}
        >
            <div className={`flex-shrink-0 w-14 h-14 flex items-center justify-center bg-black/30 rounded-md border-2 ${getRarityColor(itemDef.rarity)}`}>
                <img src={itemDef.icon} alt={itemDef.name} className="w-10 h-10 object-contain" />
            </div>
            <div className="flex-grow min-w-0">
                <p className={`font-bold truncate ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name} <span className="text-xs text-white">Lv.{auction.item.level}</span></p>
                <div className="flex items-center gap-2 text-sm text-yellow-300">
                    <CoinIcon /> 
                    <span className="font-semibold">{auction.currentBid.toLocaleString()}</span>
                </div>
            </div>
            <div className="flex-shrink-0 text-right">
                <Timer endTime={auction.endTime} />
            </div>
        </div>
    );
});

const AuctionDetailView = memo(({ auction, user, onBid, isBidding }: { auction: AuctionItem, user: User, onBid: (amount: number) => void, isBidding: boolean }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    const { coins } = useGame();
    const [bidAmount, setBidAmount] = useState(auction.currentBid + 1);

    useEffect(() => {
        setBidAmount(auction.currentBid + 1);
    }, [auction]);

    if (!itemDef) return <div className="flex items-center justify-center h-full text-slate-500"><p>Lỗi: Không tìm thấy vật phẩm.</p></div>;

    const canAffordBid = coins >= bidAmount;
    const isHighestBidder = user.uid === auction.highestBidderId;

    const handleBidClick = () => {
        if (!isBidding && canAffordBid && !isHighestBidder && bidAmount > auction.currentBid) {
            onBid(bidAmount);
        }
    };

    return (
        <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} h-full flex flex-col`}>
            <div className="flex-shrink-0 text-center border-b border-gray-700/50 pb-4 mb-4">
                <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                <span className="text-sm font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {auction.item.level}</span>
            </div>
            <div className="flex-grow min-h-0 overflow-y-auto pr-2 space-y-4">
                 <div className={`w-32 h-32 mx-auto flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}>
                    <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-slate-700/50">
                    <p className="text-slate-300 text-sm">{itemDef.description}</p>
                </div>
                <div className="p-3 bg-black/20 rounded-lg border border-slate-700/50 space-y-2">
                    {Object.entries(auction.item.stats).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 capitalize">{key}</span>
                            <span className="font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span>
                        </div>
                    ))}
                </div>
                 <div className="p-3 bg-black/20 rounded-lg border border-slate-700/50 text-sm">
                    <p>Người bán: <span className="font-semibold text-cyan-300">{auction.sellerName}</span></p>
                    <p>Kết thúc sau: <Timer endTime={auction.endTime} /></p>
                </div>
            </div>
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-gray-700/50">
                <div className="text-center mb-2">
                    <p className="text-slate-400 text-sm">Giá hiện tại:</p>
                    <p className="text-3xl font-bold text-yellow-300 flex items-center justify-center gap-2">
                        <CoinIcon /> {auction.currentBid.toLocaleString()}
                    </p>
                    {auction.highestBidderName && <p className="text-xs text-slate-300">Giữ giá: <span className={isHighestBidder ? 'text-green-400' : 'text-orange-400'}>{isHighestBidder ? 'Bạn' : auction.highestBidderName}</span></p>}
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="number"
                        value={bidAmount}
                        onChange={e => setBidAmount(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-center font-bold text-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        min={auction.currentBid + 1}
                        disabled={isHighestBidder || isBidding}
                    />
                    <button 
                        onClick={handleBidClick}
                        disabled={isBidding || isHighestBidder || !canAffordBid || bidAmount <= auction.currentBid}
                        className="flex-shrink-0 w-32 h-14 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex flex-col items-center justify-center"
                    >
                        <span>{isBidding ? 'Đang gửi...' : 'Đặt Giá'}</span>
                        <span className="text-xs font-normal flex items-center gap-1 opacity-80">(Phí: 1 <GemIcon />)</span>
                    </button>
                </div>
                {!canAffordBid && !isHighestBidder && <p className="text-center text-red-400 text-xs mt-2">Không đủ vàng.</p>}
            </div>
        </div>
    );
});

// --- Component Chính ---
interface AuctionHouseProps {
    user: User;
    onClose: () => void;
}

export default function AuctionHouse({ user, onClose }: AuctionHouseProps) {
    const { updateUserCurrency } = useGame();
    const [auctions, setAuctions] = useState<AuctionItem[]>([]);
    const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBidding, setIsBidding] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const unsubscribe = fetchActiveAuctions((data) => {
            setAuctions(data);
            if (isLoading) setIsLoading(false);
            if (selectedAuction && !data.find(a => a.id === selectedAuction.id)) {
                setSelectedAuction(data.length > 0 ? data[0] : null);
            }
        });
        return () => unsubscribe();
    }, [isLoading, selectedAuction]);
    
    useEffect(() => {
        if (auctions.length > 0 && !selectedAuction) {
            setSelectedAuction(auctions[0]);
        }
    }, [auctions, selectedAuction]);
    
    useEffect(() => {
        if(error) {
            const timer = setTimeout(() => setError(''), 4000);
            return () => clearTimeout(timer);
        }
        if(success) {
            const timer = setTimeout(() => setSuccess(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const handlePlaceBid = async (amount: number) => {
        if (!selectedAuction || !user.displayName) return;
        setIsBidding(true);
        setError('');
        setSuccess('');
        try {
            const { newCoins, newGems } = await placeBidOnAuction(selectedAuction.id, user.uid, user.displayName, amount);
            await updateUserCurrency({ coins: newCoins, gems: newGems });
            setSuccess('Đặt giá thành công!');
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra.');
        } finally {
            setIsBidding(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             {error && <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{error}</div>}
             {success && <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg z-[101]">{success}</div>}

            <div className="relative w-full max-w-6xl h-[90vh] bg-slate-900/80 border-2 border-slate-700 rounded-2xl shadow-2xl flex flex-col p-4">
                <header className="flex-shrink-0 flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
                    <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                        Nhà Đấu Giá
                    </h1>
                    <button onClick={onClose} className="text-gray-500 hover:text-white p-2 rounded-full transition-colors"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <main className="flex-grow min-h-0 flex gap-4">
                    <aside className="w-1/3 flex flex-col gap-3 min-h-0">
                        <div className="flex-shrink-0 p-2 bg-black/20 rounded-lg">
                            <p className="text-sm text-center text-slate-400">Vật phẩm đang đấu giá</p>
                        </div>
                        <div className="flex-grow min-h-0 overflow-y-auto pr-2 space-y-2">
                            {isLoading ? (
                                <p className="text-slate-500 text-center pt-10">Đang tải...</p>
                            ) : auctions.length === 0 ? (
                                <p className="text-slate-500 text-center pt-10">Chưa có vật phẩm nào.</p>
                            ) : (
                                auctions.map(auction => (
                                    <AuctionListItem 
                                        key={auction.id}
                                        auction={auction}
                                        onSelect={() => setSelectedAuction(auction)}
                                        isSelected={selectedAuction?.id === auction.id}
                                    />
                                ))
                            )}
                        </div>
                    </aside>
                    <section className="w-2/3">
                        {selectedAuction ? (
                            <AuctionDetailView auction={selectedAuction} user={user} onBid={handlePlaceBid} isBidding={isBidding} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500 bg-black/20 rounded-xl border-2 border-dashed border-slate-700">
                                <p>Chọn một vật phẩm để xem chi tiết.</p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
// --- END OF FILE src/home/auction/AuctionHouse.tsx ---
