import React, { memo, useEffect, useState } from 'react';

const SLASH_URL = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/slashing-effect.webp";

interface SlashingEffectProps {
    onComplete: () => void;
}

const SlashingEffect = memo(({ onComplete }: SlashingEffectProps) => {
    // Thông số từ screenshot: 618x606
    const frameWidth = 618;
    const frameHeight = 606;
    const totalCols = 6; 
    const totalRows = 6; // Giả định grid 6x6 dựa trên tỷ lệ thông thường của Ludo AI

    useEffect(() => {
        // Tự hủy sau khi chạy xong animation (0.6s)
        const timer = setTimeout(() => {
            onComplete();
        }, 600);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <style>{`
                .slash-container {
                    width: ${frameWidth}px;
                    height: ${frameHeight}px;
                    overflow: hidden;
                    transform: scale(0.8); /* Chỉnh to nhỏ hiệu ứng tại đây */
                }
                .slash-sprite {
                    width: ${frameWidth * totalCols}px;
                    height: ${frameHeight * totalRows}px;
                    background-image: url('${SLASH_URL}');
                    background-size: ${frameWidth * totalCols}px ${frameHeight * totalRows}px;
                    animation: 
                        slash-x 0.6s steps(${totalCols}) forwards,
                        slash-y 0.6s steps(${totalRows}) forwards;
                }
                @keyframes slash-x {
                    from { background-position-x: 0; }
                    to { background-position-x: -${frameWidth * totalCols}px; }
                }
                @keyframes slash-y {
                    from { background-position-y: 0; }
                    to { background-position-y: -${frameHeight * totalRows}px; }
                }
                @media (max-width: 768px) {
                    .slash-container { transform: scale(0.4); }
                }
            `}</style>
            <div className="slash-container">
                <div className="slash-sprite" />
            </div>
        </div>
    );
});

export default SlashingEffect;
