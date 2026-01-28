// --- FILE: check-in-ads-modal.tsx ---

import React, { useState, useEffect } from 'react';
import { useGame } from '../../GameContext.tsx';
import { AdsRewardUI, FormattedRewardItem } from '../../ui/ads-reward-ui.tsx';
import { dailyRewardsUI, getCheckInMultiplier } from './check-in-context.tsx';
import { uiAssets, bossBattleAssets } from '../../game-assets.ts';

// Hook đếm ngược thời gian quảng cáo (copy từ tower-ads-modal.tsx)
const useAdsCooldown = (adsData: any) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isAvailable, setIsAvailable] = useState(false);

    useEffect(() => {
        const calculateTime = () => {
            if (!adsData.nextAvailableAt) {
                setTimeRemaining(0);
                setIsAvailable(true);
                return;
            }
            const now = new Date().getTime();
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
        calculateTime();
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [adsData.nextAvailableAt]);

    return { timeRemaining, isAvailable };
};

interface CheckInAdsModalProps {
    day: number;
    masteryCards: number;
    onClaimX1: () => void;
    onClaimX2: () => void;
}

export const CheckInAdsModal = ({ day, masteryCards, onClaimX1, onClaimX2 }: CheckInAdsModalProps) => {
    const { adsData, handleRegisterAdWatch } = useGame();
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const { timeRemaining, isAvailable } = useAdsCooldown(adsData);

    // Tính toán reward preview
    // Lưu ý: Logic tính phải khớp với logic trong check-in-service.ts
    const rewardConfig = dailyRewardsUI.find(r => r.day === day);
    const masteryMultiplier = getCheckInMultiplier(masteryCards);
    
    const formattedRewards: FormattedRewardItem[] = [];

    if (rewardConfig) {
        rewardConfig.items.forEach(item => {
            // Lấy URL ảnh từ JSX Element (Hơi thủ công vì dailyRewardsUI lưu JSX)
            // Cách tốt nhất là sửa dailyRewardsUI lưu string path, nhưng để nhanh ta check type
            
            let iconSrc = bossBattleAssets.coinIcon; // Fallback
            if (item.type === 'coins') iconSrc = uiAssets.goldIcon;
            else if (item.type === 'energy') iconSrc = bossBattleAssets.energyIcon;
            else if (item.icon && typeof item.icon === 'object' && 'props' in item.icon) {
                 // @ts-ignore
                 iconSrc = item.icon.props.src;
            }

            // Tính số lượng (Energy không nhân mastery)
            let finalAmount = parseFloat(item.amount);
            if (item.type !== 'energy') {
                finalAmount = finalAmount * masteryMultiplier;
            }

            formattedRewards.push({
                icon: iconSrc,
                label: item.name,
                amount: finalAmount
            });
        });
    }

    const handleAdClick = async () => {
        if (!isAvailable || adsData.watchedToday >= 30) return;
        setIsWatchingAd(true);
        
        // Giả lập xem quảng cáo
        setTimeout(async () => {
            const success = await handleRegisterAdWatch();
            setIsWatchingAd(false);
            if (success) {
                onClaimX2();
            } else {
                console.error("Ad failed");
            }
        }, 3000);
    };

    return (
        <AdsRewardUI 
            rewards={formattedRewards}
            adsStatus={{
                watchedToday: adsData.watchedToday,
                dailyLimit: 30,
                isAvailable: isAvailable,
                isWatching: isWatchingAd,
                timeRemaining: timeRemaining
            }}
            onClaimX1={onClaimX1}
            onWatchAdX2={handleAdClick}
        />
    );
};
