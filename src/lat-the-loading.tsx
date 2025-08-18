// --- START OF FILE lat-the-loading.tsx (NEW) ---

import React from 'react';

const VocabularyChestLoadingSkeleton: React.FC = () => (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, backgroundColor: '#0a0a14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <style>{`
            @keyframes skeleton-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            .skeleton-pulse { animation: skeleton-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .skeleton-bg { background-color: rgba(255, 255, 255, 0.1); }
            .skeleton-card-bg { background-color: rgba(255, 255, 255, 0.05); }
        `}</style>
        {/* Skeleton Header */}
        <header style={{ position: 'sticky', top: 0, left: 0, width: '100%', padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(16, 22, 46, 0.7)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', zIndex: 10, boxSizing: 'border-box', flexShrink: 0 }}>
            <div className="skeleton-bg skeleton-pulse" style={{ height: '32px', width: '110px', borderRadius: '8px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="skeleton-bg skeleton-pulse" style={{ height: '32px', width: '90px', borderRadius: '16px' }}></div>
                <div className="skeleton-bg skeleton-pulse" style={{ height: '32px', width: '80px', borderRadius: '16px' }}></div>
                <div className="skeleton-bg skeleton-pulse" style={{ height: '32px', width: '100px', borderRadius: '16px' }}></div>
            </div>
        </header>
        {/* Skeleton Gallery */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '30px', width: '100%', maxWidth: '1300px', padding: '20px 20px 100px', boxSizing: 'border-box', flexGrow: 1, overflowY: 'auto' }}>
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton-card-bg skeleton-pulse" style={{ width: '100%', maxWidth: '380px', minWidth: '300px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ padding: '12px 20px', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <div className="skeleton-bg" style={{ height: '16px', width: '60%', margin: '0 auto', borderRadius: '4px' }}></div>
                    </div>
                    <div style={{ padding: '20px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="skeleton-bg" style={{ height: '24px', width: '30%', borderRadius: '12px' }}></div>
                            <div className="skeleton-bg" style={{ height: '14px', width: '40%', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div className="skeleton-bg" style={{ flex: 1, aspectRatio: '1 / 1', borderRadius: '8px' }}></div>
                            <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div className="skeleton-bg" style={{ height: '12px', width: '90%', borderRadius: '4px' }}></div>
                                <div className="skeleton-bg" style={{ height: '12px', width: '100%', borderRadius: '4px' }}></div>
                                <div className="skeleton-bg" style={{ height: '12px', width: '70%', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '15px' }}>
                            <div className="skeleton-bg" style={{ flex: 1, height: '48px', borderRadius: '10px' }}></div>
                            <div className="skeleton-bg" style={{ flex: 1, height: '48px', borderRadius: '10px' }}></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default VocabularyChestLoadingSkeleton;
