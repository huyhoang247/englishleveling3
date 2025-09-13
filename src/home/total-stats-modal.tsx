import React, { memo, useMemo } from 'react';
import { uiAssets } from '../game-assets.ts';

// --- Icons and Utility functions needed by the modal ---

const CloseIcon = ({ className = '' }: { className?: string }) => ( <img src={uiAssets.closeIcon} alt="Đóng" className={className} /> );
const StatsIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}> <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/> </svg>);
const HpIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statHpIcon} alt="HP Icon" {...props} />;
const AtkIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statAtkIcon} alt="ATK Icon" {...props} />;
const DefIcon = (props: React.ComponentProps<'img'>) => <img src={uiAssets.statDefIcon} alt="DEF Icon" {...props} />;

const STAT_CONFIG: { [key: string]: { name: string; Icon: (props: any) => JSX.Element; color: string; } } = {
    hp: { name: 'HP', Icon: HpIcon, color: 'text-red-400' },
    atk: { name: 'ATK', Icon: AtkIcon, color: 'text-orange-400' },
    def: { name: 'DEF', Icon: DefIcon, color: 'text-blue-400' },
};

const formatStatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1).replace('.0', '')}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1).replace('.0', '')}M`;
    return `${(num / 1000000000).toFixed(1).replace('.0', '')}B`;
};


// --- The Modal Component ---

const TotalStatsModal = memo(({ isOpen, onClose, equipmentStats, upgradeStats }: {
    isOpen: boolean;
    onClose: () => void;
    equipmentStats: { hp: number; atk: number; def: number; };
    upgradeStats: { hp: number; atk: number; def: number; };
}) => {
    if (!isOpen) return null;

    const totalStats = useMemo(() => ({
        hp: (upgradeStats.hp || 0) + (equipmentStats.hp || 0),
        atk: (upgradeStats.atk || 0) + (equipmentStats.atk || 0),
        def: (upgradeStats.def || 0) + (equipmentStats.def || 0),
    }), [upgradeStats, equipmentStats]);

    const StatDisplayBox = ({ title, stats, tagColor }: { title: string, stats: { hp: number; atk: number; def: number; }, tagColor: string }) => (
        <div>
            <span className={`inline-block px-3 py-1 mb-2 text-xs font-semibold uppercase tracking-wider ${tagColor} rounded-full`}>
                {title}
            </span>
            <div className="w-full bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-lg p-3 flex justify-around items-center">
                {[ { key: 'hp', value: stats.hp }, { key: 'atk', value: stats.atk }, { key: 'def', value: stats.def } ].map(({ key, value }) => {
                    const config = STAT_CONFIG[key as keyof typeof STAT_CONFIG];
                    return (
                        <div key={key} className="flex items-center gap-2">
                            <config.Icon className="w-7 h-7 object-contain" />
                            <span className="text-lg font-bold text-white">{formatStatNumber(value)}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-gradient-to-br from-gray-900 to-slate-900 p-5 rounded-xl border-2 border-slate-700 shadow-2xl w-full max-w-sm z-50 flex flex-col font-lilita">
                <div className="flex-shrink-0 border-b border-slate-700/50 pb-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <StatsIcon className="w-6 h-6 text-yellow-300" />
                            <h3 className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">Total Stats</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-500 hover:text-white hover:bg-gray-700/50 rounded-full w-8 h-8 flex items-center justify-center transition-colors -mt-1 -mr-1"><CloseIcon className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="space-y-4 mt-4">
                    <StatDisplayBox title="Upgrade Stats" stats={upgradeStats} tagColor="text-purple-300 bg-purple-900/50 border border-purple-700/80" />
                    <StatDisplayBox title="Equipment Stats" stats={equipmentStats} tagColor="text-cyan-300 bg-cyan-900/50 border border-cyan-700/80" />
                </div>

                <div className="my-4 border-t border-dashed border-slate-600 relative flex justify-center">
                    <div className="absolute -top-3.5 bg-slate-800 px-2 text-yellow-400 font-black text-xl">+</div>
                </div>

                <StatDisplayBox title="Total Stats" stats={totalStats} tagColor="text-yellow-300 bg-yellow-900/50 border border-yellow-700/80" />

                <p className="text-xs text-slate-500 text-center mt-5 pt-4 border-t border-slate-700/50 font-sans">
                    Your character's final combat stats.
                </p>
            </div>
        </div>
    );
});

export default TotalStatsModal;
