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
import { 
    fetchAnalysisDashboardData, 
    claimDailyMilestoneReward,
    claimVocabMilestoneReward
} from './analysis-service.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';
// <<< THÊM: Import hook từ course-context để lấy dữ liệu người dùng
import { useQuizApp, UserProgress } from '../course/course-context.tsx'; 

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

// --- CONTEXT TYPE DEFINITION ---
interface AnalysisDashboardContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    analysisData: AnalysisData | null;
    dailyActivityMap: DailyActivityMap;
    userProgress: UserProgress;
    wordsLearnedToday: number;
    claimDailyReward: (milestone: number, rewardAmount: number) => Promise<void>;
    claimVocabReward: (milestone: number, rewardAmount: number) => Promise<void>;
}

// --- CREATE CONTEXT ---
const AnalysisDashboardContext = createContext<AnalysisDashboardContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AnalysisDashboardProvider: FC<{children: ReactNode}> = ({ children }) => {
    // <<< THAY ĐỔI: Lấy user và userProgress trực tiếp từ course-context
    const { user, userProgress } = useQuizApp();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});

    useEffect(() => {
        // <<< THAY ĐỔI: Logic giờ phụ thuộc vào `user` từ `useQuizApp`
        if (!user) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem phân tích.");
            setAnalysisData(null); // Xóa dữ liệu cũ khi đăng xuất
            setDailyActivityData({});
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // <<< THAY ĐỔI: Service giờ chỉ trả về dữ liệu phân tích
                const dataPayload = await fetchAnalysisDashboardData(user.uid, defaultVocabulary.length);
                // Không cần setUserProgress nữa vì nó được quản lý bởi course-context
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

    const claimDailyReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        // <<< THAY ĐỔI: Chỉ cần gọi service. Listener trong course-context sẽ tự động cập nhật state.
        await claimDailyMilestoneReward(user.uid, milestone, rewardAmount);
        // Không cần cập nhật state local ở đây nữa.
    }, [user]);

    const claimVocabReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        // <<< THAY ĐỔI: Tương tự như trên, chỉ gọi service.
        await claimVocabMilestoneReward(user.uid, milestone, rewardAmount);
        // Không cần cập nhật state local ở đây nữa.
    }, [user]);

    const value = useMemo(() => ({
        user,
        loading,
        error,
        analysisData,
        dailyActivityData,
        userProgress, // userProgress giờ đến từ useQuizApp
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

// QUAN TRỌNG: Để context này hoạt động, <AnalysisDashboardProvider> phải được đặt bên trong <QuizAppProvider> trong cây component của bạn (ví dụ: trong App.tsx).

// --- CUSTOM HOOK TO USE THE CONTEXT ---
export const useAnalysisDashboard = (): AnalysisDashboardContextType => {
    const context = useContext(AnalysisDashboardContext);
    if (context === undefined) {
        throw new Error('useAnalysisDashboard must be used within a AnalysisDashboardProvider');
    }
    return context;
};

// --- TYPE EXPORTS (for use in the main component) ---
export type { AnalysisData, DailyActivityMap, WordMastery };
