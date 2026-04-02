import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
export type Language = "en" | "tr" | "es" | "de" | "fr" | "ar" | "ru" | "zh";

export const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "tr", label: "Turkish", native: "Türkçe" },
  { code: "es", label: "Spanish", native: "Español" },
  { code: "de", label: "German", native: "Deutsch" },
  { code: "fr", label: "French", native: "Français" },
  { code: "ar", label: "Arabic", native: "العربية" },
  { code: "ru", label: "Russian", native: "Русский" },
  { code: "zh", label: "Chinese", native: "中文" },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    plan: "Plan",
    progress: "Progress",
    community: "Community",
    profile: "Profile",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
    custom: "Custom",
    noTasks: "No tasks yet",
    addFirst: "Tap + to add your first task",
    inProgress: "In Progress",
    completed: "Completed",
    motivationalQuote: "The secret of getting ahead is getting started.",
    motivationalAuthor: "Mark Twain",
  },
  tr: {
    plan: "Plan",
    progress: "İlerleme",
    community: "Topluluk",
    profile: "Profil",
    daily: "Günlük",
    weekly: "Haftalık",
    monthly: "Aylık",
    yearly: "Yıllık",
    custom: "Özel",
    noTasks: "Henüz görev yok",
    addFirst: "İlk görevini eklemek için + simgesine bas",
    inProgress: "Devam Ediyor",
    completed: "Tamamlandı",
    motivationalQuote: "İlerlemanın sırrı başlamaktan geçer.",
    motivationalAuthor: "Mark Twain",
  },
  es: {
    plan: "Plan",
    progress: "Progreso",
    community: "Comunidad",
    profile: "Perfil",
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
    yearly: "Anual",
    custom: "Personalizado",
    noTasks: "Sin tareas aún",
    addFirst: "Toca + para agregar tu primera tarea",
    inProgress: "En Progreso",
    completed: "Completado",
    motivationalQuote: "El secreto para avanzar es comenzar.",
    motivationalAuthor: "Mark Twain",
  },
  de: {
    plan: "Plan",
    progress: "Fortschritt",
    community: "Gemeinschaft",
    profile: "Profil",
    daily: "Täglich",
    weekly: "Wöchentlich",
    monthly: "Monatlich",
    yearly: "Jährlich",
    custom: "Benutzerdefiniert",
    noTasks: "Noch keine Aufgaben",
    addFirst: "Tippe auf +, um deine erste Aufgabe hinzuzufügen",
    inProgress: "In Bearbeitung",
    completed: "Abgeschlossen",
    motivationalQuote: "Das Geheimnis des Fortschritts ist der Anfang.",
    motivationalAuthor: "Mark Twain",
  },
  fr: {
    plan: "Plan",
    progress: "Progrès",
    community: "Communauté",
    profile: "Profil",
    daily: "Quotidien",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    yearly: "Annuel",
    custom: "Personnalisé",
    noTasks: "Pas encore de tâches",
    addFirst: "Appuyez sur + pour ajouter votre première tâche",
    inProgress: "En Cours",
    completed: "Terminé",
    motivationalQuote: "Le secret du succès est de commencer.",
    motivationalAuthor: "Mark Twain",
  },
  ar: {
    plan: "خطة",
    progress: "التقدم",
    community: "المجتمع",
    profile: "الملف",
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    yearly: "سنوي",
    custom: "مخصص",
    noTasks: "لا توجد مهام بعد",
    addFirst: "اضغط + لإضافة مهمتك الأولى",
    inProgress: "قيد التنفيذ",
    completed: "مكتمل",
    motivationalQuote: "سر التقدم هو البدء.",
    motivationalAuthor: "مارك توين",
  },
  ru: {
    plan: "План",
    progress: "Прогресс",
    community: "Сообщество",
    profile: "Профиль",
    daily: "Ежедневно",
    weekly: "Еженедельно",
    monthly: "Ежемесячно",
    yearly: "Ежегодно",
    custom: "Пользовательский",
    noTasks: "Задач пока нет",
    addFirst: "Нажмите + чтобы добавить первую задачу",
    inProgress: "В Процессе",
    completed: "Завершено",
    motivationalQuote: "Секрет движения вперёд — это начало.",
    motivationalAuthor: "Марк Твен",
  },
  zh: {
    plan: "计划",
    progress: "进度",
    community: "社区",
    profile: "我的",
    daily: "每日",
    weekly: "每周",
    monthly: "每月",
    yearly: "每年",
    custom: "自定义",
    noTasks: "暂无任务",
    addFirst: "点击 + 添加第一个任务",
    inProgress: "进行中",
    completed: "已完成",
    motivationalQuote: "前进的秘诀就是开始。",
    motivationalAuthor: "马克·吐温",
  },
};

type ThemeContextType = {
  themeMode: ThemeMode;
  language: Language;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    AsyncStorage.multiGet(["themeMode", "language"]).then((pairs) => {
      const tm = pairs[0][1] as ThemeMode | null;
      const lang = pairs[1][1] as Language | null;
      if (tm) setThemeModeState(tm);
      if (lang) setLanguageState(lang);
    });
  }, []);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem("themeMode", mode);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem("language", lang);
  }, []);

  const isDark =
    themeMode === "dark" || (themeMode === "system" && systemScheme === "dark");

  const t = useCallback(
    (key: string) => {
      return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key;
    },
    [language]
  );

  return (
    <ThemeContext.Provider value={{ themeMode, language, isDark, setThemeMode, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
