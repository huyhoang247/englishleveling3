import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import CoinDisplay from './ui/display/coin-display.tsx';

// --- SVG Icons (Giữ nguyên) ---
const CoinsIcon = ({ className, src }: { className?: string; src?: string }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Coin Icon"
        className={className}
        onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=X'; }}
      />
    );
  }
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a2 2 0 114 0 2 2 0 01-4 0zm2-8a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" fillRule="evenodd"></path>
    </svg>
  );
};

const pickaxeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_00000000d394622fa7e3b147c6b84a11.png';
const PickaxeIcon = ({ className }: { className?: string }) => <img src={pickaxeIconUrl} alt="Pickaxe Icon" className={className} onError={(e) => { e.currentTarget.src = 'https://placehold.co/24x24/cccccc/000000?text=P'; }} />;
const ZapIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"></path> </svg> );
const TrophyIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v2a2 2 0 002 2h2v2a2 2 0 002 2h4a2 2 0 002-2v-2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2h-4zm0 2h4v2h-4V4zm-2 4h12v2H8V8z"></path> </svg> );
const HeartIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path> </svg> );
const GiftIcon = ({ className }: { className?: string }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20"> <path d="M12 0H8a2 2 0 00-2 2v2H2a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4V2a2 2 0 00-2-2zm-2 2h4v2h-4V2zm-6 6h16v8H2V8z"></path> </svg> );
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );

// --- Interfaces ---
interface Item {
  icon: React.FC<{ className?: string }> | string;
  name: string;
  value: number; 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'jackpot';
  color: string;
  rewardType?: 'coin' | 'pickaxe' | 'other';
  rewardAmount?: number;
}
interface StripItem extends Item {
  uniqueId: string;
}
interface LuckyChestGameProps {
  onClose: () => void;
  isStatsFullscreen: boolean;
  currentCoins: number;
  onUpdateCoins: (amount: number) => void;
  onUpdatePickaxes: (amount: number) => void;
  currentJackpotPool: number;
  onUpdateJackpotPool: (amount: number, resetToDefault?: boolean) => void;
}
interface RewardPopupProps {
  item: Item;
  jackpotWon: boolean;
  onClose: () => void;
}

// --- UTILITY FUNCTIONS ---
const getRarityColor = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return '#9ca3af'; // gray
      case 'uncommon': return '#34d399'; // emerald
      case 'rare': return '#38bdf8'; // sky
      case 'epic': return '#a78bfa'; // violet
      case 'legendary': return '#fbbf24'; // amber
      case 'jackpot': return '#f59e0b'; // orange
      default: return '#9ca3af';
    }
};

// Style thẻ giống vong-quay.tsx nhưng map theo rarity của lucky-game
const getCardStyle = (rarity: Item['rarity']) => {
    switch(rarity) {
      case 'common': return { bg: 'bg-gradient-to-b from-slate-800 to-slate-900', border: 'border-slate-600', glow: 'shadow-none' };
      case 'uncommon': return { bg: 'bg-gradient-to-b from-emerald-900/40 to-slate-900', border: 'border-emerald-600', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]' };
      case 'rare': return { bg: 'bg-gradient-to-b from-cyan-900/40 to-slate-900', border: 'border-cyan-500', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.3)]' };
      case 'epic': return { bg: 'bg-gradient-to-b from-fuchsia-900/40 to-slate-900', border: 'border-fuchsia-500', glow: 'shadow-[0_0_20px_rgba(232,121,249,0.4)]' };
      case 'legendary': return { bg: 'bg-gradient-to-b from-amber-700/40 to-slate-900', border: 'border-amber-400', glow: 'shadow-[0_0_30px_rgba(251,191,36,0.5)]' };
      case 'jackpot': return { bg: 'bg-gradient-to-b from-red-600 via-amber-600 to-slate-900', border: 'border-yellow-300', glow: 'shadow-[0_0_40px_rgba(252,211,77,0.6)]' };
      default: return { bg: 'bg-slate-800', border: 'border-slate-700', glow: '' };
    }
};

// --- CONFIG ---
const CARD_WIDTH = 120; // Kích thước thẻ lớn hơn như vong-quay.tsx
const CARD_GAP = 16;
const VISIBLE_CARDS = 5; // Số thẻ nhìn thấy
const ITEM_FULL_WIDTH = CARD_WIDTH + CARD_GAP;

// --- POPUP ---
const RewardPopup = ({ item, jackpotWon, onClose }: RewardPopupProps) => {
    const rarityColor = getRarityColor(item.rarity);
    return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`relative w-80 bg-slate-900/90 border rounded-xl shadow-2xl animate-fade-in-scale-fast text-white flex flex-col items-center p-6 text-center
            ${jackpotWon ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.4)]' : 'border-slate-600'}`
        }
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2 right-2 text-slate-400 hover:text-white">✕</button>
        
        {jackpotWon ? (
          <>
            <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png" alt="Jackpot" className="w-24 h-24 mb-2 animate-bounce-subtle drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
            <h2 className="text-4xl font-black text-yellow-400 tracking-widest uppercase mb-2">JACKPOT!</h2>
            <p className="text-yellow-100/80 text-sm mb-4">Bạn đã trúng toàn bộ quỹ thưởng!</p>
            <div className="flex items-center justify-center gap-2 bg-slate-800/60 w-full py-3 rounded-lg border border-yellow-500/30 mb-6">
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
                <span className="text-3xl font-bold text-yellow-400">{item.value.toLocaleString()}</span>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold uppercase mb-6 tracking-wider" style={{ color: rarityColor }}>You received</h2>
            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-4 bg-slate-800 shadow-xl border-2`} style={{borderColor: rarityColor}}>
                {typeof item.icon === 'string' ? (
                    <img src={item.icon} alt={item.name} className="w-16 h-16 object-contain drop-shadow-lg" />
                ) : (
                    <item.icon className={`w-16 h-16 ${item.color} drop-shadow-lg`} />
                )}
            </div>
            
            <p className="font-bold text-lg uppercase tracking-wide mb-1" style={{ color: rarityColor }}>{item.rarity}</p>
            <p className="text-slate-400 text-sm mb-6 uppercase tracking-widest">{item.name || 'Reward'}</p>

            {(item.rewardType === 'coin' || item.rewardAmount) && (
                <div className="flex items-center justify-center gap-2 bg-slate-800/60 px-6 py-2 rounded-lg border border-slate-700 mb-6">
                    {item.rewardType === 'coin' && <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-5 h-5" />}
                    {item.rewardType === 'pickaxe' && <PickaxeIcon className="w-5 h-5" />}
                    <span className="text-xl font-bold text-white">
                        {item.rewardType === 'coin' ? item.value.toLocaleString() : `x${item.rewardAmount}`}
                    </span>
                </div>
            )}
          </>
        )}
        
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white uppercase tracking-wider transition-all active:scale-95"
        >
          Collect
        </button>
      </div>
    </div>
    );
};

// --- MAIN COMPONENT ---
const LuckyChestGame = ({ onClose, isStatsFullscreen, currentCoins, onUpdateCoins, onUpdatePickaxes, currentJackpotPool, onUpdateJackpotPool }: LuckyChestGameProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [jackpotWon, setJackpotWon] = useState(false);
  const [jackpotAnimation, setJackpotAnimation] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [wonRewardDetails, setWonRewardDetails] = useState<Item | null>(null);

  // Spinner State
  const [strip, setStrip] = useState<StripItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [transitionDuration, setTransitionDuration] = useState(0);

  const items: Item[] = useMemo(() => [
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 150, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 150 },
    { icon: ZapIcon, name: 'Energy', value: 0, rarity: 'uncommon', color: 'text-cyan-400', rewardType: 'other', rewardAmount: 1 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'uncommon', color: '', rewardType: 'pickaxe', rewardAmount: 5 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 300, rarity: 'uncommon', color: '', rewardType: 'coin', rewardAmount: 300 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'rare', color: '', rewardType: 'pickaxe', rewardAmount: 10 },
    { icon: pickaxeIconUrl, name: 'Pickaxes', value: 0, rarity: 'epic', color: '', rewardType: 'pickaxe', rewardAmount: 15 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 500, rarity: 'rare', color: '', rewardType: 'coin', rewardAmount: 500 },
    { icon: TrophyIcon, name: 'Trophy', value: 0, rarity: 'legendary', color: 'text-orange-400', rewardType: 'other', rewardAmount: 1 },
    { icon: HeartIcon, name: 'Life', value: 0, rarity: 'uncommon', color: 'text-red-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/jackpot.png', name: 'JACKPOT', value: 0, rarity: 'jackpot', color: '', rewardType: 'coin' },
    { icon: GiftIcon, name: 'Mystery', value: 0, rarity: 'epic', color: 'text-pink-400', rewardType: 'other', rewardAmount: 1 },
    { icon: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png', name: 'Coins', value: 100, rarity: 'common', color: '', rewardType: 'coin', rewardAmount: 100 },
  ], []);

  const getRandomFiller = useCallback(() => {
    const fillerItems = items.filter(i => i.rarity !== 'jackpot');
    return fillerItems[Math.floor(Math.random() * fillerItems.length)];
  }, [items]);

  // Init Strip
  useEffect(() => {
    const initStrip: StripItem[] = [];
    // Tạo strip tĩnh ban đầu để hiển thị đẹp
    for(let i=0; i<VISIBLE_CARDS + 5; i++) {
        initStrip.push({ ...getRandomFiller(), uniqueId: `init-${i}` });
    }
    setStrip(initStrip);
  }, [getRandomFiller]);

  const spinChest = useCallback(() => {
    if (isSpinning || currentCoins < 100) return;

    // Logic tiền
    onUpdateCoins(-100);
    const randomCoinsToAdd = Math.floor(Math.random() * (100 - 10 + 1)) + 10;
    onUpdateJackpotPool(randomCoinsToAdd);

    setIsSpinning(true);
    setJackpotWon(false);
    setShowRewardPopup(false);

    // Xác định kết quả
    let winner: Item;
    if (Math.random() < 0.01) { // 1% Jackpot
        winner = items.find(i => i.rarity === 'jackpot')!;
    } else {
        const others = items.filter(i => i.rarity !== 'jackpot');
        winner = others[Math.floor(Math.random() * others.length)];
    }

    // Tạo strip mới cho vòng quay
    // Bắt đầu từ 0, người thắng ở vị trí TARGET_INDEX
    const TARGET_INDEX = 40; 
    const newStrip: StripItem[] = [];
    
    // Fillers trước
    for (let i = 0; i < TARGET_INDEX; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-pre-${Date.now()}-${i}` });
    }
    // Người thắng
    newStrip.push({ ...winner, uniqueId: `winner-${Date.now()}` });
    // Fillers sau
    for (let i = 0; i < 15; i++) {
        newStrip.push({ ...getRandomFiller(), uniqueId: `spin-post-${Date.now()}-${i}` });
    }

    setStrip(newStrip);
    setTransitionDuration(0);
    setOffset(0);

    // Tính toán vị trí offset để đưa winner vào chính giữa
    // Công thức: -(Vị trí thẻ thắng) + (Một nửa chiều rộng container) - (Một nửa chiều rộng thẻ)
    // Thêm Jitter để kim không trỏ chính giữa tuyệt đối (tạo cảm giác thật)
    setTimeout(() => {
        const jitter = Math.floor(Math.random() * (CARD_WIDTH * 0.4)) - (CARD_WIDTH * 0.2); 
        
        // Giả sử container width dựa trên VISIBLE_CARDS
        const CONTAINER_WIDTH = (VISIBLE_CARDS * ITEM_FULL_WIDTH) - CARD_GAP;
        const CENTER_OFFSET = CONTAINER_WIDTH / 2;
        
        const targetX = (TARGET_INDEX * ITEM_FULL_WIDTH) + (CARD_WIDTH / 2);
        const finalOffset = -(targetX - CENTER_OFFSET) + jitter;

        setTransitionDuration(5); // 5 giây quay
        setOffset(finalOffset);
        
        // Xử lý khi quay xong
        setTimeout(() => {
            setIsSpinning(false);
            
            let actualValue = winner.value;
            if (winner.rewardType === 'pickaxe' && winner.rewardAmount) {
                onUpdatePickaxes(winner.rewardAmount);
                actualValue = winner.rewardAmount;
            } else if (winner.rarity === 'jackpot') {
                actualValue = currentJackpotPool;
                setJackpotWon(true);
                setJackpotAnimation(true);
                onUpdateCoins(actualValue);
                onUpdateJackpotPool(0, true);
                setTimeout(() => setJackpotAnimation(false), 3000);
            } else if (winner.rewardType === 'coin') {
                onUpdateCoins(winner.value);
            }

            setWonRewardDetails({ ...winner, value: actualValue });
            setShowRewardPopup(true);

        }, 5100); // Đợi hơn 5s một chút
    }, 50);

  }, [isSpinning, currentCoins, items, onUpdateCoins, onUpdatePickaxes, onUpdateJackpotPool, currentJackpotPool, getRandomFiller]);
  
  return (
    <div className="min-h-screen bg-[#050505] bg-grid-pattern flex flex-col items-center font-sans pb-4 overflow-hidden relative">
      
      {/* Background Ambience (Giống vong-quay.tsx) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#000000_70%)] opacity-60" />
      </div>

      <header className="relative w-full flex items-center justify-between py-2 px-4 bg-black/40 backdrop-blur-md z-20 border-b border-slate-800">
        <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors">
          <HomeIcon className="w-5 h-5 text-slate-300" />
          <span className="hidden sm:inline text-sm font-semibold text-slate-300">Trang Chính</span>
        </button>
        <CoinDisplay 
          displayedCoins={currentCoins}
          isStatsFullscreen={isStatsFullscreen}
        />
      </header>

      <div className="w-full max-w-5xl px-4 pt-8 flex-1 flex flex-col items-center">
        
        {/* --- JACKPOT UI (GIỮ NGUYÊN TỪ FILE GỐC) --- */}
        <div className="text-center mb-10 w-full max-w-lg z-10">
            <div className={`mt-2 p-3 rounded-xl border-4 transition-all duration-500 relative ${ jackpotAnimation ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 border-yellow-300 animate-pulse scale-110 shadow-2xl' : 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 border-purple-400 shadow-lg' }`}>
              <div className="text-yellow-200 text-base font-bold mb-1 tracking-wider"> JACKPOT POOL </div>
              <div className={`text-4xl font-black text-white drop-shadow-lg flex items-center justify-center gap-1 ${ jackpotAnimation ? 'animate-bounce' : '' }`}>
                {currentJackpotPool.toLocaleString()}
                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-8 h-8" />
              </div>
              <div className="text-yellow-200 text-xs mt-2 opacity-90"> Tỉ lệ quay trúng ô JACKPOT: 1%! </div>
              {jackpotAnimation && ( <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-ping rounded-xl"></div> )}
            </div>
        </div>
        
        {/* --- NEW SPINNER UI (GIỐNG vong-quay.tsx) --- */}
        <div className="relative w-full max-w-4xl mb-12">
            
            {/* Decorative Rails */}
            <div className="absolute -top-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-700 to-transparent opacity-50"></div>
            <div className="absolute -bottom-3 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-700 to-transparent opacity-50"></div>

            {/* Main Window */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-950/80 backdrop-blur-sm border-y border-slate-800 shadow-2xl"
                 style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
                
                {/* The Strip */}
                <div 
                    className="absolute top-0 bottom-0 left-[50%] flex items-center pl-0 will-change-transform"
                    style={{
                        transform: `translateX(calc(${offset}px - ${CARD_WIDTH / 2}px))`, // Center alignment fix
                        transition: isSpinning ? `transform ${transitionDuration}s cubic-bezier(0.12, 0.8, 0.3, 1.0)` : 'none',
                    }}
                >
                    {strip.map((item, index) => {
                        const style = getCardStyle(item.rarity);
                        return (
                            <div 
                                key={item.uniqueId} 
                                className="flex-shrink-0 flex items-center justify-center"
                                style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
                            >
                                <div className={`
                                    relative w-full aspect-[4/5] rounded-lg 
                                    bg-gradient-to-b ${style.bg}
                                    border ${style.border}
                                    flex flex-col items-center justify-center gap-2
                                    ${style.glow}
                                    transition-all duration-300
                                    shadow-lg
                                    ${isSpinning ? 'opacity-90' : 'opacity-100'}
                                `}>
                                    {/* Inner Highlight */}
                                    <div className="absolute inset-[1px] rounded-lg bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                                    {/* Icon Container */}
                                    <div className="relative z-10 p-2 rounded-full bg-slate-950/40 ring-1 ring-white/10 w-14 h-14 flex items-center justify-center">
                                        {typeof item.icon === 'string' ? (
                                            <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain drop-shadow-md" />
                                        ) : (
                                            <item.icon className={`w-10 h-10 ${item.color} drop-shadow-md`} />
                                        )}
                                    </div>
                                    
                                    {/* Text Info */}
                                    <div className="relative z-10 text-center w-full px-1">
                                        <div className={`text-[10px] font-bold uppercase tracking-wider opacity-90 truncate ${item.rarity === 'jackpot' ? 'text-yellow-400' : 'text-slate-200'}`}>
                                            {item.name || item.rarity}
                                        </div>
                                        <div className="text-xs font-black text-white drop-shadow-sm mt-0.5">
                                            {item.rarity === 'jackpot' ? '$$$' : (item.rewardAmount ? `x${item.rewardAmount}` : item.value)}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* --- CENTER TARGET (The Laser Pointer) --- */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[140px] pointer-events-none z-20">
                {/* Top Marker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                
                {/* Bottom Marker */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                
                {/* Center Laser Line */}
                <div className="absolute top-2 bottom-2 left-1/2 w-[2px] bg-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>

                {/* Side Brackets (Tech feel) */}
                <div className="absolute inset-y-4 left-0 w-2 border-l border-y border-cyan-500/20 rounded-l-lg"></div>
                <div className="absolute inset-y-4 right-0 w-2 border-r border-y border-cyan-500/20 rounded-r-lg"></div>
            </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="flex flex-col items-center justify-center z-20">
              <button
                onClick={spinChest}
                disabled={isSpinning || currentCoins < 100}
                className={`
                    relative group w-48 py-4 rounded-sm font-bold text-lg uppercase tracking-[0.2em]
                    transition-all duration-300
                    flex items-center justify-center overflow-hidden
                    ${isSpinning || currentCoins < 100
                        ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed' 
                        : 'bg-cyan-600 text-white hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] border border-cyan-400'
                    }
                `}
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
              >
                {/* Shine Effect */}
                {!isSpinning && currentCoins >= 100 && (
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                    {isSpinning ? (
                        <span className="text-sm">ROLLING...</span>
                    ) : (
                        <>
                            <span className="mb-0.5">SPIN</span>
                            <div className="flex items-center gap-1.5 text-xs opacity-90 bg-black/20 px-2 py-0.5 rounded">
                                <span>100</span>
                                <CoinsIcon src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" className="w-3 h-3" />
                            </div>
                        </>
                    )}
                </div>
              </button>
              
              {currentCoins < 100 && !isSpinning && (
                  <p className="text-red-500 text-xs mt-3 font-semibold uppercase tracking-wide bg-red-950/40 px-3 py-1 rounded border border-red-900/50">
                      Not enough coins
                  </p>
              )}
        </div>

      </div>

      {showRewardPopup && wonRewardDetails && ( <RewardPopup item={wonRewardDetails} jackpotWon={jackpotWon} onClose={() => setShowRewardPopup(false)} /> )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .font-lilita { font-family: 'Lilita One', cursive; }
        .bg-grid-pattern {
          background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
        
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        .animate-shine { animation: shine 1s linear infinite; }
        
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LuckyChestGame;
