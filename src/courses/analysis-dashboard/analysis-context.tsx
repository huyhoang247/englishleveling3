// --- START OF FILE: analysis-context.tsx ---

import React, { 
    createContext, 
    useState, 
    useEffect, 
    useMemo, 
    useCallback, 
    useContext,
    FC,
    ReactNode
} from 'react';
import { User } from 'firebase/auth';
import { useQuizApp } from '../course-context.tsx'; 
import { 
    fetchAnalysisDashboardData, 
    claimDailyMilestoneReward,
    claimVocabMilestoneReward,
    fetchUserMilestoneData // [MỚI] Import hàm fetch mới
} from './analysis-service.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';

const formatDateToLocalYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- TYPE DEFINITIONS ---
interface LearningActivity { date: string; new: number; review: number; }
interface MasteryByGame { game: string; completed: number; }
interface VocabularyGrowth { date: string; cumulative: number; }
interface WordMastery { word: string; mastery: number; lastPracticed: Date; }
interface AnalysisData {
  totalWordsLearned: number;
  totalWordsAvailable: number;
  learningActivity: LearningActivity[];
  masteryByGame: MasteryByGame[];
  vocabularyGrowth: VocabularyGrowth[];
  recentCompletions: { word: string; date: string }[];
  wordMastery: WordMastery[];
}
type DailyActivityMap = { [date: string]: { new: number; review: number } };
interface UserProgress {
    coins: number;
    masteryCount: number;
    // [SỬA] Đổi tên để rõ ràng hơn, đây là state cục bộ
    localClaimedDailyGoals: number[];
    localClaimedVocabMilestones: number[];
}

// --- CONTEXT TYPE DEFINITION ---
interface AnalysisDashboardContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    analysisData: AnalysisData | null;
    dailyActivityData: DailyActivityMap;
    userProgress: UserProgress;
    wordsLearnedToday: number;
    claimDailyReward: (milestone: number, rewardAmount: number) => Promise<void>;
    claimVocabReward: (milestone: number, rewardAmount: number) => Promise<void>;
}

// --- CREATE CONTEXT ---
const AnalysisDashboardContext = createContext<AnalysisDashboardContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AnalysisDashboardProvider: FC<{children: ReactNode}> = ({ children }) => {
    // [SỬA] Chỉ lấy state chung từ context toàn cục
    const { user, userCoins, masteryCount } = useQuizApp();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});
    
    // [MỚI] State cục bộ để quản lý các cột mốc đã nhận
    const [claimedDailyGoals, setClaimedDailyGoals] = useState<{[date: string]: number[]}>({});
    const [claimedVocabMilestones, setClaimedVocabMilestones] = useState<number[]>([]);

    // [SỬA] useEffect để fetch cả dữ liệu analysis và milestone
    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem phân tích.");
            setAnalysisData(null);
            setDailyActivityData({});
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch đồng thời cả dữ liệu analysis và dữ liệu milestone của user
                const [dataPayload, milestoneData] = await Promise.all([
                    fetchAnalysisDashboardData(user.uid, defaultVocabulary.length),
                    fetchUserMilestoneData(user.uid)
                ]);

                setAnalysisData(dataPayload.analysisData);
                setDailyActivityData(dataPayload.dailyActivityMap);
                setClaimedDailyGoals(milestoneData.claimedDailyGoals);
                setClaimedVocabMilestones(milestoneData.claimedVocabMilestones);

            } catch (err: any) {
                console.error("Lỗi tải dữ liệu phân tích:", err);
                setError("Không thể tải dữ liệu phân tích.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const wordsLearnedToday = useMemo(() => {
        const todayString = formatDateToLocalYYYYMMDD(new Date());
        return dailyActivityData[todayString]?.new + dailyActivityData[todayString]?.review || 0;
    }, [dailyActivityData]);

    // [SỬA] Hàm claim giờ đây sẽ cập nhật state cục bộ ngay lập tức
    const claimDailyReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        await claimDailyMilestoneReward(user.uid, milestone, rewardAmount);

        // [MỚI] CẬP NHẬT STATE CỤC BỘ NGAY LẬP TỨC
        const todayString = formatDateToLocalYYYYMMDD(new Date());
        setClaimedDailyGoals(prevGoals => ({
            ...prevGoals,
            [todayString]: [...(prevGoals[todayString] || []), milestone]
        }));
    }, [user]);

    const claimVocabReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        await claimVocabMilestoneReward(user.uid, milestone, rewardAmount);

        // [MỚI] CẬP NHẬT STATE CỤC BỘ NGAY LẬP TỨC
        setClaimedVocabMilestones(prevMilestones => [...prevMilestones, milestone]);
    }, [user]);
    
    const userProgress = useMemo<UserProgress>(() => {
        const todayString = formatDateToLocalYYYYMMDD(new Date());
        return {
            coins: userCoins,
            masteryCount: masteryCount,
            // [SỬA] Dùng state cục bộ và tên mới
            localClaimedDailyGoals: claimedDailyGoals?.[todayString] || [],
            localClaimedVocabMilestones: claimedVocabMilestones,
        };
    }, [userCoins, masteryCount, claimedDailyGoals, claimedVocabMilestones]);


    const value = useMemo(() => ({
        user,
        loading,
        error,
        analysisData,
        dailyActivityData,
        userProgress,
        wordsLearnedToday,
        claimDailyReward,
        claimVocabReward,
    }), [
        user, 
        loading, 
        error, 
        analysisData, 
        dailyActivityData, 
        userProgress, 
        wordsLearnedToday, 
        claimDailyReward, 
        claimVocabReward
    ]);

    return (
        <AnalysisDashboardContext.Provider value={value}>
            {children}
        </AnalysisDashboardContext.Provider>
    );
};

// --- CUSTOM HOOK TO USE THE CONTEXT ---
export const useAnalysisDashboard = (): AnalysisDashboardContextType => {
    const context = useContext(AnalysisDashboardContext);
    if (context === undefined) {
        throw new Error('useAnalysisDashboard must be used within a AnalysisDashboardProvider');
    }
    return context;
};

// --- TYPE EXPORTS (for use in the main component) ---
export type { AnalysisData, DailyActivityMap, UserProgress, WordMastery };
