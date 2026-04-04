import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AddTaskModal from "@/components/AddTaskModal";
import DwayAiModal from "@/components/DwayAiModal";
import TaskCard from "@/components/TaskCard";
import TimerModal from "@/components/TimerModal";
import { Category, Task, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

type PeriodOption = "daily" | "weekly" | "monthly" | "yearly";

const DAILY_QUOTES = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "R. Collier" },
  { quote: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

export default function PlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, categories } = useApp();
  const { t } = useTheme();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>("daily");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAiMother, setShowAiMother] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

  const todayIndex = new Date().getDay();
  const dailyQuote = DAILY_QUOTES[todayIndex % DAILY_QUOTES.length];

  const PERIOD_LABELS: Record<PeriodOption, string> = {
    daily: t("daily"),
    weekly: t("weekly"),
    monthly: t("monthly"),
    yearly: t("yearly"),
  };

  const filteredTasks = tasks.filter((task: Task) => {
    const now = new Date();
    const taskDate = new Date(task.createdAt);
    let dateMatch = true;

    if (selectedPeriod === "daily") {
      dateMatch = taskDate.toDateString() === now.toDateString();
    } else if (selectedPeriod === "weekly") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      dateMatch = taskDate >= weekAgo;
    } else if (selectedPeriod === "monthly") {
      dateMatch =
        taskDate.getMonth() === now.getMonth() &&
        taskDate.getFullYear() === now.getFullYear();
    } else if (selectedPeriod === "yearly") {
      dateMatch = taskDate.getFullYear() === now.getFullYear();
    }

    const categoryMatch =
      selectedCategory === "all" || task.categoryId === selectedCategory;
    return dateMatch && categoryMatch;
  });

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);
  const completedCount = completedTasks.length;
  const totalCount = filteredTasks.length;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
      paddingBottom: 12,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 2,
    },
    periodBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    periodLabel: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    statsText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    statsHighlight: {
      color: colors.primary,
      fontFamily: "Inter_600SemiBold",
    },
    periodModal: {
      position: "absolute",
      top: Platform.OS === "web" ? insets.top + 120 : insets.top + 70,
      left: 20,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 8,
      zIndex: 200,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 20,
      elevation: 12,
      minWidth: 180,
    },
    periodOption: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    periodOptionText: { fontSize: 15, fontFamily: "Inter_500Medium" },
    quoteCard: {
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: colors.primary + "14",
      borderRadius: 16,
      padding: 16,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    quoteLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: colors.primary,
      fontFamily: "Inter_700Bold",
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 6,
    },
    quoteText: {
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      lineHeight: 21,
      fontStyle: "italic",
    },
    quoteAuthor: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginTop: 6,
    },
    categoriesRow: { paddingHorizontal: 20, marginBottom: 16 },
    categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 1.5,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: Platform.OS === "web" ? 140 : insets.bottom + 110,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.mutedForeground,
      fontFamily: "Inter_700Bold",
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    emptyState: {
      alignItems: "center",
      paddingTop: 50,
      paddingHorizontal: 40,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 8,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 22,
    },
    fab: {
      position: "absolute",
      right: 20,
      bottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 70 + 16,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    aiMotherBtn: {
      position: "absolute",
      right: 20,
      bottom: Platform.OS === "web" ? 34 + 84 + 82 : insets.bottom + 70 + 82,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
    },
    aiMotherLabel: {
      position: "absolute",
      right: 76,
      bottom: Platform.OS === "web" ? 34 + 84 + 96 : insets.bottom + 70 + 96,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    aiMotherLabelText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    timerBtn: {
      position: "absolute",
      left: 20,
      bottom: Platform.OS === "web" ? 34 + 84 + 16 : insets.bottom + 70 + 16,
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.card,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    completedSection: { marginTop: 8 },
  });

  const PERIOD_ICONS: Record<PeriodOption, string> = {
    daily: "sun",
    weekly: "calendar",
    monthly: "layers",
    yearly: "trending-up",
  };

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.periodBtn}
            onPress={() => setShowPeriodPicker(!showPeriodPicker)}
          >
            <Text style={styles.periodLabel}>{PERIOD_LABELS[selectedPeriod]}</Text>
            <Feather name="chevron-down" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.statsText}>
          <Text style={styles.statsHighlight}>{completedCount}</Text>
          {` ${t("of")} `}
          <Text style={styles.statsHighlight}>{totalCount}</Text>
          {` ${t("tasksCompleted")}`}
        </Text>
      </View>

      {showPeriodPicker && (
        <View style={styles.periodModal}>
          {(Object.keys(PERIOD_ICONS) as PeriodOption[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                {
                  backgroundColor:
                    selectedPeriod === period
                      ? colors.primary + "18"
                      : "transparent",
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedPeriod(period);
                setShowPeriodPicker(false);
              }}
            >
              <Feather
                name={PERIOD_ICONS[period] as any}
                size={16}
                color={
                  selectedPeriod === period
                    ? colors.primary
                    : colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.periodOptionText,
                  {
                    color:
                      selectedPeriod === period
                        ? colors.primary
                        : colors.foreground,
                    fontWeight: selectedPeriod === period ? "700" : "500",
                  },
                ]}
              >
                {PERIOD_LABELS[period]}
              </Text>
              {selectedPeriod === period && (
                <Feather name="check" size={14} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.quoteCard}>
        <Text style={styles.quoteLabel}>{t("dailyMotivation")}</Text>
        <Text style={styles.quoteText}>"{dailyQuote.quote}"</Text>
        <Text style={styles.quoteAuthor}>— {dailyQuote.author}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesRow}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {[{ id: "all", name: t("all"), color: colors.primary, icon: "grid" }, ...categories].map(
          (cat: Category | { id: string; name: string; color: string; icon: string }) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === cat.id ? cat.color + "18" : "transparent",
                  borderColor:
                    selectedCategory === cat.id ? cat.color : colors.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Feather
                name={cat.icon as any}
                size={13}
                color={
                  selectedCategory === cat.id ? cat.color : colors.mutedForeground
                }
              />
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color:
                      selectedCategory === cat.id
                        ? cat.color
                        : colors.mutedForeground,
                  },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          )
        )}
      </ScrollView>

      {pendingTasks.length > 0 && (
        <Text style={styles.sectionTitle}>{t("inProgress")}</Text>
      )}
    </>
  );

  const renderListFooter = () => (
    <>
      {completedTasks.length > 0 && (
        <View style={styles.completedSection}>
          <Text style={styles.sectionTitle}>{t("completed")}</Text>
          {completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </View>
      )}
      {filteredTasks.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="check-square" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>{t("noTasks")}</Text>
          <Text style={styles.emptyText}>{t("addFirst")}</Text>
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={pendingTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard task={item} />}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.timerBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowTimer(true);
        }}
      >
        <Feather name="clock" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <View style={styles.aiMotherLabel}>
        <Text style={styles.aiMotherLabelText}>DWAY AI</Text>
      </View>
      <TouchableOpacity
        style={styles.aiMotherBtn}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setShowAiMother(true);
        }}
      >
        <Feather name="cpu" size={22} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowAddTask(true);
        }}
      >
        <Feather name="plus" size={26} color="#fff" />
      </TouchableOpacity>

      <AddTaskModal visible={showAddTask} onClose={() => setShowAddTask(false)} />
      <DwayAiModal visible={showAiMother} onClose={() => setShowAiMother(false)} />
      <TimerModal visible={showTimer} onClose={() => setShowTimer(false)} />
    </View>
  );
}
