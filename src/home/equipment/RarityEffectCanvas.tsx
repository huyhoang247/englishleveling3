import React, { useRef, useEffect, memo } from 'react';
import type { ItemRank } from './item-database';

// Cấu hình hiệu ứng cho từng độ hiếm
const RARITY_EFFECT_CONFIG: { [key in ItemRank]?: { color: string; particleCount: number; speed: number; type: 'glow' | 'sparks' } } = {
    'A': { color: 'rgba(196, 138, 245, 0.6)', particleCount: 15, speed: 0.3, type: 'glow' }, // THÊM DÒNG NÀY
    'S': { color: 'rgba(255, 235, 59, 0.7)', particleCount: 20, speed: 0.5, type: 'glow' },
    'SR': { color: 'rgba(255, 152, 0, 0.8)', particleCount: 35, speed: 0.8, type: 'glow' },
    'SSR': { color: 'rgba(244, 67, 54, 0.9)', particleCount: 50, speed: 1.2, type: 'sparks' },
};

interface Particle {
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    life: number;
    maxLife: number;
}

interface RarityEffectCanvasProps {
    rarity: ItemRank;
    className?: string;
}

const RarityEffectCanvas: React.FC<RarityEffectCanvasProps> = ({ rarity, className }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameId = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        const config = RARITY_EFFECT_CONFIG[rarity];
        if (!canvas || !config) {
            const ctx = canvas?.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        const dpr = window.devicePixelRatio || 1;
        
        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            particles = []; 
            createParticles();
        };

        const createParticles = () => {
            const { width, height } = canvas.getBoundingClientRect();
            for (let i = 0; i < config.particleCount; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.min(width, height) / 2.2; 
                const x = width / 2 + radius * Math.cos(angle);
                const y = height / 2 + radius * Math.sin(angle);

                if (config.type === 'glow') {
                    particles.push({
                        x, y,
                        size: Math.random() * 2 + 1,
                        speedX: (Math.random() - 0.5) * config.speed,
                        speedY: (Math.random() - 0.5) * config.speed,
                        life: 0, maxLife: 0
                    });
                } else if (config.type === 'sparks') {
                    const maxLife = 50 + Math.random() * 50;
                    particles.push({
                         x, y,
                        size: Math.random() * 2.5 + 1,
                        speedX: (Math.random() - 0.5) * config.speed * 2,
                        speedY: (Math.random() - 0.5) * config.speed * 2,
                        life: maxLife,
                        maxLife: maxLife
                    });
                }
            }
        };

        const drawGlow = (particle: Particle, width: number, height: number) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > height) particle.speedY *= -1;

            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = config.color;
            ctx.shadowColor = config.color;
            ctx.shadowBlur = 10;
            ctx.fill();
        };

        const drawSparks = (particle: Particle) => {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= 1;
            
            if (particle.life <= 0) {
                const { width, height } = canvas.getBoundingClientRect();
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.min(width, height) / 2.2;
                particle.x = width / 2 + radius * Math.cos(angle);
                particle.y = height / 2 + radius * Math.sin(angle);
                particle.life = particle.maxLife;
                particle.speedX = (Math.random() - 0.5) * config.speed * 2;
                particle.speedY = (Math.random() - 0.5) * config.speed * 2;
            }

            const opacity = particle.life / particle.maxLife;
            const colorMatch = config.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (!colorMatch) return;
            const [_, r, g, b] = colorMatch;

            ctx.beginPath();
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            ctx.shadowColor = config.color;
            ctx.shadowBlur = 5;
        }

        const animate = () => {
            const { width, height } = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, width, height);
            ctx.shadowBlur = 0;

            particles.forEach(p => {
                if(config.type === 'glow') drawGlow(p, width, height);
                else if (config.type === 'sparks') drawSparks(p);
            });

            animationFrameId.current = requestAnimationFrame(animate);
        };

        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [rarity]);

    return <canvas ref={canvasRef} className={className} />;
};

export default memo(RarityEffectCanvas);
