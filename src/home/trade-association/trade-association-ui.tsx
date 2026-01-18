// --- START OF FILE trade-association-modal.tsx ---

import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { 
    equipmentUiAssets, 
    resourceAssets, 
    uiAssets, 
    upgradeAssets, 
    tradeAssets 
} from '../game-assets.ts';
import { useGame } from '../GameContext.tsx';
import { auth } from '../firebase.js';
import HomeButton from '../ui/home-button.tsx'; 
import CoinDisplay from '../ui/display/coin-display.tsx'; 
import RateLimitToast from '../ui/notification.tsx'; 

// Import Service và Types từ file mới
import { 
    getTradeOptions, 
    executeTradeTransaction, 
    TradeOption, 
    ResourceType 
} from './trade-service.ts';

// --- IMAGE ICONS (UI Only) ---
const ResourceIcon = ({ type, className = "w-6 h-6" }: { type: ResourceType, className?: string }) => {
    let src = "";
    switch (type) {
        case 'wood': src = resourceAssets.wood; break;
        case 'leather': src = resourceAssets.leather; break;
        case 'ore': src = resourceAssets.ore; break;
        case 'cloth': src = resourceAssets.cloth; break;
        case 'feather': src = resourceAssets.feather; break;
        case 'coal': src = resourceAssets.coal; break;
        default: return null;
    }
    return <img src={src} alt={type} className={`${className} object-contain`} />;
};

const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => (
    <img src={equipmentUiAssets.equipmentPieceIcon} alt="Piece" className={className} />
);

const AncientBookIcon = ({ className = '' }: { className?: string }) => (
    <img src={uiAssets.bookIcon} alt="Book" className={className} />
);

const StoneIcon = ({ tier, className = '' }: { tier?: 'low' | 'medium' | 'high', className?: string }) => {
    let url = upgradeAssets.stoneBasic;
    if (tier === 'medium') url = upgradeAssets.stoneIntermediate;
    if (tier === 'high') url = upgradeAssets.stoneAdvanced;
    
    return <img src={url} alt={`${tier} Stone`} className={className} />;
};

// --- COMPONENT HEADER ---
const Header = memo(({ onClose, displayedCoins }: { onClose: () => void, displayedCoins: number }) => {
    return (
        <header className="flex-shrink-0 w-full bg-slate-900/90 border-b-2 border-slate-700/50 z-20 relative">
            <div className="w-full max-w-5xl mx-auto flex justify-between items-center py-3 px-4 sm:px-6">
                <HomeButton onClick={onClose} />
                <div className="flex items-center">
                    <CoinDisplay displayedCoins={displayedCoins} isStatsFullscreen={false} />
                </div>
            </div>
        </header>
    );
});

// --- MARKET TIMER COMPONENT ---
const MarketTimer = () => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const vnNowString = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
            const vnNow = new Date(vnNowString);

            const vnTomorrow = new Date(vnNow);
            vnTomorrow.setDate(vnTomorrow.getDate() + 1);
            vnTomorrow.setHours(0, 0, 0, 0);

            const diff = vnTomorrow.getTime() - vnNow.getTime();

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm border border-white/30 px-5 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.1)] mx-auto w-fit mb-4 animate-fadeIn">
            <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <div className="text-sm uppercase tracking-widest text-slate-400 font-lilita">Market Reset</div>
            <div className="font-lilita text-2xl text-amber-100 tabular-nums tracking-widest min-w-[100px] text-center">
                {timeLeft}
            </div>
        </div>
    );
};

interface TradeAssociationModalV2Props {
    isOpen: boolean;
    onClose: () => void;
}

// --- MAIN COMPONENT ---
const TradeAssociationModalV2 = memo(({ isOpen, onClose }: TradeAssociationModalV2Props) => {
    const { 
        wood, leather, ore, cloth, feather, coal,
        refreshUserData,
        displayedCoins
    } = useGame();

    const [isProcessing, setIsProcessing] = useState(false);
    
    const [toastState, setToastState] = useState<{ show: boolean, message: string }>({ 
        show: false, 
        message: '' 
    });
    
    const [tradeQuantities, setTradeQuantities] = useState<Record<string, number>>({});

    const resources: Record<ResourceType, number> = { wood, leather, ore, cloth, feather, coal };

    // --- LOAD TRADE OPTIONS FROM SERVICE ---
    const currentTradeOptions = useMemo(() => getTradeOptions(), []); 

    const getQuantity = (optionId: string) => tradeQuantities[optionId] || 1;

    const handleQuantityChange = (optionId: string, change: number) => {
        setTradeQuantities(prev => {
            const current = prev[optionId] || 1;
            const newVal = current + change;
            if (newVal < 1) return prev;
            if (newVal > 99) return prev;
            return { ...prev, [optionId]: newVal };
        });
    };

    const handleExchange = useCallback(async (option: TradeOption, quantity: number) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            setToastState({ show: true, message: "User not authenticated!" });
            return;
        }
        if (isProcessing) return;

        setIsProcessing(true);
        setToastState(prev => ({ ...prev, show: false }));

        try {
            // A. Client-side Validation (Kiểm tra nhanh trên UI)
            for (const ing of option.ingredients) {
                const totalRequired = ing.amount * quantity;
                if ((resources[ing.type] || 0) < totalRequired) {
                    throw new Error(`Insufficient ${ing.name}! Need ${totalRequired}.`);
                }
            }

            // B. Call Service Transaction
            await executeTradeTransaction(userId, option, quantity);

            setToastState({ show: true, message: 'Exchange successful!' });
            
            await refreshUserData();
            setTradeQuantities(prev => ({ ...prev, [option.id]: 1 }));

        } catch (error: any) {
            console.error("Trade Error:", error);
            setToastState({ show: true, message: error.message || "Transaction failed." });
        } finally {
            setIsProcessing(false);
            setTimeout(() => setToastState(prev => ({ ...prev, show: false })), 3000);
        }
    }, [resources, refreshUserData, isProcessing]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] text-slate-200 flex flex-col overflow-hidden animate-zoom-in font-sans">
            
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={tradeAssets.background} 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/80" />
            </div>

            <Header onClose={onClose} displayedCoins={displayedCoins} />

            <div className="flex-1 overflow-y-auto hide-scrollbar relative z-10">
                
                <div className="relative p-4 md:p-10 min-h-full max-w-5xl mx-auto flex flex-col">
                    
                    <MarketTimer />

                    <RateLimitToast 
                        show={toastState.show} 
                        message={toastState.message}
                        showIcon={false} 
                        className="fixed top-20 right-4 z-[120]"
                    />

                    <div className="space-y-6 md:space-y-8 flex-1 pb-10 mt-2">
                        
                        {currentTradeOptions.map((option) => {
                            const quantity = getQuantity(option.id);
                            let canAffordAll = true;
                            
                            return (
                                <div key={option.id} className="relative group bg-slate-900/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:bg-slate-900/90 hover:-translate-y-1">

                                    <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center gap-2 lg:gap-6">
                                        
                                        {/* INGREDIENTS */}
                                        <div className="flex-1 w-full flex items-center justify-center lg:justify-start gap-4 md:gap-6 bg-black/20 p-5 rounded-2xl border border-slate-800/50 shadow-inner">
                                            {option.ingredients.map((ing, idx) => {
                                                const userHas = resources[ing.type] || 0;
                                                const requiredAmount = ing.amount * quantity;
                                                const isEnough = userHas >= requiredAmount;
                                                if (!isEnough) canAffordAll = false;

                                                return (
                                                    <React.Fragment key={ing.type}>
                                                        <div className="flex flex-col items-center gap-3 min-w-[80px]">
                                                            
                                                            <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isEnough ? 'bg-slate-800 border-slate-700' : 'bg-red-950/20 border-red-900/50'}`}>
                                                                <ResourceIcon type={ing.type} className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />
                                                            </div>
                                                            <div className="text-xs md:text-sm font-mono font-bold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                                                <span className={isEnough ? "text-emerald-400" : "text-red-500"}>
                                                                    {userHas > 999 ? '999+' : userHas}
                                                                </span>
                                                                <span className="text-slate-500 ml-1">/ {requiredAmount}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {idx < option.ingredients.length - 1 && (
                                                            <div className="shrink-0 flex items-center justify-center px-1 -translate-y-4 md:-translate-y-6">
                                                                <img 
                                                                    src={tradeAssets.plusIcon}
                                                                    alt="plus"
                                                                    className="w-10 h-10 md:w-14 md:h-14 object-contain opacity-90"
                                                                />
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>

                                        {/* ARROW */}
                                        <div className="shrink-0 flex items-center justify-center">
                                            <img 
                                                src={tradeAssets.arrowIcon} 
                                                alt="Convert to"
                                                className="w-14 h-14 md:w-20 md:h-20 object-contain opacity-90 lg:-rotate-90"
                                            />
                                        </div>

                                        {/* RESULT */}
                                        <div className="flex-1 w-full flex flex-col items-center justify-center gap-5 bg-black/20 p-5 rounded-2xl border border-slate-800/50 shadow-inner">
                                            
                                            <div className="relative group-hover:scale-105 transition-transform duration-500">
                                                <div className="relative p-4 rounded-xl border-2 bg-slate-800 border-slate-700 shadow-lg">
                                                    {option.receiveType === 'equipmentPiece' ? (
                                                        <EquipmentPieceIcon className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl relative z-10 object-contain" />
                                                    ) : option.receiveType === 'stone' ? (
                                                        <StoneIcon tier={option.receiveSubType} className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl relative z-10 object-contain" />
                                                    ) : (
                                                        <AncientBookIcon className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl relative z-10 object-contain" />
                                                    )}
                                                    <div className="absolute -top-3 -right-3 bg-black/50 text-white text-[11px] font-bold px-2 py-1 rounded-full border border-slate-600 shadow-lg z-20">
                                                        x{option.receiveAmount * quantity}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-center gap-3 w-full max-w-[140px] bg-slate-900/50 p-1.5 rounded-lg border border-slate-700">
                                                <button 
                                                    onClick={() => handleQuantityChange(option.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-slate-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                    </svg>
                                                </button>
                                                <span className="flex-1 text-center font-bold font-lilita text-xl text-amber-500">{quantity}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(option.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-slate-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleExchange(option, quantity)}
                                                disabled={!canAffordAll || isProcessing}
                                                className={`
                                                    w-full max-w-[200px] py-2 px-4 rounded-xl font-lilita text-lg uppercase tracking-wider shadow-md transition-all duration-200
                                                    flex items-center justify-center gap-2 transform active:scale-95
                                                    ${canAffordAll 
                                                        ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-emerald-900/30' 
                                                        : 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed opacity-70'
                                                    }
                                                `}
                                            >
                                                {isProcessing ? 'Processing...' : 'Exchange'}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-zoom-in {
                    animation: zoomIn 0.2s ease-out forwards;
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
});

export default TradeAssociationModalV2;
