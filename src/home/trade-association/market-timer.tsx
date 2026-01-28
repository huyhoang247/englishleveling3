// --- START OF FILE market-timer.tsx ---

import React, { useState, useEffect, memo } from 'react';

const MarketTimer = memo(() => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            // Lấy giờ hiện tại theo múi giờ VN
            const vnNowString = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
            const vnNow = new Date(vnNowString);

            // Tạo mốc 00:00 ngày hôm sau
            const vnTomorrow = new Date(vnNow);
            vnTomorrow.setDate(vnTomorrow.getDate() + 1);
            vnTomorrow.setHours(0, 0, 0, 0);

            const diff = vnTomorrow.getTime() - vnNow.getTime();

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        // Chạy ngay lần đầu
        setTimeLeft(calculateTimeLeft());
        
        // Cập nhật mỗi giây
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Render nothing if timeLeft isn't ready yet to avoid layout shift (optional)
    if (!timeLeft) return null;

    return (
        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-600 px-5 py-2 rounded-full mx-auto w-fit mb-4 animate-fadeIn select-none">
            {/* Đã loại bỏ chấm xanh nhấp nháy ở đây */}
            
            <div className="text-sm uppercase tracking-widest text-slate-400 font-lilita">Market Reset</div>
            
            {/* 
                - text-xl: Size chữ nhỏ hơn (trước là 2xl)
                - text-white: Màu trắng
                - min-w-[90px]: Điều chỉnh lại chiều rộng tối thiểu cho cân đối
            */}
            <div className="font-lilita text-xl text-white tabular-nums tracking-widest min-w-[90px] text-center">
                {timeLeft}
            </div>
        </div>
    );
});

export default MarketTimer;
