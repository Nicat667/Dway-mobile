import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ProgressCircle from "@/components/ProgressCircle";
import { ProgressPeriod, useApp } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

type Period = ProgressPeriod;

function generateInsights(
  period: Period,
  percentage: number,
  byCategory: Array<{ categoryId: string; total: number; completed: number; percentage: number }>,
  categories: Array<{ id: string; name: string; color: string }>
): string[] {
  const messages: string[] = [];
  const periodLabel = period === "weekly" ? "week" : period === "monthly" ? "month" : "year";

  const activeCats = byCategory.filter((c) => c.total > 0);
  if (activeCats.length === 0) {
    return [
      `Start adding tasks to see your ${periodLabel}ly insights!`,
      "Track your goals across different categories for personalized AI analysis.",
      "Consistency is key — even one task a day makes a big difference over time.",
    ];
  }

  const topCat = activeCats.sort((a, b) => b.percentage - a.percentage)[0];
  const bottomCat = activeCats.sort((a, b) => a.percentage - b.percentage)[0];
  const topCatName = categories.find((c) => c.id === topCat?.categoryId)?.name ?? "Unknown";
  const bottomCatName = categories.find((c) => c.id === bottomCat?.categoryId)?.name ?? "Unknown";

  if (percentage >= 80) {
    messages.push(
      `Outstanding! This ${periodLabel} you completed ${percentage}% of your tasks — you're in the top tier of productivity. Keep this momentum going!`
    );
  } else if (percentage >= 50) {
    messages.push(
      `Good progress this ${periodLabel}! With ${percentage}% completion, you're moving in the right direction. Push for 80%+ next ${periodLabel}!`
    );
  } else if (percentage > 0) {
    messages.push(
      `You've completed ${percentage}% of your tasks this ${periodLabel}. Every step counts — let's pick up the pace and aim higher!`
    );
  } else {
    messages.push(
      `This ${periodLabel} is just getting started! Set some tasks and start building your productivity streak.`
    );
  }

  if (topCat && topCat.percentage > 0 && topCat.categoryId !== bottomCat?.categoryId) {
    messages.push(
      `You're crushing ${topCatName} with ${topCat.percentage}% completion this ${periodLabel}! This is your strongest category — great discipline here.`
    );
  } else {
    messages.push(
      `Your most consistent area this ${periodLabel} shows real commitment. Use that momentum to build into other categories too!`
    );
  }

  if (bottomCat && bottomCat.total > 0 && bottomCat.percentage < 50) {
    messages.push(
      `${bottomCatName} needs your attention! At ${bottomCat.percentage}% completion this ${periodLabel}, it's falling behind. Focus here for balanced growth.`
    );
  } else {
    messages.push(
      `To level up, try setting stricter deadlines for your lower-priority tasks. Time-boxing helps you stay accountable and avoid procrastination.`
    );
  }

  return messages.slice(0, 3);
}

export default function ProgressScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { getTaskStats, categories } = useApp();
  const { t } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("weekly");

  const PERIODS: { key: Period; label: string; icon: string }[] = [
    { key: "weekly", label: t("weekly"), icon: "calendar" },
    { key: "monthly", label: t("monthly"), icon: "layers" },
    { key: "yearly", label: t("yearly"), icon: "trending-up" },
  ];

  const stats = getTaskStats(selectedPeriod);
  const insights = generateInsights(selectedPeriod, stats.percentage, stats.byCategory, categories);

  const activeCategoryStats = stats.byCategory
    .filter((cat) => cat.total > 0)
    .sort((a, b) => b.percentage - a.percentage);

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
      paddingBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 4,
    },
    periodSelector: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 24,
      backgroundColor: colors.muted,
      borderRadius: 14,
      padding: 4,
    },
    periodBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      borderRadius: 12,
      gap: 6,
    },
    periodBtnText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    mainCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 24,
      alignItems: "center",
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    mainCircleLabel: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 16,
    },
    mainStats: {
      flexDirection: "row",
      gap: 24,
      marginTop: 16,
    },
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      alignSelf: "stretch",
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginBottom: 16,
    },
    categoriesSection: {
      marginHorizontal: 20,
      marginBottom: 24,
    },
    categoryRow: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    categoryColorDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    categoryInfo: {
      flex: 1,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 4,
    },
    progressBarBg: {
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.muted,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: 3,
    },
    categoryPercentage: {
      fontSize: 13,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    insightsSection: {
      marginHorizontal: 20,
      marginBottom: 24,
    },
    insightCard: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    insightIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
    },
    insightText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 21,
      fontFamily: "Inter_400Regular",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 40,
    },
    emptyText: {
      fontSize: 15,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      paddingHorizontal: 20,
      lineHeight: 22,
    },
    circlesRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginBottom: 20,
      gap: 10,
    },
    circleCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
  });

  const insightColors = [
    { bg: colors.success + "18", icon: colors.success, name: "trending-up" },
    { bg: colors.primary + "18", icon: colors.primary, name: "star" },
    { bg: colors.warning + "18", icon: colors.warning, name: "alert-circle" },
  ] as const;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "web" ? 34 + 84 + 24 : insets.bottom + 90,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t("progress")}</Text>
        <Text style={styles.subtitle}>{t("progressSubtitle")}</Text>
      </View>

      <View style={styles.periodSelector}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodBtn,
              {
                backgroundColor:
                  selectedPeriod === p.key ? colors.card : "transparent",
              },
            ]}
            onPress={() => setSelectedPeriod(p.key)}
          >
            <Feather
              name={p.icon as any}
              size={14}
              color={
                selectedPeriod === p.key ? colors.primary : colors.mutedForeground
              }
            />
            <Text
              style={[
                styles.periodBtnText,
                {
                  color:
                    selectedPeriod === p.key
                      ? colors.primary
                      : colors.mutedForeground,
                },
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.mainCard}>
        <ProgressCircle
          percentage={stats.percentage}
          size={140}
          strokeWidth={14}
          color={colors.primary}
        />
        <Text style={styles.mainCircleLabel}>
          {t("overallCompletion")}
        </Text>
        <View style={styles.mainStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>{t("done")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total - stats.completed}</Text>
            <Text style={styles.statLabel}>{t("remaining")}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>{t("total")}</Text>
          </View>
        </View>

      </View>

      {activeCategoryStats.length > 0 && (
        <View style={styles.circlesRow}>
          {activeCategoryStats.slice(0, 3).map((catStat) => {
            const cat = categories.find((c) => c.id === catStat.categoryId);
            if (!cat) return null;
            return (
              <View key={catStat.categoryId} style={styles.circleCard}>
                <ProgressCircle
                  percentage={catStat.percentage}
                  size={72}
                  strokeWidth={7}
                  color={cat.color}
                  label={cat.name}
                  sublabel={`${catStat.completed}/${catStat.total}`}
                />
              </View>
            );
          })}
        </View>
      )}

      {activeCategoryStats.length > 0 ? (
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>{t("byCategory")}</Text>
          {activeCategoryStats.map((catStat) => {
            const cat = categories.find((c) => c.id === catStat.categoryId);
            if (!cat) return null;
            return (
              <View key={catStat.categoryId} style={styles.categoryRow}>
                <View
                  style={[styles.categoryColorDot, { backgroundColor: cat.color }]}
                />
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${catStat.percentage}%`,
                          backgroundColor: cat.color,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.categoryPercentage, { color: cat.color }]}>
                  {catStat.percentage}%
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t("noTaskData")}</Text>
        </View>
      )}

      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>{t("aiInsights")}</Text>
        {insights.map((insight, i) => {
          const ic = insightColors[i % insightColors.length];
          return (
            <View key={i} style={[styles.insightCard, { backgroundColor: ic.bg }]}>
              <View style={[styles.insightIcon, { backgroundColor: ic.icon + "28" }]}>
                <Feather name={ic.name as any} size={16} color={ic.icon} />
              </View>
              <Text style={[styles.insightText, { color: colors.foreground }]}>
                {insight}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
