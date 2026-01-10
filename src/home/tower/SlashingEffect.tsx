import React, { memo, useEffect } from 'react';

interface SlashingEffectProps {
    onComplete: () => void;
}

const SlashingEffect = memo(({ onComplete }: SlashingEffectProps) => {
    const spriteUrl = "https://raw.githubusercontent.com/huyhoang247/englishleveling3/refs/heads/main/src/assets/effect/slashing-effect.webp";
    
    useEffect(() => {
        // Hiệu ứng kéo dài 600ms (0.6s) khớp với CSS animation
        const timer = setTimeout(() => {
            onComplete();
        }, 600);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="slash-animation-wrapper">
            <style>{`
                .slash-animation-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 618px; 
                    height: 606px;
                    z-index: 100;
                    pointer-events: none;
                    overflow: hidden;
                    transform: translate(-50%, -50%);
                    /* Animation di chuyển từ trái sang phải qua tâm boss */
                    animation: slash-move-horizontal 0.6s ease-out forwards;
                }

                .slash-sprite-sheet {
                    width: 3708px; /* 618px * 6 frames */
                    height: 3636px; /* 606px * 6 frames */
                    background-image: url('${spriteUrl}');
                    background-size: 3708px 3636px;
                    background-repeat: no-repeat;
                    image-rendering: pixelated;
                    /* Chạy sprite sheet 6x6 */
                    animation: 
                        slash-x-steps 0.6s steps(6) infinite,
                        slash-y-steps 0.6s steps(6) infinite;
                }

                @keyframes slash-x-steps {
                    from { background-position-x: 0; }
                    to { background-position-x: -3708px; }
                }

                @keyframes slash-y-steps {
                    from { background-position-y: 0; }
                    to { background-position-y: -3636px; }
                }

                @keyframes slash-move-horizontal {
                    0% { 
                        transform: translate(-140%, -50%) scale(0.8); 
                        opacity: 0; 
                    }
                    30% { 
                        opacity: 1; 
                    }
                    70% {
                        opacity: 1;
                    }
                    100% { 
                        transform: translate(40%, -50%) scale(1.4); 
                        opacity: 0; 
                    }
                }

                /* Mobile: Thu nhỏ scale lại để không tràn màn hình */
                @media (max-width: 768px) {
                    .slash-animation-wrapper {
                        width: 309px;
                        height: 303px;
                    }
                    .slash-sprite-sheet {
                        width: 1854px;
                        height: 1818px;
                        background-size: 1854px 1818px;
                    }
                    @keyframes slash-x-steps {
                        from { background-position-x: 0; }
                        to { background-position-x: -1854px; }
                    }
                    @keyframes slash-y-steps {
                        from { background-position-y: 0; }
                        to { background-position-y: -1818px; }
                    }
                }
            `}</style>
            <div className="slash-sprite-sheet" />
        </div>
    );
});

export default SlashingEffect;
