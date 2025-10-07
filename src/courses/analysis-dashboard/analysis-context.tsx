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
// Lấy dữ liệu người dùng từ context cha
import { useQuizApp } from '../course-context.tsx'; 

import { 
    fetchAnalysisDashboardData, 
    claimDailyMilestoneReward,
    claimVocabMilestoneReward
} from './analysis-service.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';

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

// Kiểu dữ liệu này phải đồng bộ với course-context.tsx
interface UserProgress {
    coins: number;
    masteryCount: number;
    claimedDailyGoals: { [date: string]: number[] };
    claimedVocabMilestones: number[];
}

interface AnalysisDashboardContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    analysisData: AnalysisData | null;
    dailyActivityMap: DailyActivityMap;
    userProgress: UserProgress; // State cục bộ để cập nhật UI tức thì
    wordsLearnedToday: number;
    claimedDailyGoalsToday: number[]; // Thuộc tính tiện ích
    claimDailyReward: (milestone: number, rewardAmount: number) => Promise<void>;
    claimVocabReward: (milestone: number, rewardAmount: number) => Promise<void>;
}

const AnalysisDashboardContext = createContext<AnalysisDashboardContextType | undefined>(undefined);

export const AnalysisDashboardProvider: FC<{children: ReactNode}> = ({ children }) => {
    // Lấy dữ liệu người dùng từ context cha (QuizAppProvider)
    const { user, userProgress: userProgressFromCourse } = useQuizApp();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});
    
    // State này vẫn cần thiết để cập nhật UI ngay lập tức khi nhận thưởng (optimistic UI update)
    const [userProgress, setUserProgress] = useState<UserProgress>({
        coins: 0,
        masteryCount: 0,
        claimedDailyGoals: {},
        claimedVocabMilestones: [],
    });

    // Effect để đồng bộ userProgress từ context cha vào state cục bộ
    useEffect(() => {
        if (userProgressFromCourse) {
            setUserProgress(userProgressFromCourse);
        }
    }, [userProgressFromCourse]);

    // Effect fetch dữ liệu phân tích, phụ thuộc vào `user` từ useQuizApp
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
        const todayString = new Date().toISOString().slice(0, 10);
        const todayActivity = Object.entries(dailyActivityData).find(([date]) => date.startsWith(todayString));
        return todayActivity ? todayActivity[1].new + todayActivity[1].review : 0;
    }, [dailyActivityData]);

    const claimedDailyGoalsToday = useMemo(() => {
        const todayString = new Date().toISOString().slice(0, 10);
        return userProgress.claimedDailyGoals[todayString] || [];
    }, [userProgress.claimedDailyGoals]);

    const claimDailyReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        const todayString = new Date().toISOString().slice(0, 10);
        
        // Cập nhật UI tức thì (Optimistic Update)
        setUserProgress(prev => ({
            ...prev,
            coins: prev.coins + rewardAmount,
            claimedDailyGoals: {
                ...prev.claimedDailyGoals,
                [todayString]: [...(prev.claimedDailyGoals[todayString] || []), milestone]
            }
        }));
        
        // Gọi service để cập nhật lên DB
        await claimDailyMilestoneReward(user.uid, milestone, rewardAmount);
    }, [user]);

    const claimVocabReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        
        // Cập nhật UI tức thì (Optimistic Update)
        setUserProgress(prev => ({
            ...prev,
            coins: prev.coins + rewardAmount,
            claimedVocabMilestones: [...prev.claimedVocabMilestones, milestone],
        }));
        
        // Gọi service để cập nhật lên DB
        await claimVocabMilestoneReward(user.uid, milestone, rewardAmount);
    }, [user]);

    const value = useMemo(() => ({
        user,
        loading,
        error,
        analysisData,
        dailyActivityData,
        userProgress,
        wordsLearnedToday,
        claimedDailyGoalsToday,
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
        claimedDailyGoalsToday,
        claimDailyReward, 
        claimVocabReward
    ]);

    return (
        <AnalysisDashboardContext.Provider value={value}>
            {children}
        </AnalysisDashboardContext.Provider>
    );
};

export const useAnalysisDashboard = (): AnalysisDashboardContextType => {
    const context = useContext(AnalysisDashboardContext);
    if (context === undefined) {
        throw new Error('useAnalysisDashboard must be used within a AnalysisDashboardProvider');
    }
    return context;
};

export type { AnalysisData, DailyActivityMap, UserProgress, WordMastery };
