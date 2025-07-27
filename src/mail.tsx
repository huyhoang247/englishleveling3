import React, { useState, useMemo, useEffect } from 'react';

// --- Dữ liệu mẫu cho hộp thư ---
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

// --- Component Icon (Đã được chuẩn hóa để ổn định hơn) ---
const Icon = ({ name, className }) => {
  // Tất cả các icon đã được chuẩn hóa thành dạng stroke-based để đảm bảo tính nhất quán và tránh lỗi render.
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

// --- Component Popup hiển thị chi tiết thư ---
const MailPopup = ({ mail, onClose, onClaim, onDelete }) => {
  if (!mail) return null;

  const canClaim = mail.items && mail.items.length > 0 && !mail.isClaimed;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-yellow-500/30 transform transition-all duration-300 scale-95 animate-scale-in"
        style={{background: 'radial-gradient(ellipse at top, #374151, #111827)'}}
        onClick={e => e.stopPropagation()} // Ngăn popup đóng khi click vào nội dung
      >
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700/50">
          <h2 className="text-2xl font-bold text-yellow-400 text-center">{mail.subject}</h2>
          <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
            <p>Từ: <span className="font-semibold text-gray-300">{mail.sender}</span></p>
            <p>{new Date(mail.timestamp).toLocaleString('vi-VN')}</p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
            <Icon name="close" className="w-7 h-7" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto text-gray-300 leading-relaxed">
          <p>{mail.body}</p>
        </div>

        {/* Items */}
        {mail.items && mail.items.length > 0 && (
          <div className="p-6 border-t border-gray-700/50">
            <h3 className="text-lg font-semibold text-yellow-500 mb-4 text-center">Vật phẩm đính kèm</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mail.items.map((item, index) => (
                <div key={index} className="bg-gray-900/70 p-3 rounded-lg text-center flex flex-col items-center justify-center transform hover:scale-105 transition-transform duration-200 border border-gray-700">
                  <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mb-2 border-2 border-yellow-400/30">
                    <Icon name={item.icon} className="w-8 h-8 text-yellow-400" />
                  </div>
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-sm text-gray-400">x{item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="p-6 flex items-center justify-center space-x-4 bg-gray-900/50 rounded-b-xl">
          <button
            onClick={() => onDelete(mail.id)}
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-red-900/50 transform hover:-translate-y-1"
          >
            <Icon name="trash" className="w-5 h-5" />
            <span>Xóa</span>
          </button>
          {canClaim && (
            <button
              onClick={() => onClaim(mail.id)}
              className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all duration-300 flex items-center space-x-2 shadow-lg shadow-green-900/50 transform hover:-translate-y-1 animate-pulse-slow"
            >
              <Icon name="claim" className="w-5 h-5" />
              <span>NHẬN</span>
            </button>
          )}
          {mail.isClaimed && (
             <div className="px-8 py-3 bg-gray-600 text-gray-300 font-semibold rounded-lg flex items-center space-x-2 cursor-not-allowed">
               <Icon name="check" className="w-5 h-5" />
              <span>Đã nhận</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Component hiển thị một thư trong danh sách ---
const MailItem = ({ mail, onSelect, isSelected }) => {
  const getIconForType = (type) => {
    switch (type) {
      case 'gift': return <Icon name="gift" className="w-7 h-7 text-yellow-400" />;
      case 'item': return <Icon name="item" className="w-7 h-7 text-blue-400" />;
      default: return <Icon name="mail" className="w-7 h-7 text-gray-400" />;
    }
  };

  return (
    <li
      onClick={() => onSelect(mail.id)}
      className={`p-4 flex items-start space-x-4 cursor-pointer border-l-4 transition-all duration-200 ${isSelected ? 'border-yellow-400 bg-gray-700' : 'border-transparent hover:bg-gray-700/50'}`}
    >
      {!mail.isRead && <div className="flex-shrink-0 w-2.5 h-2.5 bg-yellow-400 rounded-full mt-2.5 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>}
      {mail.isRead && <div className="flex-shrink-0 w-2.5 h-2.5"></div>}
      
      <div className="flex-shrink-0">{getIconForType(mail.type)}</div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <p className={`font-bold truncate ${mail.isRead ? 'text-gray-400' : 'text-white'}`}>{mail.subject}</p>
          <p className="text-xs text-gray-500 flex-shrink-0 ml-2">{new Date(mail.timestamp).toLocaleDateString('vi-VN')}</p>
        </div>
        <p className="text-sm text-gray-400 truncate">Từ: {mail.sender}</p>
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

  // Thêm hiệu ứng cho body khi popup mở
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

  const handleClosePopup = () => {
    setSelectedMailId(null);
  };

  const handleClaim = (id) => {
    setMails(prevMails =>
      prevMails.map(mail =>
        mail.id === id ? { ...mail, isClaimed: true } : mail
      )
    );
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

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans" style={{background: 'linear-gradient(145deg, #1f2937, #111827)'}}>
      <div className="w-full max-w-3xl mx-auto p-4 sm:p-8">
        <div className="bg-gray-800/50 rounded-xl shadow-2xl shadow-black/50 flex flex-col border border-gray-700/50 backdrop-blur-sm">
          {/* Header */}
          <div className="p-4 border-b border-gray-700/50 flex justify-between items-center flex-shrink-0">
            <h1 className="text-3xl font-bold text-yellow-400" style={{textShadow: '0 0 10px rgba(250, 204, 21, 0.5)'}}>Hộp Thư</h1>
            {unreadCount > 0 && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">{unreadCount}</span>
            )}
          </div>
          
          {/* Mail List */}
          <ul className="flex-grow overflow-y-auto h-[65vh] divide-y divide-gray-700/50">
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
                    <Icon name="mail" className="w-24 h-24" />
                    <p className="mt-4 text-lg">Hộp thư trống</p>
                </div>
            )}
          </ul>
          
          {/* Footer Actions */}
          <div className="p-3 border-t border-gray-700/50 flex-shrink-0 flex items-center justify-around space-x-2 bg-gray-900/30 rounded-b-xl">
            <button onClick={handleClaimAll} className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-900/50">Nhận tất cả</button>
            <button onClick={handleDeleteAllRead} className="flex-1 px-4 py-2 text-sm bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200">Xóa thư đã đọc</button>
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
      
      {/* CSS for animations */}
      <style>{`
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
          50% {
            opacity: .85;
            box-shadow: 0 0 15px rgba(52, 211, 153, 0.6);
          }
        }
        .animate-pulse-slow {
            animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
