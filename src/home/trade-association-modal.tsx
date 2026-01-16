// --- START OF FILE trade-association-modal.tsx ---

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
        <div className="grid grid-cols-4 gap-4 mb-8 bg-slate-950/50 p-4 rounded-xl border border-slate-700/50 shadow-inner max-w-3xl mx-auto">
            {items.map((item) => (
                <div key={item.type} className="flex flex-col items-center justify-center group">
                    <div className="bg-slate-800/80 p-3 rounded-full mb-2 border border-slate-600 shadow-md group-hover:bg-slate-700 transition-colors">
                        <ResourceIcon type={item.type} className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">{item.label}</span>
                    <span className="text-lg font-bold text-white">{resources[item.type]?.toLocaleString() || 0}</span>
                </div>
            ))}
        </div>
    );
};

interface TradeAssociationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- MAIN COMPONENT ---
const TradeAssociationModal = memo(({ isOpen, onClose }: TradeAssociationModalProps) => {
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
                
                // Construct final update object
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
        <div className="fixed inset-0 z-[110] bg-[#13151b] flex flex-col animate-zoom-in overflow-hidden">
            {/* 1. Header Area - Fixed Top */}
            <div className="shrink-0 relative bg-gradient-to-r from-[#2c241b] via-[#3e3226] to-[#2c241b] p-4 border-b-2 border-[#8b7355] flex justify-between items-center z-20 shadow-xl">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-600 to-amber-800 rounded-xl border-2 border-yellow-400/50 shadow-lg flex items-center justify-center">
                        {/* Scale Icon */}
                        <img 
                            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shop-icon.webp" 
                            className="w-10 h-10 object-contain drop-shadow-md"
                            alt="Trade"
                        />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold uppercase tracking-widest text-amber-400 drop-shadow-md font-serif">
                            Trade Association
                        </h3>
                        <p className="text-sm text-amber-200/60 uppercase tracking-wider">Exchange & Supply Center</p>
                    </div>
                </div>
                
                <button onClick={onClose} className="group bg-black/20 hover:bg-red-900/50 p-3 rounded-full border border-transparent hover:border-red-500/50 transition-all">
                    <CloseIcon className="w-8 h-8 text-slate-400 group-hover:text-red-200" />
                </button>
            </div>

            {/* 2. Main Content - Scrollable */}
            <div className="flex-1 overflow-y-auto bg-[#1c1e26] relative custom-scrollbar">
                <div className="min-h-full p-4 md:p-8 max-w-5xl mx-auto flex flex-col">
                    
                    {/* Feedback Toast Message */}
                    {message && (
                        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl border-2 text-base font-bold animate-bounce flex items-center gap-3 ${message.type === 'success' ? 'bg-green-900/95 border-green-500 text-green-100' : 'bg-red-900/95 border-red-500 text-red-100'}`}>
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

                    {/* Resources Display */}
                    <div className="w-full">
                        <ResourceWallet resources={resources} />
                    </div>

                    {/* Trade Options List */}
                    <div className="space-y-6 pb-12">
                        {TRADE_OPTIONS.map((option) => {
                            let canAffordAll = true;
                            
                            return (
                                <div key={option.id} className="relative group bg-[#252833] rounded-2xl border border-slate-700 shadow-xl overflow-hidden transition-all hover:border-amber-700/50 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-0.5">
                                    {/* Card Header */}
                                    <div className="px-6 py-3 bg-[#2d313d] border-b border-slate-700/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="w-2 h-8 bg-amber-600 rounded-full hidden sm:block shadow-[0_0_10px_rgba(217,119,6,0.5)]"></span>
                                            <span className="text-xl font-bold text-amber-500/90 uppercase tracking-wide">{option.title}</span>
                                        </div>
                                        <span className="text-xs text-slate-400 italic bg-black/20 px-3 py-1.5 rounded-full border border-slate-800">{option.description}</span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                                        
                                        {/* Ingredients Input Area */}
                                        <div className="flex-1 w-full flex items-center justify-center md:justify-start gap-4 lg:gap-8 bg-black/30 p-5 rounded-xl border border-slate-800 shadow-inner">
                                            {option.ingredients.map((ing, idx) => {
                                                const userHas = resources[ing.type] || 0;
                                                const isEnough = userHas >= ing.amount;
                                                if (!isEnough) canAffordAll = false;

                                                return (
                                                    <React.Fragment key={ing.type}>
                                                        <div className="flex flex-col items-center gap-3 min-w-[80px]">
                                                            {/* Icon Container */}
                                                            <div className={`relative p-3 rounded-xl border-2 transition-all duration-300 ${isEnough ? 'bg-slate-800 border-slate-700 group-hover:border-slate-600' : 'bg-red-950/20 border-red-900/50'}`}>
                                                                <ResourceIcon type={ing.type} className="w-10 h-10 drop-shadow-md" />
                                                                {/* Required Amount Badge */}
                                                                <div className="absolute -top-3 -right-3 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-amber-400 z-10">
                                                                    req: {ing.amount}
                                                                </div>
                                                            </div>
                                                            {/* User Stock Display */}
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{ing.name}</span>
                                                                <div className="text-sm font-mono font-bold bg-black/40 px-2 py-0.5 rounded text-center min-w-[60px]">
                                                                    <span className={isEnough ? "text-emerald-400" : "text-red-500"}>
                                                                        {userHas > 999 ? '999+' : userHas}
                                                                    </span>
                                                                    <span className="text-slate-600 text-xs"> / {ing.amount}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                        {idx < option.ingredients.length - 1 && (
                                                            <div className="text-slate-600 font-bold text-2xl opacity-30 select-none">+</div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>

                                        {/* Direction Arrow */}
                                        <div className="shrink-0 text-slate-600 rotate-90 md:rotate-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 animate-pulse opacity-50">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>

                                        {/* Output & Action Button Area */}
                                        <div className="flex-1 w-full md:max-w-xs flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-amber-500/5 to-transparent p-5 rounded-xl border border-dashed border-amber-900/30">
                                            {/* Reward Icon */}
                                            <div className="relative group-hover:scale-110 transition-transform duration-500 ease-out">
                                                <div className={`absolute inset-0 bg-amber-400 rounded-full blur-2xl opacity-10 ${canAffordAll ? 'animate-pulse' : 'hidden'}`}></div>
                                                <EquipmentPieceIcon className="w-20 h-20 drop-shadow-2xl relative z-10" />
                                                <span className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold px-2.5 py-0.5 rounded-full border border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)] z-20">
                                                    x{option.receiveAmount}
                                                </span>
                                            </div>

                                            {/* Exchange Button */}
                                            <button
                                                onClick={() => handleExchange(option)}
                                                disabled={!canAffordAll || isProcessing}
                                                className={`
                                                    w-full py-3.5 px-6 rounded-xl font-bold text-sm uppercase tracking-[0.2em] shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 overflow-hidden relative
                                                    ${canAffordAll 
                                                        ? 'bg-gradient-to-r from-amber-700 to-orange-700 hover:from-amber-600 hover:to-orange-600 text-white border-amber-900 hover:shadow-amber-900/50' 
                                                        : 'bg-slate-800 text-slate-600 border-slate-900 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {isProcessing ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Crafting...
                                                    </span>
                                                ) : 'Exchange Now'}
                                                
                                                {/* Button Shine Effect */}
                                                {canAffordAll && !isProcessing && (
                                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                                                )}
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer Disclaimer - Fixed Bottom */}
            <div className="shrink-0 bg-[#15171e] p-3 text-center border-t border-slate-800/80 z-20">
                <p className="text-xs text-slate-600 font-mono italic">
                    *Trade materials are consumed immediately. Transactions are final. Rates subject to guild regulations.
                </p>
            </div>

            {/* Internal Styles for Animation and Scrollbar */}
            <style>{`
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-zoom-in {
                    animation: zoomIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #13151b; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #3e3226; 
                    border-radius: 5px;
                    border: 2px solid #13151b;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #5c4b3a; 
                }
            `}</style>
        </div>
    );
});

export default TradeAssociationModal;
