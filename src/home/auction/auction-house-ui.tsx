import React, { useState, useEffect, useMemo, FC, memo } from 'react';
import { Timestamp } from 'firebase/firestore';
import { 
    listenToActiveAuctions, listenToUserAuctions, listAuctionItem, placeBidOnAuction, 
    claimAuctionWin, reclaimExpiredAuction, AuctionItem, listenAndProcessPendingPayments
} from './auction-service.ts';
import { useGame } from '../../GameContext.tsx';
import { auth } from '../../firebase.js';
import type { OwnedItem, EquippedItems } from '../equipment/equipment-ui.tsx';
import { getItemDefinition, ItemRank, RARITY_ORDER } from '../equipment/item-database.ts';
import { uiAssets } from '../../game-assets.ts';
import CoinDisplay from '../../ui/display/coin-display.tsx';
import GemDisplay from '../../ui/display/gem-display.tsx';
import HomeButton from '../../ui/home-button.tsx';

// --- START: HELPERS & ICONS ---
const getRarityColor = (rank: ItemRank): string => ({ SSR: 'border-red-500', SR: 'border-orange-400', S: 'border-yellow-400', A: 'border-purple-500', B: 'border-blue-500', D: 'border-green-500', E: 'border-gray-500' }[rank] || 'border-gray-600');
const getRarityTextColor = (rank: ItemRank): string => ({ SSR: 'text-red-500', SR: 'text-orange-400', S: 'text-yellow-400', A: 'text-purple-400', B: 'text-blue-400', D: 'text-green-400', E: 'text-gray-400' }[rank] || 'text-gray-500');
const getRarityGradient = (rank: ItemRank): string => ({ SSR: 'from-red-900/80 to-slate-900', SR: 'from-orange-900/80 to-slate-900', S: 'from-yellow-900/80 to-slate-900', A: 'from-purple-900/80 to-slate-900', B: 'from-blue-900/80 to-slate-900', D: 'from-green-900/80 to-slate-900', E: 'from-gray-800/80 to-slate-900' }[rank] || 'from-gray-900 to-slate-900');

const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const CoinIcon = ({ className = '' }: { className?: string }) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/coin.webp" alt="Vàng" className={className} /> );
const GemIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.gemIcon} alt="Gem" className={className} /> );

const HpIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/> </svg> );
const AtkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M17.46,3.26a1.5,1.5,0,0,0-2.12,0L3.25,15.35a1.5,1.5,0,0,0,0,2.12l2.83,2.83a1.5,1.5,0,0,0,2.12,0L20.29,8.21a1.5,1.5,0,0,0,0-2.12Zm-11,14.31L4.6,15.71,15,5.34l1.83,1.83ZM18,7.5,16.5,6l1.41-1.41a.5.5,0,0,1,.71.71Z"/> </svg> );
const DefIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M12,1L3,5v6c0,5.55,3.84,10.74,9,12c5.16-1.26,9-6.45,9-12V5L12,1z"/> </svg> );
const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};
// --- END: HELPERS & ICONS ---

const useAnimateValue = (endValue: number, duration: number = 500) => {
    const [currentValue, setCurrentValue] = useState(0);
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    useEffect(() => {
        let frame = 0; const startValue = currentValue;
        const counter = setInterval(() => {
            frame++; const progress = frame / totalFrames;
            const nextValue = Math.round(startValue + (endValue - startValue) * progress);
            if (frame >= totalFrames) { clearInterval(counter); setCurrentValue(endValue); } else { setCurrentValue(nextValue); }
        }, frameRate);
        return () => clearInterval(counter);
    }, [endValue, duration]);
    return currentValue;
};

const useCountdown = (endTime: Timestamp | undefined) => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
        if (!endTime) return;
        const interval = setInterval(() => {
            const diff = endTime.toMillis() - Date.now();
            if (diff <= 0) { setTimeLeft('Ended'); clearInterval(interval); return; }
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

// --- START: MODAL FOR CREATING AUCTION (UPDATED) ---
const AuctionDetailModal = memo(({ ownedItem, onClose, onList, isProcessing }: { ownedItem: OwnedItem, onClose: () => void, onList: (item: OwnedItem, price: number, duration: number) => void, isProcessing: boolean }) => {
    const itemDef = getItemDefinition(ownedItem.itemId);
    const [activeTab, setActiveTab] = useState<'stats' | 'auction'>('stats');
    const [price, setPrice] = useState(1000);
    
    const DURATION_OPTIONS = [6, 12, 24];
    const [durationIndex, setDurationIndex] = useState(1); // Default to 12h (index 1)

    if (!itemDef) {
        console.error(`Cannot open auction detail modal for non-existent item ID: ${ownedItem.itemId}`);
        onClose();
        return null;
    }

    const handleListClick = () => {
        if (price > 0) {
            onList(ownedItem, price, DURATION_OPTIONS[durationIndex]);
        }
    };

    const handlePriceChange = (amount: number) => {
        setPrice(prev => Math.max(1, prev + amount));
    };

    const handleDurationChange = (direction: -1 | 1) => {
        setDurationIndex(prev => {
            const newIndex = prev + direction;
            return Math.max(0, Math.min(DURATION_OPTIONS.length - 1, newIndex));
        });
    };

    const quickPriceValues = [100, 1000, 10000, 100000];

    const sortedStats = useMemo(() => {
        const order = ['hp', 'atk', 'def']; const stats = ownedItem.stats || {};
        const orderedEntries: [string, any][] = []; const remainingEntries = { ...stats };
        for (const key of order) {
            if (stats.hasOwnProperty(key)) { orderedEntries.push([key, stats[key]]); delete remainingEntries[key]; }
        }
        orderedEntries.push(...Object.entries(remainingEntries));
        return orderedEntries;
    }, [ownedItem.stats]);
    const hasStats = sortedStats.length > 0;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
                <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(itemDef.rarity)} bg-gray-800/70 border ${getRarityColor(itemDef.rarity)}`}>{`${itemDef.rarity} Rank`}</span>
                        <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {ownedItem.level}</span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}>
                             <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                        </div>
                        <div className="w-full p-4 bg-black/20 rounded-lg border border-slate-700/50 text-left">
                            <p className="text-slate-300 text-sm leading-relaxed">{itemDef.description}</p>
                        </div>
                        
                        <div className="w-full bg-black/20 rounded-lg">
                            <div className="flex border-b border-slate-700/50">
                                <button onClick={() => setActiveTab('stats')} className={`relative px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'stats' ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}>Chỉ Số{activeTab === 'stats' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-cyan-400"></div>}</button>
                                <button onClick={() => setActiveTab('auction')} className={`relative px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'auction' ? 'text-green-300' : 'text-slate-500 hover:text-slate-300'}`}>Đấu Giá{activeTab === 'auction' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-green-400"></div>}</button>
                            </div>
                            
                            <div className="p-4">
                                {activeTab === 'stats' && (
                                    <div className="space-y-1">{hasStats ? sortedStats.map(([key, value]) => { const config = STAT_CONFIG[key.toLowerCase()]; return (<div key={key} className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg">{config?.Icon && (<div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-black/30 ${config.color}`}><config.Icon className="w-4 h-4" /></div>)}<div className="flex flex-1 items-center justify-between"><span className="text-xs font-semibold text-slate-300 capitalize">{config?.name || key}</span><span className="font-bold text-sm text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span></div></div>); }) : (<p className="text-sm text-slate-500 text-center py-4">Vật phẩm này không có chỉ số.</p>)}</div>
                                )}

                                {activeTab === 'auction' && (
                                    <div className="space-y-4">
                                        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2 text-center">Giá khởi điểm (Vàng)</label>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handlePriceChange(-quickPriceValues[0])} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-xl transition-colors">-</button>
                                                    <div className="flex-grow text-center text-xl font-bold py-2 rounded-md bg-black/40 border border-slate-600 text-white">
                                                        {price.toLocaleString()}
                                                    </div>
                                                    <button onClick={() => handlePriceChange(quickPriceValues[0])} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-xl transition-colors">+</button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2 mt-3">
                                                    {quickPriceValues.map(val => (
                                                        <button key={val} onClick={() => handlePriceChange(val)} className="py-1.5 bg-slate-700/70 hover:bg-slate-600 text-white text-xs font-semibold rounded-md transition-colors">+{val.toLocaleString()}</button>
                                                    ))}
                                                </div>
                                            </div>
                                             <div>
                                                <label className="block text-sm font-medium text-slate-300 mb-2 text-center">Thời gian</label>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => handleDurationChange(-1)} disabled={durationIndex === 0} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                                                    <div className="flex-grow text-center text-xl font-bold py-2 rounded-md bg-black/40 border border-slate-600 text-white">
                                                        {DURATION_OPTIONS[durationIndex]} Giờ
                                                    </div>
                                                    <button onClick={() => handleDurationChange(1)} disabled={durationIndex === DURATION_OPTIONS.length - 1} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center pt-2">
                                            <button onClick={handleListClick} disabled={price <= 0 || isProcessing} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                                                {isProcessing ? 'Đang xử lý...' : 'Đăng Bán'}
                                            </button>
                                            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">Phí đăng: 1 <GemIcon className="w-3 h-3" /></p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
// --- END: MODAL FOR CREATING AUCTION ---

// --- START: VIEW-ONLY DETAIL MODAL ---
const ViewAuctionDetailModal = memo(({ auction, onClose, userId }: { auction: AuctionItem, onClose: () => void, userId: string }) => {
    const ownedItem = auction.item;
    const itemDef = getItemDefinition(ownedItem.itemId);
    const [activeTab, setActiveTab] = useState<'stats' | 'info'>('stats');
    const timeLeft = useCountdown(auction.endTime);
    const isEnded = timeLeft === 'Ended';

    if (!itemDef) {
        console.error(`Cannot open view detail modal for non-existent item ID: ${ownedItem.itemId}`);
        onClose();
        return null;
    }

    const sortedStats = useMemo(() => {
        const order = ['hp', 'atk', 'def']; const stats = ownedItem.stats || {};
        const orderedEntries: [string, any][] = []; const remainingEntries = { ...stats };
        for (const key of order) {
            if (stats.hasOwnProperty(key)) { orderedEntries.push([key, stats[key]]); delete remainingEntries[key]; }
        }
        orderedEntries.push(...Object.entries(remainingEntries));
        return orderedEntries;
    }, [ownedItem.stats]);
    const hasStats = sortedStats.length > 0;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md max-h-[95vh] z-50 flex flex-col`}>
                <div className="flex-shrink-0 border-b border-gray-700/50 pb-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-2xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>{itemDef.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(itemDef.rarity)} bg-gray-800/70 border ${getRarityColor(itemDef.rarity)}`}>{`${itemDef.rarity} Rank`}</span>
                        <span className="text-xs font-bold text-white bg-slate-700/80 px-3 py-1 rounded-full border border-slate-600">Level {ownedItem.level}</span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto pr-2">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={`w-32 h-32 flex items-center justify-center bg-black/30 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} shadow-inner`}>
                             <img src={itemDef.icon} alt={itemDef.name} className="w-24 h-24 object-contain" />
                        </div>
                        <div className="w-full p-4 bg-black/20 rounded-lg border border-slate-700/50 text-left">
                            <p className="text-slate-300 text-sm leading-relaxed">{itemDef.description}</p>
                        </div>
                        <div className="w-full bg-black/20 rounded-lg">
                             <div className="flex border-b border-slate-700/50">
                                <button onClick={() => setActiveTab('stats')} className={`relative px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'stats' ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}>Chỉ Số{activeTab === 'stats' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-cyan-400"></div>}</button>
                                <button onClick={() => setActiveTab('info')} className={`relative px-4 py-2 text-sm font-bold transition-colors ${activeTab === 'info' ? 'text-yellow-300' : 'text-slate-500 hover:text-slate-300'}`}>Thông Tin{activeTab === 'info' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-yellow-400"></div>}</button>
                            </div>
                            <div className="p-4">
                                {activeTab === 'stats' && (
                                     <div className="space-y-1">{hasStats ? sortedStats.map(([key, value]) => { const config = STAT_CONFIG[key.toLowerCase()]; return (<div key={key} className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-lg">{config?.Icon && (<div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md bg-black/30 ${config.color}`}><config.Icon className="w-4 h-4" /></div>)}<div className="flex flex-1 items-center justify-between"><span className="text-xs font-semibold text-slate-300 capitalize">{config?.name || key}</span><span className="font-bold text-sm text-white">{typeof value === 'number' ? value.toLocaleString() : value}</span></div></div>); }) : (<p className="text-sm text-slate-500 text-center py-4">Vật phẩm này không có chỉ số.</p>)}</div>
                                )}
                                {activeTab === 'info' && (
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="text-slate-300">Người bán:</span><span className="font-bold text-slate-200">{auction.sellerId === userId ? "Bạn" : auction.sellerName}</span></div>
                                        <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="text-slate-300">Người ra giá cao nhất:</span><span className="font-bold text-cyan-300">{auction.highestBidderId === userId ? "Bạn" : (auction.highestBidderName || 'Chưa có')}</span></div>
                                        <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="text-slate-300">Giá khởi điểm:</span><span className="font-semibold text-gray-300 flex items-center gap-1"><CoinIcon className="w-4 h-4" />{auction.startingBid.toLocaleString()}</span></div>
                                        <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="text-slate-300">Giá hiện tại:</span><span className="font-bold text-yellow-400 flex items-center gap-1"><CoinIcon className="w-4 h-4" />{auction.currentBid.toLocaleString()}</span></div>
                                        <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-lg"><span className="text-slate-300">Thời gian:</span><span className={`font-bold ${isEnded ? 'text-red-500' : 'text-green-400'}`}>{timeLeft}</span></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
// --- END: VIEW-ONLY DETAIL MODAL ---

// --- START: BIDDING MODAL ---
const BidModal = memo(({ auction, onClose, onPlaceBid, userCoins, isProcessing }: { auction: AuctionItem, onClose: () => void, onPlaceBid: (amount: number) => void, userCoins: number, isProcessing: boolean }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    
    // Calculate the minimum next bid. A common rule is current bid + 5%, but at least 1.
    const minNextBid = auction.currentBid + Math.max(1, Math.round(auction.currentBid * 0.05));
    const [bidAmount, setBidAmount] = useState(minNextBid);

    if (!itemDef) { onClose(); return null; }

    const handleIncrement = (value: number) => {
        setBidAmount(prev => Math.min(prev + value, userCoins));
    };
    
    const handleDecrement = (value: number) => {
        setBidAmount(prev => Math.max(minNextBid, prev - value));
    };

    const hasEnoughCoins = userCoins >= bidAmount;
    const isBidTooLow = bidAmount <= auction.currentBid;
    const canBid = hasEnoughCoins && !isBidTooLow && !isProcessing;

    const quickAddValues = [100, 1000, 10000, 100000];

    return (
        <div className="fixed inset-0 flex items-center justify-center z-[70] p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-gradient-to-br ${getRarityGradient(itemDef.rarity)} p-5 rounded-xl border-2 ${getRarityColor(itemDef.rarity)} shadow-2xl w-full max-w-md z-50`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className={`text-xl font-bold ${getRarityTextColor(itemDef.rarity)}`}>Đặt giá cho: {itemDef.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4">
                     <div className="flex items-center gap-4 p-3 bg-black/20 rounded-lg border border-slate-700/50">
                        <div className={`relative w-16 h-16 flex-shrink-0 bg-black/30 rounded-md border ${getRarityColor(itemDef.rarity)} flex items-center justify-center p-1`}>
                            <img src={itemDef.icon} alt={itemDef.name} className="w-full h-full object-contain" />
                            <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">Lv.{auction.item.level}</span>
                        </div>
                        <div className="flex-grow text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Giá hiện tại:</span>
                                <span className="font-bold text-yellow-400 flex items-center gap-1"><CoinIcon className="w-4 h-4"/>{auction.currentBid.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-slate-400">Vàng của bạn:</span>
                                <span className="font-bold text-slate-200 flex items-center gap-1"><CoinIcon className="w-4 h-4"/>{userCoins.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                        <label className="block text-sm font-medium text-slate-300 mb-2 text-center">Giá bạn đặt</label>
                        <div className="flex items-center justify-center gap-2">
                             <button onClick={() => handleDecrement(quickAddValues[0])} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-xl transition-colors">-</button>
                             <div className={`flex-grow text-center text-2xl font-bold py-2 rounded-md bg-black/40 border ${isBidTooLow || !hasEnoughCoins ? 'border-red-500 text-red-400' : 'border-cyan-500 text-white'}`}>
                                 {bidAmount.toLocaleString()}
                             </div>
                             <button onClick={() => handleIncrement(quickAddValues[0])} className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-md text-white font-bold text-xl transition-colors">+</button>
                        </div>
                         <div className="grid grid-cols-4 gap-2 mt-3">
                             {quickAddValues.map(val => (
                                 <button key={val} onClick={() => handleIncrement(val)} className="py-1.5 bg-slate-700/70 hover:bg-slate-600 text-white text-xs font-semibold rounded-md transition-colors">+{val.toLocaleString()}</button>
                             ))}
                        </div>
                    </div>
                     <div className="text-center h-5">
                        {!hasEnoughCoins && <p className="text-xs text-red-400">Bạn không đủ vàng.</p>}
                        {hasEnoughCoins && isBidTooLow && <p className="text-xs text-red-400">Giá đặt phải cao hơn {auction.currentBid.toLocaleString()}.</p>}
                    </div>
                    <button onClick={() => onPlaceBid(bidAmount)} disabled={!canBid} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                        {isProcessing ? 'Đang xử lý...' : 'Xác nhận Đặt Giá'}
                    </button>
                </div>
            </div>
        </div>
    );
});
// --- END: BIDDING MODAL ---

// --- START: REFACTORED AuctionCard Component ---
const AuctionCard: FC<{ auction: AuctionItem; userId: string; onBid: (a: AuctionItem) => void; onClaim: (a: AuctionItem) => void; onReclaim: (a: AuctionItem) => void; onViewDetails: (a: AuctionItem) => void; }> = ({ auction, userId, onBid, onClaim, onReclaim, onViewDetails }) => {
    const itemDef = getItemDefinition(auction.item.itemId);
    const timeLeft = useCountdown(auction.endTime);
    const isEnded = timeLeft === 'Ended';

    // Renders the status tag in the top-right corner
    const renderStatusTag = () => {
        let text = '';
        let colorClasses = '';

        if (auction.status === 'claimed') {
            text = 'Đã bán';
            colorClasses = 'bg-green-500/20 text-green-300 border-green-500/50';
        } else if (auction.status === 'sold') {
            text = 'Chờ nhận';
            colorClasses = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
        } else if (auction.status === 'expired' || (isEnded && !auction.highestBidderId)) {
            text = 'Hết hạn';
            colorClasses = 'bg-gray-500/20 text-gray-300 border-gray-500/50';
        } else if (isEnded) {
            text = 'Kết thúc';
            colorClasses = 'bg-red-500/20 text-red-300 border-red-500/50';
        } else {
            text = timeLeft;
            colorClasses = 'bg-green-500/20 text-green-300 border-green-500/50';
        }

        return (
            <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-md border ${colorClasses}`}>
                {text}
            </div>
        );
    };

    // Renders the action button inside the grid
    const renderActionInGrid = () => {
        const buttonClasses = "w-full text-white font-bold py-1 px-2 rounded-md text-xs transition-colors";
        
        // Status 'sold' (waiting for winner to claim)
        if (auction.status === 'sold' && auction.highestBidderId === userId) {
            return <button onClick={(e) => { e.stopPropagation(); onClaim(auction); }} className={`${buttonClasses} bg-green-600 hover:bg-green-700`}>Nhận</button>;
        }
        
        // Ended and active (winner can claim)
        if (isEnded && auction.status === 'active' && auction.highestBidderId === userId) {
             return <button onClick={(e) => { e.stopPropagation(); onClaim(auction); }} className={`${buttonClasses} bg-green-600 hover:bg-green-700`}>Nhận</button>;
        }
        
        // Ended and unsold (seller can reclaim)
        if (isEnded && auction.status === 'active' && auction.sellerId === userId && !auction.highestBidderId) {
            return <button onClick={(e) => { e.stopPropagation(); onReclaim(auction); }} className={`${buttonClasses} bg-teal-800 hover:bg-teal-700`}>Lấy Lại</button>;
        }
        
        // Ongoing (non-seller can bid)
        if (!isEnded && auction.status === 'active' && auction.sellerId !== userId) {
            return <button onClick={(e) => { e.stopPropagation(); onBid(auction); }} className={`${buttonClasses} bg-cyan-600 hover:bg-cyan-700`}>Đấu Giá</button>;
        }

        // If no action is available, return null to show nothing.
        return null;
    };


    if (!itemDef) return <div className="text-red-500 bg-slate-800/60 rounded-lg p-3">Lỗi vật phẩm không xác định</div>;

    return (
        <div className={`relative bg-slate-800/60 rounded-lg border-2 ${getRarityColor(itemDef.rarity)} p-3 flex flex-col justify-center transition-shadow hover:shadow-lg hover:shadow-cyan-500/10 min-h-[100px]`}>
            {renderStatusTag()}
            
            <div onClick={() => onViewDetails(auction)} className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-16 h-16 flex-shrink-0 bg-black/30 rounded-md border ${getRarityColor(itemDef.rarity)} flex items-center justify-center p-1`}>
                    <img src={itemDef.icon} alt={itemDef.name} className="w-full h-full object-contain" />
                    <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">Lv.{auction.item.level}</span>
                </div>
                
                <div className="flex-grow">
                    <div className="grid grid-cols-3 gap-1 text-center">
                        <div>
                            <div className="text-[11px] text-slate-400">Khởi Điểm</div>
                            <div className="font-semibold text-xs text-gray-300 flex items-center justify-center gap-1 mt-0.5"><CoinIcon className="w-3.5 h-3.5" /><span>{auction.startingBid.toLocaleString()}</span></div>
                        </div>
                        <div>
                            <div className="text-[11px] text-slate-400">Hiện Tại</div>
                            <div className="font-bold text-xs text-yellow-400 flex items-center justify-center gap-1 mt-0.5"><CoinIcon className="w-3.5 h-3.5" /><span>{auction.currentBid.toLocaleString()}</span></div>
                        </div>
                        <div className="flex items-center justify-center">
                           {renderActionInGrid()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
// --- END: REFACTORED AuctionCard Component ---


// --- START: CreateAuctionView ---
const CreateAuctionView: FC<{ ownedItems: OwnedItem[]; equippedItems: EquippedItems; onList: (item: OwnedItem, price: number, duration: number) => void; isProcessing: boolean }> = ({ ownedItems, equippedItems, onList, isProcessing }) => {
    const [itemForAuction, setItemForAuction] = useState<OwnedItem | null>(null);

    const unequippedItems = useMemo(() => {
        const equippedIds = Object.values(equippedItems).filter(Boolean);
        return ownedItems
            .filter(item => !equippedIds.includes(item.id))
            .sort((a, b) => {
                const itemDefA = getItemDefinition(a.itemId); const itemDefB = getItemDefinition(b.itemId);
                return (RARITY_ORDER.indexOf(itemDefB?.rarity || 'E') - RARITY_ORDER.indexOf(itemDefA?.rarity || 'E')) || (b.level - a.level);
            });
    }, [ownedItems, equippedItems]);

    const handleList = (item: OwnedItem, price: number, duration: number) => {
        onList(item, price, duration);
        setItemForAuction(null);
    };

    return (
        <div className="bg-black/20 rounded-lg p-4 h-full flex flex-col">
             {itemForAuction && (
                <AuctionDetailModal
                    ownedItem={itemForAuction}
                    onClose={() => setItemForAuction(null)}
                    onList={handleList}
                    isProcessing={isProcessing}
                />
            )}
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div className="flex items-baseline gap-2">
                    <h2 className="text-base font-bold text-cyan-400 tracking-wide title-glow">Túi Đồ</h2>
                    <span className="text-sm font-semibold text-slate-300">{unequippedItems.length} vật phẩm</span>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
                {unequippedItems.length > 0 ? (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {unequippedItems.map(item => {
                            const itemDef = getItemDefinition(item.itemId);
                            if (!itemDef) return null;
                            
                            const shadowRarity = getRarityColor(itemDef.rarity).replace('border-', '');
                            const shadowColorStyle = { '--tw-shadow-color': `var(--tw-color-${shadowRarity})` } as React.CSSProperties;

                            return (
                                <div 
                                    key={item.id} 
                                    onClick={() => setItemForAuction(item)} 
                                    className={`relative aspect-square rounded-lg border-2 bg-slate-900/50 flex items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${getRarityColor(itemDef.rarity)}`}
                                    style={shadowColorStyle}
                                >
                                    <img src={itemDef.icon} alt={itemDef.name} className="w-3/4 h-3/4 object-contain" />
                                    <span className="absolute top-0.5 right-0.5 px-1.5 text-[10px] font-bold bg-black/70 text-white rounded-md border border-slate-600">Lv.{item.level}</span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Không có vật phẩm nào để bán.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
// --- END: CreateAuctionView ---

// --- NEW TABS COMPONENT ---
const AuctionTabs = ({ activeTab, setActiveTab }: { activeTab: 'browse' | 'my_auctions' | 'create'; setActiveTab: (tab: 'browse' | 'my_auctions' | 'create') => void; }) => {
    const tabs = [
        { id: 'browse', name: 'Sàn Đấu Giá', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/market-auction.webp' },
        { id: 'my_auctions', name: 'Lịch sử đấu giá', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/history-auction.webp' },
        { id: 'create', name: 'Đăng Bán', icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/sell-icon.webp' },
    ];
    return ( <> <nav className="relative flex items-center gap-2 overflow-x-auto horizontal-scrollbar-hidden px-4 sm:px-6 lg:px-8"> {tabs.map(({ id, name, icon: iconSrc }) => ( <button key={id} onClick={() => setActiveTab(id as any)} className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-t-lg font-medium text-sm transition-colors duration-200 border-b-2 ${ activeTab === id ? 'border-cyan-400 text-white' : 'border-transparent text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' }`} > <img src={iconSrc} alt={name} className="w-5 h-5" /> <span>{name}</span> </button> ))} </nav> <style jsx>{` .horizontal-scrollbar-hidden::-webkit-scrollbar { display: none; } .horizontal-scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; } `}</style> </> );
};
// --- END NEW TABS COMPONENT ---

// --- AuctionHeader Component ---
const AuctionHeader: FC<any> = ({ onClose, userCoins, userGems }) => {
    const animatedCoins = useAnimateValue(userCoins);
    const animatedGems = useAnimateValue(userGems);
    return ( <header className="flex-shrink-0 bg-slate-900 border-b border-white/10 shadow-lg z-10"> <div className="max-w-[1700px] mx-auto flex items-center justify-between h-[52px] px-4"> <div className="flex items-center gap-4"> <HomeButton onClick={onClose} label="" title="Về trang chính" /> <h1 className="text-lg font-bold text-white hidden sm:block">Nhà Đấu Giá</h1> </div> <div className="flex items-center gap-3"> <GemDisplay displayedGems={animatedGems} /> <CoinDisplay displayedCoins={animatedCoins} isStatsFullscreen={false} /> </div> </div> </header> );
};
// --- END AuctionHeader Component ---

export default function AuctionHouse({ onClose }: { onClose: () => void; }) {
    const { coins, gems, ownedItems, equippedItems, refreshUserData } = useGame();
    const user = auth.currentUser;
    const userId = user?.uid;
    const userName = user?.displayName || 'Unknown Player';

    const [activeTab, setActiveTab] = useState<'browse' | 'my_auctions' | 'create'>('browse');
    const [activeAuctions, setActiveAuctions] = useState<AuctionItem[]>([]);
    const [userAuctions, setUserAuctions] = useState<AuctionItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{type: 'error' | 'success', text: string} | null>(null);
    const [selectedAuction, setSelectedAuction] = useState<AuctionItem | null>(null);
    const [biddingOnAuction, setBiddingOnAuction] = useState<AuctionItem | null>(null); // State for new bid modal
    
    useEffect(() => {
        if (!userId) return;

        const unsubActive = listenToActiveAuctions(setActiveAuctions);
        const unsubUser = listenToUserAuctions(userId, setUserAuctions);
        
        const unsubPayments = listenAndProcessPendingPayments(userId, (amount) => {
            console.log(`Successfully received ${amount} coins!`);
            setMessage({ type: 'success', text: `Bạn đã nhận được ${amount.toLocaleString()} vàng.` });
            refreshUserData();
        });

        return () => { 
            unsubActive(); 
            unsubUser();
            unsubPayments();
        };
    }, [userId, refreshUserData]);
    
    useEffect(() => {
        if(message) { const timer = setTimeout(() => setMessage(null), 4000); return () => clearTimeout(timer); }
    }, [message]);

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        setIsLoading(true); setMessage(null);
        try {
            await action();
            setMessage({type: 'success', text: successMsg});
            await refreshUserData();
        } catch (e: any) { setMessage({type: 'error', text: e.message || 'Có lỗi xảy ra.'});
        } finally { setIsLoading(false); }
    };
    
    // Opens the bid modal
    const handleBid = (auction: AuctionItem) => {
        if (!userId) {
            setMessage({ type: 'error', text: 'Bạn phải đăng nhập để đấu giá.' });
            return;
        }
        setBiddingOnAuction(auction);
    };

    // Called from the bid modal to execute the bid
    const handleConfirmBid = (auctionId: string, bidAmount: number) => {
        if (!userId) return;
        handleAction(
            () => placeBidOnAuction(userId, userName, auctionId, bidAmount), 
            "Đặt giá thành công!"
        );
        setBiddingOnAuction(null); // Close modal after action
    };


    if (!userId) return <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"> <div className="bg-slate-800 p-8 rounded-lg text-white text-center border border-red-500"> <p className="text-lg">Lỗi: Không tìm thấy người dùng.</p> <p className="text-sm text-slate-400">Vui lòng đăng nhập lại và thử lại.</p> <button onClick={onClose} className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-bold transition-colors">Đóng</button> </div> </div>;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
            <style>{`.title-glow { text-shadow: 0 0 8px rgba(107, 229, 255, 0.7); }`}</style>
            {isLoading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[101]"><div className="text-white text-xl animate-pulse">Đang xử lý...</div></div>}
            
            {selectedAuction && <ViewAuctionDetailModal auction={selectedAuction} onClose={() => setSelectedAuction(null)} userId={userId} />}
            {biddingOnAuction && (
                <BidModal 
                    auction={biddingOnAuction}
                    onClose={() => setBiddingOnAuction(null)}
                    onPlaceBid={(amount) => handleConfirmBid(biddingOnAuction.id, amount)}
                    userCoins={coins}
                    isProcessing={isLoading}
                />
            )}

            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-[#110f21] flex flex-col">
                <AuctionHeader onClose={onClose} userCoins={coins} userGems={gems} />
                
                <div className="flex-shrink-0 bg-[#0a0a14] border-b border-slate-800/70 shadow-md">
                    <div className="max-w-[1700px] mx-auto pt-2">
                         <AuctionTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                </div>

                <main className="flex-1 min-h-0 overflow-y-auto p-4 lg:p-6 relative">
                    {message && <div className={`absolute top-4 left-1/2 -translate-x-1/2 p-3 rounded-lg text-white font-bold text-sm shadow-lg z-50 animate-pulse ${message.type === 'error' ? 'bg-red-600/90' : 'bg-green-600/90'}`}>{message.text}</div>}
                    
                    {activeTab === 'browse' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {activeAuctions.length > 0 ? activeAuctions.map(auction => (
                                <AuctionCard key={auction.id} auction={auction} userId={userId} 
                                    onBid={handleBid}
                                    onClaim={a => handleAction(() => claimAuctionWin(userId, a.id), "Nhận vật phẩm thành công!")}
                                    onReclaim={a => handleAction(() => reclaimExpiredAuction(userId, a.id), "Nhận lại vật phẩm thành công!")}
                                    onViewDetails={setSelectedAuction} />
                            )) : <p className="text-slate-500 col-span-full text-center mt-10">Sàn đấu giá hiện đang trống.</p>}
                        </div>
                    )}
                    {activeTab === 'my_auctions' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            {userAuctions.length > 0 ? userAuctions.map(auction => (
                                <AuctionCard key={auction.id} auction={auction} userId={userId} 
                                    onBid={handleBid}
                                    onClaim={a => handleAction(() => claimAuctionWin(userId, a.id), "Nhận vật phẩm thành công!")}
                                    onReclaim={a => handleAction(() => reclaimExpiredAuction(userId, a.id), "Nhận lại vật phẩm thành công!")}
                                    onViewDetails={setSelectedAuction} />
                            )) : <p className="text-slate-500 col-span-full text-center mt-10">Bạn chưa có hoạt động đấu giá nào.</p>}
                        </div>
                    )}
                     {activeTab === 'create' && (
                        <CreateAuctionView 
                           ownedItems={ownedItems}
                           equippedItems={equippedItems}
                           onList={(item, price, duration) => handleAction(() => listAuctionItem(userId, userName, item, price, null, duration), "Đăng bán thành công!")}
                           isProcessing={isLoading}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
