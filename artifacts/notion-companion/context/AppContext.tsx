import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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
  createdAt: string;
  completedAt?: string;
  notes?: string;
};

export type TimerSession = {
  taskId?: string;
  duration: number;
  remaining: number;
  isRunning: boolean;
  type: "focus" | "break";
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
  timerSession: TimerSession | null;
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  updateProfileSettings: (updates: Partial<ProfileSettings>) => void;
  setTimerSession: (session: TimerSession | null) => void;
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

const DEFAULT_CATEGORIES: Category[] = [
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

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>({
    name: "User",
    alarmSound: "default",
    notificationsEnabled: true,
  });
  const [timerSession, setTimerSession] = useState<TimerSession | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksData, categoriesData, profileData] = await Promise.all([
        AsyncStorage.getItem("tasks"),
        AsyncStorage.getItem("categories"),
        AsyncStorage.getItem("profile"),
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
    await AsyncStorage.setItem("tasks", JSON.stringify(newTasks));
  }, []);

  const saveCategories = useCallback(async (newCats: Category[]) => {
    await AsyncStorage.setItem("categories", JSON.stringify(newCats));
  }, []);

  const saveProfile = useCallback(async (profile: ProfileSettings) => {
    await AsyncStorage.setItem("profile", JSON.stringify(profile));
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
          percentage: catTotal > 0 ? Math.round((catCompleted / catTotal) * 100) : 0,
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
        timerSession,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        addCategory,
        updateCategory,
        deleteCategory,
        updateProfileSettings,
        setTimerSession,
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
