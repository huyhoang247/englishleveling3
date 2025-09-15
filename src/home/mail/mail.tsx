// --- START OF FILE mail.tsx (FULL CODE, ADMIN EMAIL UPDATED) ---

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import HomeButton from '../../ui/home-button.tsx'; // Import HomeButton component
import { auth } from '../../firebase'; // Để lấy userId

import {
  Mail,
  MailAttachment,
  listenForUserMails,
  sendSystemMailToAll,
  markMailAsRead,
  claimMailAttachments,
  deleteMails
} from './mail-service.ts'; // Import service mới

// Dữ liệu item mẫu cho Admin Panel (thay thế bằng dữ liệu game thực tế của bạn)
const ALL_GAME_ITEMS_MOCK = [
    { itemId: 1, name: "Kiếm Bão Tố", icon: 'sword', stats: { atk: 15, hp: 10 } },
    { itemId: 2, name: "Giáp Cổ Thụ", icon: 'chest', stats: { def: 20, hp: 50 } },
    { itemId: 3, name: "Huy hiệu Dũng Sĩ", icon: 'badge', stats: {} },
    { itemId: 101, name: "Thuốc Hồi Phục (Nhỏ)", icon: 'item', stats: {} },
    { itemId: 201, name: "Vé Quay May Mắn", icon: 'gift', stats: {} },
];


// --- UI HELPER COMPONENTS ---

const Icon = ({ name, className }: { name: string, className: string }) => {
  const icons: { [key: string]: JSX.Element } = {
    mail: <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />,
    gift: <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a2.25 2.25 0 01-2.25 2.25H5.25a2.25 2.25 0 01-2.25-2.25v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
    item: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
    gem: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5-7.5-7.5 7.5-7.5z" />,
    coin: <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18zm0-4a5 5 0 100-10 5 5 0 000 10z" />,
    sword: <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 10-8.5 0v8.25a.75.75 0 001.5 0v-8.25a3 3 0 116 0v8.25a.75.75 0 001.5 0v-8.25z" />,
    badge: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    chest: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
    send: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    wrench: <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.83-5.83M11.42 15.17L4.842 8.592a3.75 3.75 0 010-5.303 3.75 3.75 0 015.304 0L15.17 8.592M11.42 15.17L8.592 12.34m2.828 2.828l2.828-2.828" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {icons[name] || icons.mail}
    </svg>
  );
};

const Toast = ({ message, type, onDismiss }) => (
    <div className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white font-sans animate-fade-in z-50 ${type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'}`}>
        {message}
        <button onClick={onDismiss} className="ml-4 font-bold">✕</button>
    </div>
);

const MailPopup = ({ mail, onClose, onClaim, onDelete }) => {
  if (!mail) return null;
  const canClaim = mail.attachments && mail.attachments.length > 0 && !mail.isClaimed;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
      <div className="relative w-full max-w-lg max-h-full bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-sans flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>

        <div className="p-5 border-b border-slate-700">
          <h2 className="font-sans text-xl font-bold text-cyan-300 text-shadow tracking-wide mb-2">{mail.subject}</h2>
          <div className="flex items-center flex-wrap gap-2 text-xs text-slate-400 font-sans">
            <span className="inline-flex items-center gap-1.5 bg-slate-800/70 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              <span>Từ:</span>
              <span className="font-semibold text-white">{mail.sender}</span>
            </span>
            <span className="inline-flex items-center bg-slate-800/70 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
              {mail.timestamp ? new Date(mail.timestamp.toDate()).toLocaleString('vi-VN') : 'Đang gửi...'}
            </span>
          </div>
        </div>

        <div className="flex-grow p-6 overflow-y-auto text-slate-300 leading-relaxed font-sans scrollbar-thin">
          <p>{mail.body}</p>
        </div>

        {mail.attachments && mail.attachments.length > 0 && (
          <div className="p-5 border-t border-slate-700">
            <h3 className="font-lilita text-lg font-bold text-center text-cyan-300 text-shadow-sm tracking-wide mb-4 uppercase">Vật phẩm đính kèm</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {mail.attachments.map((item, index) => (
                <div key={index} className="w-20 bg-slate-800/50 p-2 rounded-lg flex flex-col items-center justify-center transition-transform duration-200 border border-slate-700 hover:border-cyan-500/50 hover:scale-105 aspect-square" title={`${item.name} x${item.quantity}`}>
                  <div className="relative w-12 h-12 rounded-full flex items-center justify-center mb-1 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600">
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md"></div>
                    <Icon name={item.icon} className="w-6 h-6 text-cyan-300 drop-shadow-[0_2px_3px_rgba(34,211,238,0.4)]" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300 font-sans">x{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 flex items-center justify-center space-x-3 bg-slate-900/50 rounded-b-xl border-t border-slate-700">
          <button onClick={() => onDelete(mail.id)} className="px-4 py-2 bg-slate-700/80 text-slate-300 font-bold rounded-lg hover:bg-red-600/80 hover:text-white transition-all duration-300 flex items-center space-x-1.5 active:scale-95 border border-slate-600 hover:border-red-500">
            <Icon name="trash" className="w-4 h-4" />
            <span className="font-sans font-semibold text-sm">Xóa</span>
          </button>
          {canClaim && (
            <button onClick={() => onClaim(mail)} className="btn-shine relative overflow-hidden px-6 py-2 bg-teal-600/80 text-white font-bold rounded-lg hover:bg-teal-500 transition-all duration-300 flex items-center space-x-1.5 shadow-[0_0_15px_theme(colors.teal.600/0.5)] active:scale-95 border border-teal-500 hover:border-teal-400">
              <Icon name="gift" className="w-4 h-4" />
              <span className="font-sans font-semibold text-sm">Nhận</span>
            </button>
          )}
          {mail.isClaimed && (
             <div className="px-6 py-2 bg-slate-800 text-slate-500 font-bold rounded-lg flex items-center space-x-1.5 cursor-not-allowed border border-slate-700">
               <Icon name="check" className="w-4 h-4" />
              <span className="font-sans font-semibold text-sm">Đã Nhận</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MailItem = ({ mail, onSelect, isSelected }) => {
  const hasAttachments = mail.attachments && mail.attachments.length > 0;
  const isVisuallyRead = !hasAttachments ? mail.isRead : mail.isClaimed;

  return (
    <li onClick={() => onSelect(mail.id)} className={`relative p-3 flex items-start space-x-3 cursor-pointer border-l-4 transition-all duration-200 ${isSelected ? 'border-cyan-400 bg-slate-800/70' : 'border-transparent hover:bg-slate-800/40'}`}>
      <div className="relative flex-shrink-0 p-3 bg-slate-900/50 rounded-full mt-1">
        <Icon name={hasAttachments ? 'gift' : 'mail'} className="w-6 h-6 text-slate-400" />
        {!mail.isRead && (
          <img src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/exclamation-mark.webp" alt="Unread" className="absolute -top-0.5 -right-0.5 w-4 h-4 animate-gentle-bounce" />
        )}
      </div>
      {hasAttachments ? (
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-2.5">
            <p className={`text-sm font-semibold truncate font-sans pr-2 ${isVisuallyRead ? 'text-slate-400' : 'text-slate-100'}`}>{mail.subject}</p>
            <span className="text-xs font-sans flex-shrink-0 text-slate-500">{mail.timestamp ? new Date(mail.timestamp.toDate()).toLocaleDateString('vi-VN') : ''}</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {mail.attachments.map((item, index) => (
              <div key={index} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300 text-xs font-sans border border-slate-600" title={`${item.name} x${item.quantity}`}>
                <Icon name={item.icon} className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-w-0 flex items-center h-full">
            <div className="w-full flex justify-between items-baseline">
                <p className={`text-sm font-semibold truncate font-sans pr-2 ${isVisuallyRead ? 'text-slate-400' : 'text-slate-100'}`}>{mail.subject}</p>
                <span className="text-xs font-sans flex-shrink-0 text-slate-500">{mail.timestamp ? new Date(mail.timestamp.toDate()).toLocaleDateString('vi-VN') : ''}</span>
            </div>
        </div>
      )}
    </li>
  );
};

const AddAttachmentModal = ({ onClose, onAddAttachment }) => {
    const [type, setType] = useState<'currency' | 'item'>('currency');
    const [currency, setCurrency] = useState<'coins' | 'gems'>('coins');
    const [quantity, setQuantity] = useState(1);
    const [selectedItem, setSelectedItem] = useState(ALL_GAME_ITEMS_MOCK[0]);

    const handleAdd = () => {
        let attachment: MailAttachment;
        if (type === 'currency') {
            attachment = {
                type: 'currency', id: currency,
                name: currency === 'coins' ? 'Vàng' : 'Kim Cương',
                quantity: Number(quantity), icon: currency === 'coins' ? 'coin' : 'gem',
            };
        } else {
             attachment = {
                type: 'item', id: String(selectedItem.itemId),
                name: selectedItem.name, quantity: Number(quantity),
                icon: selectedItem.icon,
                itemData: { itemId: selectedItem.itemId, level: 1, stats: selectedItem.stats }
            };
        }
        onAddAttachment(attachment);
        onClose();
    };

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-slate-800 border border-slate-600 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-cyan-300 mb-4">Thêm vật phẩm đính kèm</h3>
            <div className="flex gap-2 mb-4">
                <button onClick={() => setType('currency')} className={`flex-1 py-2 rounded ${type === 'currency' ? 'bg-cyan-600' : 'bg-slate-700'}`}>Tiền tệ</button>
                <button onClick={() => setType('item')} className={`flex-1 py-2 rounded ${type === 'item' ? 'bg-cyan-600' : 'bg-slate-700'}`}>Vật phẩm</button>
            </div>

            {type === 'currency' ? (
                <select value={currency} onChange={e => setCurrency(e.target.value as any)} className="w-full bg-slate-700 p-2 rounded">
                    <option value="coins">Vàng</option>
                    <option value="gems">Kim Cương</option>
                </select>
            ) : (
                <select onChange={e => setSelectedItem(ALL_GAME_ITEMS_MOCK.find(i => i.itemId === Number(e.target.value))!)} className="w-full bg-slate-700 p-2 rounded">
                    {ALL_GAME_ITEMS_MOCK.map(item => <option key={item.itemId} value={item.itemId}>{item.name}</option>)}
                </select>
            )}
            <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} placeholder="Số lượng" className="w-full bg-slate-700 p-2 rounded mt-3" />

            <div className="flex justify-end gap-3 mt-5">
                <button onClick={onClose} className="px-4 py-2 bg-slate-600 rounded">Hủy</button>
                <button onClick={handleAdd} className="px-4 py-2 bg-cyan-600 rounded">Thêm</button>
            </div>
        </div>
    </div>
    );
};

const AdminMailView = ({ onBack }) => {
    const [sender, setSender] = useState('Hệ Thống');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [attachments, setAttachments] = useState<MailAttachment[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const handleSendMail = async () => {
        if (!subject.trim() || !body.trim()) {
            setToast({ message: "Tiêu đề và nội dung không được trống!", type: 'error' });
            return;
        }
        setIsSending(true);
        try {
            await sendSystemMailToAll({ sender, subject, body, attachments });
            setToast({ message: `Gửi thư thành công đến tất cả người dùng!`, type: 'success' });
            setSubject(''); setBody(''); setAttachments([]);
        } catch (error) {
            console.error("Failed to send mail:", error);
            setToast({ message: `Gửi thư thất bại: ${error.message}`, type: 'error' });
        } finally {
            setIsSending(false);
        }
    };

    useEffect(() => {
        if(toast) { const timer = setTimeout(() => setToast(null), 3000); return () => clearTimeout(timer); }
    }, [toast]);

    return (
    <div className="w-full h-full flex flex-col p-4 font-sans">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        {showAddModal && <AddAttachmentModal onClose={() => setShowAddModal(false)} onAddAttachment={att => setAttachments(prev => [...prev, att])} />}

        <div className="flex justify-between items-center mb-4 flex-shrink-0">
             <h2 className="text-xl font-bold text-cyan-300 font-lilita">SOẠN THƯ ADMIN</h2>
             <button onClick={onBack} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">← Quay lại Hộp thư</button>
        </div>

        <div className="flex-grow space-y-4 overflow-y-auto pr-2 scrollbar-thin">
            <input type="text" value={sender} onChange={e => setSender(e.target.value)} placeholder="Người gửi" className="w-full p-3 bg-slate-800 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Tiêu đề" className="w-full p-3 bg-slate-800 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Nội dung thư..." rows={8} className="w-full p-3 bg-slate-800 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>

            <div>
                <h3 className="text-slate-400 mb-2">Vật phẩm đính kèm:</h3>
                <div className="space-y-2">
                    {attachments.map((att, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                            <div className="flex items-center gap-2">
                                <Icon name={att.icon || 'item'} className="w-5 h-5 text-cyan-400" />
                                <span>{att.name} x{att.quantity}</span>
                            </div>
                            <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="text-red-400">✕</button>
                        </div>
                    ))}
                </div>
                <button onClick={() => setShowAddModal(true)} className="mt-2 w-full p-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center gap-2">
                    <Icon name="plus" className="w-5 h-5" /> Thêm vật phẩm
                </button>
            </div>
        </div>

        <div className="flex-shrink-0 mt-4">
            <button onClick={handleSendMail} disabled={isSending} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 disabled:bg-slate-600 disabled:cursor-wait">
                <Icon name="send" className="w-5 h-5" />
                {isSending ? 'Đang gửi...' : 'Gửi cho tất cả người dùng'}
            </button>
        </div>
    </div>
    );
};

// --- MAIN MAILBOX COMPONENT ---
export default function Mailbox({ onClose }: { onClose: () => void }) {
  const [mails, setMails] = useState<Mail[]>([]);
  const [selectedMailId, setSelectedMailId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const currentUser = auth.currentUser;

  const isUserAdmin = currentUser?.email === "vanlongt309@gmail.com";

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);
    const unsubscribe = listenForUserMails(currentUser.uid, (fetchedMails) => {
      setMails(fetchedMails);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const selectedMail = useMemo(() => mails.find(m => m.id === selectedMailId) || null, [mails, selectedMailId]);

  const handleSelectMail = useCallback((id: string) => {
    setSelectedMailId(id);
    const mail = mails.find(m => m.id === id);
    if (mail && !mail.isRead && currentUser) {
        markMailAsRead(currentUser.uid, id).catch(console.error);
    }
  }, [mails, currentUser]);

  const handleClosePopup = () => setSelectedMailId(null);

  const handleClaim = useCallback(async (mail: Mail) => {
    if (!currentUser || !mail) return;
    try { await claimMailAttachments(currentUser.uid, mail); }
    catch (error) { console.error("Failed to claim items:", error); }
  }, [currentUser]);

  const handleDelete = useCallback(async (id: string) => {
    if (!currentUser) return;
    await deleteMails(currentUser.uid, [id]);
    handleClosePopup();
  }, [currentUser]);

  const handleClaimAll = useCallback(async () => {
    if (!currentUser) return;
    const claimableMails = mails.filter(m => m.attachments.length > 0 && !m.isClaimed);
    for (const mail of claimableMails) {
        try { await claimMailAttachments(currentUser.uid, mail); }
        catch (error) { console.error(`Failed to claim mail ${mail.id}:`, error); }
    }
  }, [currentUser, mails]);

  const handleDeleteAllRead = useCallback(async () => {
    if (!currentUser) return;
    const readMailIds = mails
        .filter(m => m.isRead && !(m.attachments.length > 0 && !m.isClaimed))
        .map(m => m.id);
    if(readMailIds.length > 0) {
        await deleteMails(currentUser.uid, readMailIds);
    }
    handleClosePopup();
  }, [currentUser, mails]);

  const unreadCount = mails.filter(m => !m.isRead).length;
  const canClaimAny = mails.some(m => m.attachments.length > 0 && !m.isClaimed);
  const hasAnyDeletable = mails.some(m => m.isRead && !(m.attachments.length > 0 && !m.isClaimed));

  return (
    <>
      <style>{`
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
        @keyframes gentle-bounce { 0%, 100% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
        .animate-gentle-bounce { animation: gentle-bounce 1.2s infinite; }
      `}</style>

      <div
        className="relative w-full max-w-5xl h-full max-h-[90vh] bg-slate-900/80 rounded-xl shadow-2xl shadow-black/50 flex flex-col border border-slate-700/50 backdrop-blur-md text-white font-lilita animate-fade-in-scale-fast"
        onClick={(e) => e.stopPropagation()}
      >
        {isAdminMode ? (
            <AdminMailView onBack={() => setIsAdminMode(false)} />
        ) : (
            <>
                <div className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-cyan-300 text-shadow tracking-wider uppercase">MAIL BOX</h1>
                        {!isLoading && <div className="mt-1 text-xs text-slate-400 font-sans">
                            <span>New: </span><span className="font-bold text-yellow-300">{unreadCount}</span>
                            <span className="mx-2 text-slate-600">|</span>
                            <span>Total: </span><span className="font-semibold text-slate-200">{mails.length}</span>
                        </div>}
                    </div>
                     <div className="flex items-center gap-2">
                        {isUserAdmin && (
                            <button
                                onClick={() => setIsAdminMode(true)}
                                className="px-4 py-2 bg-slate-800/80 hover:bg-yellow-600/80 rounded-lg transition-colors duration-200 text-sm font-sans font-semibold text-slate-300"
                                title="Admin Panel">
                                Admin
                            </button>
                        )}
                        <HomeButton onClick={onClose} label="" title="Về Trang chính"/>
                    </div>
                </div>

                <ul className="flex-grow overflow-y-auto divide-y divide-slate-800 scrollbar-thin">
                    {isLoading ? <div className="flex items-center justify-center h-full text-slate-500">Đang tải thư...</div>
                    : mails.length > 0 ? (
                        mails.map(mail => (<MailItem key={mail.id} mail={mail} onSelect={handleSelectMail} isSelected={selectedMailId === mail.id} />))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600">
                            <Icon name="mail" className="w-24 h-24" />
                            <p className="mt-4 text-lg font-sans">Hộp thư trống</p>
                        </div>
                    )}
                </ul>

                <div className="p-3 border-t border-slate-700 flex-shrink-0 flex items-center justify-around gap-3 bg-slate-900/60 rounded-b-xl">
                    <button
                      onClick={handleDeleteAllRead}
                      disabled={!hasAnyDeletable}
                      className="flex-1 px-4 py-2.5 bg-slate-700/80 text-slate-300 font-bold rounded-lg hover:bg-red-600/80 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 active:scale-95 border border-slate-600 hover:border-red-500 disabled:bg-slate-800/50 disabled:border-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">
                      <Icon name="trash" className="w-5 h-5" />
                      <span className="font-sans font-semibold text-sm">Xóa đã đọc</span>
                    </button>
                    <button
                      onClick={handleClaimAll}
                      disabled={!canClaimAny}
                      className="btn-shine relative overflow-hidden flex-1 px-4 py-2.5 bg-teal-600/80 text-white font-bold rounded-lg hover:bg-teal-500 transition-all duration-300 flex items-center justify-center space-x-2 shadow-[0_0_20px_theme(colors.teal.600/0.5)] active:scale-95 border border-teal-500 hover:border-teal-400 disabled:bg-slate-800/50 disabled:border-slate-700 disabled:text-slate-500 disabled:shadow-none disabled:cursor-not-allowed">
                      <Icon name="gift" className="w-5 h-5" />
                      <span className="font-sans font-semibold text-sm">Nhận tất cả</span>
                    </button>
                </div>
            </>
        )}
      </div>

      {selectedMail && <MailPopup mail={selectedMail} onClose={handleClosePopup} onClaim={handleClaim} onDelete={handleDelete} />}
    </>
  );
}

// --- END OF FILE mail.tsx ---
