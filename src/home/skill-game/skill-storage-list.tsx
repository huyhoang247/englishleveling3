// --- START OF FILE skill-storage-list.tsx ---

import React, { memo, useCallback } from 'react';
import { useSkillContext } from './skill-context.tsx';
import { SkillCard } from './skill-ui.tsx'; 
import { type OwnedSkill } from './skill-data.tsx';

interface SkillStorageListProps {
    skills: OwnedSkill[];
}

const SkillStorageList = ({ skills }: SkillStorageListProps) => {
    const { handleSelectSkill } = useSkillContext();

    // Sử dụng useCallback để đảm bảo hàm onSelect không được tạo lại mỗi lần render,
    // giúp tối ưu cho SkillCard vì prop không thay đổi.
    const onSelect = useCallback((skill: OwnedSkill) => {
        handleSelectSkill(skill);
    }, [handleSelectSkill]);

    if (skills.length === 0) {
        return (
            <div className="col-span-full flex items-center justify-center h-full text-slate-500">
                <p>Kho chứa trống hoặc tất cả kỹ năng đã được trang bị.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto hide-scrollbar">
            {skills.map(ownedSkill => (
                <SkillCard
                    key={ownedSkill.id}
                    ownedSkill={ownedSkill}
                    isEquipped={false}
                    onSelect={onSelect} 
                />
            ))}
        </div>
    );
};

// React.memo sẽ ngăn component này render lại nếu prop `skills` không thay đổi.
// Vì `unequippedSkillsSorted` trong context đã được bọc trong useMemo,
// nên việc tối ưu này sẽ rất hiệu quả.
export default memo(SkillStorageList);

// --- END OF FILE skill-storage-list.tsx ---
