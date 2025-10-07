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
import { auth } from '../../firebase.js'; 
import { onAuthStateChanged, User } from 'firebase/auth';
// [SỬA] Thay đổi đường dẫn import để trỏ đến service mới
import { 
    fetchAnalysisDashboardData, 
    claimDailyMilestoneReward,
    claimVocabMilestoneReward
} from './analysis-service.ts'; // <--- ĐÃ THAY ĐỔI
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
    const [user, setUser] = useState<User | null>(auth.currentUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
    const [dailyActivityData, setDailyActivityData] = useState<DailyActivityMap>({});
    const [userProgress, setUserProgress] = useState<UserProgress>({
        coins: 0,
        masteryCount: 0,
        claimedDailyGoals: [],
        claimedVocabMilestones: [],
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem phân tích.");
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Không cần thay đổi gì ở đây vì tên hàm vẫn giữ nguyên
                const dataPayload = await fetchAnalysisDashboardData(user.uid, defaultVocabulary.length);
                setUserProgress({
                    coins: dataPayload.userData.coins,
                    masteryCount: dataPayload.userData.masteryCards,
                    claimedDailyGoals: dataPayload.userData.claimedDailyGoals,
                    claimedVocabMilestones: dataPayload.userData.claimedVocabMilestones,
                });
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
        await claimDailyMilestoneReward(user.uid, milestone, rewardAmount);
        setUserProgress(prev => ({
            ...prev,
            coins: prev.coins + rewardAmount,
            claimedDailyGoals: [...prev.claimedDailyGoals, milestone],
        }));
    }, [user]);

    const claimVocabReward = useCallback(async (milestone: number, rewardAmount: number) => {
        if (!user) throw new Error("User not logged in");
        await claimVocabMilestoneReward(user.uid, milestone, rewardAmount);
        setUserProgress(prev => ({
            ...prev,
            coins: prev.coins + rewardAmount,
            claimedVocabMilestones: [...prev.claimedVocabMilestones, milestone],
        }));
    }, [user]);

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
