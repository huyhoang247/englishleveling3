import React, { memo, useEffect } from 'react';

const SLASH_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/slashing-effect.webp";

interface SlashingEffectProps {
    onComplete: () => void;
}

const SlashingEffect = memo(({ onComplete }: SlashingEffectProps) => {
    useEffect(() => {
        // Tổng thời gian hiệu ứng là 600ms
        const timer = setTimeout(onComplete, 600);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="absolute inset-0 flex items-center justify-center z-[60] pointer-events-none">
            <style>{`
                .slash-sprite-container {
                    width: 618px;
                    height: 606px;
                    overflow: hidden;
                    position: relative;
                    transform: scale(0.9);
                }
                .slash-sprite-sheet {
                    width: 3090px; /* 618 * 5 frames */
                    height: 3030px; /* 606 * 5 frames */
                    background-image: url('${SLASH_IMAGE}');
                    background-size: 3090px 3030px;
                    /* Chạy X 5 lần trong khi Y chạy 1 lần để quét hết lưới 5x5 */
                    animation: 
                        slash-x 0.12s steps(5) 5, 
                        slash-y 0.6s steps(5) forwards;
                }
                @keyframes slash-x {
                    from { background-position-x: 0; }
                    to { background-position-x: -3090px; }
                }
                @keyframes slash-y {
                    from { background-position-y: 0; }
                    to { background-position-y: -3030px; }
                }
                @media (max-width: 768px) {
                    .slash-sprite-container { transform: scale(0.5); }
                }
            `}</style>
            <div className="slash-sprite-container">
                <div className="slash-sprite-sheet" />
            </div>
        </div>
    );
});

export default SlashingEffect;
