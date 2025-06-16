import React, { useState, useEffect } from 'react';
import { itemDatabase, ItemRank, ItemDefinition } from './inventory/item-database.ts';
import { uiAssets } from './game-assets.ts';

// --- SVG Icon Components (thay thế cho lucide-react) ---
const Icon = ({ children, ...props }: React.SVGProps<SVGSVGElement> & { children: React.ReactNode }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        {children}
    </svg>
);
const Shield = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon> );
const Gem = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M6 3h12l4 6-10 13L2 9z"/><path d="M12 22 6 9l-4-6"/><path d="M12 22 18 9l4-6"/></Icon> );
const Swords = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M14.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4-4L14.5 3.5z"/><path d="M19.5 8.5a2.12 2.12 0 0 1-3-3L10 12l4 4L19.5 8.5z"/></Icon> );
const Coins = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></Icon> );
const Sparkles = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="m12 3-1.9 4.2-4.3.4 3.3 2.9-1 4.2 3.6-2.3 3.6 2.3-1-4.2 3.3-2.9-4.3-.4L12 3z"/><path d="M5 12.5 3.1 14 5 15.5"/><path d="M19 12.5 20.9 14 19 15.5"/></Icon> );
const ShoppingCart = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" /></Icon> );
const Tag = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></Icon> );
const RefreshCw = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></Icon> );

// --- Dữ liệu tĩnh cho các loại vật phẩm khác ---
const sampleItemsNonWeapons = [
    { id: 1002, name: 'Giáp Thiên Thần', type: 'Trang bị', rarity: 'Sử thi', price: 1820, image: 'https://placehold.co/600x600/1a1a2e/87ceeb?text=🛡️', description: 'Bộ giáp mang lại sự bảo vệ tối thượng và khả năng hồi phục máu theo thời gian.' },
    { id: 1006, name: 'Khiên Bất Diệt', type: 'Trang bị', rarity: 'Sử thi', price: 2000, image: 'https://placehold.co/600x600/1a1a2e/c0c0c0?text=🛡️', description: 'Một chiếc khiên không thể bị phá hủy, chặn mọi đòn tấn công từ phía trước.' },
    { id: 1004, name: 'Gói Trang Phục Hắc Tinh', type: 'Trang phục', rarity: 'Sử thi', price: 2200, image: 'https://placehold.co/600x600/1a1a2e/9370db?text=✨', description: 'Thay đổi ngoại hình của bạn thành một thực thể vũ trụ bí ẩn và quyền năng.' },
    { id: 1003, name: 'Ngọc Tái Sinh', type: 'Vật phẩm', rarity: 'Hiếm', price: 975, image: 'https://placehold.co/600x600/1a1a2e/32cd32?text=💎', description: 'Hồi sinh ngay lập tức tại chỗ khi bị hạ gục. Chỉ có thể sử dụng một lần mỗi trận.' },
    { id: 1007, name: 'Vé Nâng Cấp VIP', type: 'Vật phẩm', rarity: 'Phổ thông', price: 500, image: 'https://placehold.co/600x600/1a1a2e/f0e68c?text=🎟️', description: 'Nhận đặc quyền VIP trong 30 ngày, bao gồm tăng kinh nghiệm và vật phẩm nhận được.' },
    { id: 1008, name: 'Rương Kho Báu Bí Ẩn', type: 'Rương', rarity: 'Hiếm', price: 750, image: 'https://placehold.co/600x600/1a1a2e/d2b48c?text=📦', description: 'Mở để có cơ hội nhận được một vật phẩm quý hiếm ngẫu nhiên từ danh sách phần thưởng.' },
];

// --- Cấu hình màu sắc & giá cho các cấp độ hiếm ---
const rarityConfig = {
    'SSR': { color: 'red-500', shadow: 'red-500/50', gradient: 'from-red-800/80 via-orange-900/30 to-black' },
    'SR': { color: 'rose-400', shadow: 'rose-400/50', gradient: 'from-red-800/80 via-orange-900/30 to-black' },
    'S': { color: 'amber-400', shadow: 'amber-400/50', gradient: 'from-yellow-800/70 via-black/40 to-gray-900' },
    'A': { color: 'purple-500', shadow: 'purple-500/50', gradient: 'from-purple-800/80 via-black/30 to-gray-900' },
    'B': { color: 'sky-400', shadow: 'sky-400/50', gradient: 'from-blue-800/80 to-gray-900' },
    'D': { color: 'green-400', shadow: 'green-400/50', gradient: 'from-green-900/70 to-gray-900' },
    'E': { color: 'gray-400', shadow: 'gray-400/50', gradient: 'from-gray-800/95 to-gray-900/95' },
    // Giữ lại rank cũ để các vật phẩm khác không bị lỗi
    'Huyền thoại': { color: 'amber-400', shadow: 'amber-400/50', gradient: 'from-yellow-800/70 via-black/40 to-gray-900' },
    'Sử thi': { color: 'purple-500', shadow: 'purple-500/50', gradient: 'from-purple-800/80 via-black/30 to-gray-900' },
    'Hiếm': { color: 'sky-400', shadow: 'sky-400/50', gradient: 'from-blue-800/80 to-gray-900' },
    'Phổ thông': { color: 'gray-400', shadow: 'gray-400/50', gradient: 'from-gray-800/95 to-gray-900/95' },
};

const SHOP_WEAPON_RANKS: ItemRank[] = ['E', 'D', 'B', 'A', 'S', 'SR'];
const SHOP_WEAPON_PRICES: { [key in ItemRank]?: number } = {
    'E': 100, 'D': 500, 'B': 1000, 'A': 2000, 'S': 5000, 'SR': 10000
};

// --- Logic Tạo và Quản lý Vật phẩm Cửa hàng Hàng ngày ---
const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

const generateDailyShopWeapons = () => {
    const allWeapons = Array.from(itemDatabase.values()).filter(item => item.type === 'weapon');
    const selectedWeapons = shuffleArray(allWeapons).slice(0, 10);

    return selectedWeapons.map(weapon => {
        const randomRank = SHOP_WEAPON_RANKS[Math.floor(Math.random() * SHOP_WEAPON_RANKS.length)];
        const price = SHOP_WEAPON_PRICES[randomRank] || 100;
        
        const trimmedIcon = weapon.icon ? weapon.icon.trim() : '';

        const imageUrl = trimmedIcon.startsWith('http')
            ? trimmedIcon
            : `https://placehold.co/600x600/1a1a2e/ffffff?text=${encodeURIComponent(trimmedIcon || '❓')}`;

        return {
            id: weapon.id,
            name: weapon.name,
            type: 'Vũ khí',
            rarity: randomRank,
            price: price,
            image: imageUrl,
            description: weapon.description,
            // Thêm stats và skills để hiển thị trong modal chi tiết mới
            stats: weapon.stats,
            skills: weapon.skills,
        };
    });
};


const getShopItems = () => {
    try {
        const storedData = localStorage.getItem('dailyShopData');
        const storedTimestamp = localStorage.getItem('dailyShopTimestamp');
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (storedData && storedTimestamp && parseInt(storedTimestamp, 10) === today) {
            return JSON.parse(storedData);
        } else {
            const newItems = generateDailyShopWeapons();
            localStorage.setItem('dailyShopData', JSON.stringify(newItems));
            localStorage.setItem('dailyShopTimestamp', today.toString());
            return newItems;
        }
    } catch (error) {
        console.error("Could not access localStorage. Generating temporary shop data.", error);
        return generateDailyShopWeapons();
    }
};

// --- Component Thẻ Vật phẩm ---
const ShopItemCard = ({ item, onSelect }: { item: any; onSelect: (item: any) => void }) => {
    const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig['E'];
    return (
        <div 
            className="group relative overflow-hidden rounded-lg bg-slate-800/60 border border-slate-700 transition-all duration-300 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer"
            onClick={() => onSelect(item)}
        >
            <div className={`absolute -inset-0.5 rounded-lg bg-gradient-to-r from-${config.color} to-cyan-400 opacity-0 group-hover:opacity-75 transition duration-500 blur-md`}></div>
            <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-40 object-contain object-center p-4" />
                <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-900/80 text-${config.color} border border-${config.color}`}>
                    {item.rarity}
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1.5">
                        <Gem className={`w-4 h-4 text-${config.color}`} />
                        <span className="text-lg font-bold text-white">{item.price.toLocaleString()}</span>
                    </div>
                    <button className="text-xs font-semibold text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        CHI TIẾT
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Component Thanh Tabs Danh mục ---
const CategoryTabs = ({ activeCategory, setActiveCategory }: { activeCategory: string; setActiveCategory: (category: string) => void }) => {
    const categories = [
        { name: 'Vũ khí', icon: Swords },
        { name: 'Trang bị', icon: Shield },
        { name: 'Trang phục', icon: Sparkles },
        { name: 'Vật phẩm', icon: Tag },
        { name: 'Rương', icon: ShoppingCart },
    ];
    
    return (
        <nav className="flex flex-wrap gap-2 mb-8">
            {categories.map(({ name, icon: IconComponent }) => (
                <button
                    key={name}
                    onClick={() => setActiveCategory(name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
                        activeCategory === name 
                        ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                    <IconComponent className="w-5 h-5" />
                    <span>{name}</span>
                </button>
            ))}
        </nav>
    );
};

// --- START: CÁC HÀM HỖ TRỢ RENDER MODAL (TỪ INVENTORY) ---
const formatStatName = (stat: string) => {
    const translations: { [key: string]: string } = { damage: 'Sát thương', health: 'Máu', durability: 'Độ bền', healing: 'Hồi máu', defense: 'Phòng thủ', energyRestore: 'Hồi năng lượng', magicBoost: 'Tăng phép', intelligence: 'Trí tuệ', resurrection: 'Hồi sinh', fireDamage: 'Sát thương lửa', strength: 'Sức mạnh', attackSpeed: 'Tốc độ tấn công', manaRegen: 'Hồi mana', range: 'Tầm xa', poisonDamage: 'Sát thương độc', duration: 'Thời gian', magicResist: 'Kháng phép', manaRestore: 'Hồi mana', speed: 'Tốc độ', cleanse: 'Thanh tẩy', strengthBoost: 'Tăng sức mạnh', luck: 'May mắn' };
    return translations[stat] || stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

const renderItemStats = (item: any) => {
    if (!item.stats) return null;
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 bg-black/20 p-3 rounded-lg border border-gray-700/50 text-sm">
        {Object.entries(item.stats).map(([stat, value]) => (
          <div key={stat} className="flex justify-between items-center">
            <span className="text-gray-400 capitalize text-xs">{formatStatName(stat)}:</span>
            <span className={'font-semibold text-gray-300'}>{stat.includes('Percent') || stat === 'magicBoost' ? `+${value}%` : value}</span>
          </div>
        ))}
      </div>
    );
};

const getUnlockedSkillCount = (rarity: string) => {
    switch(rarity) {
        case 'D': return 1; case 'B': return 2; case 'A': return 3; case 'S': return 4; case 'SR': return 5; case 'SSR': return 5;
        default: return 0;
    }
};

const renderItemSkills = (item: any) => {
    if (!item.skills || item.skills.length === 0) return null;
    const unlockedCount = getUnlockedSkillCount(item.rarity);
    const unlockRanks = ['D', 'B', 'A', 'S', 'SR'];
    return (
        <div className="space-y-2.5">
            {item.skills.map((skill: any, index: number) => {
                const isLocked = index >= unlockedCount;
                const requiredRank = unlockRanks[index];
                return (
                    <div key={index} className={`flex items-center gap-3 bg-black/30 p-3 rounded-lg border transition-all duration-200 ${isLocked ? 'border-gray-800/70' : 'border-gray-700/50'}`}>
                        <div className={`relative flex-shrink-0 w-12 h-12 bg-gray-900/80 rounded-md flex items-center justify-center text-2xl border ${isLocked ? 'border-gray-700' : 'border-gray-600'}`}>
                           {isLocked ? '🔒' : skill.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h5 className={`font-semibold text-sm ${isLocked ? 'text-gray-500' : 'text-gray-100'}`}>{skill.name}</h5>
                                {isLocked && (<span className="text-xs text-yellow-300 font-medium bg-black/40 px-2 py-1 rounded-md border border-yellow-700/40">{requiredRank} Rank</span>)}
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{skill.description}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
// --- END: CÁC HÀM HỖ TRỢ ---


// --- Component Chi tiết Vật phẩm (Modal) - Thiết kế lại ---
const ItemDetailModal = ({ item, onClose }: { item: any | null; onClose: () => void }) => {
    const [activeModalTab, setActiveModalTab] = useState<'info' | 'skills'>('info');
    
    useEffect(() => {
        if (item) setActiveModalTab('info');
    }, [item]);

    if (!item) return null;
    
    const config = rarityConfig[item.rarity as keyof typeof rarityConfig] || rarityConfig['E'];
    const hasSkills = item.skills && item.skills.length > 0;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
            <div className={`relative bg-gradient-to-br ${config.gradient} p-5 rounded-xl border-2 border-${config.color} shadow-2xl w-full max-w-md max-h-[90vh] transition-all duration-300 animate-scale-up z-50 flex flex-col`}>
                
                {/* Header */}
                <div className="flex-shrink-0 border-b border-gray-700/50 pb-4">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-2xl font-bold text-${config.color}`}>{item.name}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors text-xl -mt-1 -mr-1">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center bg-black/30 rounded-lg border-2 border-${config.color} shadow-inner flex-shrink-0 relative overflow-hidden mx-auto sm:mx-0`}>
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center mb-2 gap-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-${config.color} bg-gray-800/70 border border-gray-700 capitalize`}>{item.rarity} Rank</span>
                                <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span>
                            </div>
                            <p className="text-gray-300 leading-relaxed text-sm ">{item.description}</p>
                        </div>
                    </div>
                    {hasSkills && (
                        <nav className="flex -mb-[18px] space-x-4 px-1">
                            <button onClick={() => setActiveModalTab('info')} className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${activeModalTab === 'info' ? `border-cyan-400 text-cyan-300` : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Thông Tin</button>
                            <button onClick={() => setActiveModalTab('skills')} className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${activeModalTab === 'skills' ? `border-cyan-400 text-cyan-300` : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Kỹ Năng</button>
                        </nav>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-h-[150px] overflow-y-auto scrollbar-hidden">
                    <div className="modal-tab-content pt-4 pb-2">
                        {(!hasSkills || activeModalTab === 'info') ? renderItemStats(item) : renderItemSkills(item)}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 mt-auto flex flex-col gap-4 border-t border-gray-700/50 pt-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <p className="text-sm text-gray-400">Giá vật phẩm</p>
                        <div className="flex items-center space-x-3 mt-1">
                            <Gem className={`w-8 h-8 text-${config.color}`} />
                            <span className="text-3xl font-bold text-white">{item.price.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-stretch gap-3">
                        <button className={`flex-1 bg-gradient-to-r from-${config.color} to-cyan-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}>MUA NGAY</button>
                        <button className="bg-slate-700 text-white font-bold p-3 rounded-lg hover:bg-slate-600 transition-colors duration-300">TẶNG</button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
                .scrollbar-hidden::-webkit-scrollbar { display: none; }
                .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes modal-tab-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
                .modal-tab-content { animation: modal-tab-fade-in 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000); }
            `}</style>
        </div>
    );
};

// --- Component Đồng hồ đếm ngược ---
const ShopCountdown = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
            const difference = tomorrow.getTime() - now.getTime();

            if (difference > 0) {
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({
                    hours: hours.toString().padStart(2, '0'),
                    minutes: minutes.toString().padStart(2, '0'),
                    seconds: seconds.toString().padStart(2, '0'),
                });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-slate-400">
            <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '2s' }}/>
            <span>Làm mới sau:</span>
            <span className="font-mono font-bold text-slate-200 tracking-wider">
                {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
            </span>
        </div>
    );
};

// --- Component Chính Của Cửa Hàng ---
const GameShopUI = ({ onClose }: { onClose: () => void }) => {
    const [activeCategory, setActiveCategory] = useState('Vũ khí');
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [allItems, setAllItems] = useState<any[]>([]);

    useEffect(() => {
        const dailyWeapons = getShopItems();
        setAllItems([...dailyWeapons, ...sampleItemsNonWeapons]);
    }, []);

    const gridItems = allItems.filter(item => item.type === activeCategory);
    
    const handleSelectItem = (item: any) => setSelectedItem(item);
    const handleCloseModal = () => setSelectedItem(null);

    return (
        <div className="relative w-full h-full overflow-y-auto bg-slate-900 font-sans text-white">
            <button onClick={onClose} className="absolute top-4 right-4 lg:top-6 lg:right-6 z-[60]" aria-label="Đóng cửa hàng">
                <img src={uiAssets.closeIcon} alt="Close" className="w-5 h-5" />
            </button>
            <div className="absolute inset-0 bg-grid-slate-800/40 [mask-image:linear-gradient(0deg,#000000,rgba(0,0,0,0))]"></div>
            <div className="relative max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 pb-24">
                <main>
                    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h1 className="text-3xl font-bold text-white">Cửa Hàng</h1>
                        <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-2">
                                <Coins className="w-6 h-6 text-yellow-400" />
                                <span className="font-bold text-lg">15,280</span>
                            </div>
                            <div className="w-px h-6 bg-slate-600"></div>
                            <div className="flex items-center gap-2">
                                <Gem className="w-6 h-6 text-cyan-400" />
                                <span className="font-bold text-lg">3,250</span>
                            </div>
                            <button className="ml-2 bg-yellow-500 text-slate-900 font-bold text-sm px-3 py-1.5 rounded-md hover:bg-yellow-400 transition-colors">NẠP</button>
                        </div>
                    </header>

                    <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

                    <section>
                        <div className="flex justify-between items-center mb-4 pr-2">
                            <h2 className="text-2xl font-bold text-white">{activeCategory}</h2>
                            {activeCategory === 'Vũ khí' && <ShopCountdown />}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                            {gridItems.map(item => (
                                <ShopItemCard key={`${item.id}-${item.name}-${item.rarity}`} item={item} onSelect={handleSelectItem} />
                            ))}
                        </div>
                    </section>
                </main>
                {selectedItem && <ItemDetailModal item={selectedItem} onClose={handleCloseModal} />}
            </div>
            <style jsx global>{`
              .bg-grid-slate-800\\/40 {
                background-image: linear-gradient(white 2px, transparent 2px), linear-gradient(to right, white 2px, transparent 2px);
                background-size: 6rem 6rem;
                background-position: -0.5rem -0.5rem;
                opacity: 0.1;
                pointer-events: none;
              }
            `}</style>
        </div>
    );
};

// --- Component Wrapper để export ---
export default function App({ onClose }: { onClose: () => void }) {
    return <GameShopUI onClose={onClose} />;
}
