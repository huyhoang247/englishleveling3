// --- START OF FILE trade-association-modal-v2.tsx ---

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
        <div className="grid grid-cols-4 gap-2 mb-6 bg-slate-950/50 p-3 rounded-xl border border-slate-700/50 shadow-inner">
            {items.map((item) => (
                <div key={item.type} className="flex flex-col items-center justify-center">
                    <div className="bg-slate-800/80 p-1.5 rounded-full mb-1 border border-slate-600 shadow-md">
                        <ResourceIcon type={item.type} className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.label}</span>
                    <span className="text-sm font-bold text-white">{resources[item.type]?.toLocaleString() || 0}</span>
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
                // Based on standard structure: user -> equipment -> pieces
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
        <div className="fixed inset-0 flex items-center justify-center z-[110] p-4">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={onClose} 
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-[#13151b] rounded-2xl border-2 border-[#8b7355] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-zoom-in">
                
                {/* Header */}
                <div className="relative bg-gradient-to-r from-[#2c241b] via-[#3e3226] to-[#2c241b] p-4 border-b-2 border-[#8b7355] flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-amber-800 rounded-lg border-2 border-yellow-400/50 shadow-lg flex items-center justify-center">
                            {/* Scale Icon */}
                            <img 
                                src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/shop-icon.webp" 
                                className="w-8 h-8 object-contain drop-shadow-md"
                                alt="Trade"
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold uppercase tracking-widest text-amber-400 drop-shadow-md font-serif">
                                Trade Association
                            </h3>
                            <p className="text-[11px] text-amber-200/60 uppercase tracking-wider">Exchange & Supply</p>
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="group bg-black/20 hover:bg-red-900/50 p-2 rounded-full border border-transparent hover:border-red-500/50 transition-all">
                        <CloseIcon className="w-6 h-6 text-slate-400 group-hover:text-red-200" />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-5 bg-[#1c1e26] overflow-y-auto max-h-[70vh] hide-scrollbar relative">
                    
                    {/* Feedback Toast Message */}
                    {message && (
                        <div className={`absolute top-2 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg border text-sm font-bold animate-bounce flex items-center gap-2 ${message.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-red-900/90 border-red-500 text-red-100'}`}>
                            {message.type === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.text}
                        </div>
                    )}

                    {/* Resources Display */}
                    <ResourceWallet resources={resources} />

                    {/* Trade Options List */}
                    <div className="space-y-4">
                        {TRADE_OPTIONS.map((option) => {
                            let canAffordAll = true;
                            
                            return (
                                <div key={option.id} className="relative group bg-[#252833] rounded-xl border border-slate-700 shadow-lg overflow-hidden transition-transform hover:scale-[1.01] hover:border-amber-700/50">
                                    {/* Card Header */}
                                    <div className="px-4 py-2 bg-[#2d313d] border-b border-slate-700/50 flex justify-between items-center">
                                        <span className="text-sm font-bold text-amber-500/90 uppercase tracking-wide">{option.title}</span>
                                        <span className="text-[10px] text-slate-500 italic">{option.description}</span>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 flex flex-col sm:flex-row items-center gap-6">
                                        
                                        {/* Ingredients Input Area */}
                                        <div className="flex-1 w-full flex items-center justify-center sm:justify-start gap-4 bg-black/30 p-3 rounded-xl border border-slate-800 shadow-inner">
                                            {option.ingredients.map((ing, idx) => {
                                                const userHas = resources[ing.type] || 0;
                                                const isEnough = userHas >= ing.amount;
                                                if (!isEnough) canAffordAll = false;

                                                return (
                                                    <React.Fragment key={ing.type}>
                                                        <div className="flex flex-col items-center gap-1.5 min-w-[60px]">
                                                            {/* Icon Container */}
                                                            <div className={`relative p-2 rounded-lg border-2 transition-colors ${isEnough ? 'bg-slate-800 border-slate-700' : 'bg-red-950/20 border-red-900/50'}`}>
                                                                <ResourceIcon type={ing.type} className="w-8 h-8 drop-shadow-md" />
                                                                {/* Required Amount Badge */}
                                                                <div className="absolute -top-2 -right-2 bg-amber-600 text-white text-[9px] font-bold px-1 rounded shadow-sm border border-amber-400">
                                                                    {ing.amount}
                                                                </div>
                                                            </div>
                                                            {/* User Stock Display */}
                                                            <div className="text-[11px] font-mono font-bold">
                                                                <span className={isEnough ? "text-emerald-400" : "text-red-500"}>
                                                                    {userHas > 999 ? '999+' : userHas}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        
                                                        {idx < option.ingredients.length - 1 && (
                                                            <div className="text-slate-600 font-bold text-lg opacity-40">+</div>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>

                                        {/* Direction Arrow */}
                                        <div className="shrink-0 text-slate-600 rotate-90 sm:rotate-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                            </svg>
                                        </div>

                                        {/* Output & Action Button Area */}
                                        <div className="flex-1 w-full flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-amber-500/5 to-transparent p-3 rounded-xl border border-dashed border-amber-900/30">
                                            {/* Reward Icon */}
                                            <div className="relative">
                                                <div className={`absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-20 ${canAffordAll ? 'animate-pulse' : 'hidden'}`}></div>
                                                <EquipmentPieceIcon className="w-14 h-14 drop-shadow-2xl relative z-10" />
                                                <span className="absolute -bottom-1 -right-1 bg-amber-600 text-white text-[10px] font-bold px-1.5 rounded border border-amber-400 shadow-md">
                                                    x{option.receiveAmount}
                                                </span>
                                            </div>

                                            {/* Exchange Button */}
                                            <button
                                                onClick={() => handleExchange(option)}
                                                disabled={!canAffordAll || isProcessing}
                                                className={`
                                                    w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg transition-all border-b-4 active:border-b-0 active:translate-y-1
                                                    ${canAffordAll 
                                                        ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-800' 
                                                        : 'bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed grayscale'
                                                    }
                                                `}
                                            >
                                                {isProcessing ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Processing...
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

                {/* Footer Disclaimer */}
                <div className="bg-[#1a1d26] p-3 text-center border-t border-slate-800">
                    <p className="text-[10px] text-slate-500 font-mono italic">
                        *Trade materials are consumed immediately. Transactions are final.
                    </p>
                </div>
            </div>

            {/* Internal Styles for Animation and Scrollbar */}
            <style>{`
                @keyframes zoomIn {
                    from { opacity: 0; transform: scale(0.95); }
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
