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
        <header className="flex-shrink-0 w-full bg-slate-900 border-b border-slate-700 z-20 relative">
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
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-600 px-5 py-2 rounded-full mx-auto w-fit mb-4 animate-fadeIn">
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

// --- NUMPAD MODAL COMPONENT (Bàn phím ảo) ---
interface NumpadModalProps {
    isOpen: boolean;
    initialValue: number;
    maxValue: number;
    title: string;
    onClose: () => void;
    onConfirm: (value: number) => void;
}

const NumpadModal = ({ isOpen, initialValue, maxValue, title, onClose, onConfirm }: NumpadModalProps) => {
    const [displayValue, setDisplayValue] = useState(initialValue.toString());

    useEffect(() => {
        if (isOpen) {
            setDisplayValue(initialValue > 0 ? initialValue.toString() : "");
        }
    }, [isOpen, initialValue]);

    if (!isOpen) return null;

    const handleNumberClick = (num: number) => {
        setDisplayValue(prev => {
            if (prev === "0") return num.toString();
            const next = prev + num.toString();
            // Prevent crazy long numbers
            if (next.length > 9) return prev;
            return next;
        });
    };

    const handleBackspace = () => {
        setDisplayValue(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setDisplayValue("");
    };

    const handleMax = () => {
        setDisplayValue(maxValue.toString());
    };

    const handleConfirm = () => {
        const val = parseInt(displayValue);
        if (isNaN(val) || val <= 0) {
            onConfirm(1);
        } else {
            onConfirm(val);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 animate-fadeIn backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-600 rounded-2xl w-full max-w-[320px] shadow-2xl overflow-hidden animate-zoom-in">
                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <span className="text-slate-300 font-lilita tracking-wide uppercase text-sm">{title}</span>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Display Area */}
                <div className="p-4 bg-black/40">
                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-right h-16 flex items-center justify-end">
                        <span className="text-3xl font-lilita text-amber-400 tracking-wider">
                            {displayValue || "0"}
                        </span>
                    </div>
                    <div className="text-right text-xs text-slate-500 mt-1 mr-1">
                        Max Possible: {formatNumber(maxValue)}
                    </div>
                </div>

                {/* Keypad Grid */}
                <div className="grid grid-cols-4 gap-2 p-4 bg-slate-900 select-none">
                    {[1, 2, 3].map(n => (
                        <button key={n} onClick={() => handleNumberClick(n)} className="h-14 bg-slate-800 hover:bg-slate-700 rounded-lg text-xl font-bold text-slate-200 shadow-sm active:translate-y-0.5 transition-all">{n}</button>
                    ))}
                    <button onClick={handleMax} className="h-14 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-800/50 text-amber-500 rounded-lg text-xs font-bold uppercase tracking-wider">Max</button>

                    {[4, 5, 6].map(n => (
                        <button key={n} onClick={() => handleNumberClick(n)} className="h-14 bg-slate-800 hover:bg-slate-700 rounded-lg text-xl font-bold text-slate-200 shadow-sm active:translate-y-0.5 transition-all">{n}</button>
                    ))}
                    <button onClick={handleClear} className="h-14 bg-red-950/40 hover:bg-red-950/60 text-red-400 rounded-lg text-sm font-bold uppercase">C</button>

                    {[7, 8, 9].map(n => (
                        <button key={n} onClick={() => handleNumberClick(n)} className="h-14 bg-slate-800 hover:bg-slate-700 rounded-lg text-xl font-bold text-slate-200 shadow-sm active:translate-y-0.5 transition-all">{n}</button>
                    ))}
                    <button onClick={handleBackspace} className="h-14 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12l-2.25 2.25m-4.28 4.28a2.25 2.25 0 01-3.18 0L2.98 12.02a2.25 2.25 0 010-3.18l6.76-6.76a2.25 2.25 0 013.18 0l6.76 6.76a2.25 2.25 0 010 3.18l-6.76 6.76z" />
                        </svg>
                    </button>

                    <button onClick={() => handleNumberClick(0)} className="col-span-2 h-14 bg-slate-800 hover:bg-slate-700 rounded-lg text-xl font-bold text-slate-200 shadow-sm active:translate-y-0.5 transition-all">0</button>
                    <button onClick={handleConfirm} className="col-span-2 h-14 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xl font-bold text-white shadow-md shadow-emerald-900/50 active:translate-y-0.5 transition-all">OK</button>
                </div>
            </div>
        </div>
    );
};

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
    onSetMax: (id: string, maxVal: number) => void;
    onExchange: (option: TradeOption, qty: number) => void;
    isProcessing: boolean;
}

const TradeOptionCard = memo(({ 
    option, 
    quantity, 
    resources, 
    onQuantityChange, 
    onOpenNumpad,
    onSetMax,
    onExchange, 
    isProcessing 
}: TradeCardProps) => {
    
    // Internal state for "Step" multiplier (1, 10, 100, 1000)
    const [step, setStep] = useState(1);

    let canAffordAll = true;

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

    return (
        <div className="relative bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center gap-2 lg:gap-6">
                
                {/* INGREDIENTS */}
                <div className="flex-1 w-full flex items-center justify-center lg:justify-start gap-4 md:gap-6 bg-black/20 p-5 rounded-2xl border border-slate-800">
                    {option.ingredients.map((ing, idx) => {
                        const userHas = resources[ing.type] || 0;
                        const requiredAmount = ing.amount * quantity;
                        const isEnough = userHas >= requiredAmount;
                        if (!isEnough) canAffordAll = false;

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
                <div className="flex-1 w-full flex flex-col items-center justify-center gap-4 bg-black/20 p-5 rounded-2xl border border-slate-800">
                    
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
                            {/* Minus Button uses Step */}
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
                            
                            {/* Plus Button uses Step */}
                            <button 
                                onClick={() => onQuantityChange(option.id, step)}
                                className="w-10 h-10 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-slate-200 shrink-0 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        </div>

                        {/* Step Select Buttons + Max */}
                        <div className="flex gap-1 justify-between">
                            <StepSelectBtn label="x1" isSelected={step === 1} onClick={() => setStep(1)} />
                            <StepSelectBtn label="x10" isSelected={step === 10} onClick={() => setStep(10)} />
                            <StepSelectBtn label="x100" isSelected={step === 100} onClick={() => setStep(100)} />
                            <StepSelectBtn label="x1k" isSelected={step === 1000} onClick={() => setStep(1000)} />
                            
                            {/* Max Button */}
                            <button
                                onClick={() => onSetMax(option.id, maxAffordable)}
                                disabled={maxAffordable === 0}
                                className={`
                                    px-2 py-1 text-[10px] sm:text-xs font-bold rounded border transition-colors flex-1
                                    ${maxAffordable === 0 
                                        ? 'bg-slate-800 border-slate-700 text-slate-600' 
                                        : 'bg-indigo-900 border-indigo-700 text-indigo-200 hover:bg-indigo-800 hover:text-white'
                                    }
                                `}
                            >
                                MAX
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

    // Handle Max Button Click
    const handleSetMax = useCallback((optionId: string, maxVal: number) => {
        const val = Math.max(1, maxVal);
        handleSetQuantity(optionId, val);
    }, [handleSetQuantity]);

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
            
            {/* BACKGROUND */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={tradeAssets.background} 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-30" 
                />
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
                                onSetMax={handleSetMax}
                                onExchange={handleExchange}
                                isProcessing={isProcessing}
                            />
                        ))}
                    </div>
                </div>
            </div>
            
            {/* NUMPAD OVERLAY (Rendered once at root of Modal) */}
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
