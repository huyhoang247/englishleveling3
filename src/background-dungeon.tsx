import React, { useState, useEffect, useMemo } from 'react';

/**
 * DungeonBackground component provides a dynamic and atmospheric dungeon-themed background.
 * It features animated particles, cracks, and flickering torch-like light effects
 * to create an immersive visual experience.
 */
const DungeonBackground = () => {
    // State to track time, used for smooth animation loops.
    const [time, setTime] = useState(0);

    // Effect to update the 'time' state at a fixed interval (approx. 60 FPS).
    // This drives the animations of particles, cracks, and light effects.
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prev => prev + 0.016); // Increment time by 0.016 seconds (1000ms / 60 frames = approx 16ms)
        }, 16); // Update every 16 milliseconds

        // Cleanup function to clear the interval when the component unmounts.
        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures this effect runs only once on mount.

    // Memoize the particles array to prevent unnecessary re-creation on re-renders.
    // This optimizes performance by keeping particle data stable.
    const particles = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            id: i, // Unique ID for React's key prop, crucial for list rendering performance
            x: Math.random() * 100, // Initial X position (percentage of container width)
            y: Math.random() * 100, // Initial Y position (percentage of container height)
            size: Math.random() * 3 + 1, // Size of the particle (1 to 4 pixels)
            speed: Math.random() * 0.5 + 0.2, // Speed for animation (0.2 to 0.7)
            opacity: Math.random() * 0.8 + 0.2 // Initial opacity (0.2 to 1.0)
        }));
    }, []); // Empty dependency array means this array is created only once.

    // Memoize the cracks array for wall textures, similar to particles.
    // This also optimizes performance by maintaining stable crack data.
    const cracks = useMemo(() => {
        return Array.from({ length: 8 }, (_, i) => ({
            id: i, // Unique ID for React's key prop
            x: Math.random() * 100, // Initial X position (percentage)
            y: Math.random() * 100, // Initial Y position (percentage)
            width: Math.random() * 30 + 10, // Width of the crack (10 to 40 pixels)
            height: Math.random() * 2 + 1, // Height of the crack (1 to 3 pixels)
            rotation: Math.random() * 45 // Initial rotation angle (0 to 45 degrees)
        }));
    }, []); // Empty dependency array means this array is created only once.

    return (
        // Main container for the dungeon background.
        // It's absolutely positioned to cover its parent, with overflow hidden.
        // Uses a dark gradient for the base dungeon color.
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-black">
            {/* Animated radial gradient overlay for a subtle light source effect.
                The center of the gradient subtly moves based on 'time' to create a dynamic light. */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(circle at ${50 + Math.sin(time * 0.5) * 20}% ${50 + Math.cos(time * 0.3) * 15}%,
                    rgba(139, 69, 19, 0.4) 0%, /* Dark orange/brown, more opaque */
                    rgba(101, 67, 33, 0.3) 30%, /* Lighter brown, less opaque */
                    rgba(62, 39, 35, 0.2) 60%, /* Even lighter brown, even less opaque */
                    transparent 100%)` // Fades to transparent
                }}
            />

            {/* Stone texture overlay using a subtle gradient and mix-blend-multiply for texture.
                This adds a rough, rocky feel to the background. */}
            <div className="absolute inset-0 opacity-20">
                <div className="w-full h-full bg-gradient-to-br from-transparent via-gray-700 to-transparent mix-blend-multiply" />
            </div>

            {/* Render animated cracks on the wall.
                Each crack has a slight rotation animation based on 'time'. */}
            {cracks.map(crack => (
                <div
                    key={crack.id} // Unique key for React list rendering
                    className="absolute bg-black opacity-40" // Dark, semi-transparent cracks
                    style={{
                        left: `${crack.x}%`,
                        top: `${crack.y}%`,
                        width: `${crack.width}px`,
                        height: `${crack.height}px`,
                        // Apply a slight rotation animation based on 'time'.
                        transform: `rotate(${crack.rotation + Math.sin(time * 0.1) * 2}deg)`,
                        borderRadius: '1px', // Slightly rounded edges for cracks
                        transition: 'transform 0.1s ease-out' // Smooth transition for rotation.
                    }}
                />
            ))}

            {/* Render floating dust particles.
                Particles move in sine/cosine waves and their opacity flickers. */}
            {particles.map(particle => (
                <div
                    key={particle.id} // Unique key for React list rendering
                    className="absolute rounded-full bg-yellow-200" // Yellowish color for dust
                    style={{
                        // Animate particle position using sine and cosine waves for a floating effect.
                        left: `${(particle.x + Math.sin(time * particle.speed + particle.id) * 10) % 100}%`,
                        top: `${(particle.y + Math.cos(time * particle.speed * 0.7 + particle.id) * 5) % 100}%`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        // Animate particle opacity for a flickering effect.
                        opacity: particle.opacity * (0.7 + Math.sin(time * 2 + particle.id) * 0.3),
                        boxShadow: '0 0 4px rgba(255, 255, 0, 0.3)', // Subtle glow effect.
                        transition: 'opacity 0.1s ease-out' // Smooth transition for opacity.
                    }}
                />
            ))}

            {/* Animated torch light effect (left side).
                Uses a radial gradient with flickering opacity and scale to simulate fire. */}
            <div className="absolute top-10 left-10">
                <div
                    className="w-32 h-32 rounded-full"
                    style={{
                        background: `radial-gradient(circle,
                        rgba(255, 140, 0, ${0.4 + Math.sin(time * 3) * 0.1}) 0%, /* Orange, flickering opacity */
                        rgba(255, 69, 0, ${0.3 + Math.sin(time * 2.5) * 0.08}) 30%, /* Red-orange, flickering opacity */
                        rgba(139, 69, 19, ${0.2 + Math.sin(time * 2) * 0.05}) 60%, /* Brown, flickering opacity */
                        transparent 100%)`, // Fades to transparent
                        filter: 'blur(2px)', // Blurs the light for a softer effect.
                        transform: `scale(${1 + Math.sin(time * 2.8) * 0.05})` // Pulsing scale effect.
                    }}
                />
            </div>

            {/* Another torch light effect (right side), similar to the left one but slightly different parameters. */}
            <div className="absolute top-16 right-12">
                <div
                    className="w-28 h-28 rounded-full"
                    style={{
                        background: `radial-gradient(circle,
                        rgba(255, 140, 0, ${0.35 + Math.sin(time * 2.3 + 1) * 0.08}) 0%,\n
                        rgba(255, 69, 0, ${0.25 + Math.sin(time * 2.8 + 1) * 0.06}) 30%,\n
                        rgba(139, 69, 19, ${0.15 + Math.sin(time * 2.2 + 1) * 0.04}) 60%,\n
                        transparent 100%)`,
                        filter: 'blur(2px)',
                        transform: `scale(${1 + Math.sin(time * 2.5 + 1) * 0.04})`
                    }}
                />
            </div>

            {/* Ambient pulsing glow effect that blends with the background. */}
            <div
                className="absolute inset-0 pointer-events-none" // Ignores mouse events
                style={{
                    background: `radial-gradient(ellipse at center,
                    rgba(101, 67, 33, ${0.1 + Math.sin(time * 0.5) * 0.05}) 0%, /* Soft brown, pulsing opacity */
                    transparent 70%)`, // Fades to transparent
                    mixBlendMode: 'overlay' // Blends with the background for a subtle effect.
                }}
            />
        </div>
    );
};

export default DungeonBackground;
