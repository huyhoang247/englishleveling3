import React, { memo, useEffect } from 'react';

const SLASH_IMAGE = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/slashing-effect.webp";

interface SlashingEffectProps {
    onComplete: () => void;
}

const SlashingEffect = memo(({ onComplete }: SlashingEffectProps) => {
    useEffect(() => {
        // Animation chạy trong 600ms rồi biến mất
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
                    transform: scale(0.8);
                }
                .slash-sprite-sheet {
                    width: 3090px; /* 618 * 5 frames */
                    height: 3030px; /* 606 * 5 frames */
                    background-image: url('${SLASH_IMAGE}');
                    background-size: 3090px 3030px;
                    animation: 
                        slash-play-x 0.6s steps(5) infinite,
                        slash-play-y 0.6s steps(5) infinite;
                }
                @keyframes slash-play-x {
                    from { background-position-x: 0; }
                    to { background-position-x: -3090px; }
                }
                @keyframes slash-play-y {
                    from { background-position-y: 0; }
                    to { background-position-y: -3030px; }
                }
                @media (max-width: 768px) {
                    .slash-sprite-container { transform: scale(0.45); }
                }
            `}</style>
            <div className="slash-sprite-container">
                <div className="slash-sprite-sheet" />
            </div>
        </div>
    );
});

export default SlashingEffect;
