import React, { memo, useEffect, useState } from 'react';

interface SlashingEffectProps {
    onComplete: () => void;
}

const SlashingEffect = memo(({ onComplete }: SlashingEffectProps) => {
    const spriteUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/slashing-effect.webp";
    
    useEffect(() => {
        // Tự động xóa effect sau khi animation kết thúc (0.5s)
        const timer = setTimeout(() => {
            onComplete();
        }, 500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="slash-effect-container">
            <style>{`
                .slash-effect-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(1.2);
                    z-index: 50;
                    pointer-events: none;
                    width: 618px;
                    height: 606px;
                    overflow: hidden;
                    /* Hiệu ứng di chuyển từ trái sang phải như yêu cầu */
                    animation: slash-move 0.5s ease-out forwards;
                }

                .slash-sprite {
                    width: 3708px; /* 618 * 6 khung */
                    height: 3636px; /* 606 * 6 khung */
                    background-image: url('${spriteUrl}');
                    background-size: 3708px 3636px;
                    image-rendering: pixelated;
                    /* Chạy sprite sheet 6x6 */
                    animation: 
                        slash-x 0.5s steps(6) infinite,
                        slash-y 0.5s steps(6) infinite;
                }

                @keyframes slash-x {
                    from { background-position-x: 0; }
                    to { background-position-x: -3708px; }
                }

                @keyframes slash-y {
                    from { background-position-y: 0; }
                    to { background-position-y: -3636px; }
                }

                @keyframes slash-move {
                    0% { 
                        transform: translate(-150%, -50%) scale(0.8); 
                        opacity: 0; 
                    }
                    20% { 
                        opacity: 1; 
                    }
                    100% { 
                        transform: translate(50%, -50%) scale(1.5); 
                        opacity: 0; 
                    }
                }

                @media (max-width: 768px) {
                    .slash-effect-container {
                        width: 309px; /* Scale 0.5 cho mobile */
                        height: 303px;
                    }
                    .slash-sprite {
                        width: 1854px;
                        height: 1818px;
                        background-size: 1854px 1818px;
                    }
                    @keyframes slash-x {
                        from { background-position-x: 0; }
                        to { background-position-x: -1854px; }
                    }
                    @keyframes slash-y {
                        from { background-position-y: 0; }
                        to { background-position-y: -1818px; }
                    }
                }
            `}</style>
            <div className="slash-sprite" />
        </div>
    );
});

export default SlashingEffect;
