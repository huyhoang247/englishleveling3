import React, { useState } from 'react';

// --- SVG Icon Components (thay thế cho lucide-react) ---
const Icon = ({ children, ...props }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        {children}
    </svg>
);

const Shield = (props) => (
    <Icon {...props}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
);

const Gem = (props) => (
    <Icon {...props}>
        <path d="M6 3h12l4 6-10 13L2 9z"/>
        <path d="M12 22 6 9l-4-6"/>
        <path d="M12 22 18 9l4-6"/>
    </Icon>
);

const Swords = (props) => (
    <Icon {...props}>
        <path d="M14.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4-4L14.5 3.5z"/>
        <path d="M19.5 8.5a2.12 2.12 0 0 1-3-3L10 12l4 4L19.5 8.5z"/>
    </Icon>
);

const Star = (props) => (
    <Icon {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Icon>
);

const Coins = (props) => (
    <Icon {...props}>
        <circle cx="8" cy="8" r="6" />
        <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
        <path d="M7 6h1v4" />
        <path d="m16.71 13.88.7.71-2.82 2.82" />
    </Icon>
);

const Sparkles = (props) => (
    <Icon {...props}>
        <path d="m12 3-1.9 4.2-4.3.4 3.3 2.9-1 4.2 3.6-2.3 3.6 2.3-1-4.2 3.3-2.9-4.3-.4L12 3z"/>
        <path d="M5 12.5 3.1 14 5 15.5"/>
        <path d="M19 12.5 20.9 14 19 15.5"/>
    </Icon>
);

const ShoppingCart = (props) => (
    <Icon {...props}>
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" />
    </Icon>
);

const Tag = (props) => (
    <Icon {...props}>
        <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"/>
        <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
    </Icon>
);


// --- Dữ liệu mẫu cho cửa hàng ---
const sampleItems = [
    {
        id: 1,
        name: 'Kiếm Rồng Lửa',
        type: 'Vũ khí',
        rarity: 'Huyền thoại',
        price: 2950,
        image: 'https://placehold.co/600x600/1a1a2e/ff6347?text=⚔️',
        description: 'Thanh kiếm được rèn từ vảy của rồng lửa cổ đại, có khả năng thiêu đốt mọi kẻ thù.',
        featured: true, // Item này sẽ được làm nổi bật
    },
    {
        id: 2,
        name: 'Giáp Thiên Thần',
        type: 'Trang bị',
        rarity: 'Sử thi',
        price: 1820,
        image: 'https://placehold.co/600x600/1a1a2e/87ceeb?text=🛡️',
        description: 'Bộ giáp mang lại sự bảo vệ tối thượng và khả năng hồi phục máu theo thời gian.'
    },
    {
        id: 3,
        name: 'Ngọc Tái Sinh',
        type: 'Vật phẩm',
        rarity: 'Hiếm',
        price: 975,
        image: 'https://placehold.co/600x600/1a1a2e/32cd32?text=💎',
        description: 'Hồi sinh ngay lập tức tại chỗ khi bị hạ gục. Chỉ có thể sử dụng một lần mỗi trận.'
    },
    {
        id: 4,
        name: 'Gói Trang Phục Hắc Tinh',
        type: 'Trang phục',
        rarity: 'Sử thi',
        price: 2200,
        image: 'https://placehold.co/600x600/1a1a2e/9370db?text=✨',
        description: 'Thay đổi ngoại hình của bạn thành một thực thể vũ trụ bí ẩn và quyền năng.'
    },
    {
        id: 5,
        name: 'Búa Sét Thần Thor',
        type: 'Vũ khí',
        rarity: 'Huyền thoại',
        price: 3250,
        image: 'https://placehold.co/600x600/1a1a2e/ffd700?text=🔨',
        description: 'Triệu hồi sức mạnh của sấm sét để tiêu diệt kẻ thù và làm choáng các mục tiêu xung quanh.'
    },
    {
        id: 6,
        name: 'Khiên Bất Diệt',
        type: 'Trang bị',
        rarity: 'Sử thi',
        price: 2000,
        image: 'https://placehold.co/600x600/1a1a2e/c0c0c0?text=🛡️',
        description: 'Một chiếc khiên không thể bị phá hủy, chặn mọi đòn tấn công từ phía trước.'
    },
    {
        id: 7,
        name: 'Vé Nâng Cấp VIP',
        type: 'Vật phẩm',
        rarity: 'Phổ thông',
        price: 500,
        image: 'https://placehold.co/600x600/1a1a2e/f0e68c?text=🎟️',
        description: 'Nhận đặc quyền VIP trong 30 ngày, bao gồm tăng kinh nghiệm và vật phẩm nhận được.'
    },
    {
        id: 8,
        name: 'Rương Kho Báu Bí Ẩn',
        type: 'Rương',
        rarity: 'Hiếm',
        price: 750,
        image: 'https://placehold.co/600x600/1a1a2e/d2b48c?text=📦',
        description: 'Mở để có cơ hội nhận được một vật phẩm quý hiếm ngẫu nhiên từ danh sách phần thưởng.'
    },
];

const rarityConfig = {
    'Huyền thoại': { color: 'amber-400', shadow: 'amber-400/50' },
    'Sử thi': { color: 'purple-500', shadow: 'purple-500/50' },
    'Hiếm': { color: 'sky-400', shadow: 'sky-400/50' },
    'Phổ thông': { color: 'gray-400', shadow: 'gray-400/50' },
};

// --- Component Thẻ Vật phẩm trong Grid ---
const ShopItemCard = ({ item, onSelect }) => {
    const config = rarityConfig[item.rarity] || rarityConfig['Phổ thông'];
    return (
        <div 
            className="group relative overflow-hidden rounded-lg bg-slate-800/60 border border-slate-700 transition-all duration-300 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer"
            onClick={() => onSelect(item)}
        >
            {/* Rarity Glow Effect */}
            <div className={`absolute -inset-0.5 rounded-lg bg-gradient-to-r from-${config.color} to-cyan-400 opacity-0 group-hover:opacity-75 transition duration-500 blur-md`}></div>
            <div className="relative">
                <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                {/* Rarity Badge */}
                <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-900/80 text-${config.color} border border-${config.color}`}>
                    {item.rarity}
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-1.5">
                        <Gem className={`w-4 h-4 text-${config.color}`} />
                        <span className="text-lg font-bold text-white">{item.price}</span>
                    </div>
                    <button className="text-xs font-semibold text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        CHI TIẾT
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Component Vật phẩm Nổi bật ---
const FeaturedItem = ({ item, onSelect }) => {
    if (!item) return null;
    const config = rarityConfig[item.rarity] || rarityConfig['Phổ thông'];
    return (
        <div 
            onClick={() => onSelect(item)}
            className={`relative grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-slate-800/50 rounded-xl p-6 md:p-8 border border-slate-700 shadow-2xl shadow-${config.shadow} cursor-pointer`}>
            {/* Left Side: Image */}
            <div className="flex items-center justify-center">
                   <img src={item.image} alt={item.name} className="w-full max-w-xs md:max-w-sm rounded-lg object-contain drop-shadow-2xl" />
            </div>
            {/* Right Side: Details */}
            <div className="flex flex-col text-center md:text-left">
                <span className={`font-bold text-sm uppercase tracking-widest text-${config.color}`}>Vật phẩm nổi bật</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white my-2">{item.name}</h2>
                <p className="text-slate-300 mb-6 text-sm md:text-base">{item.description}</p>
                   <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                        <div className="flex items-center space-x-2 bg-slate-900/50 px-4 py-2 rounded-lg">
                            <Gem className={`w-6 h-6 text-${config.color}`} />
                            <span className="text-2xl font-bold text-white">{item.price}</span>
                        </div>
                        <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Xem chi tiết
                        </button>
                    </div>
            </div>
        </div>
    );
};

// --- Component Sidebar ---
const Sidebar = ({ activeCategory, setActiveCategory }) => {
    const categories = [
        { name: 'Nổi Bật', icon: Star },
        { name: 'Vũ khí', icon: Swords },
        { name: 'Trang bị', icon: Shield },
        { name: 'Trang phục', icon: Sparkles },
        { name: 'Vật phẩm', icon: Tag },
        { name: 'Rương', icon: ShoppingCart },
    ];
    
    return (
        <nav className="flex flex-col space-y-2">
            {categories.map(({ name, icon: Icon }) => (
                <button
                    key={name}
                    onClick={() => setActiveCategory(name)}
                    className={`flex items-center space-x-3 p-3 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                        activeCategory === name 
                        ? 'bg-cyan-500/20 text-cyan-300' 
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                    }`}
                >
                    <Icon className="w-5 h-5" />
                    <span>{name}</span>
                </button>
            ))}
        </nav>
    );
};

// --- Component Chi tiết Vật phẩm (Modal) ---
const ItemDetailModal = ({ item, onClose }) => {
    if (!item) return null;
    const config = rarityConfig[item.rarity] || rarityConfig['Phổ thông'];

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-8 p-6 md:p-8 relative animate-scale-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {/* Cột hình ảnh (2/5 width) */}
                <div className="md:col-span-2 flex flex-col items-center justify-center">
                    <img src={item.image} alt={item.name} className={`w-full h-auto max-h-[450px] object-contain rounded-lg drop-shadow-[0_0_35px_rgba(var(--shadow-color),0.5)]`} style={{ '--shadow-color': `var(--color-${config.color})` }}/>
                </div>

                {/* Cột thông tin (3/5 width) */}
                <div className="md:col-span-3 flex flex-col">
                    <span className={`text-sm font-bold uppercase tracking-wider text-${config.color}`}>{item.type}</span>
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white my-1">{item.name}</h2>
                    <span className={`text-lg font-bold mb-4 text-${config.color}`}>{item.rarity}</span>
                    
                    <p className="text-gray-300 mb-6 flex-grow">{item.description}</p>
                    
                    <div className="bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-700">
                        <p className="text-sm text-gray-400">Giá vật phẩm</p>
                        <div className="flex items-center space-x-3 mt-1">
                            <Gem className={`w-8 h-8 text-${config.color}`} />
                            <span className="text-3xl font-bold text-white">{item.price}</span>
                        </div>
                    </div>

                    <div className="flex items-stretch gap-4">
                        <button className={`flex-1 bg-gradient-to-r from-${config.color} to-cyan-400 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}>
                            MUA NGAY
                        </button>
                        <button className="bg-slate-700 text-white font-bold p-3 rounded-lg hover:bg-slate-600 transition-colors duration-300">
                            TẶNG
                        </button>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

// --- Component Chính Của Cửa Hàng ---
const GameShopUI = () => {
    const [activeCategory, setActiveCategory] = useState('Nổi Bật');
    const [selectedItem, setSelectedItem] = useState(null);

    const featuredItem = sampleItems.find(item => item.featured);
    const gridItems = sampleItems.filter(item => {
        if (activeCategory === 'Nổi Bật') return true;
        return item.type === activeCategory;
    });
    
    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    return (
        <div className="w-full min-h-screen bg-slate-900 font-sans text-white">
            <div 
                className="absolute inset-0 bg-grid-slate-800/40 [mask-image:linear-gradient(0deg,#000000,rgba(0,0,0,0))]">
            </div>
            <div className="relative flex flex-col lg:flex-row max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
                {/* --- Sidebar --- */}
                <aside className="w-full lg:w-56 lg:pr-8 mb-8 lg:mb-0 flex-shrink-0">
                    <h1 className="text-2xl font-bold text-white mb-6">Cửa Hàng</h1>
                    <Sidebar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
                </aside>

                {/* --- Main Content --- */}
                <main className="flex-1">
                    {/* Header */}
                    <header className="flex flex-col sm:flex-row justify-end items-center mb-8">
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
                            <button className="ml-2 bg-yellow-500 text-slate-900 font-bold text-sm px-3 py-1.5 rounded-md hover:bg-yellow-400 transition-colors">
                                NẠP
                            </button>
                        </div>
                    </header>
                    
                    {/* Featured Item Section */}
                    {activeCategory === 'Nổi Bật' && featuredItem && (
                        <section className="mb-10">
                            <FeaturedItem item={featuredItem} onSelect={handleSelectItem} />
                        </section>
                    )}

                    {/* Items Grid */}
                    <section>
                            <h2 className="text-2xl font-bold text-white mb-4">{activeCategory}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {gridItems.map(item => (
                                    <ShopItemCard key={item.id} item={item} onSelect={handleSelectItem} />
                                ))}
                            </div>
                    </section>
                </main>

                {/* --- Modal --- */}
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

// --- App Component Wrapper ---
export default function App() {
    return <GameShopUI />;
}
