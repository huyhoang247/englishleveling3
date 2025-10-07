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
// [MỚI] Import hook từ course-context để lấy dữ liệu người dùng
import { useQuizApp } from '../course/course-context.tsx'; 
import { 
    fetchAnalysisDashboardData, 
    claimDailyMilestoneReward,
    claimVocabMilestoneReward
} from './analysis-service.ts';
import { defaultVocabulary } from '../../voca-data/list-vocabulary.ts';

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
    // [SỬA] Đây là danh sách các mốc đã nhận trong ngày hôm nay
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
    userProgress: UserProgress; // Giữ nguyên type này để component con không bị ảnh hưởng
    wordsLearnedToday: number;
    claimDailyReward: (milestone: number, rewardAmount: number) => Promise<void>;
    claimVocabReward: (milestone: number, rewardAmount: number) => Promise<void>;
}

// --- CREATE CONTEXT ---
const AnalysisDashboardContext = createContext<AnalysisDashboardContextType | undefined>(undefined);

// --- PROVIDER COMPONENT ---
export const AnalysisDashboardProvider: FC<{children: ReactNode}> = ({ children }) => {
    // [SỬA] Lấy dữ liệu người dùng trực tiếp từ useQuizApp hook
    const { user, userCoins, masteryCount, claimedDailyGoals, claimedVocabMilestones } = useQuizApp();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});
    
    // [XÓA] State cho user và userProgress bị loại bỏ vì đã có từ context cha
    // const [user, setUser] = useState<User | null>(auth.currentUser);
    // const [userProgress, setUserProgress] = useState<UserProgress>({...});
    // [XÓA] useEffect lắng nghe auth state cũng bị loại bỏ

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem phân tích.");
            setAnalysisData(null); // Xóa dữ liệu cũ khi người dùng đăng xuất
            setDailyActivityData({});
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // [SỬA] fetchAnalysisDashboardData không còn trả về userData
                const dataPayload = await fetchAnalysisDashboardData(user.uid, defaultVocabulary.length);
                // [XÓA] Không còn setUserProgress ở đây. Dữ liệu này đến từ useQuizApp.
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
    }, [user]); // Phụ thuộc vào user từ context cha

    const wordsLearnedToday = useMemo(() => {
        const todayString = new Date().toISOString().slice(0, 10);
        const todayActivity = Object.entries(dailyActivityData).find(([date]) => date.startsWith(todayString));
        return todayActivity ? todayActivity[1].new + todayActivity[1].review : 0;
    }, [dailyActivityData]);

    const claimDailyReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        await claimDailyMilestoneReward(user.uid, milestone, rewardAmount);
        // [XÓA] Không cần cập nhật state cục bộ. 
        // `course-context` sẽ tự động nhận dữ liệu mới từ Firestore và re-render.
    }, [user]);

    const claimVocabReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        await claimVocabMilestoneReward(user.uid, milestone, rewardAmount);
        // [XÓA] Không cần cập nhật state cục bộ.
    }, [user]);
    
    // [MỚI] Tạo đối tượng userProgress một cách linh hoạt từ dữ liệu của context cha
    const userProgress = useMemo<UserProgress>(() => {
        const todayString = new Date().toISOString().slice(0, 10);
        return {
            coins: userCoins,
            masteryCount: masteryCount,
            claimedDailyGoals: claimedDailyGoals?.[todayString] || [], // Lấy mảng của ngày hôm nay
            claimedVocabMilestones: claimedVocabMilestones,
        };
    }, [userCoins, masteryCount, claimedDailyGoals, claimedVocabMilestones]);


    const value = useMemo(() => ({
        user,
        loading,
        error,
        analysisData,
        dailyActivityData,
        userProgress, // Cung cấp đối tượng đã được tạo
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
