// --- START OF FILE src/shop.tsx ---

import React, { useState, useEffect } from 'react';
import { itemDatabase, ItemRank } from './home/equipment/item-database.ts';
import { uiAssets } from './game-assets.ts';
// --- THAY ĐỔI: Import thêm processGemExchange và auth ---
import { fetchOrCreateUserGameData, processShopPurchase, processGemExchange } from './gameDataService.ts'; // Giả định bạn sẽ thêm processGemExchange
import { auth } from './firebase.js';
import CoinDisplay from './ui/display/coin-display.tsx';
import GemDisplay from './ui/display/gem-display.tsx';
import HomeButton from './ui/home-button.tsx';
import { useAnimateValue } from './ui/useAnimateValue.ts';

// --- START: HELPERS & COMPONENTS SAO CHÉP TỪ INVENTORY.TSX ---
const getRarityColor = (rarity: string) => { switch(rarity) { case 'E': return 'border-gray-600'; case 'D': return 'border-green-700'; case 'B': return 'border-blue-500'; case 'A': return 'border-purple-500'; case 'S': return 'border-yellow-400'; case 'SR': return 'border-red-500'; case 'SSR': return 'border-rose-500'; default: return 'border-gray-600'; } };
const getRarityGradient = (rarity: string) => { switch(rarity) { case 'E': return 'from-gray-800/95 to-gray-900/95'; case 'D': return 'from-green-900/70 to-gray-900'; case 'B': return 'from-blue-800/80 to-gray-900'; case 'A': return 'from-purple-800/80 via-black/30 to-gray-900'; case 'S': return 'from-yellow-800/70 via-black/40 to-gray-900'; case 'SR': return 'from-red-800/80 via-orange-900/30 to-black'; case 'SSR': return 'from-rose-800/80 via-red-900/40 to-black'; default: return 'from-gray-800/95 to-gray-900/95'; } };
const getRarityTextColor = (rarity: string) => { switch(rarity) { case 'E': return 'text-gray-400'; case 'D': return 'text-green-400'; case 'B': return 'text-blue-400'; case 'A': return 'text-purple-400'; case 'S': return 'text-yellow-300'; case 'SR': return 'text-red-400'; case 'SSR': return 'text-rose-400'; default: return 'text-gray-400'; } };
const getRarityDisplayName = (rarity: string) => { if (!rarity) return 'Unknown Rank'; return `${rarity.toUpperCase()} Rank`; }
const formatStatName = (stat: string) => { const translations: { [key: string]: string } = { damage: 'Sát thương', health: 'Máu', durability: 'Độ bền', healing: 'Hồi máu', defense: 'Phòng thủ', energyRestore: 'Hồi năng lượng', magicBoost: 'Tăng phép', intelligence: 'Trí tuệ', resurrection: 'Hồi sinh', fireDamage: 'Sát thương lửa', strength: 'Sức mạnh', attackSpeed: 'Tốc độ tấn công', manaRegen: 'Hồi mana', range: 'Tầm xa', poisonDamage: 'Sát thương độc', duration: 'Thời gian', magicResist: 'Kháng phép', manaRestore: 'Hồi mana', speed: 'Tốc độ', cleanse: 'Thanh tẩy', strengthBoost: 'Tăng sức mạnh', luck: 'May mắn', lifeSteal: 'Hút Máu', darkDamage: 'ST Bóng Tối', critChance: 'Tỷ Lệ Chí Mạng'}; return translations[stat] || stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); };
const getUnlockedSkillCount = (rarity: string) => { switch(rarity) { case 'D': return 1; case 'B': return 2; case 'A': return 3; case 'S': return 4; case 'SR': return 5; case 'SSR': return 5; default: return 0; } };
const renderItemStats = (item: any) => { if (!item.stats) return null; return ( <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/20 p-3 rounded-lg border border-gray-700/50 text-sm"> {Object.entries(item.stats).map(([stat, value]) => ( <div key={stat} className="flex justify-between items-center"> <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span> <span className={'font-semibold text-gray-300'}>{stat.includes('Chance') || stat === 'lifeSteal' ? `${(Number(value) * 100).toFixed(0)}%` : value}</span> </div> ))} </div> ); };
const renderItemSkills = (item: any) => { if (!item.skills || item.skills.length === 0) return null; const unlockedCount = getUnlockedSkillCount(item.rarity); const unlockRanks = ['D', 'B', 'A', 'S', 'SR']; return ( <div className="space-y-2.5"> {item.skills.map((skill: any, index: number) => { const isLocked = index >= unlockedCount; const requiredRank = unlockRanks[index]; return ( <div key={index} className={`flex items-center gap-3 bg-black/30 p-3 rounded-lg border transition-all duration-200 ${isLocked ? 'border-gray-800/70' : 'border-gray-700/50'}`}> <div className={`relative flex-shrink-0 w-12 h-12 bg-gray-900/80 rounded-md flex items-center justify-center text-2xl border ${isLocked ? 'border-gray-700' : 'border-gray-600'}`}> {isLocked ? '🔒' : skill.icon} </div> <div className="flex-1"> <div className="flex justify-between items-center"> <h5 className={`font-semibold text-sm ${isLocked ? 'text-gray-500' : 'text-gray-100'}`}>{skill.name}</h5> {isLocked && (<span className="text-xs text-yellow-300 font-medium bg-black/40 px-2 py-1 rounded-md border border-yellow-700/40">{requiredRank} Rank</span>)} </div> <p className="text-xs text-gray-400 mt-0.5">{skill.description}</p> </div> </div> ); })} </div> ); };
// --- END: HELPERS & COMPONENTS SAO CHÉP ---

// --- SVG Icon Components ---
const Icon = ({ children, ...props }: React.SVGProps<SVGSVGElement> & { children: React.ReactNode }) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg> );
const Gem = (props: any) => ( <img src={uiAssets.gemIcon} alt="Gems" {...props} /> );
const Coins = (props: any) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin" {...props} /> );
const Tag = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></Icon> );
const RefreshCw = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></Icon> );
const ClipboardCopy = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></Icon> );
// --- THÊM MỚI: Icon cho chức năng đổi ---
const ArrowRightLeft = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></Icon> );
const ArrowRight = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></Icon> );


// --- Dữ liệu tĩnh ---
const sampleItemsNonWeapons = [ /* ... Dữ liệu cũ không đổi ... */ ];
const SHOP_WEAPON_RANKS: ItemRank[] = ['E', 'D', 'B', 'A', 'S', 'SR'];
const SHOP_WEAPON_PRICES: { [key in ItemRank]?: number } = { 'E': 100, 'D': 500, 'B': 1000, 'A': 2000, 'S': 5000, 'SR': 10000 };
const gemPackages = [ { id: 'gem_1', gems: 100, price: 20000, label: 'Gói Tiểu' }, { id: 'gem_2', gems: 525, price: 100000, label: 'Gói Trung', bonus: '5% bonus' }, { id: 'gem_3', gems: 1100, price: 200000, label: 'Gói Đại', bonus: '10% bonus' }, { id: 'gem_4', gems: 2875, price: 500000, label: 'Gói Khổng Lồ', bonus: '15% bonus' }, { id: 'gem_5', gems: 6000, price: 1000000, label: 'Gói Thần Thánh', bonus: '20% bonus' },];
// --- THÊM MỚI: Dữ liệu cho các gói đổi Gem sang Coin ---
const gemExchangePackages = [
    { id: 'ex_10', gems: 10, coins: 10 * 1000 },
    { id: 'ex_50', gems: 50, coins: 50 * 1000 },
    { id: 'ex_100', gems: 100, coins: 100 * 1000 },
    { id: 'ex_200', gems: 200, coins: 200 * 1000 },
    { id: 'ex_500', gems: 500, coins: 500 * 1000 },
    { id: 'ex_1000', gems: 1000, coins: 1000 * 1000 },
];
const BANK_INFO = { ID: '970422', ACCOUNT_NO: '19036924369018', ACCOUNT_NAME: 'LE VAN LONG' };
const shuffleArray = (array: any[]) => { let currentIndex = array.length, randomIndex; while (currentIndex !== 0) { randomIndex = Math.floor(Math.random() * currentIndex); currentIndex--; [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]; } return array; };
const generateDailyShopWeapons = () => { const allWeapons = Array.from(itemDatabase.values()).filter(item => item.type === 'weapon'); const selectedWeapons = shuffleArray(allWeapons).slice(0, 10); return selectedWeapons.map(weapon => { const randomRank = SHOP_WEAPON_RANKS[Math.floor(Math.random() * SHOP_WEAPON_RANKS.length)]; const price = SHOP_WEAPON_PRICES[randomRank] || 100; const trimmedIcon = weapon.icon ? weapon.icon.trim() : ''; const imageUrl = trimmedIcon.startsWith('http') ? trimmedIcon : `https://placehold.co/600x600/1a1a2e/ffffff?text=${encodeURIComponent(trimmedIcon || '❓')}`; return { id: weapon.id, name: weapon.name, type: 'Vũ khí', rarity: randomRank, price: price, image: imageUrl, description: weapon.description, }; }); };
const getShopItems = () => { try { const storedData = localStorage.getItem('dailyShopData'); const storedTimestamp = localStorage.getItem('dailyShopTimestamp'); const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); if (storedData && storedTimestamp && parseInt(storedTimestamp, 10) === today) { return JSON.parse(storedData); } else { const newItems = generateDailyShopWeapons(); localStorage.setItem('dailyShopData', JSON.stringify(newItems)); localStorage.setItem('dailyShopTimestamp', today.toString()); return newItems; } } catch (error) { console.error("Could not access localStorage. Generating temporary shop data.", error); return generateDailyShopWeapons(); } };

const ShopItemCard = ({ item, onSelect }: { item: any; onSelect: (item: any) => void }) => { /* ... Component không đổi ... */ };
const GemPackageCard = ({ pkg, onSelect }: { pkg: any; onSelect: (pkg: any) => void }) => { /* ... Component không đổi ... */ };

// --- THÊM MỚI: Component cho thẻ đổi Gems ---
const GemExchangeCard = ({ pack, onSelect }: { pack: any; onSelect: (pack: any) => void }) => {
    return (
        <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/80 to-cyan-900/40 border border-slate-700 transition-all duration-300 hover:border-cyan-500 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer flex flex-col" onClick={() => onSelect(pack)}>
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-600/50 z-10">
                <Gem className="w-4 h-4" />
                <span className="text-sm font-bold text-white">{pack.gems.toLocaleString()}</span>
            </div>
            <div className="relative flex-grow flex items-center justify-center p-8 pt-14 pb-6">
                <div className="flex items-center gap-4 transition-transform duration-300 group-hover:scale-105">
                    <Gem className="w-12 h-12" />
                    <ArrowRight className="w-8 h-8 text-cyan-400 opacity-70" />
                    <Coins className="w-12 h-12" />
                </div>
            </div>
            <div className="p-4 bg-black/40 border-t border-slate-700 group-hover:border-cyan-500 transition-colors duration-300 mt-auto flex items-center justify-center gap-2">
                <Coins className="w-5 h-5"/>
                <p className="text-lg font-semibold text-yellow-300 text-center">
                    {pack.coins.toLocaleString('vi-VN')}
                </p>
            </div>
        </div>
    );
};


const CategoryTabs = ({ activeCategory, setActiveCategory }: { activeCategory: string; setActiveCategory: (category: string) => void }) => {
    // --- THAY ĐỔI: Thêm tab "Đổi Gems" ---
    const categories = [
        { name: 'Nạp Gems', icon: Gem },
        { name: 'Đổi Gems', icon: ArrowRightLeft },
        { name: 'Item', icon: Tag },
    ];
    return (
        <nav className="flex flex-wrap gap-2 mb-8">
            {categories.map(({ name, icon: IconComponent }) => (
                <button key={name} onClick={() => setActiveCategory(name)} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${ activeCategory === name ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' }`}>
                    <IconComponent className="w-5 h-5" />
                    <span>{name}</span>
                </button>
            ))}
        </nav>
    );
};
const PaymentQRModal = ({ pkg, onClose, currentUser }: { pkg: any | null; onClose: () => void; currentUser: any | null }) => { /* ... Component không đổi ... */ };
const ShopCountdown = () => { /* ... Component không đổi ... */ };
const ItemDetailModal = ({ item, onClose, onPurchase, currentCoins }: { item: any | null; onClose: () => void; onPurchase: (item: any, quantity: number) => Promise<void>; currentCoins: number; }) => { /* ... Component không đổi ... */ };

// --- THÊM MỚI: Modal xác nhận đổi Gems ---
const ExchangeConfirmationModal = ({ pack, onClose, onConfirm, currentGems }: { pack: any | null; onClose: () => void; onConfirm: (pack: any) => Promise<void>; currentGems: number; }) => {
    const [isExchanging, setIsExchanging] = useState(false);
    if (!pack) return null;

    const canAfford = currentGems >= pack.gems;
    const handleConfirmClick = async () => {
        if (isExchanging || !canAfford) return;
        setIsExchanging(true);
        try {
            await onConfirm(pack);
            onClose();
        } catch (error) {
            console.error("Exchange failed:", error);
        } finally {
            setIsExchanging(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-3">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-gradient-to-br from-slate-900 to-cyan-900/50 p-6 rounded-xl border-2 border-cyan-500 shadow-2xl w-full max-w-sm z-50">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-cyan-300">Xác Nhận Đổi</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Close" className="w-5 h-5" /></button>
                </div>
                <div className="my-6 space-y-4 text-center">
                    <p className="text-slate-300">Bạn có chắc chắn muốn thực hiện giao dịch này?</p>
                    <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 space-y-3">
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-slate-400">Chi phí:</span>
                            <div className="flex items-center gap-2 font-bold text-white">
                                {pack.gems.toLocaleString()} <Gem className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-slate-400">Nhận được:</span>
                            <div className="flex items-center gap-2 font-bold text-yellow-300">
                                {pack.coins.toLocaleString()} <Coins className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                     <p className="text-sm text-slate-400">Số dư Gems hiện tại: <span className="font-bold text-white">{currentGems.toLocaleString()}</span></p>
                </div>
                <div className="flex flex-col gap-3 mt-8">
                    <button
                        onClick={handleConfirmClick}
                        disabled={!canAfford || isExchanging}
                        className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-base uppercase px-5 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
                    >
                        {isExchanging ? 'ĐANG XỬ LÝ...' : (canAfford ? 'XÁC NHẬN' : 'KHÔNG ĐỦ GEMS')}
                    </button>
                    <button onClick={onClose} className="w-full bg-slate-700/50 text-slate-300 font-semibold py-2.5 rounded-lg hover:bg-slate-700 transition-colors">
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- HEADER MỚI CỦA CỬA HÀNG ---
const ShopHeader = ({ onClose, userGold, userGems, isLoading }: { onClose: () => void; userGold: number; userGems: number; isLoading: boolean; }) => {
    const navItems = ['Cửa Hàng', 'Nhiệm Vụ', 'Bang Hội', 'Sự Kiện'];
    const activeNav = 'Cửa Hàng';
    const animatedGold = useAnimateValue(userGold, 500);
    const animatedGems = useAnimateValue(userGems, 500);

    return (
        <header className="sticky top-0 left-0 right-0 z-40 bg-slate-900 border-b border-white/10">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between h-[53px] px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <HomeButton onClick={onClose} label="" title="Về trang chính" />
                    <nav className="hidden md:flex items-center gap-4">
                        {navItems.map(item => ( <a key={item} href="#" className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${ activeNav === item ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white' }`}>{item}</a> ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <GemDisplay displayedGems={isLoading ? 0 : animatedGems} />
                    <CoinDisplay displayedCoins={isLoading ? 0 : animatedGold} isStatsFullscreen={false} />
                </div>
            </div>
        </header>
    );
};

// --- Component Chính Của Cửa Hàng ---
const GameShopUI = ({ onClose, onPurchaseComplete }: { onClose: () => void; onPurchaseComplete: () => void; }) => {
    const currentUser = auth.currentUser;
    const [coins, setCoins] = useState(0);
    const [gems, setGems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Nạp Gems');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [selectedGemPackage, setSelectedGemPackage] = useState<any | null>(null);
    // --- THÊM MỚI: State cho việc chọn gói đổi gems ---
    const [selectedExchangePackage, setSelectedExchangePackage] = useState<any | null>(null);
    const [allItems, setAllItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchShopData = async () => {
            if (!currentUser) { setIsLoading(false); return; }
            try { setIsLoading(true); const gameData = await fetchOrCreateUserGameData(currentUser.uid); setCoins(gameData.coins); setGems(gameData.gems); const dailyWeapons = getShopItems(); setAllItems([...dailyWeapons, ...sampleItemsNonWeapons]); } catch (error) { console.error("Failed to fetch shop data:", error); } finally { setIsLoading(false); }
        };
        fetchShopData();
    }, [currentUser]);

    const handleLocalPurchase = async (item: any, quantity: number) => {
        if (!currentUser) throw new Error("User not authenticated.");
        try { const { newCoins } = await processShopPurchase(currentUser.uid, item, quantity); setCoins(newCoins); onPurchaseComplete(); alert(`Mua thành công x${quantity} ${item.name}!`); } catch (error) { console.error("Shop purchase transaction failed:", error); alert(`Mua thất bại: ${error instanceof Error ? error.message : String(error)}`); throw error; }
    };
    
    // --- THÊM MỚI: Logic xử lý việc đổi Gems ---
    const handleConfirmExchange = async (pack: any) => {
        if (!currentUser) throw new Error("User not authenticated.");
        try {
            // Giả định bạn đã tạo hàm processGemExchange trong gameDataService.ts
            const { newCoins, newGems } = await processGemExchange(currentUser.uid, pack.gems, pack.coins);
            setCoins(newCoins);
            setGems(newGems);
            onPurchaseComplete(); // Báo cho context game cập nhật lại dữ liệu
            alert(`Đổi thành công ${pack.gems} Gems để nhận ${pack.coins.toLocaleString()} Coins!`);
        } catch (error) {
            console.error("Gem exchange transaction failed:", error);
            alert(`Đổi thất bại: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    };

    const handleSelectItem = (shopItem: any) => { const baseItem = itemDatabase.get(shopItem.id); if (!baseItem && !shopItem.stackable && ['Vũ khí'].includes(shopItem.type)) { console.error(`Vật phẩm với ID ${shopItem.id} không tìm thấy trong database.`); setSelectedItem(shopItem); return; } const detailedItem = { ...(baseItem || {}), ...shopItem, }; setSelectedItem(detailedItem); };
    const handleSelectGemPackage = (pkg: any) => setSelectedGemPackage(pkg);
    const handleCloseItemModal = () => setSelectedItem(null);
    const handleCloseGemModal = () => setSelectedGemPackage(null);
    // --- THÊM MỚI: Handlers cho modal đổi gems ---
    const handleSelectExchangePackage = (pack: any) => setSelectedExchangePackage(pack);
    const handleCloseExchangeModal = () => setSelectedExchangePackage(null);


    return (
        <div className="w-full h-full overflow-y-auto bg-slate-900 font-sans text-white">
            <ShopHeader onClose={onClose} userGold={coins} userGems={gems} isLoading={isLoading} />
            <div className="absolute inset-0 top-[53px] bg-grid-slate-800/40 [mask-image:linear-gradient(0deg,#000000,rgba(0,0,0,0))]"></div>
            <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24">
                <main>
                    <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                    <section>
                        <div className="flex justify-between items-center mb-4 pr-2">
                            <h2 className="text-2xl font-bold text-white">{activeCategory}</h2>
                            {activeCategory === 'Item' && <ShopCountdown />}
                        </div>
                        {activeCategory === 'Nạp Gems' ? (
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {gemPackages.map(pkg => ( <GemPackageCard key={pkg.id} pkg={pkg} onSelect={handleSelectGemPackage} /> ))}
                            </div>
                        ) : activeCategory === 'Đổi Gems' ? ( // --- THÊM MỚI: Giao diện cho Đổi Gems ---
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {gemExchangePackages.map(pack => (
                                    <GemExchangeCard key={pack.id} pack={pack} onSelect={handleSelectExchangePackage} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {allItems .filter(item => ["Vũ khí", "Trang bị", "Trang phục", "Item", "Rương"].includes(item.type)) .map(item => ( <ShopItemCard key={`${item.id}-${item.name}-${item.rarity}`} item={item} onSelect={handleSelectItem} /> ))}
                            </div>
                        )}
                    </section>
                </main>
                {selectedItem && <ItemDetailModal item={selectedItem} onClose={handleCloseItemModal} onPurchase={handleLocalPurchase} currentCoins={coins} />}
                {selectedGemPackage && <PaymentQRModal pkg={selectedGemPackage} onClose={handleCloseGemModal} currentUser={currentUser} />}
                {/* --- THÊM MỚI: Render modal xác nhận đổi gems --- */}
                {selectedExchangePackage && <ExchangeConfirmationModal pack={selectedExchangePackage} onClose={handleCloseExchangeModal} onConfirm={handleConfirmExchange} currentGems={gems} />}
            </div>
            <style jsx global>{` .bg-grid-slate-800\\/40 { background-image: linear-gradient(white 2px, transparent 2px), linear-gradient(to right, white 2px, transparent 2px); background-size: 6rem 6rem; background-position: -0.5rem -0.5rem; opacity: 0.1; pointer-events: none; } `}</style>
        </div>
    );
};

// --- Component Wrapper để export ---
export default function App({ onClose, onPurchaseComplete }: { onClose: () => void; onPurchaseComplete: () => void; }) {
    return <GameShopUI onClose={onClose} onPurchaseComplete={onPurchaseComplete} />;
}
// --- END OF FILE src/shop.tsx ---
