import React, { useState, useEffect } from 'react';

// Hàm helper format số (Copy vào đây để component hoạt động độc lập)
const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
};

export interface NumpadModalProps {
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
            if (next.length > 9) return prev; // Limit length
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 animate-fadeIn">
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

                {/* Display */}
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

                {/* Keypad */}
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
                        {/* Đã thay đổi icon Backspace chuẩn */}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
                        </svg>
                    </button>

                    <button onClick={() => handleNumberClick(0)} className="col-span-2 h-14 bg-slate-800 hover:bg-slate-700 rounded-lg text-xl font-bold text-slate-200 shadow-sm active:translate-y-0.5 transition-all">0</button>
                    <button onClick={handleConfirm} className="col-span-2 h-14 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-xl font-bold text-white shadow-md shadow-emerald-900/50 active:translate-y-0.5 transition-all">OK</button>
                </div>
            </div>
        </div>
    );
};

export default NumpadModal;
