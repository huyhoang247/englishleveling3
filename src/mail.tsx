import React, { useState, useMemo, useEffect } from 'react';

// --- Dữ liệu mẫu (Không thay đổi) ---
const initialMails = [
  { id: 1, sender: 'Hệ Thống', subject: 'Chào mừng tân thủ!', body: 'Chào mừng bạn đã đến với thế giới của chúng tôi! Đây là một món quà nhỏ để giúp bạn bắt đầu cuộc hành trình.', type: 'gift', items: [{ name: 'Kim cương', quantity: 100, icon: 'gem' }, { name: 'Vàng', quantity: 5000, icon: 'coin' },], isRead: false, isClaimed: false, timestamp: '2025-07-21T10:30:00Z' },
  { id: 2, sender: 'Trưởng Lão Làng', subject: 'Nhiệm vụ đầu tiên', body: 'Hãy đến gặp tôi để nhận nhiệm vụ đầu tiên của bạn. Đừng quên chuẩn bị kỹ càng nhé!', type: 'notification', items: [], isRead: false, isClaimed: false, timestamp: '2025-07-21T10:35:00Z' },
  { id: 3, sender: 'Phần thưởng Đấu trường', subject: 'Quà xếp hạng tuần', body: 'Chúc mừng bạn đã đạt thứ hạng cao trong Đấu trường tuần qua. Đây là phần thưởng của bạn.', type: 'item', items: [{ name: 'Kiếm Bão Tố', quantity: 1, icon: 'sword' }, { name: 'Huy hiệu Dũng Sĩ', quantity: 10, icon: 'badge' },], isRead: true, isClaimed: false, timestamp: '2025-07-20T08:00:00Z' },
  { id: 4, sender: 'Bảo trì hệ thống', subject: 'Thông báo bảo trì', body: 'Hệ thống sẽ được bảo trì vào lúc 02:00 sáng ngày mai. Sẽ có quà đền bù sau khi bảo trì hoàn tất.', type: 'notification', items: [], isRead: true, isClaimed: false, timestamp: '2025-07-19T15:00:00Z' },
  { id: 5, sender: 'Phần thưởng đăng nhập', subject: 'Quà đăng nhập ngày 7', body: 'Cảm ơn bạn đã đăng nhập liên tục. Đây là phần thưởng đặc biệt dành cho bạn!', type: 'gift', items: [{ name: 'Trang phục Hiếm', quantity: 1, icon: 'chest' },], isRead: false, isClaimed: false, timestamp: '2025-07-18T05:00:00Z' },
];

// --- Component Icon (Tùy chỉnh màu sắc để hợp với theme) ---
const Icon = ({ name, className }) => {
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
    claim: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a2.25 2.25 0 01-2.25-2.25v-9a2.25 2.25 0 012.25-2.25h9A2.25 2.25 0 0118.75 7.5v9a2.25 2.25 0 01-2.25 2.25z" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    wax_seal: <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor" />, // Placeholder
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {icons[name] || icons.mail}
    </svg>
  );
};

// --- [RE-DESIGN] Popup chi tiết thư ---
const MailPopup = ({ mail, onClose, onClaim, onDelete }) => {
  if (!mail) return null;
  const canClaim = mail.items && mail.items.length > 0 && !mail.isClaimed;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col parchment-bg shadow-2xl shadow-black/70 animate-unfurl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-8 text-center border-b-2 border-amber-800/20">
          <h2 className="text-4xl text-amber-900 font-fancy-heading">{mail.subject}</h2>
          <div className="flex justify-between items-center mt-3 text-sm text-amber-900/70 font-handwriting">
            <span>Từ: <b className="font-bold">{mail.sender}</b></span>
            <span>{new Date(mail.timestamp).toLocaleString('vi-VN')}</span>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-amber-800/60 hover:text-amber-900 transition-colors hover:rotate-90 duration-300">
            <Icon name="close" className="w-9 h-9" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow p-8 overflow-y-auto text-lg text-amber-900/90 leading-relaxed font-handwriting">
          <p>{mail.body}</p>
        </div>

        {/* Items */}
        {mail.items && mail.items.length > 0 && (
          <div className="p-6 border-t-2 border-amber-800/20">
            <h3 className="text-xl font-fancy-heading text-amber-900 mb-4 text-center">Vật Phẩm</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mail.items.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center p-2 rounded-lg transition-transform duration-200 transform hover:scale-110">
                  <div className="w-20 h-20 bg-amber-200/50 rounded-full flex items-center justify-center mb-2 ring-2 ring-amber-800/20" style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
                    <Icon name={item.icon} className="w-10 h-10 text-amber-800" style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }} />
                  </div>
                  <p className="font-bold text-amber-900">{item.name}</p>
                  <p className="text-sm text-amber-900/70 font-handwriting">x{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex items-center justify-center space-x-6">
          <button onClick={() => onDelete(mail.id)} className="font-fancy-heading text-lg text-amber-800/70 hover:text-red-700 transition-colors flex items-center gap-2">
            <Icon name="trash" className="w-6 h-6"/> Xóa Thư
          </button>
          
          {canClaim && (
            <button onClick={() => onClaim(mail.id)} className="wax-seal-button group">
              <div className="seal">
                <Icon name="gift" className="w-10 h-10 text-amber-100 transition-transform duration-200 group-hover:scale-110" />
              </div>
              <span className="label">Nhận Thưởng</span>
            </button>
          )}

          {mail.isClaimed && (
             <div className="wax-seal-button-claimed">
               <div className="seal">
                 <Icon name="check" className="w-10 h-10 text-amber-800/50" />
               </div>
               <span className="label">Đã Nhận</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- [RE-DESIGN] Mail Item trong danh sách ---
const MailItem = ({ mail, onSelect, isSelected }) => {
  const getIconForType = (type) => {
    const iconColor = isSelected ? 'text-amber-800' : 'text-amber-900/60';
    switch (type) {
      case 'gift': return <Icon name="gift" className={`w-7 h-7 ${iconColor}`} />;
      case 'item': return <Icon name="item" className={`w-7 h-7 ${iconColor}`} />;
      default: return <Icon name="mail" className={`w-7 h-7 ${iconColor}`} />;
    }
  };

  return (
    <li
      onClick={() => onSelect(mail.id)}
      className={`p-4 flex items-center space-x-4 cursor-pointer transition-all duration-300 relative ${isSelected ? 'bg-amber-300/40' : 'hover:bg-amber-300/20'}`}
    >
      {/* Wax Seal as Unread Indicator */}
      {!mail.isRead && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-700 rounded-full ring-2 ring-red-900/50 shadow-md"></div>
      )}

      <div className={`flex-shrink-0 transition-opacity duration-300 ${mail.isRead && !isSelected ? 'opacity-50' : 'opacity-100'}`}>
        {getIconForType(mail.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className={`font-bold truncate ${mail.isRead ? 'text-amber-900/60' : 'text-amber-900'}`}>{mail.subject}</p>
          <p className="text-xs text-amber-900/50 flex-shrink-0 ml-2 font-handwriting">{new Date(mail.timestamp).toLocaleDateString('vi-VN')}</p>
        </div>
        <p className={`text-sm truncate font-handwriting ${mail.isRead ? 'text-amber-900/50' : 'text-amber-900/70'}`}>Từ: {mail.sender}</p>
      </div>
    </li>
  );
};


// --- Component chính ---
export default function App() {
  const [mails, setMails] = useState(initialMails);
  const [selectedMailId, setSelectedMailId] = useState(null);

  const selectedMail = useMemo(() => mails.find(m => m.id === selectedMailId) || null, [mails, selectedMailId]);

  useEffect(() => {
    document.body.style.overflow = selectedMailId ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedMailId]);

  const handleSelectMail = (id) => {
    setSelectedMailId(id);
    setMails(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleClosePopup = () => setSelectedMailId(null);
  const handleClaim = (id) => setMails(prev => prev.map(m => m.id === id ? { ...m, isClaimed: true } : m));
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

  return (
    <div className="min-h-screen font-sans wooden-bg p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col parchment-bg shadow-2xl shadow-black/50">
        {/* Header */}
        <header className="p-6 text-center border-b-4 border-double border-amber-800/30 relative">
          <h1 className="text-5xl text-amber-900 font-fancy-heading" style={{ textShadow: '1px 1px 2px rgba(92, 57, 30, 0.4)' }}>
            Hộp Thư
          </h1>
          {unreadCount > 0 && (
            <div className="absolute top-4 right-4 flex items-center">
              <span className="text-lg font-bold text-red-800 font-fancy-heading">{unreadCount}</span>
              <div className="ml-1 w-3 h-3 bg-red-700 rounded-full shadow-md"></div>
            </div>
          )}
           <div className="w-48 h-px bg-gradient-to-r from-transparent via-amber-800/40 to-transparent mx-auto mt-2"></div>
        </header>
        
        {/* Mail List */}
        <main className="flex-grow overflow-y-auto custom-scrollbar">
          {mails.length > 0 ? (
            <ul className="divide-y divide-amber-800/10">
              {mails.map(mail => (
                <MailItem key={mail.id} mail={mail} onSelect={handleSelectMail} isSelected={selectedMailId === mail.id} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-amber-800/40">
              <Icon name="mail" className="w-32 h-32" />
              <p className="mt-4 text-2xl font-fancy-heading">Hộp thư trống</p>
            </div>
          )}
        </main>
        
        {/* Footer Actions */}
        <footer className="p-4 border-t-4 border-double border-amber-800/30 flex-shrink-0 flex items-center justify-center space-x-4">
          <button onClick={handleClaimAll} className="action-button-metal">Nhận Tất Cả</button>
          <button onClick={handleDeleteAllRead} className="action-button-metal">Xóa Thư Đã Đọc</button>
        </footer>
      </div>
      
      {/* Mail Popup */}
      {selectedMail && <MailPopup mail={selectedMail} onClose={handleClosePopup} onClaim={handleClaim} onDelete={handleDelete} />}
      
      {/* CSS for custom styles, fonts, and animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=Kalam:wght@300;400;700&display=swap');
        
        .font-fancy-heading { font-family: 'Uncial Antiqua', cursive; }
        .font-handwriting { font-family: 'Kalam', cursive; }

        .wooden-bg {
          background-color: #3d2c21;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='%2335261d' fill-opacity='0.4'%3E%3Crect x='0' y='0' width='100' height='1'/%3E%3Crect x='0' y='2' width='100' height='1'/%3E%3Crect x='0' y='5' width='100' height='1'/%3E%3Crect x='0' y='8' width='100' height='1'/%3E%3Crect x='0' y='12' width='100' height='1'/%3E%3Crect x='0' y='16' width='100' height='1'/%3E%3Crect x='0' y='21' width='100' height='1'/%3E%3Crect x='0' y='26' width='100' height='1'/%3E%3Crect x='0' y='32' width='100' height='1'/%3E%3Crect x='0' y='38' width='100' height='1'/%3E%3Crect x='0' y='45' width='100' height='1'/%3E%3Crect x='0' y='52' width='100' height='1'/%3E%3Crect x='0' y='60' width='100' height='1'/%3E%3Crect x='0' y='68' width='100' height='1'/%3E%3Crect x='0' y='77' width='100' height='1'/%3E%3Crect x='0' y='86' width='100' height='1'/%3E%3Crect x='0' y='96' width='100' height='1'/%3E%3C/g%3E%3C/svg%3E");
        }

        .parchment-bg {
          background-color: #fdf5e6;
          background-image:
            radial-gradient(circle at 100% 0%, rgba(200,180,150,0.3) 0%, rgba(200,180,150,0) 25%),
            radial-gradient(circle at 0% 100%, rgba(200,180,150,0.3) 0%, rgba(200,180,150,0) 25%),
            linear-gradient(rgba(240,220,180,0.2) 2px, transparent 2px),
            linear-gradient(90deg, rgba(240,220,180,0.2) 2px, transparent 2px),
            linear-gradient(rgba(240,220,180,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,220,180,0.1) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 73px 73px, 73px 73px, 31px 31px, 31px 31px;
          border: 1px solid #c8b48c;
          border-radius: 4px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 15px rgba(92,57,30,0.2);
        }

        .action-button-metal {
          padding: 10px 20px;
          font-family: 'Uncial Antiqua', cursive;
          font-size: 1rem;
          color: #e8d9c0;
          background: linear-gradient(145deg, #6d5d4b, #4a3e32);
          border: 2px solid;
          border-image: linear-gradient(145deg, #c8b48c, #856f4d) 1;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1);
          text-shadow: 1px 1px 2px #2a221b;
          transition: all 0.2s ease-out;
        }
        .action-button-metal:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2);
          filter: brightness(1.1);
        }
        .action-button-metal:active {
          transform: translateY(1px);
          box-shadow: 0 1px 2px rgba(0,0,0,0.5), inset 0 2px 4px rgba(0,0,0,0.4);
          filter: brightness(0.9);
        }

        .wax-seal-button, .wax-seal-button-claimed {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }
        .wax-seal-button .seal {
          width: 80px; height: 80px;
          background: #c0392b;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.4), inset 0 2px 3px rgba(0,0,0,0.3);
          border: 3px solid #a03024;
          transition: all 0.2s ease;
        }
        .wax-seal-button:hover .seal {
          transform: scale(1.05);
          background: #e74c3c;
        }
        .wax-seal-button:active .seal {
          transform: scale(0.95);
          box-shadow: 0 2px 4px rgba(0,0,0,0.4), inset 0 3px 5px rgba(0,0,0,0.4);
        }
        .wax-seal-button .label, .wax-seal-button-claimed .label {
          margin-top: 8px; font-family: 'Uncial Antiqua', cursive;
          font-size: 1rem; color: #a03024; text-shadow: 1px 1px 1px #fff5;
        }
        .wax-seal-button-claimed .seal {
           width: 80px; height: 80px;
           background: #b0a08d;
           border: 3px solid #8c7b68;
           box-shadow: 0 2px 3px rgba(0,0,0,0.2), inset 0 2px 3px rgba(0,0,0,0.2);
           cursor: not-allowed;
           border-radius: 50%; display: flex; align-items: center; justify-content: center;
        }
        .wax-seal-button-claimed .label {
           color: #8c7b68;
        }

        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        
        @keyframes unfurl {
          from { opacity: 0; transform: scaleY(0) scaleX(0.5); }
          to { opacity: 1; transform: scaleY(1) scaleX(1); }
        }
        .animate-unfurl { animation: unfurl 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) forwards; }

        /* Custom scrollbar for mail list */
        .custom-scrollbar::-webkit-scrollbar { width: 12px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #e0d5c1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #856f4d, #6d5d4b);
          border-radius: 10px;
          border: 2px solid #e0d5c1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #a58f6d, #8d7d6b); }
      `}</style>
    </div>
  );
}
