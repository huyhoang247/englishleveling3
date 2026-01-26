import React, { useState, useEffect } from 'react';
import { bossBattleAssets, resourceAssets } from '../../game-assets.ts';
import { BattleRewards } from './tower-service.ts';
import { useGame } from '../../GameContext.tsx';

// --- HELPER FORMAT NUMBERS ---
const formatNum = (num: number) => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
};

// --- HELPER FORMAT TIME (MM:SS) ---
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

interface AdsRewardModalProps {
    rewards: BattleRewards | null;
    onClaimX1: () => void;
    onClaimX2: () => void; 
}

export const AdsRewardModal = ({ rewards, onClaimX1, onClaimX2 }: AdsRewardModalProps) => {
    // Lấy dữ liệu Ads và hàm xử lý từ GameContext
    const { adsData, handleRegisterAdWatch } = useGame(); 
    
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    
    // State đếm ngược thời gian
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);

    // EFFECT: Tính toán thời gian chờ dựa trên adsData.nextAvailableAt
    useEffect(() => {
        const calculateTime = () => {
            // Nếu chưa có mốc thời gian phải chờ -> Có sẵn
            if (!adsData.nextAvailableAt) {
                setTimeRemaining(0);
                setIsAvailable(true);
                return;
            }

            const now = new Date().getTime();
            // Lưu ý: nextAvailableAt thường là Firestore Timestamp, cần gọi toDate()
            const availableAt = adsData.nextAvailableAt.toDate().getTime();
            const diff = Math.ceil((availableAt - now) / 1000);

            if (diff > 0) {
                setTimeRemaining(diff);
                setIsAvailable(false);
            } else {
                setTimeRemaining(0);
                setIsAvailable(true);
            }
        };

        calculateTime(); // Chạy ngay lập tức khi mount hoặc data thay đổi
        
        const timer = setInterval(calculateTime, 1000); // Cập nhật mỗi giây

        return () => clearInterval(timer);
    }, [adsData.nextAvailableAt]);

    // Xử lý khi bấm nút xem quảng cáo
    const handleAdClick = async () => {
        // Kiểm tra điều kiện an toàn lần nữa
        if (!isAvailable || adsData.watchedToday >= 30) return;

        setIsWatchingAd(true);
        
        // --- GIẢ LẬP XEM QUẢNG CÁO (Thay thế bằng SDK Ads thực tế ở đây) ---
        setTimeout(async () => {
            
            // 1. Gọi server (thông qua Context) để ghi nhận lượt xem và tính cooldown mới
            const success = await handleRegisterAdWatch();
            
            setIsWatchingAd(false);

            if (success) {
                // 2. Nếu thành công -> Nhận thưởng x2
                onClaimX2();
            } else {
                // Nếu thất bại (lỗi mạng hoặc logic server chặn)
                console.error("Ad watch validation failed");
            }
            
        }, 3000); // Giả lập xem video 3 giây
    };

    const isDailyLimitReached = adsData.watchedToday >= 30;

    // --- TÍNH TOÁN UI CHO PROGRESS BAR ---
    // Tính phần trăm hiển thị (max 100%)
    const progressPercent = Math.min((adsData.watchedToday / 30) * 100, 100);
    
    // Logic đổi màu dựa trên trạng thái (Xanh -> Cam -> Đỏ)
    let statusColor = "bg-blue-500";
    let statusText = "text-blue-200";
    
    if (adsData.watchedToday >= 25) {
        statusColor = "bg-orange-500"; // Sắp hết
        statusText = "text-orange-200";
    }
    if (isDailyLimitReached) {
        statusColor = "bg-red-500"; // Đã hết
        statusText = "text-red-200";
    }

    if (!rewards) return null;

    return (
        // Đã loại bỏ 'backdrop-blur-sm' ở dòng dưới đây
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
            {/* Main Container */}
            <div className="relative w-[360px] bg-[#1a1b26] border-2 border-slate-600 rounded-3xl shadow-2xl flex flex-col items-center overflow-hidden animate-fade-in-scale-fast">
                
                {/* --- HEADER --- */}
                <div className="mt-6 z-10 flex flex-col items-center relative">
                    {/* Đã đổi VICTORY thành REWARDS */}
                    <h2 className="text-3xl font-lilita text-white tracking-widest drop-shadow-sm">REWARDS</h2>
                    <div className="h-[2px] w-12 bg-slate-500 rounded-full mt-2 mb-1 opacity-50"></div>
                </div>

                {/* --- REWARDS LIST --- */}
                <div className="w-full px-5 py-4 z-10">
                    <div className="bg-slate-900/60 rounded-2xl border border-slate-700/50 p-4 space-y-3 shadow-inner">
                        <div className="flex justify-between px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                            <span>Reward</span>
                            <span>With Ads</span>
                        </div>
                        
                        {/* COINS */}
                        {rewards.coins > 0 && (
                            <RewardRow icon={bossBattleAssets.coinIcon} label="Coins" amount={rewards.coins} />
                        )}
                        
                        {/* RESOURCES */}
                        {rewards.resources.map((res, idx) => {
                            const resKey = res.type as keyof typeof resourceAssets;
                            const img = resourceAssets[resKey] || bossBattleAssets.coinIcon;
                            return <RewardRow key={idx} icon={img} label={res.type} amount={res.amount} />;
                        })}
                    </div>
                </div>

                {/* --- DAILY LIMIT STATUS BAR (NEW DESIGN) --- */}
                <div className="w-full px-6 mb-3">
                    <div className="flex items-center justify-between bg-black/40 rounded-full p-1.5 pl-3 border border-white/5">
                        
                        {/* Left: Label & Icon */}
                        <div className="flex items-center gap-2">
                            {/* Icon TV nhỏ */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-3.5 h-3.5 ${statusText}`}>
                                <path d="M19.5 6h-15v9h15V6z" />
                                <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25c0 1.035.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.84 21.66 3 20.625 3H3.375zm.75 12.75h15.75v-9H4.125v9zM12 15.75l-4.5-3 4.5-3v6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Daily Watch ADS
                            </span>
                        </div>

                        {/* Right: Progress Bar & Count */}
                        <div className="flex items-center gap-2 pr-1">
                            {/* Thanh Bar */}
                            <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${statusColor}`} 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            {/* Số đếm */}
                            <span className={`text-[10px] font-mono font-bold ${statusText}`}>
                                {adsData.watchedToday}<span className="text-slate-500">/30</span>
                            </span>
                        </div>

                    </div>
                </div>

                {/* --- ACTION BUTTONS --- */}
                <div className="w-full px-5 pb-5 z-10 flex gap-2 mt-auto">
                    
                    {/* BUTTON 1: NO THANKS (X1) */}
                    <button 
                        onClick={onClaimX1} 
                        disabled={isWatchingAd} 
                        className="flex-[1] py-2 bg-slate-700 hover:bg-slate-600 rounded-xl border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 transition-all flex flex-col items-center justify-center group h-14"
                    >
                         <span className="text-slate-400 text-[9px] font-bold uppercase leading-tight group-hover:text-slate-300">No Thanks</span>
                         <span className="font-lilita text-slate-200 text-base uppercase tracking-wide leading-tight">Collect</span>
                    </button>

                    {/* BUTTON 2: WATCH AD (X2) - LOGIC PHỨC TẠP */}
                    <button 
                        onClick={handleAdClick}
                        // Disable khi: Đang xem HOẶC Đang chờ cooldown HOẶC Hết lượt ngày
                        disabled={isWatchingAd || !isAvailable || isDailyLimitReached}
                        className={`flex-[2] relative group py-2 rounded-xl border-b-4 transition-all flex items-center justify-center overflow-hidden shadow-lg h-14
                            ${(!isAvailable || isDailyLimitReached)
                                ? 'bg-slate-800 border-slate-900 cursor-not-allowed grayscale opacity-80' // Style khi Disabled
                                : 'bg-gradient-to-b from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 border-orange-700 active:border-b-0 active:translate-y-1' // Style khi Active
                            }
                        `}
                    >
                        {/* Shimmer Effect (Chỉ hiện khi nút Active) */}
                        {isAvailable && !isDailyLimitReached && !isWatchingAd && (
                            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12 z-20" />
                        )}

                        {/* CASE 1: ĐANG LOADING (XEM AD) */}
                        {isWatchingAd ? (
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span className="font-lilita text-white text-sm">LOADING...</span>
                            </div>
                        ) : 
                        /* CASE 2: HẾT LƯỢT TRONG NGÀY */
                        isDailyLimitReached ? (
                             <div className="flex flex-col items-center leading-none">
                                <span className="font-lilita text-red-300 text-sm tracking-wide">LIMIT REACHED</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase">Resets Tomorrow</span>
                            </div>
                        ) : 
                        /* CASE 3: ĐANG CHỜ COOLDOWN */
                        !isAvailable ? (
                            <div className="flex flex-col items-center leading-none">
                                {/* Hiển thị đếm ngược MM:SS */}
                                <span className="font-lilita text-slate-300 text-lg tracking-widest">{formatTime(timeRemaining)}</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Cooldown</span>
                            </div>
                        ) : 
                        /* CASE 4: SẴN SÀNG */
                        (
                            <div className="flex items-center justify-center gap-3 z-10 w-full">
                                <div className="bg-black/20 p-1.5 rounded-lg border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-yellow-100">
                                        <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span className="font-lilita text-white text-xl drop-shadow-md">GET X2</span>
                                    <span className="text-[9px] font-bold text-yellow-900/80 uppercase tracking-wider">Watch Ad</span>
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SUB COMPONENT: REWARD ROW ---
const RewardRow = ({ icon, label, amount }: { icon: string, label: string, amount: number }) => (
    <div className="relative flex items-center justify-between bg-[#15161e] p-2.5 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
        {/* Left: Normal Amount */}
        <div className="flex items-center gap-3">
            <img src={icon} alt={label} className="w-8 h-8 object-contain drop-shadow-md" />
            <div className="flex flex-col">
                <span className="text-white font-lilita text-sm tracking-wide">{formatNum(amount)}</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase">{label}</span>
            </div>
        </div>
        
        {/* Center: Arrow Visual */}
        <div className="absolute left-1/2 -translate-x-1/2 text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
        </div>

        {/* Right: x2 Amount (Highlighted) */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-900/40 to-green-800/20 px-2.5 py-1 rounded-lg border border-green-500/30">
            <span className="text-green-400 font-lilita text-base drop-shadow-sm">
                {formatNum(amount * 2)}
            </span>
        </div>
    </div>
);
