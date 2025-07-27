import React, { useState, useMemo, useEffect } from 'react';

// --- Dữ liệu mẫu cho hộp thư (Không thay đổi) ---
const initialMails = [
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


// --- Component Icon (Không thay đổi) ---
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
    claim: <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {icons[name] || icons.mail}
    </svg>
  );
};

// --- [Nâng cấp] Component Popup hiển thị chi tiết thư ---
const MailPopup = ({ mail, onClose, onClaim, onDelete }) => {
  if (!mail) return null;

  const canClaim = mail.items && mail.items.length > 0 && !mail.isClaimed;

  // Lớp CSS chung cho các nút bấm trong popup
  const buttonBaseClass = "px-6 py-2.5 font-bold rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 border-2 shadow-lg transform active:scale-95";
  const buttonTextClass = "font-cinzel tracking-wider uppercase";

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800/70 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-amber-400/50 transform transition-all duration-300 scale-95 animate-scale-in relative overflow-hidden"
        style={{
            background: 'radial-gradient(ellipse at center, #2c3e50 0%, #1a202c 100%)',
            boxShadow: '0 0 25px rgba(251, 191, 36, 0.2), inset 0 0 10px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 border-b-2 border-amber-400/30 text-center">
          <h2 className="text-3xl font-bold text-amber-300 font-cinzel" style={{textShadow: '0 2px 10px rgba(252, 211, 77, 0.5)'}}>{mail.subject}</h2>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-400 font-inter">
            <p>Từ: <span className="font-semibold text-gray-200">{mail.sender}</span></p>
            <p>{new Date(mail.timestamp).toLocaleString('vi-VN')}</p>
          </div>
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-amber-300 transition-colors duration-200 hover:rotate-90">
            <Icon name="close" className="w-8 h-8" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto text-gray-300 leading-relaxed font-inter bg-black/20" style={{'--pattern-color': '#4a556855', backgroundImage: 'linear-gradient(var(--pattern-color) 1px, transparent 1px), linear-gradient(to right, var(--pattern-color) 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
          <p className="text-base">{mail.body}</p>
        </div>

        {/* Items */}
        {mail.items && mail.items.length > 0 && (
          <div className="p-6 border-t-2 border-amber-400/30 bg-black/20">
            <h3 className="text-xl font-semibold text-amber-400 mb-4 text-center font-cinzel">Vật phẩm đính kèm</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mail.items.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-900 to-slate-800 p-3 rounded-lg text-center flex flex-col items-center justify-between transform hover:scale-105 transition-transform duration-200 border-2 border-amber-500/30 shadow-lg shadow-black/50 aspect-square">
                   <div className="relative w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mb-2 border-2 border-amber-400/30" style={{boxShadow: 'inset 0 0 10px rgba(251, 191, 36, 0.2)'}}>
                    <div className="absolute inset-0 bg-amber-300/30 rounded-full blur-lg animate-pulse-slow"></div>
                    <Icon name={item.icon} className="w-8 h-8 text-amber-300" />
                  </div>
                  <div className="flex-grow flex flex-col justify-center">
                    <p className="font-semibold text-white text-sm font-inter">{item.name}</p>
                    <p className="text-xs text-gray-400 font-inter">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 flex items-center justify-center space-x-4 bg-gradient-to-t from-black/50 to-transparent rounded-b-xl">
          <button
            onClick={() => onDelete(mail.id)}
            className={`${buttonBaseClass} bg-gradient-to-b from-rose-600 to-rose-800 text-white border-rose-500/50 hover:from-rose-500 hover:to-rose-700 hover:border-rose-400 hover:shadow-rose-500/30`}
          >
            <Icon name="trash" className="w-5 h-5" />
            <span className={buttonTextClass}>Xóa</span>
          </button>
          {canClaim && (
            <button
              onClick={() => onClaim(mail.id)}
              className={`${buttonBaseClass} bg-gradient-to-b from-green-500 to-green-700 text-white border-green-400/80 hover:from-green-400 hover:to-green-600 hover:border-green-300 hover:shadow-green-400/40 animate-pulse-slow`}
            >
              <Icon name="claim" className="w-5 h-5" />
              <span className={buttonTextClass}>NHẬN</span>
            </button>
          )}
          {mail.isClaimed && (
             <div className={`${buttonBaseClass} bg-slate-700 text-gray-400 border-slate-600 cursor-not-allowed`}>
               <Icon name="check" className="w-5 h-5" />
              <span className={buttonTextClass}>Đã nhận</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- [Nâng cấp] Component hiển thị một thư trong danh sách ---
const MailItem = ({ mail, onSelect, isSelected }) => {
  const getIconForType = (type) => {
    switch (type) {
      case 'gift': return <Icon name="gift" className="w-8 h-8 text-amber-400" />;
      case 'item': return <Icon name="item" className="w-8 h-8 text-sky-400" />;
      default: return <Icon name="mail" className="w-8 h-8 text-gray-400" />;
    }
  };

  const selectedClass = isSelected 
    ? 'bg-amber-400/10 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)]' 
    : 'border-transparent hover:bg-slate-700/50 hover:border-slate-600';

  return (
    <li
      onClick={() => onSelect(mail.id)}
      className={`p-4 flex items-center space-x-4 cursor-pointer border-l-4 transition-all duration-200 ${selectedClass}`}
    >
      <div className="flex-shrink-0 w-3 h-3 flex items-center justify-center">
        {!mail.isRead && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(250,204,21,0.9)]"></div>}
      </div>
      
      <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-black/20 rounded-lg border border-slate-600/50">
        {getIconForType(mail.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className={`font-bold truncate font-cinzel ${mail.isRead ? 'text-gray-400' : 'text-white'}`}>{mail.subject}</p>
          <p className="text-xs text-gray-500 flex-shrink-0 ml-2 font-inter">{new Date(mail.timestamp).toLocaleDateString('vi-VN')}</p>
        </div>
        <p className="text-sm text-gray-400 truncate font-inter">Từ: {mail.sender}</p>
      </div>
    </li>
  );
};

// --- Component chính ---
export default function App() {
  const [mails, setMails] = useState(initialMails);
  const [selectedMailId, setSelectedMailId] = useState(null);

  const selectedMail = useMemo(() => {
    return mails.find(m => m.id === selectedMailId) || null;
  }, [mails, selectedMailId]);

  useEffect(() => {
    if (selectedMailId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedMailId]);

  const handleSelectMail = (id) => {
    setSelectedMailId(id);
    setMails(prevMails =>
      prevMails.map(mail =>
        mail.id === id ? { ...mail, isRead: true } : mail
      )
    );
  };

  const handleClosePopup = () => setSelectedMailId(null);

  const handleClaim = (id) => {
    setMails(prevMails => prevMails.map(mail => mail.id === id ? { ...mail, isClaimed: true } : mail));
  };
  
  const handleDelete = (id) => {
    setMails(prevMails => prevMails.filter(mail => mail.id !== id));
    handleClosePopup();
  };

  const handleClaimAll = () => {
      setMails(prevMails => prevMails.map(mail => 
        (mail.items && mail.items.length > 0 && !mail.isClaimed) ? { ...mail, isClaimed: true, isRead: true } : mail
      ));
  };

  const handleDeleteAllRead = () => {
      setMails(prevMails => prevMails.filter(mail => !mail.isRead || (mail.items && mail.items.length > 0 && !mail.isClaimed)));
      handleClosePopup();
  };
  
  const unreadCount = mails.filter(m => !m.isRead).length;

  const actionButtonClass = "flex-1 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-300 shadow-lg border border-transparent hover:scale-105 active:scale-100 font-cinzel tracking-wider";

  return (
    <div className="min-h-screen text-white font-inter" style={{background: `radial-gradient(ellipse at center, #1e293b, #0f172a)`}}>
       <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%224%22%20height%3D%224%22%20viewBox%3D%220%200%204%204%22%3E%3Cpath%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.1%22%20d%3D%22M1%203h1v1H1V3zm2-2h1v1H3V1z%22%3E%3C%2Fpath%3E%3C%2Fsvg%3E')] opacity-20"></div>

      <div className="w-full max-w-4xl mx-auto p-4 sm:p-8 relative z-10">
        <div className="bg-slate-800/80 rounded-xl shadow-2xl shadow-black/50 flex flex-col border-2 border-amber-400/30 backdrop-blur-sm">
          {/* Header */}
          <div className="p-5 border-b-2 border-amber-400/30 flex justify-between items-center flex-shrink-0 relative">
            <div className="absolute top-0 left-4 w-8 h-1 bg-amber-400 rounded-b-full"></div>
            <div className="absolute top-0 right-4 w-8 h-1 bg-amber-400 rounded-b-full"></div>
            <h1 className="text-4xl font-bold text-amber-300 font-cinzel mx-auto" style={{textShadow: '0 0 15px rgba(251, 191, 36, 0.6)'}}>HỘP THƯ</h1>
            {unreadCount > 0 && (
              <span className="absolute right-5 top-1/2 -translate-y-1/2 bg-amber-500 text-black text-xs font-bold px-2.5 py-1 rounded-full animate-pulse shadow-lg shadow-amber-500/50">{unreadCount}</span>
            )}
          </div>
          
          {/* Mail List */}
          <ul className="overflow-y-auto h-[65vh] divide-y divide-slate-700/50 bg-black/10">
            {mails.length > 0 ? (
                mails.map(mail => (
                  <MailItem
                    key={mail.id}
                    mail={mail}
                    onSelect={handleSelectMail}
                    isSelected={selectedMailId === mail.id}
                  />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <Icon name="mail" className="w-24 h-24 text-slate-600" />
                    <p className="mt-4 text-lg font-cinzel">Hộp thư trống</p>
                </div>
            )}
          </ul>
          
          {/* Footer Actions */}
          <div className="p-3 border-t-2 border-amber-400/30 flex-shrink-0 flex items-center justify-around space-x-3 bg-slate-900/50">
            <button onClick={handleClaimAll} className={`${actionButtonClass} bg-sky-600 text-white shadow-sky-900/50 border-sky-500 hover:bg-sky-500 hover:border-sky-400`}>Nhận tất cả</button>
            <button onClick={handleDeleteAllRead} className={`${actionButtonClass} bg-slate-600 text-white shadow-slate-900/50 border-slate-500 hover:bg-slate-500 hover:border-slate-400`}>Xóa thư đã đọc</button>
          </div>
        </div>
      </div>
      
      {/* Mail Popup */}
      <MailPopup 
        mail={selectedMail} 
        onClose={handleClosePopup}
        onClaim={handleClaim}
        onDelete={handleDelete}
      />
      
      {/* CSS for animations & fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');
        
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-inter { font-family: 'Inter', sans-serif; }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
        }
        @keyframes pulse-slow {
          0%, 100% {
             transform: scale(1);
             filter: brightness(1);
          }
          50% {
             transform: scale(1.02);
             filter: brightness(1.2);
             box-shadow: 0 0 20px rgba(52, 211, 153, 0.6);
          }
        }
        .animate-pulse-slow {
            animation: pulse-slow 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
