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
    claimVocabMilestoneReward
} from './analysis-service.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';

// [MỚI] Hàm trợ giúp để định dạng ngày theo giờ địa phương, đảm bảo tính nhất quán.
const formatDateToLocalYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// --- TYPE DEFINITIONS (Should be in a shared types file, but kept here for context) ---
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
    claimedDailyGoals: number[];
    claimedVocabMilestones: number[];
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
    const { user, userCoins, masteryCount, claimedDailyGoals, claimedVocabMilestones } = useQuizApp();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});
    
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
                const dataPayload = await fetchAnalysisDashboardData(user.uid, defaultVocabulary.length);
                setAnalysisData(dataPayload.analysisData);
                setDailyActivityData(dataPayload.dailyActivityMap);
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
        // [SỬA] Sử dụng hàm định dạng ngày nhất quán
        const todayString = formatDateToLocalYYYYMMDD(new Date());
        return dailyActivityData[todayString]?.new + dailyActivityData[todayString]?.review || 0;
    }, [dailyActivityData]);

    const claimDailyReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        await claimDailyMilestoneReward(user.uid, milestone, rewardAmount);
    }, [user]);

    const claimVocabReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        await claimVocabMilestoneReward(user.uid, milestone, rewardAmount);
    }, [user]);
    
    const userProgress = useMemo<UserProgress>(() => {
        // [SỬA] Sử dụng hàm định dạng ngày nhất quán để lấy đúng key
        const todayString = formatDateToLocalYYYYMMDD(new Date());
        return {
            coins: userCoins,
            masteryCount: masteryCount,
            claimedDailyGoals: claimedDailyGoals?.[todayString] || [],
            claimedVocabMilestones: claimedVocabMilestones,
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
