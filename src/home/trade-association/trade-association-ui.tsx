// --- START OF FILE trade-association-ui.tsx ---

import React, { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { 
    equipmentUiAssets, 
    resourceAssets, 
    uiAssets, 
    upgradeAssets, 
    tradeAssets 
} from '../../game-assets.ts';
import { useGame } from '../../GameContext.tsx';
import { auth } from '../../firebase.js';
import HomeButton from '../../ui/home-button.tsx'; 
import CoinDisplay from '../../ui/display/coin-display.tsx'; 
import RateLimitToast from '../../ui/notification.tsx'; 

// Import Numpad từ file riêng
import NumpadModal from './numpad-modal.tsx';

// Import Service và Types từ file service
import { 
    getTradeOptions, 
    executeTradeTransaction, 
    TradeOption, 
    ResourceType 
} from './trade-service.ts';

// --- UTILS: NUMBER FORMATTING ---
const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'b';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
};

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
        // Changed bg-slate-900 to bg-slate-900/80 for transparency
        <header className="flex-shrink-0 w-full bg-slate-900/80 border-b border-slate-700/50 backdrop-blur-sm z-20 relative">
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
const MarketTimer = memo(() => {
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
        // Changed bg-slate-900 to bg-slate-900/80 for transparency
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-600/50 px-5 py-2 rounded-full mx-auto w-fit mb-4 animate-fadeIn backdrop-blur-sm">
            <div className="relative flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <div className="text-sm uppercase tracking-widest text-slate-400 font-lilita">Market Reset</div>
            <div className="font-lilita text-2xl text-amber-100 tabular-nums tracking-widest min-w-[100px] text-center">
                {timeLeft}
            </div>
        </div>
    );
});

// --- HELPER COMPONENT: STEP SELECT BUTTON ---
const StepSelectBtn = ({ label, isSelected, onClick }: { label: string, isSelected: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`
            px-1 py-1 text-[10px] sm:text-xs font-bold rounded border transition-all duration-200 flex-1
            ${isSelected 
                ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/50 scale-105 z-10' 
                : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }
        `}
    >
        {label}
    </button>
);

// --- SUB-COMPONENT: TRADE OPTION CARD ---
interface TradeCardProps {
    option: TradeOption;
    quantity: number;
    resources: Record<string, number>;
    onQuantityChange: (id: string, delta: number) => void;
    onOpenNumpad: (id: string, currentVal: number, maxVal: number) => void; 
    onSetQuantity: (id: string, value: number) => void;
    onExchange: (option: TradeOption, qty: number) => void;
    isProcessing: boolean;
}

const TradeOptionCard = memo(({ 
    option, 
    quantity, 
    resources, 
    onQuantityChange, 
    onOpenNumpad,
    onSetQuantity,
    onExchange, 
    isProcessing 
}: TradeCardProps) => {
    
    // Calculate maximum possible trade based on ingredients
    const maxAffordable = useMemo(() => {
        let max = Infinity;
        option.ingredients.forEach(ing => {
            const userHas = resources[ing.type] || 0;
            const cost = ing.amount;
            if (cost === 0) return; 
            const possible = Math.floor(userHas / cost);
            if (possible < max) max = possible;
        });
        return max === Infinity ? 0 : max;
    }, [option.ingredients, resources]);

    // --- DYNAMIC STEPS LOGIC ---
    // Calculate which steps to show based on maxAffordable
    const dynamicSteps = useMemo(() => {
        if (maxAffordable < 100) return [1, 10];
        if (maxAffordable < 1000) return [10, 100];
        if (maxAffordable < 10000) return [100, 1000];
        return [1000, 10000];
    }, [maxAffordable]);

    // Current Step State (default to the first available dynamic step if current step is weird, else keep 1)
    const [step, setStep] = useState(dynamicSteps[0]);

    // Update step if the dynamic range changes drastically and current step becomes too small
    useEffect(() => {
        if (!dynamicSteps.includes(step)) {
            setStep(dynamicSteps[0]);
        }
    }, [dynamicSteps]);

    let canAffordAll = true;
    option.ingredients.forEach(ing => {
        if ((resources[ing.type] || 0) < ing.amount * quantity) canAffordAll = false;
    });

    return (
        // Changed bg-slate-900 to bg-slate-900/80 for transparency
        <div className="relative bg-slate-900/80 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center gap-2 lg:gap-6">
                
                {/* INGREDIENTS */}
                <div className="flex-1 w-full flex items-center justify-center lg:justify-start gap-4 md:gap-6 bg-black/20 p-5 rounded-2xl border border-slate-800/50">
                    {option.ingredients.map((ing, idx) => {
                        const userHas = resources[ing.type] || 0;
                        const requiredAmount = ing.amount * quantity;
                        const isEnough = userHas >= requiredAmount;
                        
                        return (
                            <React.Fragment key={ing.type}>
                                <div className="flex flex-col items-center gap-3 min-w-[80px]">
                                    <div className={`relative p-3 rounded-xl border transition-colors ${isEnough ? 'bg-slate-800 border-slate-600' : 'bg-red-950/30 border-red-900'}`}>
                                        <ResourceIcon type={ing.type} className="w-14 h-14 md:w-16 md:h-16" />
                                    </div>
                                    
                                    <div className="text-xs md:text-sm font-mono font-bold bg-black/40 px-3 py-1 rounded-full border border-white/5 whitespace-nowrap">
                                        <span className={isEnough ? "text-emerald-400" : "text-red-500"}>
                                            {formatNumber(userHas)}
                                        </span>
                                        <span className="text-slate-500 ml-1">/ {formatNumber(requiredAmount)}</span>
                                    </div>
                                </div>
                                
                                {idx < option.ingredients.length - 1 && (
                                    <div className="shrink-0 flex items-center justify-center px-1 -translate-y-4 md:-translate-y-6">
                                        <img 
                                            src={tradeAssets.plusIcon}
                                            alt="plus"
                                            className="w-8 h-8 md:w-10 md:h-10 object-contain opacity-70"
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
                        className="w-10 h-10 md:w-14 md:h-14 object-contain opacity-70 lg:-rotate-90"
                    />
                </div>

                {/* RESULT & CONTROLS */}
                <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 bg-black/20 p-5 rounded-2xl border border-slate-800/50">
                    
                    {/* Item Icon */}
                    <div className="relative">
                        <div className="relative p-3 rounded-xl border bg-slate-800 border-slate-600">
                            {option.receiveType === 'equipmentPiece' ? (
                                <EquipmentPieceIcon className="w-14 h-14 md:w-16 md:h-16 object-contain" />
                            ) : option.receiveType === 'stone' ? (
                                <StoneIcon tier={option.receiveSubType} className="w-14 h-14 md:w-16 md:h-16 object-contain" />
                            ) : (
                                <AncientBookIcon className="w-14 h-14 md:w-16 md:h-16 object-contain" />
                            )}
                            <div className="absolute -top-3 -right-3 bg-slate-700 text-white text-[11px] font-bold px-2 py-1 rounded-full border border-slate-500 z-20">
                                x{formatNumber(option.receiveAmount * quantity)}
                            </div>
                        </div>
                    </div>

                    {/* Quantity Controls Container */}
                    <div className="w-full max-w-[250px] space-y-2">
                        
                        {/* +/- and Display Row */}
                        <div className="flex items-center justify-center gap-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700">
                            <button 
                                onClick={() => onQuantityChange(option.id, -step)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-slate-200 shrink-0 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                </svg>
                            </button>
                            
                            {/* Read-only Display Trigger (Opens Numpad) */}
                            <div 
                                onClick={() => onOpenNumpad(option.id, quantity, maxAffordable)}
                                className="flex-1 bg-black/40 h-10 flex items-center justify-center rounded border border-slate-700 cursor-pointer hover:border-slate-500 active:bg-black/60 transition-colors select-none"
                            >
                                <span className="font-lilita text-xl text-amber-500">
                                    {quantity}
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => onQuantityChange(option.id, step)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-slate-200 shrink-0 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        </div>

                        {/* SMART BUTTONS: Min | Step 1 | Step 2 | Max */}
                        <div className="flex gap-1 justify-between">
                            {/* MIN Button */}
                            <button
                                onClick={() => onSetQuantity(option.id, 1)}
                                className="px-2 py-1 text-[10px] sm:text-xs font-bold rounded border transition-colors flex-1 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                            >
                                Min
                            </button>

                            {/* Dynamic Step 1 */}
                            <StepSelectBtn 
                                label={`x${formatNumber(dynamicSteps[0])}`} 
                                isSelected={step === dynamicSteps[0]} 
                                onClick={() => setStep(dynamicSteps[0])} 
                            />

                            {/* Dynamic Step 2 */}
                            <StepSelectBtn 
                                label={`x${formatNumber(dynamicSteps[1])}`} 
                                isSelected={step === dynamicSteps[1]} 
                                onClick={() => setStep(dynamicSteps[1])} 
                            />
                            
                            {/* MAX Button */}
                            <button
                                onClick={() => onSetQuantity(option.id, Math.max(1, maxAffordable))}
                                disabled={maxAffordable === 0}
                                className={`
                                    px-2 py-1 text-[10px] sm:text-xs font-bold rounded border transition-colors flex-1
                                    ${maxAffordable === 0 
                                        ? 'bg-slate-800 border-slate-700 text-slate-600' 
                                        : 'bg-indigo-900 border-indigo-700 text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                    }
                                `}
                            >
                                Max
                            </button>
                        </div>
                    </div>

                    {/* Exchange Button */}
                    <button
                        onClick={() => onExchange(option, quantity)}
                        disabled={!canAffordAll || isProcessing || quantity <= 0}
                        className={`
                            w-full max-w-[250px] py-2 px-4 rounded-xl font-lilita text-lg uppercase tracking-wider transition-transform duration-100
                            flex items-center justify-center gap-2 active:scale-95 border mt-1
                            ${canAffordAll && quantity > 0
                                ? 'bg-emerald-700 border-emerald-600 text-white hover:bg-emerald-600' 
                                : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'
                            }
                        `}
                    >
                        {isProcessing ? 'Processing...' : 'Exchange'}
                    </button>
                </div>
            </div>
        </div>
    );
});


// --- MAIN COMPONENT ---
interface TradeAssociationModalV2Props {
    isOpen: boolean;
    onClose: () => void;
}

const TradeAssociationModalV2 = memo(({ isOpen, onClose }: TradeAssociationModalV2Props) => {
    const { 
        wood, leather, ore, cloth, feather, coal,
        refreshUserData,
        displayedCoins
    } = useGame();

    const [isProcessing, setIsProcessing] = useState(false);
    
    // Toast State
    const [toastState, setToastState] = useState<{ show: boolean, message: string }>({ 
        show: false, 
        message: '' 
    });
    
    // Trade Quantities Map
    const [tradeQuantities, setTradeQuantities] = useState<Record<string, number>>({});

    // Numpad State
    const [numpadState, setNumpadState] = useState<{
        isOpen: boolean;
        optionId: string | null;
        currentValue: number;
        maxValue: number;
    }>({
        isOpen: false,
        optionId: null,
        currentValue: 1,
        maxValue: 999
    });

    const resources = useMemo(() => ({
        wood, leather, ore, cloth, feather, coal
    }), [wood, leather, ore, cloth, feather, coal]);

    const currentTradeOptions = useMemo(() => getTradeOptions(), []); 

    const getQuantity = useCallback((optionId: string) => tradeQuantities[optionId] || 1, [tradeQuantities]);

    // Update quantity based on delta (+/- step)
    const handleQuantityChange = useCallback((optionId: string, delta: number) => {
        setTradeQuantities(prev => {
            const current = prev[optionId] || 1;
            const newVal = current + delta;
            if (newVal < 1) return { ...prev, [optionId]: 1 };
            return { ...prev, [optionId]: newVal };
        });
    }, []);

    // Directly set quantity (from Max or Numpad)
    const handleSetQuantity = useCallback((optionId: string, value: number) => {
        setTradeQuantities(prev => ({
            ...prev,
            [optionId]: value < 1 ? 1 : value
        }));
    }, []);

    // Open Numpad logic
    const handleOpenNumpad = useCallback((optionId: string, currentVal: number, maxVal: number) => {
        setNumpadState({
            isOpen: true,
            optionId,
            currentValue: currentVal,
            maxValue: maxVal
        });
    }, []);

    // Close Numpad logic
    const handleCloseNumpad = useCallback(() => {
        setNumpadState(prev => ({ ...prev, isOpen: false }));
    }, []);

    // Confirm Numpad logic
    const handleConfirmNumpad = useCallback((value: number) => {
        if (numpadState.optionId) {
            handleSetQuantity(numpadState.optionId, value);
        }
    }, [numpadState.optionId, handleSetQuantity]);

    // Transaction Execution
    const handleExchange = useCallback(async (option: TradeOption, quantity: number) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            setToastState({ show: true, message: "User not authenticated!" });
            return;
        }
        if (isProcessing) return;
        if (quantity <= 0) return;

        setIsProcessing(true);
        setToastState(prev => ({ ...prev, show: false }));

        try {
            // Client-side Validation
            for (const ing of option.ingredients) {
                const totalRequired = ing.amount * quantity;
                if ((resources[ing.type] || 0) < totalRequired) {
                    throw new Error(`Insufficient ${ing.name}! Need ${totalRequired}.`);
                }
            }

            await executeTradeTransaction(userId, option, quantity);

            setToastState({ show: true, message: 'Exchange Successful!' });
            
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
        <div className="fixed inset-0 z-[110] text-slate-200 flex flex-col overflow-hidden animate-zoom-in font-sans bg-black">
            
            {/* BACKGROUND + OVERLAY (40% Black) */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={tradeAssets.background} 
                    alt="Background" 
                    className="w-full h-full object-cover" 
                />
                {/* 40% Black Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>
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
                        {currentTradeOptions.map((option) => (
                            <TradeOptionCard 
                                key={option.id}
                                option={option}
                                quantity={getQuantity(option.id)}
                                resources={resources}
                                onQuantityChange={handleQuantityChange}
                                onOpenNumpad={handleOpenNumpad}
                                onSetQuantity={handleSetQuantity}
                                onExchange={handleExchange}
                                isProcessing={isProcessing}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* NUMPAD OVERLAY (Sử dụng component import từ file riêng) */}
            <NumpadModal 
                isOpen={numpadState.isOpen}
                initialValue={numpadState.currentValue}
                maxValue={numpadState.maxValue}
                title="Enter Quantity"
                onClose={handleCloseNumpad}
                onConfirm={handleConfirmNumpad}
            />

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
