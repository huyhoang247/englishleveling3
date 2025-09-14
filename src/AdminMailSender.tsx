// --- START OF FILE AdminMailSender.tsx ---

import React, { useState } from 'react';
import HomeButton from './ui/home-button.tsx';
import { MailAttachment, sendSystemMailToAllUsers } from './mailService';

// Danh sách các vật phẩm có thể gửi. Trong thực tế, bạn sẽ lấy từ một file config.
const attachableItems = [
    { id: 'coins', name: 'Vàng', icon: 'coin' },
    { id: 'gems', name: 'Kim Cương', icon: 'gem' },
    { id: 'ancientBooks', name: 'Sách Cổ', icon: 'item' },
    { id: 'pickaxes', name: 'Cuốc', icon: 'sword' }, // Tận dụng icon
    { id: 'masteryCards', name: 'Thẻ Tinh Thông', icon: 'badge' },
    { id: 'equipmentPieces', name: 'Mảnh Trang Bị', icon: 'chest' }
];

interface AdminMailSenderProps {
    onClose: () => void;
}

// Re-using Icon component for consistency
const Icon = ({ name, className }: { name: string, className: string }) => {
    const icons = {
        mail: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
        gem: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5-7.5-7.5 7.5-7.5z" />,
        coin: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0-4a5 5 0 100-10 5 5 0 000 10z" />,
        item: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
        sword: <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 10-8.5 0v8.25a.75.75 0 001.5 0v-8.25a3 3 0 116 0v8.25a.75.75 0 001.5 0v-8.25z" />,
        badge: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
        chest: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
        plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    };
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        {icons[name] || icons.mail}
        </svg>
    );
};


export default function AdminMailSender({ onClose }: AdminMailSenderProps) {
    const [sender, setSender] = useState('Hệ Thống');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<MailAttachment[]>([]);
    const [isSending, setIsSending] = useState(false);

    // State cho form thêm item
    const [selectedItem, setSelectedItem] = useState(attachableItems[0].id);
    const [itemQuantity, setItemQuantity] = useState(1);
    
    const handleAddItem = () => {
        if (!selectedItem || itemQuantity <= 0) return;
        
        const itemInfo = attachableItems.find(i => i.id === selectedItem);
        if (!itemInfo) return;

        // Nếu item đã tồn tại, thì cộng dồn số lượng
        const existingItemIndex = attachments.findIndex(att => att.id === selectedItem);
        if(existingItemIndex > -1) {
            const newAttachments = [...attachments];
            newAttachments[existingItemIndex].quantity += itemQuantity;
            setAttachments(newAttachments);
        } else {
             setAttachments([...attachments, {
                type: 'currency',
                id: itemInfo.id,
                name: itemInfo.name,
                icon: itemInfo.icon,
                quantity: itemQuantity
            }]);
        }
       
        setItemQuantity(1); // Reset số lượng
    };

    const handleRemoveItem = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSendMail = async () => {
        if (!sender || !subject || !body) {
            alert("Vui lòng điền Tên người gửi, Tiêu đề và Nội dung.");
            return;
        }

        const isConfirmed = window.confirm(`Bạn có chắc muốn gửi thư này đến TẤT CẢ người dùng không? Hành động này không thể hoàn tác.`);
        if (!isConfirmed) return;

        setIsSending(true);
        try {
            const count = await sendSystemMailToAllUsers(sender, subject, body, attachments);
            alert(`Đã gửi thư thành công đến ${count} người dùng.`);
            onClose(); // Đóng cửa sổ sau khi gửi thành công
        } catch (error) {
            console.error("Error sending system mail:", error);
            alert(`Gửi thư thất bại: ${error.message}`);
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div 
                className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900/90 rounded-xl shadow-2xl shadow-black/50 flex flex-col border border-slate-700/50 text-white font-sans"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h1 className="text-xl font-bold text-cyan-300 tracking-wider uppercase">SOẠN THƯ HỆ THỐNG</h1>
                    <HomeButton onClick={onClose} />
                </div>

                {/* Form Content */}
                <div className="p-6 flex-grow overflow-y-auto space-y-4 scrollbar-thin">
                    {/* From & Subject */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Người gửi</label>
                            <input type="text" value={sender} onChange={e => setSender(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Tiêu đề</label>
                            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                        </div>
                    </div>
                    {/* Body */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Nội dung</label>
                        <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} className="w-full bg-slate-800 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 scrollbar-thin"></textarea>
                    </div>

                    {/* Attachments */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-400">Vật phẩm đính kèm</label>
                        {/* Add Item Form */}
                        <div className="flex items-stretch gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                            <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)} className="flex-grow bg-slate-700 border border-slate-600 rounded-md px-3 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                {attachableItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                            <input type="number" min="1" value={itemQuantity} onChange={e => setItemQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="w-24 bg-slate-700 border border-slate-600 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500"/>
                            <button onClick={handleAddItem} className="px-4 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white font-bold flex items-center justify-center active:scale-95 transition-transform"><Icon name="plus" className="w-5 h-5"/></button>
                        </div>
                        {/* Attached Items List */}
                        {attachments.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {attachments.map((att, index) => (
                                    <div key={index} className="relative group bg-slate-800/80 p-2 rounded-lg flex items-center gap-2 border border-slate-700">
                                        <Icon name={att.icon} className="w-5 h-5 text-cyan-300 flex-shrink-0"/>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-semibold truncate text-slate-200">{att.name}</p>
                                            <p className="text-xs text-slate-400">x{att.quantity.toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => handleRemoveItem(index)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-700 flex-shrink-0">
                     <button 
                        onClick={handleSendMail} 
                        disabled={isSending}
                        className="w-full px-6 py-3 bg-red-700/80 text-white font-bold rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_0_20px_theme(colors.red.700/0.5)] active:scale-95 border border-red-600 hover:border-red-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-wait disabled:shadow-none"
                    >
                        <span>{isSending ? 'Đang gửi...' : 'Gửi đến TẤT CẢ người dùng'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- END OF FILE AdminMailSender.tsx ---
