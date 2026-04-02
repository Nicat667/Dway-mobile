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
import AiMotherModal from "@/components/AiMotherModal";
import TaskCard from "@/components/TaskCard";
import TimerModal from "@/components/TimerModal";
import { Category, Task, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type PeriodOption = "daily" | "weekly" | "monthly" | "yearly" | "custom";

const PERIOD_LABELS: Record<PeriodOption, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
  custom: "Custom",
};

export default function PlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, categories } = useApp();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>("daily");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAiMother, setShowAiMother] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

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

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop:
        Platform.OS === "web"
          ? insets.top + 67
          : insets.top + 16,
      paddingBottom: 16,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    periodBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    periodLabel: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    chevron: {
      marginTop: 4,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
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
      zIndex: 100,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 10,
    },
    periodOption: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    periodOptionText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
    },
    categoriesRow: {
      paddingHorizontal: 20,
      marginBottom: 16,
    },
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
      paddingBottom:
        Platform.OS === "web"
          ? 140
          : insets.bottom + 100,
    },
    emptyState: {
      alignItems: "center",
      paddingTop: 60,
      paddingHorizontal: 40,
    },
    emptyIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
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
      bottom:
        Platform.OS === "web"
          ? 34 + 84 + 16
          : insets.bottom + 70 + 16,
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
      bottom:
        Platform.OS === "web"
          ? 34 + 84 + 80
          : insets.bottom + 70 + 80,
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
      bottom:
        Platform.OS === "web"
          ? 34 + 84 + 93
          : insets.bottom + 70 + 93,
      backgroundColor: colors.card,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
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
      bottom:
        Platform.OS === "web"
          ? 34 + 84 + 16
          : insets.bottom + 70 + 16,
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
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 12,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    completedSection: {
      marginTop: 8,
    },
  });

  const pendingTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const renderListHeader = () => (
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.periodBtn}
            onPress={() => setShowPeriodPicker(!showPeriodPicker)}
          >
            <Text style={styles.periodLabel}>
              {PERIOD_LABELS[selectedPeriod]}
            </Text>
            <Feather
              name="chevron-down"
              size={20}
              color={colors.foreground}
              style={styles.chevron}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>
            <Text style={styles.statsHighlight}>{completedCount}</Text> of{" "}
            <Text style={styles.statsHighlight}>{totalCount}</Text> tasks done
          </Text>
        </View>
      </View>

      {showPeriodPicker && (
        <View style={styles.periodModal}>
          {(Object.keys(PERIOD_LABELS) as PeriodOption[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodOption,
                {
                  backgroundColor:
                    selectedPeriod === period ? colors.primary + "18" : "transparent",
                },
              ]}
              onPress={() => {
                setSelectedPeriod(period);
                setShowPeriodPicker(false);
              }}
            >
              <Feather
                name={
                  period === "daily"
                    ? "sun"
                    : period === "weekly"
                    ? "calendar"
                    : period === "monthly"
                    ? "layers"
                    : period === "yearly"
                    ? "trending-up"
                    : "plus"
                }
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
                    fontWeight: selectedPeriod === period ? "700" : "400",
                  },
                ]}
              >
                {PERIOD_LABELS[period]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesRow}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                selectedCategory === "all" ? colors.primary + "18" : "transparent",
              borderColor:
                selectedCategory === "all" ? colors.primary : colors.border,
            },
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Feather
            name="grid"
            size={13}
            color={selectedCategory === "all" ? colors.primary : colors.mutedForeground}
          />
          <Text
            style={[
              styles.categoryChipText,
              {
                color:
                  selectedCategory === "all"
                    ? colors.primary
                    : colors.mutedForeground,
              },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((cat: Category) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === cat.id
                    ? cat.color + "18"
                    : "transparent",
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
        ))}
      </ScrollView>

      {pendingTasks.length > 0 && (
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={styles.sectionTitle}>In Progress</Text>
        </View>
      )}
    </>
  );

  const renderListFooter = () => (
    <>
      {completedTasks.length > 0 && (
        <View style={[styles.completedSection, { paddingHorizontal: 20 }]}>
          <Text style={styles.sectionTitle}>Completed</Text>
          {completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </View>
      )}
      {filteredTasks.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Feather name="check-square" size={26} color={colors.mutedForeground} />
          </View>
          <Text style={styles.emptyTitle}>No tasks yet</Text>
          <Text style={styles.emptyText}>
            Tap the + button to add your first task for {PERIOD_LABELS[selectedPeriod].toLowerCase()}
          </Text>
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
        <Text style={styles.aiMotherLabelText}>AI Mother</Text>
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
      <AiMotherModal visible={showAiMother} onClose={() => setShowAiMother(false)} />
      <TimerModal visible={showTimer} onClose={() => setShowTimer(false)} />
    </View>
  );
}
