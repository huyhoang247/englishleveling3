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

// --- SVG ICON (Updated to a Back Arrow) ---
const BackIcon = ({ className = '' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
    </svg>
);


// --- COMPONENT PROPS ---
interface BackButtonProps {
    onClick: () => void;
    isHidden?: boolean;
    label?: string;
    title?: string;
}

// --- REUSABLE COMPONENT (Renamed to BackButton) ---
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
