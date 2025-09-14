// --- START OF FILE src/home/skill-game/skill-context.tsx ---

import React, { createContext, useState, useMemo, useCallback, useEffect, useContext, ReactNode } from 'react';
import {
    ALL_SKILLS,
    getUpgradeCost,
    getTotalUpgradeCost,
    type OwnedSkill,
    type Rarity,
    type SkillBlueprint,
    getNextRarity,
} from './skill-data.tsx';
import { useGame } from '../../GameContext.tsx';

// --- INTERFACES & TYPES ---
interface MergeResult { level: number; refundGold: number; }
export interface MergeGroup { skillId: string; rarity: Rarity; skills: OwnedSkill[]; blueprint: SkillBlueprint; nextRarity: Rarity | null; estimatedResult: MergeResult; }

interface SkillContextType {
    // State trực tiếp từ GameContext
    gold: number;
    ancientBooks: number;
    ownedSkills: OwnedSkill[];
    equippedSkillIds: (string | null)[];
    isLoading: boolean; // Trạng thái loading của màn hình
    isProcessing: boolean; // Trạng thái đang xử lý một hành động (gọi DB)

    // UI State cục bộ
    selectedSkill: OwnedSkill | null;
    newlyCraftedSkill: OwnedSkill | null;
    isMergeModalOpen: boolean;

    // Derived State
    equippedSkills: (OwnedSkill | null)[];
    unequippedSkillsSorted: OwnedSkill[];
    MAX_SKILLS_IN_STORAGE: number;
    mergeableGroups: MergeGroup[];

    // Toast Messages
    message: string;
    messageKey: number;

    // Functions
    handleEquipSkill: (skillToEquip: OwnedSkill) => void;
    handleUnequipSkill: (skillToUnequip: OwnedSkill) => void;
    handleCraftSkill: () => void;
    handleDisenchantSkill: (skillToDisenchant: OwnedSkill) => void;
    handleUpgradeSkill: (skillToUpgrade: OwnedSkill) => void;
    handleMergeSkills: (group: MergeGroup) => void;
    handleClose: () => void;
    handleSelectSkill: (skill: OwnedSkill) => void;
    handleCloseDetailModal: () => void;
    handleCloseCraftSuccessModal: () => void;
    handleOpenMergeModal: () => void;
    handleCloseMergeModal: () => void;
}

// --- CONTEXT CREATION ---
const SkillContext = createContext<SkillContextType | null>(null);

export const useSkillContext = () => {
    const context = useContext(SkillContext);
    if (!context) {
        throw new Error('useSkillContext must be used within a SkillProvider');
    }
    return context;
};

// --- HELPER FUNCTIONS ---
const calculateMergeResult = (skillsToMerge: OwnedSkill[], blueprint: SkillBlueprint): MergeResult => {
    if (skillsToMerge.length < 3 || !blueprint.upgradeCost) return { level: 1, refundGold: 0 };
    const totalInvestedGold = skillsToMerge.reduce((total, skill) => total + getTotalUpgradeCost(blueprint, skill.level), 0);
    let finalLevel = 1, remainingGold = totalInvestedGold;
    while (true) {
        const costForNextLevel = getUpgradeCost(blueprint.upgradeCost, finalLevel);
        if (remainingGold >= costForNextLevel) { remainingGold -= costForNextLevel; finalLevel++; } else { break; }
    }
    return { level: finalLevel, refundGold: remainingGold };
};

// --- PROVIDER COMPONENT ---
interface SkillProviderProps {
    children: ReactNode;
    onClose: () => void;
}

export const SkillProvider = ({ children, onClose }: SkillProviderProps) => {
    // Lấy dữ liệu VÀ hàm xử lý trực tiếp từ GameContext
    const { 
        coins: gold,
        ancientBooks, 
        ownedSkills, 
        equippedSkillIds,
        isSyncingData, // Dùng isSyncingData làm isProcessing
        handleSkillCraft: handleCraftSkill_GC,
        handleSkillUpgrade: handleUpgradeSkill_GC,
        handleSkillDisenchant: handleDisenchantSkill_GC,
        handleSkillEquip: handleEquipSkill_GC,
        handleSkillUnequip: handleUnequipSkill_GC,
        handleSkillMerge: handleMergeSkills_GC,
    } = useGame();

    // --- STATE QUẢN LÝ GIAO DIỆN CỤC BỘ ---
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSkill, setSelectedSkill] = useState<OwnedSkill | null>(null);
    const [newlyCraftedSkill, setNewlyCraftedSkill] = useState<OwnedSkill | null>(null);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);
    
    const MAX_SKILLS_IN_STORAGE = 50;

    const showMessage = useCallback((text: string) => {
        setMessage(text);
        setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 300);
        return () => clearTimeout(timer);
    }, []);

    // --- DERIVED STATE ---
    const equippedSkills = useMemo(() => {
        return equippedSkillIds.map(id => ownedSkills.find(s => s.id === id) || null);
    }, [equippedSkillIds, ownedSkills]);

    const unequippedSkillsSorted = useMemo(() => {
        return ownedSkills
            .filter(ownedSkill => !equippedSkillIds.includes(ownedSkill.id))
            .sort((a, b) => {
                const rarityOrder = ['E', 'D', 'B', 'A', 'S', 'SR', 'SSR'];
                const rarityIndexA = rarityOrder.indexOf(a.rarity);
                const rarityIndexB = rarityOrder.indexOf(b.rarity);
                if (rarityIndexA !== rarityIndexB) return rarityIndexB - rarityIndexA;
                if (a.level !== b.level) return b.level - a.level;
                const skillA = ALL_SKILLS.find(s => s.id === a.skillId)!;
                const skillB = ALL_SKILLS.find(s => s.id === b.skillId)!;
                return skillA.name.localeCompare(skillB.name);
            });
    }, [ownedSkills, equippedSkillIds]);
    
    const mergeableGroups = useMemo<MergeGroup[]>(() => {
        const unequippedSkills = ownedSkills.filter(s => !equippedSkillIds.includes(s.id));
        const groups: Record<string, OwnedSkill[]> = {};
        for (const skill of unequippedSkills) {
            const key = `${skill.skillId}-${skill.rarity}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(skill);
        }
        return Object.values(groups)
            .filter(group => group.length >= 3)
            .map(group => {
                const firstSkill = group[0];
                const blueprint = ALL_SKILLS.find(s => s.id === firstSkill.skillId)!;
                const nextRarity = getNextRarity(firstSkill.rarity);
                const sortedSkills = [...group].sort((a, b) => b.level - a.level);
                const estimatedResult = calculateMergeResult(sortedSkills.slice(0, 3), blueprint);
                return { skillId: firstSkill.skillId, rarity: firstSkill.rarity, skills: sortedSkills, blueprint, nextRarity, estimatedResult };
            })
            .filter(group => group.nextRarity !== null)
            .sort((a, b) => a.blueprint.name.localeCompare(b.blueprint.name));
    }, [ownedSkills, equippedSkillIds]);

    // --- CORE LOGIC & UI HANDLERS ---
    const handleAction = useCallback(async (action: () => Promise<any>) => {
        if (isSyncingData) return;
        try {
            await action();
        } catch (error: any) {
            showMessage(error.message || 'Có lỗi xảy ra.');
            console.error(error);
        }
    }, [isSyncingData, showMessage]);

    const handleCraftSkill = useCallback(() => {
        handleAction(async () => {
            const newSkill = await handleCraftSkill_GC();
            if (newSkill) setNewlyCraftedSkill(newSkill);
        });
    }, [handleAction, handleCraftSkill_GC]);

    const handleUpgradeSkill = useCallback((skillToUpgrade: OwnedSkill) => {
        handleAction(async () => {
            const updatedSkill = await handleUpgradeSkill_GC(skillToUpgrade);
            if (updatedSkill) {
                setSelectedSkill(updatedSkill);
                showMessage('Nâng cấp thành công!');
            }
        });
    }, [handleAction, handleUpgradeSkill_GC, showMessage]);

    const handleDisenchantSkill = useCallback((skillToDisenchant: OwnedSkill) => {
        handleAction(async () => {
            const success = await handleDisenchantSkill_GC(skillToDisenchant);
            if (success) {
                setSelectedSkill(null);
                showMessage('Tái chế thành công.');
            }
        });
    }, [handleAction, handleDisenchantSkill_GC, showMessage]);

    const handleEquipSkill = useCallback((skillToEquip: OwnedSkill) => {
        handleAction(async () => {
            const success = await handleEquipSkill_GC(skillToEquip);
            if(success) setSelectedSkill(null);
        });
    }, [handleAction, handleEquipSkill_GC]);

    const handleUnequipSkill = useCallback((skillToUnequip: OwnedSkill) => {
        handleAction(async () => {
            const success = await handleUnequipSkill_GC(skillToUnequip);
            if(success) setSelectedSkill(null);
        });
    }, [handleAction, handleUnequipSkill_GC]);

    const handleMergeSkills = useCallback((group: MergeGroup) => {
        handleAction(async () => {
            if (group.skills.length < 3 || !group.nextRarity) return;
            const skillsToConsume = group.skills.slice(0, 3);
            const { level: finalLevel, refundGold } = calculateMergeResult(skillsToConsume, group.blueprint);
            const newSkillData = { skillId: group.skillId, rarity: group.nextRarity, level: finalLevel };

            const newSkill = await handleMergeSkills_GC(skillsToConsume, newSkillData, refundGold);
            if(newSkill) {
                setIsMergeModalOpen(false);
                showMessage('Hợp nhất thành công!');
            }
        });
    }, [handleAction, handleMergeSkills_GC, showMessage]);

    const handleClose = useCallback(() => onClose(), [onClose]);
    const handleSelectSkill = useCallback((skill: OwnedSkill) => setSelectedSkill(skill), []);
    const handleCloseDetailModal = useCallback(() => setSelectedSkill(null), []);
    const handleCloseCraftSuccessModal = useCallback(() => setNewlyCraftedSkill(null), []);
    const handleCloseMergeModal = useCallback(() => setIsMergeModalOpen(false), []);
    const handleOpenMergeModal = useCallback(() => setIsMergeModalOpen(true), []);

    const value = {
        gold, ancientBooks, ownedSkills, equippedSkillIds, isLoading, isProcessing: isSyncingData,
        selectedSkill, newlyCraftedSkill, isMergeModalOpen,
        equippedSkills, unequippedSkillsSorted, MAX_SKILLS_IN_STORAGE, mergeableGroups,
        message, messageKey,
        handleEquipSkill, handleUnequipSkill, handleCraftSkill, handleDisenchantSkill,
        handleUpgradeSkill, handleMergeSkills, handleClose, handleSelectSkill,
        handleCloseDetailModal, handleCloseCraftSuccessModal, handleOpenMergeModal, handleCloseMergeModal,
    };

    return (
        <SkillContext.Provider value={value}>
            {children}
        </SkillContext.Provider>
    );
};
// --- END OF FILE src/home/skill-game/skill-context.tsx ---
