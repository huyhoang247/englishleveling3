// --- START OF FILE tower-ads-modal.tsx ---

import React, { useState, useEffect } from 'react';
import { bossBattleAssets, resourceAssets } from '../../game-assets.ts';
import { BattleRewards } from './tower-service.ts';
import { useGame } from '../../GameContext.tsx';
import { AdsRewardUI, FormattedRewardItem } from '../../ui/ads-reward-ui.tsx';

// --- CUSTOM HOOK: ADS COOLDOWN LOGIC ---
// Hook này chịu trách nhiệm tính toán thời gian đếm ngược
const useAdsCooldown = (adsData: any) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            // Nếu không có nextAvailableAt nghĩa là chưa xem hoặc đã hết thời gian chờ
            if (!adsData.nextAvailableAt) {
                setTimeRemaining(0);
                setIsAvailable(true);
                return;
            }

            const now = new Date().getTime();
            
            // Xử lý an toàn cho trường hợp nextAvailableAt là Firestore Timestamp hoặc Date string
            let availableAt = 0;
            if (adsData.nextAvailableAt && typeof adsData.nextAvailableAt.toDate === 'function') {
                availableAt = adsData.nextAvailableAt.toDate().getTime();
            } else {
                availableAt = new Date(adsData.nextAvailableAt).getTime();
            }

            const diff = Math.ceil((availableAt - now) / 1000);

            if (diff > 0) {
                setTimeRemaining(diff);
                setIsAvailable(false);
            } else {
                setTimeRemaining(0);
                setIsAvailable(true);
            }
        };

        // Chạy ngay lần đầu
        calculateTime();
        
        // Cập nhật mỗi giây
        const timer = setInterval(calculateTime, 1000);
        
        // Cleanup khi unmount
        return () => clearInterval(timer);
    }, [adsData.nextAvailableAt]);

    return { timeRemaining, isAvailable };
};

interface AdsRewardModalProps {
    rewards: BattleRewards | null;
    onClaimX1: () => void;
    onClaimX2: () => void; 
}

// --- CONTAINER COMPONENT ---
export const AdsRewardModal = ({ rewards, onClaimX1, onClaimX2 }: AdsRewardModalProps) => {
    // 1. Lấy Data & Action từ Context
    const { adsData, handleRegisterAdWatch } = useGame(); 
    
    // 2. State nội bộ xử lý việc đang xem
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    
    // 3. Sử dụng Custom Hook để lấy trạng thái thời gian
    const { timeRemaining, isAvailable } = useAdsCooldown(adsData);

    // 4. Hàm xử lý logic Click xem quảng cáo
    const handleAdClick = async () => {
        // Kiểm tra điều kiện an toàn
        if (!isAvailable || adsData.watchedToday >= 30) return;

        setIsWatchingAd(true);
        
        // --- GIẢ LẬP GỌI SDK QUẢNG CÁO ---
        // Tại đây bạn sẽ thay thế bằng code gọi AdMob/UnityAds thật
        setTimeout(async () => {
            
            // Gọi server xác nhận xem xong
            const success = await handleRegisterAdWatch();
            
            setIsWatchingAd(false);

            if (success) {
                onClaimX2(); // Thành công -> Nhận thưởng x2
            } else {
                console.error("Ad watch validation failed");
                // Có thể thêm Toast thông báo lỗi ở đây
            }
            
        }, 3000); // Giả lập video 3 giây
    };

    // 5. Chuẩn bị dữ liệu hiển thị (Mapping Data -> UI Format)
    const formattedRewards: FormattedRewardItem[] = [];

    if (rewards) {
        // Map Coins
        if (rewards.coins > 0) {
            formattedRewards.push({
                icon: bossBattleAssets.coinIcon,
                label: 'Coins',
                amount: rewards.coins
            });
        }
        // Map Resources
        rewards.resources.forEach(res => {
            const resKey = res.type as keyof typeof resourceAssets;
            // Fallback icon nếu không tìm thấy resource
            const img = resourceAssets[resKey] || bossBattleAssets.coinIcon;
            
            formattedRewards.push({
                icon: img,
                label: res.type,
                amount: res.amount
            });
        });
    }

    if (!rewards) return null;

    // 6. Render UI Component (Truyền props đã xử lý vào)
    return (
        <AdsRewardUI 
            rewards={formattedRewards}
            adsStatus={{
                watchedToday: adsData.watchedToday,
                dailyLimit: 30, // Có thể lấy số này từ config server nếu muốn dynamic
                isAvailable: isAvailable,
                isWatching: isWatchingAd,
                timeRemaining: timeRemaining
            }}
            onClaimX1={onClaimX1}
            onWatchAdX2={handleAdClick}
        />
    );
};
