import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Task, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  task: Task;
  onPress?: () => void;
};

const PRIORITY_COLORS = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export default function TaskCard({ task, onPress }: Props) {
  const colors = useColors();
  const { toggleTask, deleteTask, categories } = useApp();
  const category = categories.find((c) => c.id === task.categoryId);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTask(task.id);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteTask(task.id);
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "flex-start",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      marginTop: 1,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: "Inter_500Medium",
      marginBottom: 6,
    },
    meta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    categoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    priorityDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    alarmBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    alarmText: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
    },
    deleteBtn: {
      padding: 4,
      marginLeft: 8,
    },
  });

  const priorityColor = PRIORITY_COLORS[task.priority];
  const alarmTime = task.alarmTime
    ? new Date(task.alarmTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          {
            borderColor: task.completed ? colors.primary : colors.border,
            backgroundColor: task.completed ? colors.primary : "transparent",
          },
        ]}
        onPress={handleToggle}
      >
        {task.completed && <Feather name="check" size={14} color="#fff" />}
      </TouchableOpacity>

      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            {
              color: task.completed ? colors.mutedForeground : colors.foreground,
              textDecorationLine: task.completed ? "line-through" : "none",
            },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.meta}>
          {category && (
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: category.color + "18" },
              ]}
            >
              <Feather name={category.icon as any} size={10} color={category.color} />
              <Text style={[styles.categoryText, { color: category.color }]}>
                {category.name}
              </Text>
            </View>
          )}
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          {task.alarmEnabled && alarmTime && (
            <View style={styles.alarmBadge}>
              <Feather name="clock" size={11} color={colors.mutedForeground} />
              <Text style={[styles.alarmText, { color: colors.mutedForeground }]}>
                {alarmTime}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Feather name="trash-2" size={16} color={colors.mutedForeground} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
