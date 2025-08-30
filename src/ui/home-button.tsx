// src/ui/components/home-button.tsx

import React from 'react';

// --- STYLES (Self-contained) ---
const ScopedStyles = () => (
    <style>{`
        .vocab-screen-home-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 8px;
            background-color: rgba(30, 41, 59, 0.8);
            border: 1px solid rgb(51, 65, 85);
            transition: background-color 0.2s ease, opacity 0.3s ease, visibility 0.3s;
            cursor: pointer;
            color: #cbd5e1;
        }
        .vocab-screen-home-btn:hover {
            background-color: rgb(51, 65, 85);
        }
        .vocab-screen-home-btn.is-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }
        .vocab-screen-home-btn svg {
            width: 20px;
            height: 20px;
        }
        .vocab-screen-home-btn span {
            font-size: 0.875rem;
            font-weight: 600;
        }
        /* Responsive: Hide text on small screens */
        @media (max-width: 640px) {
            .vocab-screen-home-btn span {
                display: none;
            }
        }
    `}</style>
);

// --- SVG ICON (Internal to this component) ---
const HomeIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
);

// --- COMPONENT PROPS ---
interface HomeButtonProps {
    onClick: () => void;
    isHidden?: boolean;
    label?: string;
    title?: string;
}

// --- REUSABLE COMPONENT ---
const HomeButton: React.FC<HomeButtonProps> = ({
    onClick,
    isHidden = false,
    label = "Trang Chính",
    title = "Quay lại Trang Chính"
}) => {
    return (
        <>
            <ScopedStyles />
            <button
                onClick={onClick}
                className={`vocab-screen-home-btn ${isHidden ? 'is-hidden' : ''}`}
                title={title}
            >
                <HomeIcon />
                {label && <span>{label}</span>}
            </button>
        </>
    );
};

export default HomeButton;
