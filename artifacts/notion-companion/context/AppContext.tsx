import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { cancelAlarm, scheduleTaskAlarm } from "@/utils/alarmService";

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  isCustom?: boolean;
};

export type Task = {
  id: string;
  title: string;
  categoryId: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  alarmTime?: string;
  alarmEnabled: boolean;
  notificationId?: string; // expo-notifications ID, used to cancel the alarm
  createdAt: string;
  completedAt?: string;
  notes?: string;
};

export type AlarmSound = "default" | "gentle" | "beep" | "bell";

export type ProfileSettings = {
  name: string;
  alarmSound: AlarmSound;
  notificationsEnabled: boolean;
};

export type ProgressPeriod = "weekly" | "monthly" | "yearly";

type AppContextType = {
  tasks: Task[];
  categories: Category[];
  profileSettings: ProfileSettings;
  joinedChallenges: Set<string>;
  toggleChallenge: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateProfileSettings: (updates: Partial<ProfileSettings>) => void;
  getTaskStats: (period: ProgressPeriod) => {
    total: number;
    completed: number;
    percentage: number;
    byCategory: Array<{
      categoryId: string;
      total: number;
      completed: number;
      percentage: number;
    }>;
  };
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "work", name: "Work", color: "#6366f1", icon: "briefcase" },
  { id: "health", name: "Health", color: "#22c55e", icon: "heart" },
  { id: "sport", name: "Sport", color: "#f59e0b", icon: "activity" },
  { id: "learning", name: "Learning", color: "#3b82f6", icon: "book" },
  { id: "personal", name: "Personal", color: "#ec4899", icon: "user" },
  { id: "finance", name: "Finance", color: "#10b981", icon: "dollar-sign" },
  { id: "social", name: "Social", color: "#8b5cf6", icon: "users" },
  { id: "creative", name: "Creative", color: "#f97316", icon: "pen-tool" },
  { id: "home", name: "Home", color: "#06b6d4", icon: "home" },
  { id: "other", name: "Other", color: "#94a3b8", icon: "more-horizontal" },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString();
}

const DEMO_TASKS: Task[] = [
  // TODAY
  { id: "d1", title: "Review Q2 project proposal", categoryId: "work", completed: true, priority: "high", alarmEnabled: true, alarmTime: new Date().toISOString(), createdAt: daysAgo(0), completedAt: daysAgo(0) },
  { id: "d2", title: "Morning run — 5km", categoryId: "sport", completed: true, priority: "medium", alarmEnabled: false, createdAt: daysAgo(0), completedAt: daysAgo(0) },
  { id: "d3", title: "Read 30 pages of book", categoryId: "learning", completed: false, priority: "medium", alarmEnabled: true, alarmTime: new Date().toISOString(), createdAt: daysAgo(0) },
  { id: "d4", title: "Reply to team emails", categoryId: "work", completed: false, priority: "high", alarmEnabled: false, createdAt: daysAgo(0) },
  { id: "d5", title: "Meditate for 10 minutes", categoryId: "health", completed: true, priority: "low", alarmEnabled: false, createdAt: daysAgo(0), completedAt: daysAgo(0) },
  // THIS WEEK
  { id: "w1", title: "Prepare weekly report slides", categoryId: "work", completed: true, priority: "high", alarmEnabled: false, createdAt: daysAgo(1), completedAt: daysAgo(1) },
  { id: "w2", title: "Gym session — upper body", categoryId: "sport", completed: true, priority: "medium", alarmEnabled: false, createdAt: daysAgo(1), completedAt: daysAgo(1) },
  { id: "w3", title: "Study English vocabulary — 20 words", categoryId: "learning", completed: false, priority: "low", alarmEnabled: false, createdAt: daysAgo(2) },
  { id: "w4", title: "Call mom and dad", categoryId: "personal", completed: true, priority: "high", alarmEnabled: true, alarmTime: daysAgo(2), createdAt: daysAgo(2), completedAt: daysAgo(2) },
  { id: "w5", title: "Grocery shopping", categoryId: "home", completed: true, priority: "medium", alarmEnabled: false, createdAt: daysAgo(2), completedAt: daysAgo(2) },
  { id: "w6", title: "Review monthly budget", categoryId: "finance", completed: false, priority: "high", alarmEnabled: false, createdAt: daysAgo(3) },
  { id: "w7", title: "Sketch new design concept", categoryId: "creative", completed: true, priority: "medium", alarmEnabled: false, createdAt: daysAgo(3), completedAt: daysAgo(3) },
  { id: "w8", title: "Coffee with Alex", categoryId: "social", completed: true, priority: "low", alarmEnabled: true, alarmTime: daysAgo(4), createdAt: daysAgo(4), completedAt: daysAgo(4) },
  { id: "w9", title: "Fix homepage bug", categoryId: "work", completed: true, priority: "high", alarmEnabled: false, createdAt: daysAgo(5), completedAt: daysAgo(5) },
  { id: "w10", title: "Yoga class", categoryId: "health", completed: false, priority: "medium", alarmEnabled: false, createdAt: daysAgo(6) },
  // THIS MONTH
  { id: "m1", title: "Quarterly financial review", categoryId: "finance", completed: true, priority: "high", alarmEnabled: false, createdAt: daysAgo(10), completedAt: daysAgo(10) },
  { id: "m2", title: "Write blog post draft", categoryId: "creative", completed: true, priority: "medium", alarmEnabled: false, createdAt: daysAgo(12), completedAt: daysAgo(12) },
  { id: "m3", title: "Online course — Module 3", categoryId: "learning", completed: false, priority: "medium", alarmEnabled: false, createdAt: daysAgo(14) },
  { id: "m4", title: "Deep clean apartment", categoryId: "home", completed: true, priority: "low", alarmEnabled: false, createdAt: daysAgo(15), completedAt: daysAgo(15) },
  { id: "m5", title: "Team building event planning", categoryId: "work", completed: true, priority: "high", alarmEnabled: false, createdAt: daysAgo(18), completedAt: daysAgo(18) },
  { id: "m6", title: "Half marathon training week 3", categoryId: "sport", completed: true, priority: "high", alarmEnabled: false, createdAt: daysAgo(20), completedAt: daysAgo(20) },
  { id: "m7", title: "Visit dentist", categoryId: "health", completed: false, priority: "medium", alarmEnabled: false, createdAt: daysAgo(22) },
  { id: "m8", title: "Friend's birthday dinner", categoryId: "social", completed: true, priority: "medium", alarmEnabled: true, alarmTime: daysAgo(25), createdAt: daysAgo(25), completedAt: daysAgo(25) },
  // THIS YEAR
  { id: "y1", title: "Complete online certification", categoryId: "learning", completed: true, priority: "high", alarmEnabled: false, createdAt: monthsAgo(2), completedAt: monthsAgo(2) },
  { id: "y2", title: "Set up emergency fund", categoryId: "finance", completed: true, priority: "high", alarmEnabled: false, createdAt: monthsAgo(3), completedAt: monthsAgo(3) },
  { id: "y3", title: "Run first 10K race", categoryId: "sport", completed: true, priority: "high", alarmEnabled: false, createdAt: monthsAgo(3), completedAt: monthsAgo(3) },
  { id: "y4", title: "Launch personal portfolio", categoryId: "creative", completed: false, priority: "medium", alarmEnabled: false, createdAt: monthsAgo(4) },
  { id: "y5", title: "Learn Spanish — A1 level", categoryId: "learning", completed: false, priority: "low", alarmEnabled: false, createdAt: monthsAgo(5) },
  { id: "y6", title: "Start meal prep routine", categoryId: "health", completed: true, priority: "medium", alarmEnabled: false, createdAt: monthsAgo(6), completedAt: monthsAgo(6) },
];

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(DEMO_TASKS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    name: "Alex",
    alarmSound: "default",
    notificationsEnabled: true,
  });
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());

  // Ref so alarm scheduling inside callbacks always sees the latest settings
  const profileRef = useRef(profileSettings);
  useEffect(() => { profileRef.current = profileSettings; }, [profileSettings]);

  const toggleChallenge = useCallback((id: string) => {
    setJoinedChallenges((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, categoriesData, profileData] = await Promise.all([
        AsyncStorage.getItem("tasks_v2"),
        AsyncStorage.getItem("categories_v2"),
        AsyncStorage.getItem("profile_v2"),
      ]);
      if (tasksData) setTasks(JSON.parse(tasksData));
      if (categoriesData) {
        const saved: Category[] = JSON.parse(categoriesData);
        const customCats = saved.filter((c) => c.isCustom);
        setCategories([...DEFAULT_CATEGORIES, ...customCats]);
      }
      if (profileData) setProfileSettings(JSON.parse(profileData));
    } catch {}
  };

  const saveTasks = useCallback(async (newTasks: Task[]) => {
    await AsyncStorage.setItem("tasks_v2", JSON.stringify(newTasks));
  }, []);

  const saveCategories = useCallback(async (newCats: Category[]) => {
    await AsyncStorage.setItem("categories_v2", JSON.stringify(newCats));
  }, []);

  const saveProfile = useCallback(async (profile: ProfileSettings) => {
    await AsyncStorage.setItem("profile_v2", JSON.stringify(profile));
  }, []);

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      const newTask: Task = {
        ...task,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => {
        const updated = [newTask, ...prev];
        saveTasks(updated);
        return updated;
      });

      // Schedule notification if alarm is enabled and notifications are on
      if (task.alarmEnabled && task.alarmTime && profileRef.current.notificationsEnabled) {
        scheduleTaskAlarm(
          newTask.id,
          newTask.title,
          task.alarmTime,
          profileRef.current.alarmSound
        ).then((notifId) => {
          if (!notifId) return;
          // Store the notification ID on the task so we can cancel it later
          setTasks((prev) => {
            const updated = prev.map((t) =>
              t.id === newTask.id ? { ...t, notificationId: notifId } : t
            );
            saveTasks(updated);
            return updated;
          });
        });
      }
    },
    [saveTasks]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Task>) => {
      setTasks((prev) => {
        const updated = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
        saveTasks(updated);
        return updated;
      });
    },
    [saveTasks]
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === id);
        if (task?.notificationId) cancelAlarm(task.notificationId);
        const updated = prev.filter((t) => t.id !== id);
        saveTasks(updated);
        return updated;
      });
    },
    [saveTasks]
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === id);
        // Cancel pending alarm when completing a task
        if (task && !task.completed && task.notificationId) {
          cancelAlarm(task.notificationId);
        }
        const updated = prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : undefined,
              }
            : t
        );
        saveTasks(updated);
        return updated;
      });
    },
    [saveTasks]
  );

  const addCategory = useCallback(
    (cat: Omit<Category, "id">) => {
      const newCat: Category = {
        ...cat,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        isCustom: true,
      };
      setCategories((prev) => {
        const updated = [...prev, newCat];
        saveCategories(updated);
        return updated;
      });
    },
    [saveCategories]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) => {
        const updated = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
        saveCategories(updated);
        return updated;
      });
    },
    [saveCategories]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveCategories(updated);
        return updated;
      });
    },
    [saveCategories]
  );

  const updateProfileSettings = useCallback(
    (updates: Partial<ProfileSettings>) => {
      setProfileSettings((prev) => {
        const updated = { ...prev, ...updates };
        saveProfile(updated);
        return updated;
      });
    },
    [saveProfile]
  );

  const getTaskStats = useCallback(
    (period: ProgressPeriod) => {
      const now = new Date();
      let startDate: Date;

      if (period === "weekly") {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
      } else if (period === "monthly") {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        startDate = new Date(now.getFullYear(), 0, 1);
      }

      const periodTasks = tasks.filter(
        (t) => new Date(t.createdAt) >= startDate
      );
      const total = periodTasks.length;
      const completed = periodTasks.filter((t) => t.completed).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

      const byCategory = categories.map((cat) => {
        const catTasks = periodTasks.filter((t) => t.categoryId === cat.id);
        const catTotal = catTasks.length;
        const catCompleted = catTasks.filter((t) => t.completed).length;
        return {
          categoryId: cat.id,
          total: catTotal,
          completed: catCompleted,
          percentage:
            catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0,
        };
      });

      return { total, completed, percentage, byCategory };
    },
    [tasks, categories]
  );

  return (
    <AppContext.Provider
      value={{
        tasks,
        categories,
        profileSettings,
        joinedChallenges,
        toggleChallenge,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addCategory,
        updateCategory,
        deleteCategory,
        updateProfileSettings,
        getTaskStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
