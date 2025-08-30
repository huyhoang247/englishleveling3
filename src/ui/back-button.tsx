// src/ui/components/back-button.tsx

import React from 'react';

// --- STYLES (Self-contained) ---
const ScopedStyles = () => (
    <style>{`
        .screen-back-btn {
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
        .screen-back-btn:hover {
            background-color: rgb(51, 65, 85);
        }
        .screen-back-btn.is-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }
        .screen-back-btn svg {
            width: 20px;
            height: 20px;
        }
        .screen-back-btn span {
            font-size: 0.875rem;
            font-weight: 600;
        }
        /* Responsive: Hide text on small screens */
        @media (max-width: 640px) {
            .screen-back-btn span {
                display: none;
            }
        }
    `}</style>
);

// --- SVG ICON (Updated to a Bolder Outline Back Arrow) ---
const BackIcon = ({ className = '' }: { className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2.5} // Tăng độ đậm của icon tại đây. Bạn có thể chỉnh thành 2 hoặc 3 nếu muốn.
        stroke="currentColor" 
        className={className}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);


// --- COMPONENT PROPS ---
interface BackButtonProps {
    onClick: () => void;
    isHidden?: boolean;
    label?: string;
    title?: string;
}

// --- REUSABLE COMPONENT ---
const BackButton: React.FC<BackButtonProps> = ({
    onClick,
    isHidden = false,
    label = "Quay Lại",
    title = "Quay lại trang trước"
}) => {
    return (
        <>
            <ScopedStyles />
            <button
                onClick={onClick}
                className={`screen-back-btn ${isHidden ? 'is-hidden' : ''}`}
                title={title}
            >
                <BackIcon />
                {label && <span>{label}</span>}
            </button>
        </>
    );
};

export default BackButton;
