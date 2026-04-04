import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
export type Language =
  | "en" | "ru" | "tr" | "az"
  | "uz" | "kk" | "ky" | "tg" | "tk";

export const LANGUAGES: { code: Language; label: string; native: string; flag: string }[] = [
  { code: "en", label: "English",    native: "English",      flag: "🇬🇧" },
  { code: "ru", label: "Russian",    native: "Русский",      flag: "🇷🇺" },
  { code: "tr", label: "Turkish",    native: "Türkçe",       flag: "🇹🇷" },
  { code: "az", label: "Azerbaijani",native: "Azərbaycanca", flag: "🇦🇿" },
  { code: "uz", label: "Uzbek",      native: "O'zbekcha",    flag: "🇺🇿" },
  { code: "kk", label: "Kazakh",     native: "Қазақша",      flag: "🇰🇿" },
  { code: "ky", label: "Kyrgyz",     native: "Кыргызча",     flag: "🇰🇬" },
  { code: "tg", label: "Tajik",      native: "Тоҷикӣ",       flag: "🇹🇯" },
  { code: "tk", label: "Turkmen",    native: "Türkmençe",    flag: "🇹🇲" },
];

export const LANGUAGE_LOCALIZED_NAMES: Record<Language, Record<Language, string>> = {
  en: { en:"English",      ru:"Английский",      tr:"İngilizce",   az:"İngilis dili",   uz:"Inglizcha",      kk:"Ағылшынша",   ky:"Англисча",   tg:"Забони англисӣ",   tk:"Iňlisçe"      },
  ru: { en:"Russian",      ru:"Русский",          tr:"Rusça",       az:"Rus dili",       uz:"Ruscha",         kk:"Орысша",      ky:"Орусча",     tg:"Забони русӣ",      tk:"Rusça"        },
  tr: { en:"Turkish",      ru:"Турецкий",         tr:"Türkçe",      az:"Türk dili",      uz:"Turkcha",        kk:"Түрікше",     ky:"Түркчө",     tg:"Забони туркӣ",     tk:"Türkçe"       },
  az: { en:"Azerbaijani",  ru:"Азербайджанский",  tr:"Azerbaycanca",az:"Azərbaycanca",   uz:"Ozarbayjoncha",  kk:"Әзірбайжанша",ky:"Азербайжанча",tg:"Забони озарбойҷонӣ",tk:"Azerbaýjança"},
  uz: { en:"Uzbek",        ru:"Узбекский",        tr:"Özbekçe",     az:"Özbək dili",     uz:"O'zbekcha",      kk:"Өзбекше",     ky:"Өзбекче",    tg:"Забони ӯзбекӣ",    tk:"Özbek dili"   },
  kk: { en:"Kazakh",       ru:"Казахский",        tr:"Kazakça",     az:"Qazax dili",     uz:"Qozoqcha",       kk:"Қазақша",     ky:"Казакча",    tg:"Забони қазоқӣ",    tk:"Gazakça"      },
  ky: { en:"Kyrgyz",       ru:"Кыргызский",       tr:"Kırgızca",    az:"Qırğız dili",    uz:"Qirg'izcha",     kk:"Қырғызша",    ky:"Кыргызча",   tg:"Забони қирғизӣ",   tk:"Gyrgyzça"     },
  tg: { en:"Tajik",        ru:"Таджикский",       tr:"Tacikçe",     az:"Tacik dili",     uz:"Tojikcha",       kk:"Тәжікше",     ky:"Тажикче",    tg:"Тоҷикӣ",           tk:"Täjikçe"      },
  tk: { en:"Turkmen",      ru:"Туркменский",      tr:"Türkmence",   az:"Türkmən dili",   uz:"Turkmancha",     kk:"Түрікменше",  ky:"Түркмөнчө",  tg:"Забони туркманӣ",  tk:"Türkmençe"    },
};

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
    communitySubtitle: "Share your wins, find your tribe",
    newPost: "New Post", activityFeed: "Activity Feed", challenges: "Challenges",
    participants: "participants", joined: "Joined", join: "Join",
    newPostPlaceholder: "Share your win, progress, or tip...",
    category: "Category", publishPost: "Publish Post",
    comments: "Comments", noCommentsYet: "No comments yet. Be the first!",
    writeComment: "Write a comment...", you: "You", justNow: "Just now",
    progressSubtitle: "Track your productivity over time",
    overallCompletion: "Overall Completion",
    done: "Done", remaining: "Remaining", total: "Total",
    byCategory: "By Category", aiInsights: "AI Insights",
    noTaskData: "No task data yet for this period.\nAdd tasks in the Plan tab to see your progress!",
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
    communitySubtitle: "Делитесь успехами, находите единомышленников",
    newPost: "Новый пост", activityFeed: "Лента", challenges: "Вызовы",
    participants: "участников", joined: "Вступил", join: "Вступить",
    newPostPlaceholder: "Поделитесь победой, прогрессом или советом...",
    category: "Категория", publishPost: "Опубликовать",
    comments: "Комментарии", noCommentsYet: "Пока нет комментариев. Будьте первым!",
    writeComment: "Написать комментарий...", you: "Вы", justNow: "Только что",
    progressSubtitle: "Отслеживайте продуктивность",
    overallCompletion: "Общее выполнение",
    done: "Готово", remaining: "Осталось", total: "Всего",
    byCategory: "По категориям", aiInsights: "ИИ-аналитика",
    noTaskData: "Данных за этот период нет.\nДобавьте задачи во вкладке «План»!",
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
    communitySubtitle: "Başarılarını paylaş, kabileni bul",
    newPost: "Yeni Gönderi", activityFeed: "Akış", challenges: "Görevler",
    participants: "katılımcı", joined: "Katıldı", join: "Katıl",
    newPostPlaceholder: "Kazanımını, ilerleni veya ipucunu paylaş...",
    category: "Kategori", publishPost: "Yayınla",
    comments: "Yorumlar", noCommentsYet: "Henüz yorum yok. İlk sen ol!",
    writeComment: "Yorum yaz...", you: "Sen", justNow: "Şimdi",
    progressSubtitle: "Zaman içindeki üretkenliğini takip et",
    overallCompletion: "Genel Tamamlama",
    done: "Bitti", remaining: "Kalan", total: "Toplam",
    byCategory: "Kategoriye Göre", aiInsights: "AI Analizi",
    noTaskData: "Bu dönem için veri yok.\nPlan sekmesine görev ekle!",
  },
  az: {
    plan: "Plan", progress: "İrəliləyiş", community: "İcma", profile: "Profil",
    daily: "Günlük", weekly: "Həftəlik", monthly: "Aylıq", yearly: "İllik",
    noTasks: "Hələ tapşırıq yoxdur", addFirst: "İlk tapşırığı əlavə etmək üçün + basın",
    inProgress: "Davam Edir", completed: "Tamamlandı",
    tasksCompleted: "tapşırıq tamamlandı", of: "/",
    dailyMotivation: "Günlük Motivasiya", all: "Hamısı",
    achievements: "Nailiyyətlər", communityChallenges: "İcma Tapşırıqları",
    notifications: "Bildirişlər", pushNotifications: "Push Bildirişlər",
    alarmSound: "Zəng Səsi", appearance: "Görünüş",
    theme: "Mövzu", language: "Dil", partners: "Tərəfdaşlar",
    data: "Məlumatlar", clearAllData: "Bütün məlumatları sil",
    tasksDone: "Edildi", dayStreak: "Gün Seriyası", completion: "Tamamlanma",
    chooseTheme: "Mövzu Seç", chooseLanguage: "Dil Seç",
    addTask: "Tapşırıq Əlavə Et", save: "Saxla", cancel: "Ləğv et",
    noChallenges: "Hələ tapşırıq yoxdur.\nİcmanı ziyarət edin!",
    communitySubtitle: "Uğurlarınızı bölüşün, qrupunuzu tapın",
    newPost: "Yeni Göndəri", activityFeed: "Axın", challenges: "Tapşırıqlar",
    participants: "iştirakçı", joined: "Qoşuldu", join: "Qoşul",
    newPostPlaceholder: "Qazanımınızı, irəliləyişinizi və ya məsləhətinizi bölüşün...",
    category: "Kateqoriya", publishPost: "Yayımla",
    comments: "Şərhlər", noCommentsYet: "Hələ şərh yoxdur. İlk siz olun!",
    writeComment: "Şərh yazın...", you: "Siz", justNow: "İndi",
    progressSubtitle: "Zaman keçdikcə məhsuldarlığınızı izləyin",
    overallCompletion: "Ümumi Tamamlanma",
    done: "Hazır", remaining: "Qalan", total: "Cəmi",
    byCategory: "Kateqoriyaya görə", aiInsights: "AI Təhlili",
    noTaskData: "Bu dövr üçün məlumat yoxdur.\nPlan bölməsinə tapşırıq əlavə edin!",
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
    communitySubtitle: "Yutuqlaringizni ulashing, guruhingizni toping",
    newPost: "Yangi post", activityFeed: "Faoliyat", challenges: "Topshiriqlar",
    participants: "ishtirokchi", joined: "Qo'shildi", join: "Qo'shilish",
    newPostPlaceholder: "G'alabangiz, natijangiz yoki maslahatingiznı ulashing...",
    category: "Kategoriya", publishPost: "Nashr qilish",
    comments: "Izohlar", noCommentsYet: "Hali izoh yo'q. Birinchi bo'ling!",
    writeComment: "Izoh yozing...", you: "Siz", justNow: "Hozir",
    progressSubtitle: "Vaqt o'tishi bilan samaradorligingizni kuzating",
    overallCompletion: "Umumiy bajarilish",
    done: "Bajarildi", remaining: "Qolgan", total: "Jami",
    byCategory: "Kategoriya bo'yicha", aiInsights: "AI tahlili",
    noTaskData: "Bu davr uchun ma'lumot yo'q.\nReja bo'limiga vazifa qo'shing!",
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
    communitySubtitle: "Жетістіктеріңізді бөлісіңіз, топ табыңыз",
    newPost: "Жаңа жазба", activityFeed: "Белсенділік", challenges: "Тапсырмалар",
    participants: "қатысушы", joined: "Қосылды", join: "Қосылу",
    newPostPlaceholder: "Жеңісіңізді, нәтижеңізді немесе кеңесіңізді бөлісіңіз...",
    category: "Санат", publishPost: "Жариялау",
    comments: "Пікірлер", noCommentsYet: "Пікір жоқ. Бірінші болыңыз!",
    writeComment: "Пікір жазыңыз...", you: "Сіз", justNow: "Қазір",
    progressSubtitle: "Уақыт өте келе өнімділікті бақылаңыз",
    overallCompletion: "Жалпы орындалу",
    done: "Дайын", remaining: "Қалды", total: "Барлығы",
    byCategory: "Санат бойынша", aiInsights: "AI талдауы",
    noTaskData: "Бұл кезең үшін деректер жоқ.\nЖоспар бөліміне тапсырма қосыңыз!",
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
    communitySubtitle: "Жетишкендиктериңизди бөлүшүңүз, топ табыңыз",
    newPost: "Жаңы жазуу", activityFeed: "Активдүүлүк", challenges: "Тапшырмалар",
    participants: "катышуучу", joined: "Кошулду", join: "Кошулуу",
    newPostPlaceholder: "Жеңишиңизди, жыйынтыгыңызды же кеңешиңизди бөлүшүңүз...",
    category: "Категория", publishPost: "Жарыялоо",
    comments: "Комментарийлер", noCommentsYet: "Комментарий жок. Биринчи болуңуз!",
    writeComment: "Комментарий жазыңыз...", you: "Сиз", justNow: "Азыр",
    progressSubtitle: "Убакыт өткөн сайын өндүрүмдүүлүктү көзөмөлдөңүз",
    overallCompletion: "Жалпы аткаруу",
    done: "Бүттү", remaining: "Калды", total: "Баары",
    byCategory: "Категория боюнча", aiInsights: "AI талдоо",
    noTaskData: "Бул мезгил үчүн маалымат жок.\nПландоо бөлүмүнө тапшырма кошуңуз!",
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
    communitySubtitle: "Муваффақиятҳоятонро мубодила кунед",
    newPost: "Паёми нав", activityFeed: "Фаъолият", challenges: "Супоришҳо",
    participants: "иштирокчӣ", joined: "Ҳамроҳ шуд", join: "Ҳамроҳ шавед",
    newPostPlaceholder: "Муваффақият, пешрафт ё маслиҳататонро мубодила кунед...",
    category: "Категория", publishPost: "Нашр кунед",
    comments: "Шарҳҳо", noCommentsYet: "Ҳоло шарҳе нест. Аввалин шавед!",
    writeComment: "Шарҳ нависед...", you: "Шумо", justNow: "Ҳозир",
    progressSubtitle: "Самаранокиятонро дар тӯли вақт пайгирӣ кунед",
    overallCompletion: "Иҷрои умумӣ",
    done: "Тайёр", remaining: "Боқӣ", total: "Ҳама",
    byCategory: "Аз рӯи категория", aiInsights: "Таҳлили AI",
    noTaskData: "Барои ин давра маълумот нест.\nБа нақша вазифа илова кунед!",
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
    communitySubtitle: "Üstünlikleriňizi paýlaşyň, toparňyzy tapyň",
    newPost: "Täze ýazgy", activityFeed: "Işjeňlik", challenges: "Wezipeler",
    participants: "gatnaşyjy", joined: "Goşuldy", join: "Goşulmak",
    newPostPlaceholder: "Üstünligiňizi, öňe gidişiňizi ýa-da maslahatlaryňyzy paýlaşyň...",
    category: "Kategoriýa", publishPost: "Çap etmek",
    comments: "Teswirler", noCommentsYet: "Heniz teswir ýok. Ilkinji boluň!",
    writeComment: "Teswir ýazyň...", you: "Siz", justNow: "Häzir",
    progressSubtitle: "Wagtyň geçmegi bilen önümçiligi yzarlaň",
    overallCompletion: "Umumy tamamlanyş",
    done: "Taýyn", remaining: "Galan", total: "Jemi",
    byCategory: "Kategoriýa boýunça", aiInsights: "AI derňewi",
    noTaskData: "Bu döwür üçin maglumat ýok.\nMeýilnama sekmesine wezipe goşuň!",
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
      if (lang && LANGUAGES.find((l) => l.code === lang)) setLanguageState(lang as Language);
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
