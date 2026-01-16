import React, { memo, useState, useCallback } from 'react';
import { equipmentUiAssets } from '../game-assets.ts';
import { useGame } from '../GameContext.tsx';
import { doc, runTransaction } from 'firebase/firestore';
import { db, auth } from '../firebase.js';
import HomeButton from '../ui/home-button.tsx'; 
import CoinDisplay from '../ui/display/coin-display.tsx'; 

// --- DEFINITION TYPES ---
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth';

export interface TradeIngredient {
    type: ResourceType;
    name: string;
    amount: number; // Base amount required for 1 unit
}

export interface TradeOption {
    id: string;
    title: string;
    ingredients: TradeIngredient[];
    receiveType: 'equipmentPiece';
    receiveAmount: number; // Base amount received for 1 exchange
    description?: string;
}

// --- TRADE OPTIONS CONFIGURATION ---
const TRADE_OPTIONS: TradeOption[] = [
    { 
        id: 'combine_wood_leather', 
        title: "Hunter's Supply",
        description: 'Crafted from natural materials',
        ingredients: [
            { type: 'wood', name: 'Wood', amount: 10 },
            { type: 'leather', name: 'Leather', amount: 10 }
        ],
        receiveType: 'equipmentPiece', 
        receiveAmount: 1
    },
    { 
        id: 'combine_ore_cloth', 
        title: "Warrior's Supply",
        description: 'Crafted from minerals and fabrics',
        ingredients: [
            { type: 'ore', name: 'Ore', amount: 10 },
            { type: 'cloth', name: 'Cloth', amount: 10 }
        ],
        receiveType: 'equipmentPiece', 
        receiveAmount: 1
    },
];

// --- IMAGE ICONS ---
const ResourceIcon = ({ type, className = "w-6 h-6" }: { type: ResourceType, className?: string }) => {
    switch (type) {
        case 'wood': 
            return ( 
                <img 
                    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/wood.webp" 
                    alt="Wood" 
                    className={`${className} object-contain`} 
                /> 
            );
        case 'leather': 
            return ( 
                <img 
                    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/leather.webp" 
                    alt="Leather" 
                    className={`${className} object-contain`} 
                /> 
            );
        case 'ore': 
            return ( 
                <img 
                    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/ore.webp" 
                    alt="Ore" 
                    className={`${className} object-contain`} 
                /> 
            );
        case 'cloth': 
            return ( 
                <img 
                    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/cloth.webp" 
                    alt="Cloth" 
                    className={`${className} object-contain`} 
                /> 
            );
        default: return null;
    }
};

const EquipmentPieceIcon = ({ className = '' }: { className?: string }) => (
    <img src={equipmentUiAssets.equipmentPieceIcon} alt="Piece" className={className} />
);

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

interface TradeAssociationModalV2Props {
    isOpen: boolean;
    onClose: () => void;
}

// --- MAIN COMPONENT ---
const TradeAssociationModalV2 = memo(({ isOpen, onClose }: TradeAssociationModalV2Props) => {
    const { 
        wood, leather, ore, cloth, 
        refreshUserData,
        displayedCoins
    } = useGame();

    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    
    // State to track quantity for each trade option
    const [tradeQuantities, setTradeQuantities] = useState<Record<string, number>>({});

    const resources: Record<ResourceType, number> = { wood, leather, ore, cloth };

    // Helper to get current quantity
    const getQuantity = (optionId: string) => tradeQuantities[optionId] || 1;

    // Helper to set quantity
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
            setMessage({ text: "User not authenticated!", type: 'error' });
            return;
        }
        if (isProcessing) return;

        setIsProcessing(true);
        setMessage(null);

        try {
            // A. Client-side Validation with Multiplier
            for (const ing of option.ingredients) {
                const totalRequired = ing.amount * quantity;
                if ((resources[ing.type] || 0) < totalRequired) {
                    throw new Error(`Insufficient ${ing.name}! Need ${totalRequired}.`);
                }
            }

            // B. Firestore Transaction
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);
                
                if (!userDoc.exists()) throw new Error("User document does not exist!");
                const userData = userDoc.data();

                const updates: any = {};
                
                // Deduct Resources based on Quantity
                for (const ing of option.ingredients) {
                    const currentVal = userData[ing.type] || 0;
                    const totalRequired = ing.amount * quantity;
                    if (currentVal < totalRequired) {
                        throw new Error(`Server: Not enough ${ing.name} (Has: ${currentVal}, Need: ${totalRequired})`);
                    }
                    updates[ing.type] = currentVal - totalRequired;
                }

                // Add Equipment Pieces based on Quantity
                const currentPieces = userData.equipment?.pieces || 0;
                const totalReceive = option.receiveAmount * quantity;
                const newPieces = currentPieces + totalReceive;
                
                updates['equipment.pieces'] = newPieces;

                transaction.update(userRef, updates);
            });

            setMessage({ text: `Successfully exchanged for ${option.receiveAmount * quantity} Equipment Piece(s)!`, type: 'success' });
            await refreshUserData();
            setTradeQuantities(prev => ({ ...prev, [option.id]: 1 }));

        } catch (error: any) {
            console.error("Trade Error:", error);
            setMessage({ text: error.message || "Transaction failed.", type: 'error' });
        } finally {
            setIsProcessing(false);
            setTimeout(() => setMessage(null), 3000);
        }
    }, [resources, refreshUserData, isProcessing]);

    if (!isOpen) return null;

    return (
        // MAIN CONTAINER
        <div className="fixed inset-0 z-[110] text-slate-200 flex flex-col overflow-hidden animate-zoom-in font-sans">
            
            {/* BACKGROUND IMAGE LAYER */}
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/background-trade-association.webp" 
                    alt="Background" 
                    className="w-full h-full object-cover"
                />
                {/* BLACK OVERLAY 80% */}
                <div className="absolute inset-0 bg-black/80" />
            </div>

            <Header onClose={onClose} displayedCoins={displayedCoins} />

            <div className="flex-1 overflow-y-auto hide-scrollbar relative z-10">
                
                <div className="relative p-4 md:p-10 min-h-full max-w-5xl mx-auto flex flex-col">
                    
                    {/* Feedback Toast */}
                    {message && (
                        <div className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 text-base font-bold animate-bounce flex items-center gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-green-950/90 border-green-500 text-green-100' : 'bg-red-950/90 border-red-500 text-red-100'}`}>
                            {message.type === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            )}
                            {message.text}
                        </div>
                    )}

                    {/* Trade Options List Container */}
                    <div className="space-y-6 md:space-y-8 flex-1 pb-10 mt-4">
                        
                        {TRADE_OPTIONS.map((option) => {
                            const quantity = getQuantity(option.id);
                            let canAffordAll = true;
                            
                            return (
                                // MODIFIED: bg-slate-900/80 (removed backdrop-blur-md)
                                <div key={option.id} className="relative group bg-slate-900/80 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:bg-slate-900/90 hover:-translate-y-1">

                                    {/* Card Body - REDUCED GAP TO 4/6 */}
                                    <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center gap-2 lg:gap-6">
                                        
                                        {/* INGREDIENTS AREA */}
                                        <div className="flex-1 w-full flex items-center justify-center lg:justify-start gap-4 md:gap-6 bg-black/20 p-5 rounded-2xl border border-slate-800/50 shadow-inner">
                                            {option.ingredients.map((ing, idx) => {
                                                const userHas = resources[ing.type] || 0;
                                                const requiredAmount = ing.amount * quantity;
                                                const isEnough = userHas >= requiredAmount;
                                                if (!isEnough) canAffordAll = false;

                                                return (
                                                    <React.Fragment key={ing.type}>
                                                        <div className="flex flex-col items-center gap-3 min-w-[80px]">
                                                            {/* Icon Container */}
                                                            <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isEnough ? 'bg-slate-800 border-slate-700' : 'bg-red-950/20 border-red-900/50'}`}>
                                                                <ResourceIcon type={ing.type} className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />
                                                            </div>
                                                            {/* User Stock Display */}
                                                            <div className="text-xs md:text-sm font-mono font-bold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                                                <span className={isEnough ? "text-emerald-400" : "text-red-500"}>
                                                                    {userHas > 999 ? '999+' : userHas}
                                                                </span>
                                                                <span className="text-slate-500 ml-1">/ {requiredAmount}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* REPLACED PLUS TEXT WITH ICON - ADJUSTED HEIGHT */}
                                                        {idx < option.ingredients.length - 1 && (
                                                            <div className="shrink-0 flex items-center justify-center px-1 -translate-y-4 md:-translate-y-6">
                                                                <img 
                                                                    src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/plus-exchange.webp"
                                                                    alt="plus"
                                                                    // Sized similar to arrow (w-10 to w-14)
                                                                    className="w-10 h-10 md:w-14 md:h-14 object-contain opacity-90"
                                                                />
                                                            </div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>

                                        {/* ARROW DIRECTION - MADE BIGGER */}
                                        <div className="shrink-0 flex items-center justify-center">
                                            <img 
                                                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/arrow-down-exchange.webp" 
                                                alt="Convert to"
                                                // Increased to w-14/20
                                                className="w-14 h-14 md:w-20 md:h-20 object-contain opacity-90 lg:-rotate-90"
                                            />
                                        </div>

                                        {/* RESULT & BUTTON AREA */}
                                        <div className="flex-1 w-full flex flex-col items-center justify-center gap-5 bg-black/20 p-5 rounded-2xl border border-slate-800/50 shadow-inner">
                                            
                                            {/* Reward Icon */}
                                            <div className="relative group-hover:scale-105 transition-transform duration-500">
                                                <div className={`absolute inset-0 bg-amber-400 rounded-xl blur-xl opacity-10 ${canAffordAll ? 'animate-pulse' : 'hidden'}`}></div>
                                                <div className="relative p-4 rounded-xl border-2 bg-slate-800 border-slate-700 shadow-lg">
                                                    <EquipmentPieceIcon className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl relative z-10 object-contain" />
                                                    
                                                    {/* Dynamic Quantity Badge */}
                                                    <div className="absolute -top-3 -right-3 bg-black/50 text-white text-[11px] font-bold px-2 py-1 rounded-full border border-slate-600 shadow-lg z-20">
                                                        x{option.receiveAmount * quantity}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-center gap-3 w-full max-w-[140px] bg-slate-900/50 p-1.5 rounded-lg border border-slate-700">
                                                <button 
                                                    onClick={() => handleQuantityChange(option.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-slate-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                                                    </svg>
                                                </button>
                                                <span className="flex-1 text-center font-bold font-mono text-lg text-amber-500">{quantity}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(option.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center bg-slate-700 hover:bg-slate-600 active:bg-slate-800 rounded-md text-slate-200 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Exchange Button */}
                                            <button
                                                onClick={() => handleExchange(option, quantity)}
                                                disabled={!canAffordAll || isProcessing}
                                                className={`
                                                    w-full md:w-3/4 py-3.5 px-6 rounded-xl font-bold text-sm md:text-base uppercase tracking-widest shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1
                                                    ${canAffordAll 
                                                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-black shadow-amber-900/20' 
                                                        : 'bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed grayscale opacity-70'
                                                    }
                                                `}
                                            >
                                                {isProcessing ? (
                                                    <span className="flex items-center justify-center gap-3">
                                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Forging...
                                                    </span>
                                                ) : 'Exchange'}
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
                .animate-zoom-in {
                    animation: zoomIn 0.2s ease-out forwards;
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
