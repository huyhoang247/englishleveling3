// --- START OF FILE src/shop.tsx ---

import React, { useState, useEffect } from 'react';
import { itemDatabase, ItemRank } from './home/equipment/item-database.ts';
import { uiAssets } from './game-assets.ts';
// --- THAY ĐỔI: Import trực tiếp service và auth ---
import { fetchOrCreateUserGameData, processShopPurchase } from './gameDataService.ts';
import { auth } from './firebase.js';
import CoinDisplay from './ui/display/coin-display.tsx';
import GemDisplay from './ui/display/gem-display.tsx';
import HomeButton from './ui/home-button.tsx';
import { useAnimateValue } from './ui/useAnimateValue.ts'; // THÊM MỚI: Import hook animation

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
const Shield = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon> );
const Gem = (props: any) => ( <img src={uiAssets.gemIcon} alt="Gems" {...props} /> );
const Swords = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M14.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4-4L14.5 3.5z"/><path d="M19.5 8.5a2.12 2.12 0 0 1-3-3L10 12l4 4L19.5 8.5z"/></Icon> );
const Coins = (props: any) => ( <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/dollar.png" alt="Coin" {...props} /> );
const Sparkles = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="m12 3-1.9 4.2-4.3.4 3.3 2.9-1 4.2 3.6-2.3 3.6 2.3-1-4.2 3.3-2.9-4.3-.4L12 3z"/><path d="M5 12.5 3.1 14 5 15.5"/><path d="M19 12.5 20.9 14 19 15.5"/></Icon> );
const ShoppingCart = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16" /></Icon> );
const Tag = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.432 0l6.568-6.568a2.426 2.426 0 0 0 0-3.432L12.586 2.586z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></Icon> );
const RefreshCw = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></Icon> );
const ArrowUpCircle = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></Icon> );
const ClipboardCopy = (props: React.SVGProps<SVGSVGElement>) => ( <Icon {...props}><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></Icon> );

// --- Dữ liệu tĩnh cho các loại vật phẩm khác ---
// --- THAY ĐỔI: Gộp các loại "Vật phẩm" và "Nâng Cấp" thành "Item" ---
const sampleItemsNonWeapons = [
    { id: 1002, name: 'Giáp Thiên Thần', type: 'Trang bị', rarity: 'S', price: 1820, image: 'https://placehold.co/600x600/1a1a2e/87ceeb?text=🛡️', description: 'Bộ giáp mang lại sự bảo vệ tối thượng và khả năng hồi phục máu theo thời gian.' },
    { id: 1006, name: 'Khiên Bất Diệt', type: 'Trang bị', rarity: 'SR', price: 2000, image: 'https://placehold.co/600x600/1a1a2e/c0c0c0?text=🛡️', description: 'Một chiếc khiên không thể bị phá hủy, chặn mọi đòn tấn công từ phía trước.' },
    { id: 1004, name: 'Gói Trang Phục Hắc Tinh', type: 'Trang phục', rarity: 'S', price: 2200, image: 'https://placehold.co/600x600/1a1a2e/9370db?text=✨', description: 'Thay đổi ngoại hình của bạn thành một thực thể vũ trụ bí ẩn và quyền năng.' },
    { id: 1003, name: 'Ngọc Tái Sinh', type: 'Item', rarity: 'A', price: 975, image: 'https://placehold.co/600x600/1a1a2e/32cd32?text=💎', description: 'Hồi sinh ngay lập tức tại chỗ khi bị hạ gục. Chỉ có thể sử dụng một lần mỗi trận.' },
    { id: 1009, name: 'Sách Cổ', type: 'Item', rarity: 'A', price: 1500, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/20250720_1859_Icon%20S%C3%A1ch%20C%E1%BB%95%20Anime_simple_compose_01k0kv0rg5fhzrx8frbtsgqk33.png', description: 'Dùng để học và nâng cấp các kỹ năng đặc biệt.', stackable: true },
    { id: 1007, name: 'Vé Nâng Cấp VIP', type: 'Item', rarity: 'B', price: 500, image: 'https://placehold.co/600x600/1a1a2e/f0e68c?text=🎟️', description: 'Nhận đặc quyền VIP trong 30 ngày, bao gồm tăng kinh nghiệm và vật phẩm nhận được.' },
    { id: 1008, name: 'Rương Kho Báu Bí Ẩn', type: 'Rương', rarity: 'A', price: 750, image: 'https://placehold.co/600x600/1a1a2e/d2b48c?text=📦', description: 'Mở để có cơ hội nhận được một vật phẩm quý hiếm ngẫu nhiên từ danh sách phần thưởng.' },
    { id: 2001, name: 'Nâng Cấp Sức Chứa Thẻ', type: 'Item', rarity: 'A', price: 100, image: 'https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/icon/file_000000006160622f8a01c95a4a8eb982.png', description: 'Tăng giới hạn số lượng thẻ từ vựng có thể sở hữu. Giá được tính trên mỗi đơn vị sức chứa.', stackable: true, quantityOptions: [50, 100, 200] },
];
const SHOP_WEAPON_RANKS: ItemRank[] = ['E', 'D', 'B', 'A', 'S', 'SR'];
const SHOP_WEAPON_PRICES: { [key in ItemRank]?: number } = { 'E': 100, 'D': 500, 'B': 1000, 'A': 2000, 'S': 5000, 'SR': 10000 };
const gemPackages = [ { id: 'gem_1', gems: 100, price: 20000, label: 'Gói Tiểu' }, { id: 'gem_2', gems: 525, price: 100000, label: 'Gói Trung', bonus: '5% bonus' }, { id: 'gem_3', gems: 1100, price: 200000, label: 'Gói Đại', bonus: '10% bonus' }, { id: 'gem_4', gems: 2875, price: 500000, label: 'Gói Khổng Lồ', bonus: '15% bonus' }, { id: 'gem_5', gems: 6000, price: 1000000, label: 'Gói Thần Thánh', bonus: '20% bonus' },];
const BANK_INFO = { ID: '970422', ACCOUNT_NO: '19036924369018', ACCOUNT_NAME: 'LE VAN LONG' };
const shuffleArray = (array: any[]) => { let currentIndex = array.length, randomIndex; while (currentIndex !== 0) { randomIndex = Math.floor(Math.random() * currentIndex); currentIndex--; [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]; } return array; };
const generateDailyShopWeapons = () => { const allWeapons = Array.from(itemDatabase.values()).filter(item => item.type === 'weapon'); const selectedWeapons = shuffleArray(allWeapons).slice(0, 10); return selectedWeapons.map(weapon => { const randomRank = SHOP_WEAPON_RANKS[Math.floor(Math.random() * SHOP_WEAPON_RANKS.length)]; const price = SHOP_WEAPON_PRICES[randomRank] || 100; const trimmedIcon = weapon.icon ? weapon.icon.trim() : ''; const imageUrl = trimmedIcon.startsWith('http') ? trimmedIcon : `https://placehold.co/600x600/1a1a2e/ffffff?text=${encodeURIComponent(trimmedIcon || '❓')}`; return { id: weapon.id, name: weapon.name, type: 'Vũ khí', rarity: randomRank, price: price, image: imageUrl, description: weapon.description, }; }); };
const getShopItems = () => { try { const storedData = localStorage.getItem('dailyShopData'); const storedTimestamp = localStorage.getItem('dailyShopTimestamp'); const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(); if (storedData && storedTimestamp && parseInt(storedTimestamp, 10) === today) { return JSON.parse(storedData); } else { const newItems = generateDailyShopWeapons(); localStorage.setItem('dailyShopData', JSON.stringify(newItems)); localStorage.setItem('dailyShopTimestamp', today.toString()); return newItems; } } catch (error) { console.error("Could not access localStorage. Generating temporary shop data.", error); return generateDailyShopWeapons(); } };

const ShopItemCard = ({ item, onSelect }: { item: any; onSelect: (item: any) => void }) => { const rarityTextColor = getRarityTextColor(item.rarity); const rarityBorderColor = getRarityColor(item.rarity); return ( <div className="group relative overflow-hidden rounded-lg bg-slate-800/60 border border-slate-700 transition-all duration-300 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 cursor-pointer" onClick={() => onSelect(item)}> <div className="relative"> <img src={item.image} alt={item.name} className="w-full h-40 object-contain object-center p-4" /> <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-slate-900/80 ${rarityTextColor} ${rarityBorderColor}`}> {item.rarity} </div> </div> <div className="p-4"> <h3 className="text-base font-bold text-white truncate">{item.name}</h3> <div className="flex items-center justify-between mt-3"> <div className="flex items-center space-x-1.5"> <Coins className="w-4 h-4" /> <span className="text-lg font-bold text-white">{item.price.toLocaleString()}</span> </div> <button className="text-xs font-semibold text-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity"> CHI TIẾT </button> </div> </div> </div> ); };
const GemPackageCard = ({ pkg, onSelect }: { pkg: any; onSelect: (pkg: any) => void }) => { return ( <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-800/80 to-purple-900/40 border border-slate-700 transition-all duration-300 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer flex flex-col" onClick={() => onSelect(pkg)}> <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10"> <div className="flex items-center gap-1.5 bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-600/50"> <Gem className="w-4 h-4" /> <span className="text-sm font-bold text-white">{pkg.gems.toLocaleString()}</span> </div> {pkg.bonus && ( <div className="px-2.5 py-1 text-xs font-bold bg-yellow-400/20 text-yellow-200 rounded-full border border-yellow-500/40"> -{pkg.bonus.replace(' bonus', '')} </div> )} </div> <div className="relative flex-grow flex items-center justify-center px-8 pt-14 pb-6"> <Gem className="w-20 h-20 object-contain transition-transform duration-300 group-hover:scale-110" /> </div> <div className="p-4 bg-black/40 border-t border-slate-700 group-hover:border-purple-500 transition-colors duration-300 mt-auto"> <p className="text-lg font-semibold text-purple-300 text-center"> {pkg.price.toLocaleString('vi-VN')} VNĐ </p> </div> </div> ); };
const CategoryTabs = ({ activeCategory, setActiveCategory }: { activeCategory: string; setActiveCategory: (category: string) => void }) => {
    const categories = [
        { name: 'Nạp Gems', icon: Gem },
        { name: 'Item', icon: Tag },
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
const PaymentQRModal = ({ pkg, onClose, currentUser }: { pkg: any | null; onClose: () => void; currentUser: any | null }) => { const [transactionMemo, setTransactionMemo] = useState(''); const [qrCodeUrl, setQrCodeUrl] = useState(''); const [copyText, setCopyText] = useState('SAO CHÉP'); useEffect(() => { if (pkg && currentUser) { const memo = `NAPGEM${currentUser.uid.slice(0, 8)}${Date.now()}`.toUpperCase(); setTransactionMemo(memo); const url = `https://img.vietqr.io/image/${BANK_INFO.ID}-${BANK_INFO.ACCOUNT_NO}-compact2.png?amount=${pkg.price}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(BANK_INFO.ACCOUNT_NAME)}`; setQrCodeUrl(url); } }, [pkg, currentUser]); const handleCopyMemo = () => { if (!transactionMemo) return; navigator.clipboard.writeText(transactionMemo); setCopyText('ĐÃ CHÉP!'); setTimeout(() => setCopyText('SAO CHÉP'), 2000); }; if (!pkg) return null; return ( <div className="fixed inset-0 flex items-center justify-center z-50 p-3"> <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div> <div className="relative bg-gradient-to-br from-slate-900 to-purple-900/50 p-5 rounded-xl border-2 border-purple-500 shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col"> <div className="flex justify-between items-start mb-4"> <h3 className="text-2xl font-bold text-purple-300">Thanh toán Gói Gems</h3> <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Close" className="w-5 h-5" /></button> </div> <div className="text-center w-full mx-auto"> <h4 className="text-xl font-bold text-white mb-1">Thanh toán cho gói: {pkg.gems.toLocaleString()} Gems</h4> <p className="text-2xl font-bold text-purple-400 mb-4">{pkg.price.toLocaleString('vi-VN')} VNĐ</p> <div className="bg-white p-3 rounded-lg shadow-lg w-48 h-48 mx-auto"> {qrCodeUrl ? <img src={qrCodeUrl} alt="VietQR Code" className="w-full h-full object-contain" /> : <div className="w-full h-full bg-gray-200 animate-pulse"></div> } </div> <div className="mt-4 text-sm text-slate-300 space-y-3"> <p>Quét mã QR bằng ứng dụng ngân hàng của bạn để thanh toán.</p> <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700"> <p className="text-xs text-slate-400">Nội dung chuyển khoản (BẮT BUỘC):</p> <div className="flex items-center justify-between gap-2 mt-1"> <p className="text-base font-mono font-bold text-yellow-300 tracking-widest">{transactionMemo}</p> <button onClick={handleCopyMemo} className="flex items-center gap-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-2 py-1 rounded-md transition-colors"> <ClipboardCopy className="w-3 h-3"/> {copyText} </button> </div> </div> <div className="bg-blue-900/30 text-blue-200 text-xs p-3 rounded-lg border border-blue-700/50"> <p className="font-bold mb-1">Lưu ý quan trọng:</p> <ul className="list-disc list-inside text-left space-y-0.5"> <li>Chuyển đúng số tiền và nội dung hiển thị.</li> <li>Gems sẽ được tự động cộng vào tài khoản sau vài phút.</li> </ul> </div> </div> </div> </div> </div> ); };
const ShopCountdown = () => { const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '00', seconds: '00' }); useEffect(() => { const timer = setInterval(() => { const now = new Date(); const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)); const difference = tomorrow.getTime() - now.getTime(); if (difference > 0) { const hours = Math.floor((difference / (1000 * 60 * 60)) % 24); const minutes = Math.floor((difference / 1000 / 60) % 60); const seconds = Math.floor((difference / 1000) % 60); setTimeLeft({ hours: hours.toString().padStart(2, '0'), minutes: minutes.toString().padStart(2, '0'), seconds: seconds.toString().padStart(2, '0'), }); } }, 1000); return () => clearInterval(timer); }, []); return ( <div className="flex items-center gap-2 text-sm text-slate-400"> <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '2s' }}/> <span>Làm mới sau:</span> <span className="font-mono font-bold text-slate-200 tracking-wider">{timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}</span> </div> ); };

// --- MODAL CHI TIẾT VẬT PHẨM ĐƯỢC THIẾT KẾ LẠI ---
const ItemDetailModal = ({ item, onClose, onPurchase, currentCoins }: { item: any | null; onClose: () => void; onPurchase: (item: any, quantity: number) => Promise<void>; currentCoins: number; }) => {
    const [activeModalTab, setActiveModalTab] = useState<'info' | 'skills'>('info');
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [quantity, setQuantity] = useState(1);
    useEffect(() => { if (item) { setActiveModalTab('info'); setIsPurchasing(false); setQuantity(item.quantityOptions ? item.quantityOptions[0] : 1); } }, [item]);
    if (!item) return null;
    const totalCost = (item.price || 0) * quantity;
    const canAfford = currentCoins >= totalCost;
    const handlePurchaseClick = async () => { if (!item || isPurchasing || quantity <= 0 || !canAfford) return; setIsPurchasing(true); try { await onPurchase(item, quantity); onClose(); } catch (error) { console.error("Purchase failed, as reported to modal:", error); } finally { setIsPurchasing(false); } };
    const hasSkills = item.skills && item.skills.length > 0;
    const isStackable = item.stackable === true;
    const quantityOptions = item.quantityOptions || [1, 5, 10];
    return ( <div className="fixed inset-0 flex items-center justify-center z-50 p-3"> <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div> <div className={`relative bg-gradient-to-br ${getRarityGradient(item.rarity)} p-5 rounded-xl border-2 ${getRarityColor(item.rarity)} shadow-2xl w-full max-w-md max-h-[90vh] z-50 flex flex-col`}> <div className="flex-shrink-0 border-b border-gray-700/50 pb-4"> <div className="flex justify-between items-start mb-4"> <h3 className={`text-2xl font-bold ${getRarityTextColor(item.rarity)}`}>{item.name}</h3> <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><img src={uiAssets.closeIcon} alt="Close" className="w-5 h-5" /></button> </div> <div className="flex flex-col sm:flex-row gap-4 mb-4"> <div className={`w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center text-5xl bg-black/30 rounded-lg border-2 ${getRarityColor(item.rarity)} shadow-inner flex-shrink-0 mx-auto sm:mx-0`}> <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" /> </div> <div className="flex-1"> <div className="flex items-center mb-2 gap-2 flex-wrap"> <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRarityTextColor(item.rarity)} bg-gray-800/70 border border-gray-700 capitalize`}>{getRarityDisplayName(item.rarity)}</span> <span className="text-gray-400 capitalize bg-gray-800/50 px-2.5 py-1 rounded-full border border-gray-700/50 text-xs">{item.type}</span> </div> <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{item.description}</p> </div> </div> {hasSkills && ( <nav className="flex -mb-[18px] space-x-4 px-1"> <button onClick={() => setActiveModalTab('info')} className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${activeModalTab === 'info' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Thông Tin</button> <button onClick={() => setActiveModalTab('skills')} className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${activeModalTab === 'skills' ? 'border-yellow-400 text-yellow-300' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>Kỹ Năng</button> </nav> )} </div> <div className="flex-1 min-h-[150px] overflow-y-auto scrollbar-hidden"> <div className="modal-tab-content pt-4 pb-2"> {(!hasSkills || activeModalTab === 'info') ? ( renderItemStats(item) ) : ( renderItemSkills(item) )} </div> </div> <div className="flex-shrink-0 mt-auto border-t border-gray-700/50 pt-4"> {isStackable && ( <div className="mb-4"> <label className="block text-sm font-medium text-gray-400 mb-2">Số lượng:</label> <div className="flex items-center gap-2"> {quantityOptions.map(q => ( <button key={q} onClick={() => setQuantity(q)} className={`flex-1 px-3 py-1.5 text-sm font-bold rounded-md transition-all duration-200 ${ quantity === q ? 'bg-cyan-500 text-slate-900 shadow-md shadow-cyan-500/20 ring-2 ring-cyan-300' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'}`}> {item.id === 2001 ? `+${q}` : `x${q}`} </button> ))} </div> </div> )} <div className="flex items-center justify-between"> <div className="flex items-center space-x-2"> <Coins className="w-6 h-6" /> <span className="text-xl font-bold text-white">{totalCost.toLocaleString()}</span> </div> <button className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-sm uppercase px-5 py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-100 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100" onClick={handlePurchaseClick} disabled={isPurchasing || !canAfford}> {isPurchasing ? 'ĐANG XỬ LÝ...' : (canAfford ? 'MUA NGAY' : 'KHÔNG ĐỦ VÀNG')} </button> </div> </div> </div> <style jsx>{` .scrollbar-hidden::-webkit-scrollbar { display: none; } .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; } @keyframes modal-tab-fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .modal-tab-content { animation: modal-tab-fade-in 0.3s cubic-bezier(0.215, 0.610, 0.355, 1.000); } `}</style> </div> ); };

// --- HEADER MỚI CỦA CỬA HÀNG ---
const ShopHeader = ({ onClose, userGold, userGems, isLoading }: { onClose: () => void; userGold: number; userGems: number; isLoading: boolean; }) => {
    const navItems = ['Cửa Hàng', 'Nhiệm Vụ', 'Bang Hội', 'Sự Kiện'];
    const activeNav = 'Cửa Hàng';

    // THÊM MỚI: Sử dụng hook để tạo giá trị động
    const animatedGold = useAnimateValue(userGold, 500);
    const animatedGems = useAnimateValue(userGems, 500);

    return (
        <header className="sticky top-0 left-0 right-0 z-40 bg-slate-900 border-b border-white/10">
            <div className="max-w-[1600px] mx-auto flex items-center justify-between h-[53px] px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                    <HomeButton onClick={onClose} label="" title="Về trang chính" />
                    <nav className="hidden md:flex items-center gap-4">
                        {navItems.map(item => (
                            <a key={item} href="#" className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${ activeNav === item ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white' }`}>
                                {item}
                            </a>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    {/* THAY ĐỔI: Truyền giá trị đã được animate vào component */}
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
    const [allItems, setAllItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchShopData = async () => {
            if (!currentUser) { setIsLoading(false); return; }
            try {
                setIsLoading(true);
                const gameData = await fetchOrCreateUserGameData(currentUser.uid);
                setCoins(gameData.coins);
                setGems(gameData.gems);
                const dailyWeapons = getShopItems();
                setAllItems([...dailyWeapons, ...sampleItemsNonWeapons]);
            } catch (error) {
                console.error("Failed to fetch shop data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchShopData();
    }, [currentUser]);

    const handleLocalPurchase = async (item: any, quantity: number) => {
        if (!currentUser) throw new Error("User not authenticated.");
        try {
            const { newCoins } = await processShopPurchase(currentUser.uid, item, quantity);
            setCoins(newCoins); // Cập nhật state 'coins' sẽ tự động kích hoạt animation trong ShopHeader
            onPurchaseComplete();
            alert(`Mua thành công x${quantity} ${item.name}!`);
        } catch (error) {
            console.error("Shop purchase transaction failed:", error);
            alert(`Mua thất bại: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    };

    const handleSelectItem = (shopItem: any) => { const baseItem = itemDatabase.get(shopItem.id); if (!baseItem && !shopItem.stackable && ['Vũ khí'].includes(shopItem.type)) { console.error(`Vật phẩm với ID ${shopItem.id} không tìm thấy trong database.`); setSelectedItem(shopItem); return; } const detailedItem = { ...(baseItem || {}), ...shopItem, }; setSelectedItem(detailedItem); };
    const handleSelectGemPackage = (pkg: any) => setSelectedGemPackage(pkg);
    const handleCloseItemModal = () => setSelectedItem(null);
    const handleCloseGemModal = () => setSelectedGemPackage(null);

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
                            {activeCategory === 'Vũ khí' && <ShopCountdown />}
                        </div>
                        {activeCategory === 'Nạp Gems' ? (
                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                {gemPackages.map(pkg => (
                                    <GemPackageCard key={pkg.id} pkg={pkg} onSelect={handleSelectGemPackage} />
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                {/* --- THAY ĐỔI: Lọc các vật phẩm có type trùng với activeCategory (sẽ là "Item") --- */}
                                {allItems
                                    .filter(item => item.type === activeCategory)
                                    .map(item => (
                                        <ShopItemCard
                                            key={`${item.id}-${item.name}-${item.rarity}`}
                                            item={item}
                                            onSelect={handleSelectItem}
                                        />
                                    ))}
                            </div>
                        )}
                    </section>
                </main>
                {selectedItem && <ItemDetailModal item={selectedItem} onClose={handleCloseItemModal} onPurchase={handleLocalPurchase} currentCoins={coins} />}
                {selectedGemPackage && <PaymentQRModal pkg={selectedGemPackage} onClose={handleCloseGemModal} currentUser={currentUser} />}
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
