import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
export type Language =
  | "en" | "tr" | "es" | "de" | "fr" | "ar" | "ru" | "zh"
  | "uz" | "kk" | "ky" | "tg" | "tk"
  | "ja" | "ko" | "pt" | "it" | "hi" | "id";

export const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English",    native: "English",        flag: "🇬🇧" },
  { code: "ru", label: "Russian",    native: "Русский",        flag: "🇷🇺" },
  { code: "zh", label: "Chinese",    native: "中文",            flag: "🇨🇳" },
  { code: "ar", label: "Arabic",     native: "العربية",         flag: "🇸🇦" },
  { code: "hi", label: "Hindi",      native: "हिन्दी",           flag: "🇮🇳" },
  { code: "es", label: "Spanish",    native: "Español",        flag: "🇪🇸" },
  { code: "fr", label: "French",     native: "Français",       flag: "🇫🇷" },
  { code: "de", label: "German",     native: "Deutsch",        flag: "🇩🇪" },
  { code: "pt", label: "Portuguese", native: "Português",      flag: "🇧🇷" },
  { code: "it", label: "Italian",    native: "Italiano",       flag: "🇮🇹" },
  { code: "tr", label: "Turkish",    native: "Türkçe",         flag: "🇹🇷" },
  { code: "ja", label: "Japanese",   native: "日本語",           flag: "🇯🇵" },
  { code: "ko", label: "Korean",     native: "한국어",           flag: "🇰🇷" },
  { code: "id", label: "Indonesian", native: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "uz", label: "Uzbek",      native: "O'zbekcha",      flag: "🇺🇿" },
  { code: "kk", label: "Kazakh",     native: "Қазақша",        flag: "🇰🇿" },
  { code: "ky", label: "Kyrgyz",     native: "Кыргызча",       flag: "🇰🇬" },
  { code: "tg", label: "Tajik",      native: "Тоҷикӣ",         flag: "🇹🇯" },
  { code: "tk", label: "Turkmen",    native: "Türkmençe",      flag: "🇹🇲" },
];

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    plan: "Plan", progress: "Progress", community: "Community", profile: "Profile",
    daily: "Daily", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly",
    noTasks: "No tasks yet", addFirst: "Tap + to add your first task",
    inProgress: "In Progress", completed: "Completed",
    tasksCompleted: "tasks completed", of: "of",
    dailyMotivation: "Daily Motivation", all: "All",
    achievements: "Achievements", communityChallenges: "Community Challenges",
    notifications: "Notifications", pushNotifications: "Push Notifications",
    alarmSound: "Alarm Sound", appearance: "Appearance",
    theme: "Theme", language: "Language", partners: "Partners",
    data: "Data", clearAllData: "Clear All Data",
    tasksDone: "Tasks Done", dayStreak: "Day Streak", completion: "Completion",
    chooseTheme: "Choose Theme", chooseLanguage: "Choose Language",
    addTask: "Add Task", save: "Save", cancel: "Cancel",
    noChallenges: "No challenges joined yet.\nVisit Community to join one!",
  },
  ru: {
    plan: "План", progress: "Прогресс", community: "Сообщество", profile: "Профиль",
    daily: "Ежедневно", weekly: "Еженедельно", monthly: "Ежемесячно", yearly: "Ежегодно",
    noTasks: "Задач пока нет", addFirst: "Нажмите + чтобы добавить первую задачу",
    inProgress: "В Процессе", completed: "Завершено",
    tasksCompleted: "задач выполнено", of: "из",
    dailyMotivation: "Мотивация дня", all: "Все",
    achievements: "Достижения", communityChallenges: "Вызовы сообщества",
    notifications: "Уведомления", pushNotifications: "Push-уведомления",
    alarmSound: "Звук будильника", appearance: "Внешний вид",
    theme: "Тема", language: "Язык", partners: "Партнёры",
    data: "Данные", clearAllData: "Очистить всё",
    tasksDone: "Выполнено", dayStreak: "Дней подряд", completion: "Процент",
    chooseTheme: "Выбор темы", chooseLanguage: "Выбор языка",
    addTask: "Добавить задачу", save: "Сохранить", cancel: "Отмена",
    noChallenges: "Вы ещё не участвуете в вызовах.\nПосетите раздел Сообщество!",
  },
  zh: {
    plan: "计划", progress: "进度", community: "社区", profile: "我的",
    daily: "每日", weekly: "每周", monthly: "每月", yearly: "每年",
    noTasks: "暂无任务", addFirst: "点击 + 添加第一个任务",
    inProgress: "进行中", completed: "已完成",
    tasksCompleted: "个任务已完成", of: "/",
    dailyMotivation: "每日激励", all: "全部",
    achievements: "成就", communityChallenges: "社区挑战",
    notifications: "通知", pushNotifications: "推送通知",
    alarmSound: "闹钟声音", appearance: "外观",
    theme: "主题", language: "语言", partners: "合作伙伴",
    data: "数据", clearAllData: "清除所有数据",
    tasksDone: "已完成任务", dayStreak: "连续天数", completion: "完成率",
    chooseTheme: "选择主题", chooseLanguage: "选择语言",
    addTask: "添加任务", save: "保存", cancel: "取消",
    noChallenges: "尚未加入任何挑战。\n前往社区加入！",
  },
  ar: {
    plan: "خطة", progress: "التقدم", community: "المجتمع", profile: "الملف",
    daily: "يومي", weekly: "أسبوعي", monthly: "شهري", yearly: "سنوي",
    noTasks: "لا توجد مهام بعد", addFirst: "اضغط + لإضافة مهمتك الأولى",
    inProgress: "قيد التنفيذ", completed: "مكتمل",
    tasksCompleted: "مهام مكتملة", of: "من",
    dailyMotivation: "الإلهام اليومي", all: "الكل",
    achievements: "الإنجازات", communityChallenges: "تحديات المجتمع",
    notifications: "الإشعارات", pushNotifications: "الإشعارات الفورية",
    alarmSound: "صوت المنبه", appearance: "المظهر",
    theme: "السمة", language: "اللغة", partners: "الشركاء",
    data: "البيانات", clearAllData: "مسح كل البيانات",
    tasksDone: "المهام المنجزة", dayStreak: "أيام متتالية", completion: "نسبة الإتمام",
    chooseTheme: "اختر السمة", chooseLanguage: "اختر اللغة",
    addTask: "إضافة مهمة", save: "حفظ", cancel: "إلغاء",
    noChallenges: "لم تنضم إلى أي تحدي بعد.\nزر المجتمع للانضمام!",
  },
  hi: {
    plan: "योजना", progress: "प्रगति", community: "समुदाय", profile: "प्रोफ़ाइल",
    daily: "दैनिक", weekly: "साप्ताहिक", monthly: "मासिक", yearly: "वार्षिक",
    noTasks: "अभी कोई कार्य नहीं", addFirst: "+ दबाएं और पहला कार्य जोड़ें",
    inProgress: "जारी है", completed: "पूर्ण",
    tasksCompleted: "कार्य पूर्ण", of: "में से",
    dailyMotivation: "दैनिक प्रेरणा", all: "सभी",
    achievements: "उपलब्धियाँ", communityChallenges: "सामुदायिक चुनौतियाँ",
    notifications: "सूचनाएं", pushNotifications: "पुश नोटिफिकेशन",
    alarmSound: "अलार्म ध्वनि", appearance: "रूप-रंग",
    theme: "थीम", language: "भाषा", partners: "साझेदार",
    data: "डेटा", clearAllData: "सारा डेटा हटाएं",
    tasksDone: "कार्य हुए", dayStreak: "दिन की लकीर", completion: "पूर्णता",
    chooseTheme: "थीम चुनें", chooseLanguage: "भाषा चुनें",
    addTask: "कार्य जोड़ें", save: "सहेजें", cancel: "रद्द करें",
    noChallenges: "अभी कोई चुनौती नहीं जोड़ी।\nसमुदाय पर जाएं!",
  },
  es: {
    plan: "Plan", progress: "Progreso", community: "Comunidad", profile: "Perfil",
    daily: "Diario", weekly: "Semanal", monthly: "Mensual", yearly: "Anual",
    noTasks: "Sin tareas aún", addFirst: "Toca + para agregar tu primera tarea",
    inProgress: "En Progreso", completed: "Completado",
    tasksCompleted: "tareas completadas", of: "de",
    dailyMotivation: "Motivación diaria", all: "Todo",
    achievements: "Logros", communityChallenges: "Retos comunitarios",
    notifications: "Notificaciones", pushNotifications: "Notificaciones push",
    alarmSound: "Sonido de alarma", appearance: "Apariencia",
    theme: "Tema", language: "Idioma", partners: "Socios",
    data: "Datos", clearAllData: "Borrar todos los datos",
    tasksDone: "Tareas hechas", dayStreak: "Racha de días", completion: "Completado",
    chooseTheme: "Elegir tema", chooseLanguage: "Elegir idioma",
    addTask: "Añadir tarea", save: "Guardar", cancel: "Cancelar",
    noChallenges: "Aún no te has unido a ningún reto.\n¡Visita Comunidad!",
  },
  fr: {
    plan: "Plan", progress: "Progrès", community: "Communauté", profile: "Profil",
    daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel", yearly: "Annuel",
    noTasks: "Pas encore de tâches", addFirst: "Appuyez sur + pour ajouter votre première tâche",
    inProgress: "En Cours", completed: "Terminé",
    tasksCompleted: "tâches terminées", of: "sur",
    dailyMotivation: "Motivation du jour", all: "Tout",
    achievements: "Succès", communityChallenges: "Défis communautaires",
    notifications: "Notifications", pushNotifications: "Notifications push",
    alarmSound: "Son d'alarme", appearance: "Apparence",
    theme: "Thème", language: "Langue", partners: "Partenaires",
    data: "Données", clearAllData: "Effacer toutes les données",
    tasksDone: "Tâches faites", dayStreak: "Jours consécutifs", completion: "Achèvement",
    chooseTheme: "Choisir un thème", chooseLanguage: "Choisir une langue",
    addTask: "Ajouter une tâche", save: "Enregistrer", cancel: "Annuler",
    noChallenges: "Aucun défi rejoint.\nVisitez Communauté!",
  },
  de: {
    plan: "Plan", progress: "Fortschritt", community: "Gemeinschaft", profile: "Profil",
    daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich", yearly: "Jährlich",
    noTasks: "Noch keine Aufgaben", addFirst: "Tippe auf +, um deine erste Aufgabe hinzuzufügen",
    inProgress: "In Bearbeitung", completed: "Abgeschlossen",
    tasksCompleted: "Aufgaben erledigt", of: "von",
    dailyMotivation: "Tägliche Motivation", all: "Alle",
    achievements: "Erfolge", communityChallenges: "Community-Herausforderungen",
    notifications: "Benachrichtigungen", pushNotifications: "Push-Benachrichtigungen",
    alarmSound: "Alarmton", appearance: "Erscheinungsbild",
    theme: "Design", language: "Sprache", partners: "Partner",
    data: "Daten", clearAllData: "Alle Daten löschen",
    tasksDone: "Erledigt", dayStreak: "Tages-Streak", completion: "Abschluss",
    chooseTheme: "Design wählen", chooseLanguage: "Sprache wählen",
    addTask: "Aufgabe hinzufügen", save: "Speichern", cancel: "Abbrechen",
    noChallenges: "Noch keine Herausforderungen.\nBesuche die Gemeinschaft!",
  },
  pt: {
    plan: "Plano", progress: "Progresso", community: "Comunidade", profile: "Perfil",
    daily: "Diário", weekly: "Semanal", monthly: "Mensal", yearly: "Anual",
    noTasks: "Nenhuma tarefa ainda", addFirst: "Toque em + para adicionar sua primeira tarefa",
    inProgress: "Em Andamento", completed: "Concluído",
    tasksCompleted: "tarefas concluídas", of: "de",
    dailyMotivation: "Motivação diária", all: "Todos",
    achievements: "Conquistas", communityChallenges: "Desafios da comunidade",
    notifications: "Notificações", pushNotifications: "Notificações push",
    alarmSound: "Som do alarme", appearance: "Aparência",
    theme: "Tema", language: "Idioma", partners: "Parceiros",
    data: "Dados", clearAllData: "Limpar todos os dados",
    tasksDone: "Tarefas feitas", dayStreak: "Dias consecutivos", completion: "Conclusão",
    chooseTheme: "Escolher tema", chooseLanguage: "Escolher idioma",
    addTask: "Adicionar tarefa", save: "Salvar", cancel: "Cancelar",
    noChallenges: "Nenhum desafio ainda.\nVisite a Comunidade!",
  },
  it: {
    plan: "Piano", progress: "Progresso", community: "Comunità", profile: "Profilo",
    daily: "Giornaliero", weekly: "Settimanale", monthly: "Mensile", yearly: "Annuale",
    noTasks: "Nessuna attività ancora", addFirst: "Premi + per aggiungere la tua prima attività",
    inProgress: "In Corso", completed: "Completato",
    tasksCompleted: "attività completate", of: "di",
    dailyMotivation: "Motivazione del giorno", all: "Tutto",
    achievements: "Traguardi", communityChallenges: "Sfide della comunità",
    notifications: "Notifiche", pushNotifications: "Notifiche push",
    alarmSound: "Suono sveglia", appearance: "Aspetto",
    theme: "Tema", language: "Lingua", partners: "Partner",
    data: "Dati", clearAllData: "Cancella tutti i dati",
    tasksDone: "Attività fatte", dayStreak: "Giorni consecutivi", completion: "Completamento",
    chooseTheme: "Scegli tema", chooseLanguage: "Scegli lingua",
    addTask: "Aggiungi attività", save: "Salva", cancel: "Annulla",
    noChallenges: "Nessuna sfida ancora.\nVisita la Comunità!",
  },
  tr: {
    plan: "Plan", progress: "İlerleme", community: "Topluluk", profile: "Profil",
    daily: "Günlük", weekly: "Haftalık", monthly: "Aylık", yearly: "Yıllık",
    noTasks: "Henüz görev yok", addFirst: "İlk görevini eklemek için + simgesine bas",
    inProgress: "Devam Ediyor", completed: "Tamamlandı",
    tasksCompleted: "görev tamamlandı", of: "/",
    dailyMotivation: "Günlük Motivasyon", all: "Tümü",
    achievements: "Başarımlar", communityChallenges: "Topluluk Görevleri",
    notifications: "Bildirimler", pushNotifications: "Anlık Bildirimler",
    alarmSound: "Alarm Sesi", appearance: "Görünüm",
    theme: "Tema", language: "Dil", partners: "Ortaklar",
    data: "Veriler", clearAllData: "Tüm Verileri Sil",
    tasksDone: "Yapılan", dayStreak: "Gün Serisi", completion: "Tamamlama",
    chooseTheme: "Tema Seç", chooseLanguage: "Dil Seç",
    addTask: "Görev Ekle", save: "Kaydet", cancel: "İptal",
    noChallenges: "Henüz görev yok.\nTopluluk'u ziyaret et!",
  },
  ja: {
    plan: "プラン", progress: "進捗", community: "コミュニティ", profile: "プロフィール",
    daily: "毎日", weekly: "毎週", monthly: "毎月", yearly: "毎年",
    noTasks: "タスクがありません", addFirst: "+ をタップして最初のタスクを追加",
    inProgress: "進行中", completed: "完了",
    tasksCompleted: "タスク完了", of: "/",
    dailyMotivation: "今日の名言", all: "すべて",
    achievements: "実績", communityChallenges: "コミュニティチャレンジ",
    notifications: "通知", pushNotifications: "プッシュ通知",
    alarmSound: "アラーム音", appearance: "外観",
    theme: "テーマ", language: "言語", partners: "パートナー",
    data: "データ", clearAllData: "全データを削除",
    tasksDone: "完了タスク", dayStreak: "連続日数", completion: "達成率",
    chooseTheme: "テーマを選択", chooseLanguage: "言語を選択",
    addTask: "タスクを追加", save: "保存", cancel: "キャンセル",
    noChallenges: "まだ参加していません。\nコミュニティをチェック！",
  },
  ko: {
    plan: "플랜", progress: "진행", community: "커뮤니티", profile: "프로필",
    daily: "매일", weekly: "매주", monthly: "매월", yearly: "매년",
    noTasks: "아직 할 일이 없습니다", addFirst: "+ 를 눌러 첫 번째 할 일 추가",
    inProgress: "진행 중", completed: "완료",
    tasksCompleted: "개 완료", of: "/",
    dailyMotivation: "오늘의 명언", all: "전체",
    achievements: "업적", communityChallenges: "커뮤니티 챌린지",
    notifications: "알림", pushNotifications: "푸시 알림",
    alarmSound: "알람 소리", appearance: "외관",
    theme: "테마", language: "언어", partners: "파트너",
    data: "데이터", clearAllData: "모든 데이터 삭제",
    tasksDone: "완료한 일", dayStreak: "연속 일수", completion: "달성률",
    chooseTheme: "테마 선택", chooseLanguage: "언어 선택",
    addTask: "할 일 추가", save: "저장", cancel: "취소",
    noChallenges: "아직 참여한 챌린지가 없습니다.\n커뮤니티를 방문하세요!",
  },
  id: {
    plan: "Rencana", progress: "Kemajuan", community: "Komunitas", profile: "Profil",
    daily: "Harian", weekly: "Mingguan", monthly: "Bulanan", yearly: "Tahunan",
    noTasks: "Belum ada tugas", addFirst: "Ketuk + untuk menambah tugas pertama",
    inProgress: "Sedang Berjalan", completed: "Selesai",
    tasksCompleted: "tugas selesai", of: "dari",
    dailyMotivation: "Motivasi Hari Ini", all: "Semua",
    achievements: "Pencapaian", communityChallenges: "Tantangan Komunitas",
    notifications: "Notifikasi", pushNotifications: "Notifikasi Push",
    alarmSound: "Suara Alarm", appearance: "Tampilan",
    theme: "Tema", language: "Bahasa", partners: "Mitra",
    data: "Data", clearAllData: "Hapus Semua Data",
    tasksDone: "Tugas Selesai", dayStreak: "Hari Beruntun", completion: "Penyelesaian",
    chooseTheme: "Pilih Tema", chooseLanguage: "Pilih Bahasa",
    addTask: "Tambah Tugas", save: "Simpan", cancel: "Batal",
    noChallenges: "Belum ada tantangan.\nKunjungi Komunitas!",
  },
  uz: {
    plan: "Reja", progress: "Ilgarilanish", community: "Jamiyat", profile: "Profil",
    daily: "Kunlik", weekly: "Haftalik", monthly: "Oylik", yearly: "Yillik",
    noTasks: "Hali vazifalar yo'q", addFirst: "Birinchi vazifani qo'shish uchun + bosing",
    inProgress: "Bajarilmoqda", completed: "Bajarildi",
    tasksCompleted: "ta vazifa bajarildi", of: "/",
    dailyMotivation: "Kunlik ilhom", all: "Barchasi",
    achievements: "Yutuqlar", communityChallenges: "Jamiyat topshiriqlari",
    notifications: "Bildirishnomalar", pushNotifications: "Push bildirishnomalar",
    alarmSound: "Soat ovozi", appearance: "Ko'rinish",
    theme: "Mavzu", language: "Til", partners: "Hamkorlar",
    data: "Ma'lumotlar", clearAllData: "Barcha ma'lumotlarni o'chirish",
    tasksDone: "Bajarilgan", dayStreak: "Kun seriyasi", completion: "Bajarilish",
    chooseTheme: "Mavzu tanlash", chooseLanguage: "Til tanlash",
    addTask: "Vazifa qo'shish", save: "Saqlash", cancel: "Bekor qilish",
    noChallenges: "Hali topshiriqlar yo'q.\nJamiyatga tashrif buyuring!",
  },
  kk: {
    plan: "Жоспар", progress: "Үдеріс", community: "Қоғам", profile: "Профиль",
    daily: "Күнделікті", weekly: "Апталық", monthly: "Айлық", yearly: "Жылдық",
    noTasks: "Тапсырма жоқ", addFirst: "Бірінші тапсырманы қосу үшін + басыңыз",
    inProgress: "Орындалуда", completed: "Аяқталды",
    tasksCompleted: "тапсырма орындалды", of: "/",
    dailyMotivation: "Күнделікті шабыт", all: "Барлығы",
    achievements: "Жетістіктер", communityChallenges: "Қоғам тапсырмалары",
    notifications: "Хабарландырулар", pushNotifications: "Push хабарландырулар",
    alarmSound: "Дабыл дыбысы", appearance: "Көрініс",
    theme: "Тақырып", language: "Тіл", partners: "Серіктестер",
    data: "Деректер", clearAllData: "Барлық деректерді жою",
    tasksDone: "Орындалған", dayStreak: "Күн сериясы", completion: "Орындалу",
    chooseTheme: "Тақырып таңдау", chooseLanguage: "Тіл таңдау",
    addTask: "Тапсырма қосу", save: "Сақтау", cancel: "Бас тарту",
    noChallenges: "Тапсырмалар жоқ.\nҚоғамға кіріңіз!",
  },
  ky: {
    plan: "Пландоо", progress: "Прогресс", community: "Коомдошток", profile: "Профиль",
    daily: "Күнүмдүк", weekly: "Жумалык", monthly: "Айлык", yearly: "Жылдык",
    noTasks: "Тапшырма жок", addFirst: "Биринчи тапшырманы кошуу үчүн + басыңыз",
    inProgress: "Аткарылуда", completed: "Аяктады",
    tasksCompleted: "тапшырма аяктады", of: "/",
    dailyMotivation: "Күнүмдүк шыктандыруу", all: "Баары",
    achievements: "Жетишкендиктер", communityChallenges: "Коомдоштук тапшырмалары",
    notifications: "Билдирүүлөр", pushNotifications: "Push билдирүүлөр",
    alarmSound: "Ойготкуч үнү", appearance: "Көрүнүш",
    theme: "Тема", language: "Тил", partners: "Өнөктөштөр",
    data: "Маалыматтар", clearAllData: "Бардык маалыматтарды жок кылуу",
    tasksDone: "Аткарылган", dayStreak: "Күн сериясы", completion: "Аткаруу",
    chooseTheme: "Тема тандоо", chooseLanguage: "Тил тандоо",
    addTask: "Тапшырма кошуу", save: "Сактоо", cancel: "Жокко чыгаруу",
    noChallenges: "Тапшырмалар жок.\nКоомдоштукка кириңиз!",
  },
  tg: {
    plan: "Нақша", progress: "Пешрафт", community: "Ҷамоат", profile: "Профил",
    daily: "Ҳаррӯза", weekly: "Ҳафтагӣ", monthly: "Моҳона", yearly: "Солона",
    noTasks: "Вазифаҳо нест", addFirst: "Барои илова кардани вазифа + -ро зер кунед",
    inProgress: "Иҷро мешавад", completed: "Анҷом ёфт",
    tasksCompleted: "вазифа анҷом ёфт", of: "/",
    dailyMotivation: "Илҳоми рӯзона", all: "Ҳама",
    achievements: "Дастовардҳо", communityChallenges: "Супоришҳои ҷамоат",
    notifications: "Огоҳиҳо", pushNotifications: "Push огоҳиҳо",
    alarmSound: "Овози зангӯлак", appearance: "Зоҳир",
    theme: "Мавзӯъ", language: "Забон", partners: "Шарикон",
    data: "Маълумот", clearAllData: "Ҳама маълумотро тоза кунед",
    tasksDone: "Иҷро шуд", dayStreak: "Рӯзҳои пайдарпай", completion: "Иҷро",
    chooseTheme: "Мавзӯъ интихоб кунед", chooseLanguage: "Забон интихоб кунед",
    addTask: "Вазифа илова кунед", save: "Сохтан", cancel: "Бекор кардан",
    noChallenges: "Супоришҳо нест.\nАз Ҷамоат дидан кунед!",
  },
  tk: {
    plan: "Meýilnama", progress: "Öňe gidiş", community: "Jemgyýet", profile: "Profil",
    daily: "Gündelik", weekly: "Hepdelik", monthly: "Aýlyk", yearly: "Ýyllyk",
    noTasks: "Wezipeler ýok", addFirst: "Ilkinji wezipe goşmak üçin + basyň",
    inProgress: "Ýerine ýetirilýär", completed: "Tamamlandy",
    tasksCompleted: "wezipe tamamlandy", of: "/",
    dailyMotivation: "Gündelik ylham", all: "Hemmesi",
    achievements: "Üstünlikler", communityChallenges: "Jemgyýet wezipeleri",
    notifications: "Habarnamalar", pushNotifications: "Push habarnamalar",
    alarmSound: "Duýduryş sesi", appearance: "Görünüş",
    theme: "Tema", language: "Dil", partners: "Hyzmatdaşlar",
    data: "Maglumat", clearAllData: "Ähli maglumatlary pozmak",
    tasksDone: "Ýerine ýetirildi", dayStreak: "Gün yzygiderliligi", completion: "Tamamlanyş",
    chooseTheme: "Tema saýlaň", chooseLanguage: "Dil saýlaň",
    addTask: "Wezipe goşuň", save: "Saklamak", cancel: "Ýatyrmak",
    noChallenges: "Wezipeler ýok.\nJemgyýete baryň!",
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
      if (lang) setLanguageState(lang as Language);
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
