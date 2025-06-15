import React, { useState } from 'react';

const closeIconUrl = 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/close.png';

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

const Gift = (props) => (
    <Icon {...props}>
        <rect x="3" y="8" width="18" height="4" rx="1"></rect>
        <path d="M12 8v13"></path>
        <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path>
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A2.5 2.5 0 0 1 12 5.5V8"></path>
        <path d="M16.5 8a2.5 2.5 0 0 0 0-5A2.5 2.5 0 0 0 12 5.5V8"></path>
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
        id: 9,
        name: 'Dao Găm Bóng Đêm',
        type: 'Vũ khí',
        rarity: 'Hiếm',
        price: 950,
        image: 'https://placehold.co/600x600/1a1a2e/483d8b?text=🔪',
        description: 'Tẩm độc, gây sát thương theo thời gian và làm chậm kẻ địch.'
    },
    {
        id: 10,
        name: 'Trường Thương Băng Giá',
        type: 'Vũ khí',
        rarity: 'Sử thi',
        price: 1850,
        image: 'https://placehold.co/600x600/1a1a2e/00ffff?text=🔱',
        description: 'Mỗi đòn đánh có tỉ lệ làm đóng băng mục tiêu trong thoáng chốc.'
    },
    {
        id: 11,
        name: 'Cung Tên Tinh Linh',
        type: 'Vũ khí',
        rarity: 'Sử thi',
        price: 2100,
        image: 'https://placehold.co/600x600/1a1a2e/98fb98?text=🏹',
        description: 'Bắn ra những mũi tên ánh sáng có khả năng xuyên qua nhiều mục tiêu.'
    },
    {
        id: 12,
        name: 'Rìu Chiến Nham Thạch',
        type: 'Vũ khí',
        rarity: 'Huyền thoại',
        price: 3100,
        image: 'https://placehold.co/600x600/1a1a2e/dc143c?text=🪓',
        description: 'Vũ khí cực nặng, tạo ra một vùng dung nham gây sát thương diện rộng khi bổ xuống đất.'
    },
    {
        id: 13,
        name: 'Song Kiếm Gió Lốc',
        type: 'Vũ khí',
        rarity: 'Sử thi',
        price: 2350,
        image: 'https://placehold.co/600x600/1a1a2e/afeeee?text=⚔️',
        description: 'Tăng tốc độ di chuyển và tốc độ đánh của người sở hữu.'
    },
    {
        id: 14,
        name: 'Quyền Trượng Mặt Trăng',
        type: 'Vũ khí',
        rarity: 'Hiếm',
        price: 1350,
        image: 'https://placehold.co/600x600/1a1a2e/e6e6fa?text=🌙',
        description: 'Tích tụ năng lượng ánh trăng để bắn ra một luồng sát thương phép mạnh mẽ.'
    },
    {
        id: 15,
        name: 'Nỏ Liên Châu',
        type: 'Vũ khí',
        rarity: 'Hiếm',
        price: 1100,
        image: 'https://placehold.co/600x600/1a1a2e/8b4513?text=🏹',
        description: 'Có khả năng bắn ra 3 mũi tên cùng một lúc với độ chính xác cao.'
    },
    {
        id: 16,
        name: 'Đoản Đao Cổ Xưa',
        type: 'Vũ khí',
        rarity: 'Phổ thông',
        price: 450,
        image: 'https://placehold.co/600x600/1a1a2e/a9a9a9?text=🗡️',
        description: 'Một vũ khí đáng tin cậy cho những nhà thám hiểm mới bắt đầu.'
    },
    {
        id: 17,
        name: 'Gậy Phép Thuật Sơ Cấp',
        type: 'Vũ khí',
        rarity: 'Phổ thông',
        price: 400,
        image: 'https://placehold.co/600x600/1a1a2e/deb887?text=🪄',
        description: 'Dành cho các pháp sư tập sự, bắn ra những quả cầu năng lượng nhỏ.'
    },
    {
        id: 18,
        name: 'Đại Đao Hủy Diệt',
        type: 'Vũ khí',
        rarity: 'Huyền thoại',
        price: 3500,
        image: 'https://placehold.co/600x600/1a1a2e/4b0082?text=🔪',
        description: 'Càng ít máu, sát thương của đại đao càng trở nên khủng khiếp.'
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
        id: 6,
        name: 'Khiên Bất Diệt',
        type: 'Trang bị',
        rarity: 'Sử thi',
        price: 2000,
        image: 'https://placehold.co/600x600/1a1a2e/c0c0c0?text=🛡️',
        description: 'Một chiếc khiên không thể bị phá hủy, chặn mọi đòn tấn công từ phía trước.'
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
        id: 3,
        name: 'Ngọc Tái Sinh',
        type: 'Vật phẩm',
        rarity: 'Hiếm',
        price: 975,
        image: 'https://placehold.co/600x600/1a1a2e/32cd32?text=💎',
        description: 'Hồi sinh ngay lập tức tại chỗ khi bị hạ gục. Chỉ có thể sử dụng một lần mỗi trận.'
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
    'Huyền thoại': { color: 'amber-400', glow: '251, 191, 36' }, // #fbb_f_5_2_4
    'Sử thi': { color: 'purple-500', glow: '168, 85, 247' }, // #a855f7
    'Hiếm': { color: 'sky-400', glow: '56, 189, 248' }, // #3_8_b_df_8
    'Phổ thông': { color: 'gray-400', glow: '156, 163, 175' }, // #9_ca_3_af
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

// --- Component Thanh Tabs Danh mục (Thay thế cho Sidebar) ---
const CategoryTabs = ({ activeCategory, setActiveCategory }) => {
    const categories = [
        { name: 'Vũ khí', icon: Swords },
        { name: 'Trang bị', icon: Shield },
        { name: 'Trang phục', icon: Sparkles },
        { name: 'Vật phẩm', icon: Tag },
        { name: 'Rương', icon: ShoppingCart },
    ];
    
    return (
        <nav className="flex flex-wrap gap-2 mb-8">
            {categories.map(({ name, icon: Icon }) => (
                <button
                    key={name}
                    onClick={() => setActiveCategory(name)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
                        activeCategory === name 
                        ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
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
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 p-6 relative animate-scale-up overflow-hidden"
                style={{ '--glow-color': config.glow }}
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-glow -z-10 opacity-60"></div>
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/80"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                {/* Cột hình ảnh */}
                <div className="flex items-center justify-center">
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full max-w-sm h-auto object-contain rounded-lg drop-shadow-[0_0_25px_rgba(255,255,255,0.1)] animate-float"
                    />
                </div>

                {/* Cột thông tin */}
                <div className="flex flex-col text-center md:text-left z-10">
                    <h2 className={`text-3xl lg:text-4xl font-extrabold text-white my-1 text-shadow-glow`}>{item.name}</h2>
                    
                    <hr className="border-slate-700/80 my-4" />

                    {/* Thuộc tính */}
                    <div className="mb-4">
                        <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Thuộc tính</h4>
                        <div className="flex gap-3 justify-center md:justify-start">
                           <div className="flex items-center gap-2 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700">
                                <Tag className="w-4 h-4 text-slate-300" />
                                <span className="text-sm text-slate-200 font-medium">{item.type}</span>
                           </div>
                           <div className="flex items-center gap-2 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700">
                                <Star className={`w-4 h-4 text-${config.color}`} />
                                <span className={`text-sm text-${config.color} font-bold`}>{item.rarity}</span>
                           </div>
                        </div>
                    </div>
                    
                    {/* Mô tả */}
                    <div className="mb-6 flex-grow">
                        <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Mô tả</h4>
                        <p className="text-slate-300 text-sm leading-relaxed">{item.description}</p>
                    </div>

                    <hr className="border-slate-700/80 my-4" />

                    {/* Khu vực mua */}
                    <div className="flex items-center justify-between gap-4 mt-auto">
                        <div className="flex items-center space-x-2">
                            <Gem className={`w-7 h-7 text-${config.color}`} />
                            <span className="text-3xl font-bold text-white">{item.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="p-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors duration-300" title="Tặng quà">
                                <Gift className="w-5 h-5"/>
                            </button>
                            <button className={`flex-1 bg-gradient-to-r from-${config.color} to-cyan-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}>
                                MUA
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style jsx>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scale-up { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                    100% { transform: translateY(0px); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
                .animate-scale-up { animation: scale-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .bg-glow {
                    background-image: radial-gradient(circle at 50% 50%, rgba(var(--glow-color), 0.25) 0%, transparent 70%);
                }
                .text-shadow-glow {
                    text-shadow: 0 0 15px rgba(var(--glow-color), 0.3);
                }
            `}</style>
        </div>
    );
};

// --- Component Chính Của Cửa Hàng ---
const GameShopUI = ({ onClose }) => {
    const [activeCategory, setActiveCategory] = useState('Vũ khí');
    const [selectedItem, setSelectedItem] = useState(null);

    const gridItems = sampleItems.filter(item => item.type === activeCategory);
    
    const handleSelectItem = (item) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    return (
        <div className="relative w-full h-full overflow-y-auto bg-slate-900 font-sans text-white">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 lg:top-6 lg:right-6 z-[60]"
                aria-label="Đóng cửa hàng"
            >
                <img src={closeIconUrl} alt="Close" className="w-5 h-5" />
            </button>
            <div 
                className="absolute inset-0 bg-grid-slate-800/40 [mask-image:linear-gradient(0deg,#000000,rgba(0,0,0,0))]">
            </div>
            {/* ===== FIX APPLIED HERE: Added pb-24 for bottom padding ===== */}
            <div className="relative max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 pb-24">
                {/* --- Main Content --- */}
                <main>
                    {/* Header: Title and User Wallet */}
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
                            <button className="ml-2 bg-yellow-500 text-slate-900 font-bold text-sm px-3 py-1.5 rounded-md hover:bg-yellow-400 transition-colors">
                                NẠP
                            </button>
                        </div>
                    </header>

                    {/* Category Tabs */}
                    <CategoryTabs activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

                    {/* Items Grid */}
                    <section>
                            <h2 className="text-2xl font-bold text-white mb-4">{activeCategory}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
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
export default function App({ onClose }) {
    return <GameShopUI onClose={onClose} />;
}
