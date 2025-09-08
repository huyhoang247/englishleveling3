import React, { useState, useMemo, useEffect } from 'react';

// --- Dữ liệu mẫu cho hộp thư (giữ nguyên) ---
const initialMails = [
  // ... (dữ liệu mail không đổi)
  {
    id: 1,
    sender: 'Hệ Thống',
    subject: 'Chào mừng tân thủ!',
    body: 'Chào mừng bạn đã đến với thế giới của chúng tôi! Đây là một món quà nhỏ để giúp bạn bắt đầu cuộc hành trình.',
    type: 'gift',
    items: [
      { name: 'Kim cương', quantity: 100, icon: 'gem' },
      { name: 'Vàng', quantity: 5000, icon: 'coin' },
    ],
    isRead: false,
    isClaimed: false,
    timestamp: '2025-07-21T10:30:00Z',
  },
  {
    id: 2,
    sender: 'Trưởng Lão Làng',
    subject: 'Nhiệm vụ đầu tiên',
    body: 'Hãy đến gặp tôi để nhận nhiệm vụ đầu tiên của bạn. Đừng quên chuẩn bị kỹ càng nhé!',
    type: 'notification',
    items: [],
    isRead: false,
    isClaimed: false,
    timestamp: '2025-07-21T10:35:00Z',
  },
  {
    id: 3,
    sender: 'Phần thưởng Đấu trường',
    subject: 'Quà xếp hạng tuần',
    body: 'Chúc mừng bạn đã đạt thứ hạng cao trong Đấu trường tuần qua. Đây là phần thưởng của bạn.',
    type: 'item',
    items: [
      { name: 'Kiếm Bão Tố', quantity: 1, icon: 'sword' },
      { name: 'Huy hiệu Dũng Sĩ', quantity: 10, icon: 'badge' },
    ],
    isRead: true,
    isClaimed: false,
    timestamp: '2025-07-20T08:00:00Z',
  },
    {
    id: 4,
    sender: 'Bảo trì hệ thống',
    subject: 'Thông báo bảo trì',
    body: 'Hệ thống sẽ được bảo trì vào lúc 02:00 sáng ngày mai. Sẽ có quà đền bù sau khi bảo trì hoàn tất.',
    type: 'notification',
    items: [],
    isRead: true,
    isClaimed: false,
    timestamp: '2025-07-19T15:00:00Z',
  },
    {
    id: 5,
    sender: 'Phần thưởng đăng nhập',
    subject: 'Quà đăng nhập ngày 7',
    body: 'Cảm ơn bạn đã đăng nhập liên tục. Đây là phần thưởng đặc biệt dành cho bạn!',
    type: 'gift',
    items: [
      { name: 'Trang phục Hiếm', quantity: 1, icon: 'chest' },
    ],
    isRead: false,
    isClaimed: false,
    timestamp: '2025-07-18T05:00:00Z',
  },
];

interface MailboxProps {
  onClose: () => void;
}

// --- UI HELPER COMPONENTS (THEO PHONG CÁCH BOSS.TSX) ---
const HomeIcon = ({ className = '' }: { className?: string }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}> <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" /> </svg> );

const Icon = ({ name, className }: { name: string, className: string }) => {
  const icons = {
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
    "gift-all": <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.5v7.5c0 1.027.845 1.99 1.976 2.094a48.505 48.505 0 004.024.166m0 0c1.355 0 2.697-.056 4.024-.166C17.155 20.01 18 19.027 18 18v-7.5c0-1.027-.845-1.99-1.976-2.094A48.455 48.455 0 0012 8.25zM12 15V6.75m0 0l-3 3m3-3l3 3" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {icons[name] || icons.mail}
    </svg>
  );
};

const MailPopup = ({ mail, onClose, onClaim, onDelete }) => {
  if (!mail) return null;

  const canClaim = mail.items && mail.items.length > 0 && !mail.isClaimed;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900/80 border border-slate-600 rounded-xl shadow-2xl animate-fade-in-scale-fast text-white font-sans flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-800/70 hover:bg-red-500/80 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 z-10 font-sans" aria-label="Đóng">✕</button>

        {/* Header */}
        <div className="p-5 border-b border-slate-700 text-center">
          <h2 className="font-sans text-3xl font-bold text-yellow-300 text-shadow tracking-wide">{mail.subject}</h2>
          <div className="flex items-center justify-between mt-2 text-sm text-slate-400 font-sans">
            <span>Từ: <span className="font-semibold text-slate-200">{mail.sender}</span></span>
            <span>{new Date(mail.timestamp).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto text-slate-300 leading-relaxed font-sans scrollbar-thin">
          <p>{mail.body}</p>
        </div>

        {/* Items */}
        {mail.items && mail.items.length > 0 && (
          <div className="p-5 border-t border-slate-700">
            <h3 className="font-lilita text-xl font-bold text-center text-cyan-300 text-shadow-sm tracking-wide mb-4 uppercase">Items</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mail.items.map((item, index) => (
                <div key={index} className="bg-slate-800/50 p-3 rounded-lg text-center flex flex-col items-center justify-center transition-transform duration-200 border border-slate-700 hover:border-cyan-500/50 hover:scale-105">
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-2 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600">
                    <div className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md"></div>
                    <Icon name={item.icon} className="w-8 h-8 text-cyan-300 drop-shadow-[0_2px_3px_rgba(34,211,238,0.4)]" />
                  </div>
                  <p className="font-lilita font-bold text-white text-shadow-sm">{item.name}</p>
                  <p className="text-sm text-slate-400 font-sans">x{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center justify-center space-x-4 bg-slate-900/50 rounded-b-xl border-t border-slate-700">
          <button onClick={() => onDelete(mail.id)} className="px-6 py-2.5 bg-slate-700/80 text-slate-300 font-bold rounded-lg hover:bg-red-600/80 hover:text-white transition-all duration-300 flex items-center space-x-2 active:scale-95 border border-slate-600 hover:border-red-500">
            <Icon name="trash" className="w-5 h-5" />
            <span className="font-sans font-semibold">Xóa</span>
          </button>
          {canClaim && (
            <button onClick={() => onClaim(mail.id)} className="btn-shine relative overflow-hidden px-8 py-3 bg-teal-600/80 text-white font-bold rounded-lg hover:bg-teal-500 transition-all duration-300 flex items-center space-x-2 shadow-[0_0_20px_theme(colors.teal.600/0.5)] active:scale-95 border border-teal-500 hover:border-teal-400">
              <Icon name="gift" className="w-5 h-5" />
              <span className="font-sans font-semibold">Nhận</span>
            </button>
          )}
          {mail.isClaimed && (
             <div className="px-8 py-3 bg-slate-800 text-slate-500 font-bold rounded-lg flex items-center space-x-2 cursor-not-allowed border border-slate-700">
               <Icon name="check" className="w-5 h-5" />
              <span className="font-sans font-semibold">Đã Nhận</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- UPDATED MAILITEM COMPONENT ---
const MailItem = ({ mail, onSelect, isSelected }) => {
  const typeIcon = mail.type === 'gift' ? 'gift' : mail.type === 'item' ? 'item' : 'mail';
  
  // Logic mới để xác định trạng thái "đã xem"
  // - Mail không có item: Dựa vào isRead
  // - Mail có item: Dựa vào isClaimed
  const isVisuallyRead = (!mail.items || mail.items.length === 0) ? mail.isRead : mail.isClaimed;

  return (
    <li onClick={() => onSelect(mail.id)} className={`relative p-3 flex items-start space-x-3 cursor-pointer border-l-4 transition-all duration-200 ${isSelected ? 'border-cyan-400 bg-slate-800/70' : 'border-transparent hover:bg-slate-800/40'}`}>
      {/* Icon chính của thư */}
      <div className="relative flex-shrink-0 p-3 bg-slate-900/50 rounded-full mt-1">
        <Icon name={typeIcon} className="w-6 h-6 text-slate-400" />
        {/* Icon báo thư mới: Vẫn dựa vào isRead để biết mail đã được mở hay chưa */}
        {!mail.isRead && (
          <img 
            src="https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/images/exclamation-mark.webp" 
            alt="Unread" 
            className="absolute -top-0.5 -right-0.5 w-4 h-4 animate-gentle-bounce"
          />
        )}
      </div>
      
      {/* Nội dung chính: Thêm class để căn giữa nếu không có item */}
      <div className={`flex-1 min-w-0 ${(!mail.items || mail.items.length === 0) ? 'flex items-center h-full' : ''}`}>
        <div> {/* Bọc nội dung trong 1 div để flexbox hoạt động đúng */}
          {/* Hàng 1: Tiêu đề và Ngày tháng */}
          <div className="flex justify-between items-center mb-1.5">
            <p className={`text-sm font-semibold truncate font-sans pr-2 ${
                isVisuallyRead
                ? 'text-slate-400'  // Đã đọc/đã nhận: màu mờ
                : 'text-slate-100'  // Chưa đọc/chưa nhận: màu sáng
              }`}>
                {mail.subject}
            </p>
            <span className="text-xs font-sans flex-shrink-0 text-slate-500">
              {new Date(mail.timestamp).toLocaleDateString('vi-VN')}
            </span>
          </div>
          
          {/* Hàng 2: Danh sách Item dạng Tag */}
          {mail.items && mail.items.length > 0 && (
            <div className="flex items-center flex-wrap gap-2">
              {mail.items.map((item, index) => (
                <div 
                  key={index} 
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-700/80 text-slate-300 text-xs font-sans border border-slate-600"
                  title={`${item.name} x${item.quantity}`}
                >
                  <Icon name={item.icon} className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-semibold">x{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};


// --- MAIN MAILBOX COMPONENT ---
export default function Mailbox({ onClose }: MailboxProps) {
  const [mails, setMails] = useState(initialMails);
  const [selectedMailId, setSelectedMailId] = useState(null);

  const selectedMail = useMemo(() => {
    return mails.find(m => m.id === selectedMailId) || null;
  }, [mails, selectedMailId]);

  useEffect(() => {
    if (selectedMailId) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedMailId]);

  const handleSelectMail = (id) => {
    setSelectedMailId(id);
    setMails(prev => prev.map(m => {
      if (m.id === id && (!m.items || m.items.length === 0)) {
        return { ...m, isRead: true };
      }
      return m;
    }));
  };
  const handleClosePopup = () => setSelectedMailId(null);
  
  const handleClaim = (id) => {
    setMails(prev => prev.map(m => m.id === id ? { ...m, isClaimed: true, isRead: true } : m));
  };
  
  const handleDelete = (id) => {
    setMails(prev => prev.filter(m => m.id !== id));
    handleClosePopup();
  };
  
  const handleClaimAll = () => setMails(prev => prev.map(m => (m.items?.length > 0 && !m.isClaimed) ? { ...m, isClaimed: true, isRead: true } : m));
  
  const handleDeleteAllRead = () => {
      setMails(prev => prev.filter(m => !m.isRead || (m.items?.length > 0 && !m.isClaimed)));
      handleClosePopup();
  };
  
  const unreadCount = mails.filter(m => !m.isRead).length;
  const canClaimAny = mails.some(m => m.items?.length > 0 && !m.isClaimed);
  const hasAnyRead = mails.some(m => m.isRead && !(m.items?.length > 0 && !m.isClaimed));


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');
        .font-lilita { font-family: 'Lilita One', cursive; } .font-sans { font-family: sans-serif; } .text-shadow { text-shadow: 2px 2px 4px rgba(0,0,0,0.5); } .text-shadow-sm { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; } @keyframes fade-in-scale-fast { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } } .animate-fade-in-scale-fast { animation: fade-in-scale-fast 0.2s ease-out forwards; } .main-bg::before, .main-bg::after { content: ''; position: absolute; left: 50%; z-index: -1; pointer-events: none; } .main-bg::before { width: 150%; height: 150%; top: 50%; transform: translate(-50%, -50%); background-image: radial-gradient(circle, transparent 40%, #110f21 80%); } .main-bg::after { width: 100%; height: 100%; top: 0; transform: translateX(-50%); background-image: radial-gradient(ellipse at top, rgba(173, 216, 230, 0.1) 0%, transparent 50%); } .scrollbar-thin { scrollbar-width: thin; scrollbar-color: #4A5568 #2D3748; } .scrollbar-thin::-webkit-scrollbar { width: 8px; } .scrollbar-thin::-webkit-scrollbar-track { background: #2D3748; } .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #4A5568; border-radius: 4px; border: 2px solid #2D3748; } .btn-shine::before { content: ''; position: absolute; top: 0; left: -100%; width: 75%; height: 100%; background: linear-gradient( to right, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100% ); transform: skewX(-25deg); transition: left 0.6s ease; } .btn-shine:hover:not(:disabled)::before { left: 125%; }
        /* Animation mới cho icon báo thư */
        @keyframes gentle-bounce { 0%, 100% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
        .animate-gentle-bounce { animation: gentle-bounce 1.2s infinite; }
      `}</style>

      <div className="main-bg relative min-h-screen bg-gradient-to-br from-[#110f21] to-[#2c0f52] flex flex-col items-center font-lilita text-white overflow-hidden p-4 sm:p-8">
        <header className="fixed top-0 left-0 w-full z-20 p-2 bg-black/30 backdrop-blur-sm border-b border-slate-700/50 shadow-lg h-14">
            <div className="w-full max-w-4xl mx-auto flex justify-between items-center h-full">
                <button onClick={onClose} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-colors" aria-label="Go Home" title="Go Home">
                    <HomeIcon className="w-5 h-5 text-slate-300" />
                    <span className="hidden sm:inline text-sm font-semibold text-slate-300 font-sans">Home</span>
                </button>
            </div>
        </header>

        <main className="w-full max-w-3xl mt-14">
            <div className="bg-slate-900/50 rounded-xl shadow-2xl shadow-black/50 flex flex-col border border-slate-700/50 backdrop-blur-sm">
                {/* Header -- UPDATED */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-cyan-300 text-shadow tracking-wider uppercase">Hộp Thư</h1>
                        {mails.length > 0 && (
                            <div className="mt-1 text-xs text-slate-400 font-sans">
                                <span>Thư mới: </span>
                                <span className="font-bold text-yellow-300">{unreadCount}</span>
                                <span className="mx-2 text-slate-600">|</span>
                                <span>Tổng cộng: </span>
                                <span className="font-semibold text-slate-200">{mails.length}</span>
                            </div>
                        )}
                    </div>
                    <Icon name="mail" className="w-10 h-10 text-slate-700" />
                </div>
                
                {/* Mail List */}
                <ul className="flex-grow overflow-y-auto h-[65vh] divide-y divide-slate-800 scrollbar-thin">
                    {mails.length > 0 ? (
                        mails.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                             .map(mail => (<MailItem key={mail.id} mail={mail} onSelect={handleSelectMail} isSelected={selectedMailId === mail.id} />))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600">
                            <Icon name="mail" className="w-24 h-24" />
                            <p className="mt-4 text-lg font-sans">Hộp thư trống</p>
                        </div>
                    )}
                </ul>
                
                {/* Footer Actions */}
                <div className="p-3 border-t border-slate-700 flex-shrink-0 flex items-center justify-around gap-3 bg-slate-900/60 rounded-b-xl">
                    <button 
                      onClick={handleDeleteAllRead} 
                      disabled={!hasAnyRead}
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
            </div>
        </main>
      </div>
      
      <MailPopup mail={selectedMail} onClose={handleClosePopup} onClaim={handleClaim} onDelete={handleDelete} />
    </>
  );
}
