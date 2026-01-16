import React, { memo, useState, useCallback } from 'react';
import { equipmentUiAssets } from '../game-assets.ts';
import { useGame } from '../GameContext.tsx';
import { doc, runTransaction } from 'firebase/firestore';
import { db, auth } from '../firebase.js';

// --- DEFINITION TYPES ---
export type ResourceType = 'wood' | 'leather' | 'ore' | 'cloth';

export interface TradeIngredient {
    type: ResourceType;
    name: string;
    amount: number;
}

export interface TradeOption {
    id: string;
    title: string;
    ingredients: TradeIngredient[];
    receiveType: 'equipmentPiece';
    receiveAmount: number;
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

const CloseIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className} strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- COMPONENT HIỂN THỊ VÍ TÀI NGUYÊN ---
const ResourceWallet = ({ resources }: { resources: Record<ResourceType, number> }) => {
    const items: { type: ResourceType; label: string }[] = [
        { type: 'wood', label: 'Wood' },
        { type: 'leather', label: 'Leather' },
        { type: 'ore', label: 'Ore' },
        { type: 'cloth', label: 'Cloth' },
    ];

    return (
        <div className="grid grid-cols-4 gap-4 mb-8 bg-slate-950/50 p-4 rounded-xl border border-slate-700/50 shadow-inner max-w-4xl mx-auto backdrop-blur-sm">
            {items.map((item) => (
                <div key={item.type} className="flex flex-col items-center justify-center group">
                    <div className="bg-slate-800/80 p-3 rounded-full mb-2 border border-slate-600 shadow-md transform group-hover:scale-110 transition-transform duration-300">
                        <ResourceIcon type={item.type} className="w-8 h-8" />
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">{item.label}</span>
                    <span className="text-lg md:text-xl font-bold text-white drop-shadow-md">{resources[item.type]?.toLocaleString() || 0}</span>
                </div>
            ))}
        </div>
    );
};

interface TradeAssociationModalV2Props {
    isOpen: boolean;
    onClose: () => void;
}

// --- MAIN COMPONENT ---
const TradeAssociationModalV2 = memo(({ isOpen, onClose }: TradeAssociationModalV2Props) => {
    // 1. Get Global State (Resources) to display in UI
    const { 
        wood, leather, ore, cloth, 
        refreshUserData
    } = useGame();

    const [isProcessing, setIsProcessing] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    // Map resources to object for easier access
    const resources: Record<ResourceType, number> = { wood, leather, ore, cloth };

    // 2. Independent Logic Handler using Firestore Transaction
    const handleExchange = useCallback(async (option: TradeOption) => {
        const userId = auth.currentUser?.uid;
        if (!userId) {
            setMessage({ text: "User not authenticated!", type: 'error' });
            return;
        }
        if (isProcessing) return;

        setIsProcessing(true);
        setMessage(null);

        try {
            // A. Client-side Validation (Quick check before server)
            for (const ing of option.ingredients) {
                if ((resources[ing.type] || 0) < ing.amount) {
                    throw new Error(`Insufficient ${ing.name}!`);
                }
            }

            // B. Firestore Transaction (Server-side check & Atomic Update)
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', userId);
                const userDoc = await transaction.get(userRef);
                
                if (!userDoc.exists()) throw new Error("User document does not exist!");
                const userData = userDoc.data();

                // Validate again inside transaction (Server-side)
                const updates: any = {};
                
                for (const ing of option.ingredients) {
                    const currentVal = userData[ing.type] || 0;
                    if (currentVal < ing.amount) {
                        throw new Error(`Server: Not enough ${ing.name} (Has: ${currentVal}, Need: ${ing.amount})`);
                    }
                    // Prepare deduction
                    updates[ing.type] = currentVal - ing.amount;
                }

                // Add Equipment Pieces
                // Note: Assuming equipment pieces are stored in `equipment.pieces` object map or field.
                const currentPieces = userData.equipment?.pieces || 0;
                const newPieces = currentPieces + option.receiveAmount;
                
                // Construct final update object using Dot Notation for nested fields
                updates['equipment.pieces'] = newPieces;

                // Execute Update
                transaction.update(userRef, updates);
            });

            // C. Success Handling
            setMessage({ text: `Successfully exchanged for ${option.receiveAmount} Equipment Piece(s)!`, type: 'success' });
            
            // Trigger global refresh to sync UI immediately
            await refreshUserData();

        } catch (error: any) {
            console.error("Trade Error:", error);
            setMessage({ text: error.message || "Transaction failed. Please try again.", type: 'error' });
        } finally {
            setIsProcessing(false);
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        }
    }, [resources, refreshUserData, isProcessing]);


    if (!isOpen) return null;

    return (
        // MAIN CONTAINER: Fixed Full Screen
        <div className="fixed inset-0 z-[110] bg-[#13151b] text-slate-200 flex flex-col overflow-hidden animate-zoom-in font-sans">
            
            {/* 1. HEADER SECTION (Fixed Top) */}
            <div className="relative bg-gradient-to-r from-[#2c241b] via-[#3e3226] to-[#2c241b] p-4 md:px-8 border-b-2 border-[#8b7355] flex justify-between items-center shadow-lg z-20 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-amber-800 rounded-xl border-2 border-yellow-400/50 shadow-lg flex items-center justify-center transform hover:rotate-6 transition-transform">
                        {/* Scale Icon */}
                        <img 
                            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shop-icon.webp" 
                            className="w-9 h-9 object-contain drop-shadow-md"
                            alt="Trade"
                        />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-3xl font-bold uppercase tracking-widest text-amber-400 drop-shadow-md font-serif">
                            Trade Association
                        </h3>
                        <p className="text-xs md:text-sm text-amber-200/60 uppercase tracking-wider font-semibold">
                            Global Resource Exchange
                        </p>
                    </div>
                </div>
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="group bg-black/40 hover:bg-red-900/80 p-3 rounded-full border border-slate-600 hover:border-red-500 transition-all transform hover:scale-110 active:scale-95 shadow-xl"
                >
                    <CloseIcon className="w-6 h-6 md:w-8 md:h-8 text-slate-300 group-hover:text-white" />
                </button>
            </div>

            {/* 2. BODY SECTION (Scrollable) */}
            <div className="flex-1 overflow-y-auto hide-scrollbar relative bg-[#1c1e26]">
                
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}>
                </div>

                <div className="relative p-4 md:p-10 min-h-full max-w-5xl mx-auto flex flex-col">
                    
                    {/* Feedback Toast Message (Floating) */}
                    {message && (
                        <div className={`fixed top-28 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 text-base font-bold animate-bounce flex items-center gap-3 backdrop-blur-md ${message.type === 'success' ? 'bg-green-950/90 border-green-500 text-green-100' : 'bg-red-950/90 border-red-500 text-red-100'}`}>
                            {message.type === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.text}
                        </div>
                    )}

                    {/* Resources Display Component */}
                    <ResourceWallet resources={resources} />

                    {/* Trade Options List Container */}
                    <div className="space-y-6 md:space-y-8 flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <h4 className="text-amber-500/80 font-serif text-2xl">Available Exchanges</h4>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-900/50 to-transparent"></div>
                        </div>
                        
                        {TRADE_OPTIONS.map((option) => {
                            let canAffordAll = true;
                            
                            return (
                                <div key={option.id} className="relative group bg-[#252833] rounded-2xl border border-slate-700 shadow-xl overflow-hidden transition-all duration-300 hover:border-amber-700/50 hover:shadow-2xl hover:bg-[#2a2d38] hover:-translate-y-1">
                                    {/* Card Header */}
                                    <div className="px-6 py-4 bg-[#2d313d] border-b border-slate-700/50 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
                                            <span className="text-lg font-bold text-amber-500/90 uppercase tracking-wide">{option.title}</span>
                                        </div>
                                        <span className="text-xs md:text-sm text-slate-400 italic font-mono">{option.description}</span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                                        
                                        {/* INGREDIENTS AREA */}
                                        <div className="flex-1 w-full flex items-center justify-center lg:justify-start gap-4 md:gap-8 bg-black/20 p-5 rounded-2xl border border-slate-800/50 shadow-inner">
                                            {option.ingredients.map((ing, idx) => {
                                                const userHas = resources[ing.type] || 0;
                                                const isEnough = userHas >= ing.amount;
                                                if (!isEnough) canAffordAll = false;

                                                return (
                                                    <React.Fragment key={ing.type}>
                                                        <div className="flex flex-col items-center gap-3 min-w-[80px]">
                                                            {/* Icon Container */}
                                                            <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isEnough ? 'bg-slate-800 border-slate-700 group-hover:border-slate-600' : 'bg-red-950/20 border-red-900/50'}`}>
                                                                <ResourceIcon type={ing.type} className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg" />
                                                                {/* Required Amount Badge */}
                                                                <div className="absolute -top-3 -right-3 bg-amber-600 text-white text-[11px] font-bold px-2 py-1 rounded-full shadow-lg border border-amber-400 z-10">
                                                                    {ing.amount}
                                                                </div>
                                                            </div>
                                                            {/* User Stock Display */}
                                                            <div className="text-xs md:text-sm font-mono font-bold bg-black/40 px-3 py-1 rounded-full border border-white/5">
                                                                <span className={isEnough ? "text-emerald-400" : "text-red-500"}>
                                                                    {userHas > 999 ? '999+' : userHas}
                                                                </span>
                                                                <span className="text-slate-500 ml-1">/ {ing.amount}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        {idx < option.ingredients.length - 1 && (
                                                            <div className="text-slate-600 font-bold text-3xl opacity-30 pb-6">+</div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>

                                        {/* ARROW DIRECTION */}
                                        <div className="shrink-0 text-slate-600 rotate-90 lg:rotate-0 animate-pulse">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 md:w-12 md:h-12 opacity-50">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>

                                        {/* RESULT & BUTTON AREA */}
                                        <div className="flex-1 w-full flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-amber-500/5 to-transparent p-5 rounded-2xl border border-dashed border-amber-900/30">
                                            {/* Reward Icon */}
                                            <div className="relative group-hover:scale-105 transition-transform duration-500">
                                                <div className={`absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-20 ${canAffordAll ? 'animate-pulse' : 'hidden'}`}></div>
                                                <EquipmentPieceIcon className="w-16 h-16 md:w-20 md:h-20 drop-shadow-2xl relative z-10" />
                                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-bold px-3 py-1 rounded-lg border border-amber-400 shadow-lg z-20">
                                                    x{option.receiveAmount}
                                                </div>
                                            </div>

                                            {/* Exchange Button */}
                                            <button
                                                onClick={() => handleExchange(option)}
                                                disabled={!canAffordAll || isProcessing}
                                                className={`
                                                    w-full md:w-3/4 py-3.5 px-6 rounded-xl font-bold text-sm md:text-base uppercase tracking-widest shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1
                                                    ${canAffordAll 
                                                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-800 shadow-amber-900/20' 
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

            {/* 3. FOOTER SECTION (Fixed Bottom) */}
            <div className="bg-[#1a1d26] p-4 text-center border-t border-slate-800 shrink-0 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
                <p className="text-[11px] text-slate-500 font-mono italic">
                    *Trade materials are consumed immediately upon exchange. Transactions are final and recorded by the Guild Ledger.
                </p>
            </div>

            {/* Internal Styles */}
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
