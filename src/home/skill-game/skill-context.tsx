// --- START OF FILE src/home/skill-game/skill-context.tsx (UPDATED) ---

import React, { createContext, useState, useMemo, useCallback, useEffect, useContext, ReactNode } from 'react';
import {
    ALL_SKILLS,
    CRAFTING_COST,
    getRandomRarity,
    getUpgradeCost,
    getTotalUpgradeCost,
    type OwnedSkill,
    type Rarity,
    type SkillBlueprint,
    getNextRarity,
} from './skill-data.tsx';
import { fetchSkillScreenData, updateUserSkills } from '../../skill-service.ts';

// --- INTERFACES & TYPES ---

export interface SkillScreenExitData {
    gold: number;
    ancientBooks: number;
    ownedSkills: OwnedSkill[];
    equippedSkillIds: (string | null)[];
}

interface MergeResult { level: number; refundGold: number; }
export interface MergeGroup { skillId: string; rarity: Rarity; skills: OwnedSkill[]; blueprint: SkillBlueprint; nextRarity: Rarity | null; estimatedResult: MergeResult; }

interface SkillContextType {
    // State
    gold: number;
    ancientBooks: number;
    ownedSkills: OwnedSkill[];
    equippedSkillIds: (string | null)[];
    isLoading: boolean;
    isProcessing: boolean;
    selectedSkill: OwnedSkill | null;
    newlyCraftedSkill: OwnedSkill | null;
    isMergeModalOpen: boolean;

    // Derived State
    equippedSkills: (OwnedSkill | null)[];
    unequippedSkillsSorted: OwnedSkill[];
    MAX_SKILLS_IN_STORAGE: number;
    mergeableGroups: MergeGroup[]; // THÊM DÒNG NÀY

    // Toast Messages
    message: string;
    messageKey: number;
    mergeToast: { show: boolean; message: string };
    craftErrorToast: { show: boolean; message: string };
    equipErrorToast: { show: boolean; message: string };
    disenchantSuccessToast: { show: boolean; message: string };

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
    userId: string;
    onClose: (dataUpdated: boolean, data?: SkillScreenExitData) => void;
}

export const SkillProvider = ({ children, userId, onClose }: SkillProviderProps) => {
    // --- STATE QUẢN LÝ DỮ LIỆU ---
    const [gold, setGold] = useState(0);
    const [ancientBooks, setAncientBooks] = useState(0);
    const [ownedSkills, setOwnedSkills] = useState<OwnedSkill[]>([]);
    const [equippedSkillIds, setEquippedSkillIds] = useState<(string | null)[]>([]);

    // --- STATE QUẢN LÝ GIAO DIỆN ---
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dataHasChanged, setDataHasChanged] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<OwnedSkill | null>(null);
    const [newlyCraftedSkill, setNewlyCraftedSkill] = useState<OwnedSkill | null>(null);
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messageKey, setMessageKey] = useState(0);

    // States cho các thông báo Toast
    const [mergeToast, setMergeToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const [craftErrorToast, setCraftErrorToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const [equipErrorToast, setEquipErrorToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    const [disenchantSuccessToast, setDisenchantSuccessToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });
    
    const MAX_SKILLS_IN_STORAGE = 50;

    const showMessage = useCallback((text: string) => {
        setMessage(text);
        setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);

    // --- FETCH DỮ LIỆU KHI MỞ COMPONENT ---
    useEffect(() => {
        const MIN_LOADING_TIME_MS = 500;
        const startTime = Date.now();

        const fetchData = async () => {
            if (!userId) return;
            try {
                const data = await fetchSkillScreenData(userId);
                setGold(data.coins);
                setAncientBooks(data.ancientBooks);
                setOwnedSkills(data.skills.owned);
                setEquippedSkillIds(data.skills.equipped);
            } catch (error) {
                console.error("Failed to fetch skill screen data:", error);
                showMessage("Lỗi: Không thể tải dữ liệu kỹ năng.");
            } finally {
                const elapsedTime = Date.now() - startTime;
                const remainingTime = MIN_LOADING_TIME_MS - elapsedTime;
                const delay = Math.max(0, remainingTime);
                
                setTimeout(() => {
                    setIsLoading(false);
                }, delay);
            }
        };
        fetchData();
    }, [userId, showMessage]);

    // --- DERIVED STATE ---
    const equippedSkills = useMemo(() => {
        return equippedSkillIds.map(id => ownedSkills.find(s => s.id === id) || null);
    }, [equippedSkillIds, ownedSkills]);

    const unequippedSkillsSorted = useMemo(() => {
        return ownedSkills
            .filter(ownedSkill => !equippedSkillIds.includes(ownedSkill.id))
            .sort((a, b) => {
                const rarityOrder = ['E', 'D', 'B', 'A', 'S', 'SR'];
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
                return {
                    skillId: firstSkill.skillId,
                    rarity: firstSkill.rarity,
                    skills: sortedSkills,
                    blueprint,
                    nextRarity,
                    estimatedResult
                };
            })
            .filter(group => group.nextRarity !== null)
            .sort((a, b) => a.blueprint.name.localeCompare(b.blueprint.name));
    }, [ownedSkills, equippedSkillIds]);

    // --- CORE LOGIC & UI HANDLERS ---
    const handleUpdateDatabase = useCallback(async (updates: { newOwned: OwnedSkill[]; newEquippedIds: (string | null)[]; goldChange: number; booksChange: number; }) => {
        if (!userId) return false;
        setIsProcessing(true);
        try {
            const { newCoins, newBooks } = await updateUserSkills(userId, updates);
            setGold(newCoins);
            setAncientBooks(newBooks);
            setOwnedSkills(updates.newOwned);
            setEquippedSkillIds(updates.newEquippedIds);
            setDataHasChanged(true);
            return true;
        } catch (error: any) {
            showMessage(`Lỗi: ${error.message || 'Cập nhật thất bại'}`);
            return false;
        } finally {
            setIsProcessing(false);
        }
    }, [userId, showMessage]);

    const handleEquipSkill = useCallback(async (skillToEquip: OwnedSkill) => {
        if (isProcessing) return;
        const firstEmptySlotIndex = equippedSkills.findIndex(slot => slot === null);
        if (firstEmptySlotIndex === -1) {
            setEquipErrorToast({ show: true, message: 'Các ô kỹ năng đã đầy.' });
            setTimeout(() => setEquipErrorToast(prev => ({ ...prev, show: false })), 4000);
            return;
        }
        const newEquippedIds = [...equippedSkillIds];
        newEquippedIds[firstEmptySlotIndex] = skillToEquip.id;
        const success = await handleUpdateDatabase({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0 });
        if (success) setSelectedSkill(null);
    }, [isProcessing, equippedSkills, equippedSkillIds, ownedSkills, handleUpdateDatabase]);

    const handleUnequipSkill = useCallback(async (skillToUnequip: OwnedSkill) => {
        if (isProcessing) return;
        const slotIndex = equippedSkillIds.findIndex(id => id === skillToUnequip.id);
        if (slotIndex === -1) return;
        const newEquippedIds = [...equippedSkillIds];
        newEquippedIds[slotIndex] = null;
        const success = await handleUpdateDatabase({ newOwned: ownedSkills, newEquippedIds: newEquippedIds, goldChange: 0, booksChange: 0 });
        if (success) setSelectedSkill(null);
    }, [isProcessing, equippedSkillIds, ownedSkills, handleUpdateDatabase]);

    const handleCraftSkill = useCallback(async () => {
        if (isProcessing) return;
        if (ancientBooks < CRAFTING_COST) { showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`); return; }
        if (ownedSkills.length >= MAX_SKILLS_IN_STORAGE) {
            setCraftErrorToast({ show: true, message: 'Kho kỹ năng đã đầy...' });
            setTimeout(() => setCraftErrorToast(prev => ({ ...prev, show: false })), 4000);
            return;
        }
        const newSkillBlueprint = ALL_SKILLS[Math.floor(Math.random() * ALL_SKILLS.length)];
        const newRarity = getRandomRarity();
        const newOwnedSkill: OwnedSkill = { id: `owned-${Date.now()}-${newSkillBlueprint.id}-${Math.random()}`, skillId: newSkillBlueprint.id, level: 1, rarity: newRarity };
        const newOwnedList = [...ownedSkills, newOwnedSkill];
        const success = await handleUpdateDatabase({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: 0, booksChange: -CRAFTING_COST });
        if (success) setNewlyCraftedSkill(newOwnedSkill);
    }, [isProcessing, ancientBooks, ownedSkills, equippedSkillIds, handleUpdateDatabase, showMessage, MAX_SKILLS_IN_STORAGE]);

    const handleDisenchantSkill = useCallback(async (skillToDisenchant: OwnedSkill) => {
        if (isProcessing || equippedSkills.some(s => s?.id === skillToDisenchant.id)) return;
        const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToDisenchant.skillId)!;
        const booksToReturn = Math.floor(CRAFTING_COST / 2);
        const goldToReturn = getTotalUpgradeCost(skillBlueprint, skillToDisenchant.level);
        const newOwnedList = ownedSkills.filter(s => s.id !== skillToDisenchant.id);
        const success = await handleUpdateDatabase({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: goldToReturn, booksChange: booksToReturn });
        if (success) {
            setSelectedSkill(null);
            setDisenchantSuccessToast({ show: true, message: 'Đã tái chế thành công.' });
            setTimeout(() => setDisenchantSuccessToast(prev => ({ ...prev, show: false })), 4000);
        }
    }, [isProcessing, equippedSkills, ownedSkills, equippedSkillIds, handleUpdateDatabase]);

    const handleUpgradeSkill = useCallback(async (skillToUpgrade: OwnedSkill) => {
        if (isProcessing) return;
        const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToUpgrade.skillId);
        if (!skillBlueprint || skillBlueprint.upgradeCost === undefined) { showMessage("Kỹ năng này không thể nâng cấp."); return; }
        const cost = getUpgradeCost(skillBlueprint.upgradeCost, skillToUpgrade.level);
        if (gold < cost) { showMessage(`Không đủ vàng. Cần ${cost.toLocaleString()}.`); return; }
        const updatedSkill = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };
        const newOwnedList = ownedSkills.map(s => s.id === skillToUpgrade.id ? updatedSkill : s);
        const success = await handleUpdateDatabase({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: -cost, booksChange: 0 });
        if (success) setSelectedSkill(updatedSkill);
    }, [isProcessing, gold, ownedSkills, equippedSkillIds, handleUpdateDatabase, showMessage]);

    const handleMergeSkills = useCallback(async (group: MergeGroup) => {
        if (isProcessing || group.skills.length < 3 || !group.nextRarity) return;
        const skillsToConsume = group.skills.slice(0, 3);
        const skillIdsToConsume = skillsToConsume.map(s => s.id);
        const { level: finalLevel, refundGold } = calculateMergeResult(skillsToConsume, group.blueprint);
        const newUpgradedSkill: OwnedSkill = { id: `owned-${Date.now()}-${group.skillId}-${Math.random()}`, skillId: group.skillId, level: finalLevel, rarity: group.nextRarity };
        const newOwnedList = ownedSkills.filter(s => !skillIdsToConsume.includes(s.id)).concat(newUpgradedSkill);
        const success = await handleUpdateDatabase({ newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: refundGold, booksChange: 0 });
        if (success) {
            setMergeToast({ show: true, message: 'Hợp nhất thành công!' });
            setTimeout(() => setMergeToast(prev => ({...prev, show: false})), 4000);
            setIsMergeModalOpen(false);
        }
    }, [isProcessing, ownedSkills, equippedSkillIds, handleUpdateDatabase]);

    const handleClose = useCallback(() => {
        if (dataHasChanged) {
            const exitData: SkillScreenExitData = {
                gold,
                ancientBooks,
                ownedSkills,
                equippedSkillIds,
            };
            onClose(true, exitData);
        } else {
            onClose(false);
        }
    }, [onClose, dataHasChanged, gold, ancientBooks, ownedSkills, equippedSkillIds]);

    const handleSelectSkill = useCallback((skill: OwnedSkill) => setSelectedSkill(skill), []);
    const handleCloseDetailModal = useCallback(() => setSelectedSkill(null), []);
    const handleCloseCraftSuccessModal = useCallback(() => setNewlyCraftedSkill(null), []);
    const handleCloseMergeModal = useCallback(() => setIsMergeModalOpen(false), []);
    const handleOpenMergeModal = useCallback(() => setIsMergeModalOpen(true), []);

    const value = {
        gold, ancientBooks, ownedSkills, equippedSkillIds, isLoading, isProcessing,
        selectedSkill, newlyCraftedSkill, isMergeModalOpen,
        equippedSkills, unequippedSkillsSorted, MAX_SKILLS_IN_STORAGE, mergeableGroups, // THÊM mergeableGroups VÀO ĐÂY
        message, messageKey, mergeToast, craftErrorToast, equipErrorToast, disenchantSuccessToast,
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
