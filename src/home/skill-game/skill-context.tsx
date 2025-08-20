// --- START OF FILE skill-context.tsx ---

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
} from './skill-data.tsx';
import { fetchSkillScreenData, updateUserSkills } from '../../gameDataService.ts';

// --- INTERFACES & TYPES ---
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
    onClose: (dataUpdated: boolean) => void;
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
    const MAX_SKILLS_IN_STORAGE = 20;

    const showMessage = useCallback((text: string) => {
        setMessage(text);
        setMessageKey(prev => prev + 1);
        const timer = setTimeout(() => setMessage(''), 4000);
        return () => clearTimeout(timer);
    }, []);

    // --- FETCH DỮ LIỆU KHI MỞ COMPONENT ---
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;
            try {
                setIsLoading(true);
                const data = await fetchSkillScreenData(userId);
                setGold(data.coins);
                setAncientBooks(data.ancientBooks);
                setOwnedSkills(data.skills.owned);
                setEquippedSkillIds(data.skills.equipped);
            } catch (error) {
                console.error("Failed to fetch skill screen data:", error);
                showMessage("Lỗi: Không thể tải dữ liệu kỹ năng.");
            } finally {
                setIsLoading(false);
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

    // --- CORE LOGIC FUNCTIONS (REFACTORED WITH OPTIMISTIC UPDATES) ---
    const handleEquipSkill = useCallback(async (skillToEquip: OwnedSkill) => {
        if (isProcessing) return;
        const firstEmptySlotIndex = equippedSkillIds.findIndex(slot => slot === null);
        if (firstEmptySlotIndex === -1) {
            setEquipErrorToast({ show: true, message: 'Các ô kỹ năng đã đầy.' });
            setTimeout(() => setEquipErrorToast(prev => ({ ...prev, show: false })), 4000);
            return;
        }

        const oldEquippedIds = [...equippedSkillIds];
        const newEquippedIds = [...equippedSkillIds];
        newEquippedIds[firstEmptySlotIndex] = skillToEquip.id;
        
        // Optimistic Update
        setEquippedSkillIds(newEquippedIds);
        setSelectedSkill(null);
        setIsProcessing(true);
        setDataHasChanged(true);

        try {
            await updateUserSkills(userId, { newOwned: ownedSkills, newEquippedIds, goldChange: 0, booksChange: 0 });
        } catch (error) {
            console.error("Equip skill failed, rolling back UI:", error);
            showMessage("Lỗi: Trang bị kỹ năng thất bại.");
            setEquippedSkillIds(oldEquippedIds); // Rollback
            setSelectedSkill(skillToEquip);      // Rollback
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, equippedSkillIds, ownedSkills, userId, showMessage]);

    const handleUnequipSkill = useCallback(async (skillToUnequip: OwnedSkill) => {
        if (isProcessing) return;
        const slotIndex = equippedSkillIds.findIndex(id => id === skillToUnequip.id);
        if (slotIndex === -1) return;

        const oldEquippedIds = [...equippedSkillIds];
        const newEquippedIds = [...equippedSkillIds];
        newEquippedIds[slotIndex] = null;
        
        // Optimistic Update
        setEquippedSkillIds(newEquippedIds);
        setSelectedSkill(null);
        setIsProcessing(true);
        setDataHasChanged(true);

        try {
            await updateUserSkills(userId, { newOwned: ownedSkills, newEquippedIds, goldChange: 0, booksChange: 0 });
        } catch (error) {
            console.error("Unequip skill failed, rolling back UI:", error);
            showMessage("Lỗi: Gỡ kỹ năng thất bại.");
            setEquippedSkillIds(oldEquippedIds); // Rollback
            setSelectedSkill(skillToUnequip);    // Rollback
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, equippedSkillIds, ownedSkills, userId, showMessage]);

    const handleCraftSkill = useCallback(async () => {
        if (isProcessing) return;
        if (ancientBooks < CRAFTING_COST) { showMessage(`Không đủ Sách Cổ. Cần ${CRAFTING_COST}.`); return; }
        if (ownedSkills.length >= MAX_SKILLS_IN_STORAGE) {
            setCraftErrorToast({ show: true, message: 'Kho kỹ năng đã đầy...' });
            setTimeout(() => setCraftErrorToast(prev => ({ ...prev, show: false })), 4000);
            return;
        }

        const oldBooks = ancientBooks;
        const oldOwnedSkills = ownedSkills;

        const newSkillBlueprint = ALL_SKILLS[Math.floor(Math.random() * ALL_SKILLS.length)];
        const newRarity = getRandomRarity();
        const newOwnedSkill: OwnedSkill = { id: `owned-${Date.now()}-${newSkillBlueprint.id}-${Math.random()}`, skillId: newSkillBlueprint.id, level: 1, rarity: newRarity };
        const newOwnedList = [...ownedSkills, newOwnedSkill];
        
        // Optimistic Update
        setAncientBooks(prev => prev - CRAFTING_COST);
        setOwnedSkills(newOwnedList);
        setIsProcessing(true);
        setDataHasChanged(true);
        
        try {
            const { newBooks } = await updateUserSkills(userId, { newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: 0, booksChange: -CRAFTING_COST });
            setAncientBooks(newBooks); // Sync with server
            setNewlyCraftedSkill(newOwnedSkill);
        } catch (error) {
            console.error("Craft skill failed, rolling back UI:", error);
            showMessage("Lỗi: Chế tạo kỹ năng thất bại.");
            setAncientBooks(oldBooks); // Rollback
            setOwnedSkills(oldOwnedSkills); // Rollback
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, ancientBooks, ownedSkills, equippedSkillIds, userId, showMessage]);

    const handleDisenchantSkill = useCallback(async (skillToDisenchant: OwnedSkill) => {
        if (isProcessing || equippedSkillIds.includes(skillToDisenchant.id)) return;

        const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToDisenchant.skillId)!;
        const booksToReturn = Math.floor(CRAFTING_COST / 2);
        const goldToReturn = getTotalUpgradeCost(skillBlueprint, skillToDisenchant.level);
        
        const oldGold = gold;
        const oldBooks = ancientBooks;
        const oldOwnedSkills = ownedSkills;
        const newOwnedList = ownedSkills.filter(s => s.id !== skillToDisenchant.id);

        // Optimistic Update
        setGold(prev => prev + goldToReturn);
        setAncientBooks(prev => prev + booksToReturn);
        setOwnedSkills(newOwnedList);
        setSelectedSkill(null);
        setIsProcessing(true);
        setDataHasChanged(true);

        try {
            const { newCoins, newBooks } = await updateUserSkills(userId, { newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: goldToReturn, booksChange: booksToReturn });
            setGold(newCoins); // Sync
            setAncientBooks(newBooks); // Sync
            setDisenchantSuccessToast({ show: true, message: 'Đã tái chế thành công.' });
            setTimeout(() => setDisenchantSuccessToast(prev => ({ ...prev, show: false })), 4000);
        } catch(error) {
            console.error("Disenchant skill failed, rolling back UI:", error);
            showMessage("Lỗi: Tái chế kỹ năng thất bại.");
            setGold(oldGold); // Rollback
            setAncientBooks(oldBooks); // Rollback
            setOwnedSkills(oldOwnedSkills); // Rollback
            setSelectedSkill(skillToDisenchant); // Rollback
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, equippedSkillIds, ownedSkills, gold, ancientBooks, userId, showMessage]);

    const handleUpgradeSkill = useCallback(async (skillToUpgrade: OwnedSkill) => {
        if (isProcessing) return;
        const skillBlueprint = ALL_SKILLS.find(s => s.id === skillToUpgrade.skillId);
        if (!skillBlueprint || skillBlueprint.upgradeCost === undefined) { showMessage("Kỹ năng này không thể nâng cấp."); return; }
        const cost = getUpgradeCost(skillBlueprint.upgradeCost, skillToUpgrade.level);
        if (gold < cost) { showMessage(`Không đủ vàng. Cần ${cost.toLocaleString()}.`); return; }

        const oldGold = gold;
        const oldOwnedSkills = [...ownedSkills];

        const updatedSkill = { ...skillToUpgrade, level: skillToUpgrade.level + 1 };
        const newOwnedList = ownedSkills.map(s => s.id === skillToUpgrade.id ? updatedSkill : s);

        // Optimistic Update
        setGold(prev => prev - cost);
        setOwnedSkills(newOwnedList);
        setSelectedSkill(updatedSkill);
        setIsProcessing(true);
        setDataHasChanged(true);

        try {
            const { newCoins } = await updateUserSkills(userId, { newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: -cost, booksChange: 0 });
            setGold(newCoins); // Sync with server state
        } catch (error) {
            console.error("Upgrade skill failed, rolling back UI:", error);
            showMessage("Lỗi: Nâng cấp thất bại.");
            setGold(oldGold); // Rollback
            setOwnedSkills(oldOwnedSkills); // Rollback
            setSelectedSkill(skillToUpgrade); // Rollback
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, gold, ownedSkills, equippedSkillIds, userId, showMessage]);
    
    const handleMergeSkills = useCallback(async (group: MergeGroup) => {
        if (isProcessing || group.skills.length < 3 || !group.nextRarity) return;
        
        const oldGold = gold;
        const oldOwnedSkills = ownedSkills;

        const skillsToConsume = group.skills.slice(0, 3);
        const skillIdsToConsume = skillsToConsume.map(s => s.id);
        const { level: finalLevel, refundGold } = calculateMergeResult(skillsToConsume, group.blueprint);
        const newUpgradedSkill: OwnedSkill = { id: `owned-${Date.now()}-${group.skillId}-${Math.random()}`, skillId: group.skillId, level: finalLevel, rarity: group.nextRarity };
        const newOwnedList = ownedSkills.filter(s => !skillIdsToConsume.includes(s.id)).concat(newUpgradedSkill);

        // Optimistic Update
        setGold(prev => prev + refundGold);
        setOwnedSkills(newOwnedList);
        setIsMergeModalOpen(false);
        setIsProcessing(true);
        setDataHasChanged(true);

        try {
            const { newCoins } = await updateUserSkills(userId, { newOwned: newOwnedList, newEquippedIds: equippedSkillIds, goldChange: refundGold, booksChange: 0 });
            setGold(newCoins); // Sync
            setMergeToast({ show: true, message: 'Hợp nhất thành công!' });
            setTimeout(() => setMergeToast(prev => ({...prev, show: false})), 4000);
        } catch (error) {
            console.error("Merge skills failed, rolling back UI:", error);
            showMessage("Lỗi: Hợp nhất thất bại.");
            setGold(oldGold); // Rollback
            setOwnedSkills(oldOwnedSkills); // Rollback
            setIsMergeModalOpen(true); // Re-open modal
        } finally {
            setIsProcessing(false);
        }
    }, [isProcessing, ownedSkills, equippedSkillIds, gold, userId, showMessage]);

    // --- UI HANDLERS ---
    const handleClose = useCallback(() => onClose(dataHasChanged), [onClose, dataHasChanged]);
    const handleSelectSkill = useCallback((skill: OwnedSkill) => setSelectedSkill(skill), []);
    const handleCloseDetailModal = useCallback(() => setSelectedSkill(null), []);
    const handleCloseCraftSuccessModal = useCallback(() => setNewlyCraftedSkill(null), []);
    const handleCloseMergeModal = useCallback(() => setIsMergeModalOpen(false), []);
    const handleOpenMergeModal = useCallback(() => setIsMergeModalOpen(true), []);

    const value = {
        gold, ancientBooks, ownedSkills, equippedSkillIds, isLoading, isProcessing,
        selectedSkill, newlyCraftedSkill, isMergeModalOpen,
        equippedSkills, unequippedSkillsSorted, MAX_SKILLS_IN_STORAGE,
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

// --- END OF FILE skill-context.tsx ---
