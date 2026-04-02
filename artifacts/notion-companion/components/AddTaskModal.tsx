import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Category, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const PRIORITY_OPTIONS = [
  { value: "low" as const, label: "Low", color: "#22c55e" },
  { value: "medium" as const, label: "Med", color: "#f59e0b" },
  { value: "high" as const, label: "High", color: "#ef4444" },
];

export default function AddTaskModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, addTask, addCategory } = useApp();

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categories[0]?.id ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const CATEGORY_COLORS = [
    "#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899",
    "#10b981", "#8b5cf6", "#f97316", "#06b6d4", "#94a3b8",
  ];
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Please enter a task title");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addTask({
      title: title.trim(),
      categoryId: selectedCategory,
      completed: false,
      priority,
      alarmEnabled,
      alarmTime: alarmEnabled ? alarmTime.toISOString() : undefined,
      notes: notes.trim() || undefined,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle("");
    setSelectedCategory(categories[0]?.id ?? "");
    setPriority("medium");
    setAlarmEnabled(false);
    setAlarmTime(new Date());
    setNotes("");
    setShowAddCategory(false);
    setNewCategoryName("");
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      icon: "tag",
      isCustom: true,
    });
    setShowAddCategory(false);
    setNewCategoryName("");
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: insets.bottom + 16,
      maxHeight: "90%",
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    closeBtn: {
      padding: 4,
    },
    content: {
      paddingHorizontal: 20,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      fontFamily: "Inter_600SemiBold",
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 14,
      marginBottom: 20,
    },
    titleInput: {
      flex: 1,
      fontSize: 16,
      color: colors.foreground,
      paddingVertical: 14,
      fontFamily: "Inter_400Regular",
    },
    alarmIconBtn: {
      padding: 6,
    },
    categoriesScroll: {
      flexDirection: "row",
      marginBottom: 20,
    },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 2,
      gap: 6,
    },
    categoryChipText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    addCategoryChip: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      borderWidth: 2,
      borderStyle: "dashed",
      gap: 6,
    },
    priorityRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    priorityBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
      borderWidth: 2,
    },
    priorityText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    alarmRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 16,
    },
    alarmRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    alarmLabel: {
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },
    alarmTimeBtn: {
      backgroundColor: colors.primary + "20",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 16,
    },
    alarmTimeText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
      textAlign: "center",
    },
    notesInput: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
      minHeight: 80,
      marginBottom: 24,
      fontFamily: "Inter_400Regular",
    },
    submitBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    submitText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    addCategorySection: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
    },
    addCategoryInput: {
      backgroundColor: colors.card,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.foreground,
      marginBottom: 12,
      fontFamily: "Inter_400Regular",
    },
    colorPicker: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    colorDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
    },
    addCatBtn: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      alignItems: "center",
    },
    addCatBtnText: {
      color: "#fff",
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={styles.container}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.headerTitle}>New Task</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Task Title</Text>
              <View style={styles.titleRow}>
                <TextInput
                  style={styles.titleInput}
                  placeholder="What do you need to do?"
                  placeholderTextColor={colors.mutedForeground}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.alarmIconBtn}
                  onPress={() => setAlarmEnabled(!alarmEnabled)}
                >
                  <Feather
                    name="clock"
                    size={20}
                    color={alarmEnabled ? colors.primary : colors.mutedForeground}
                  />
                </TouchableOpacity>
              </View>

              {alarmEnabled && (
                <>
                  <View style={styles.alarmRow}>
                    <View style={styles.alarmRowLeft}>
                      <Feather name="bell" size={18} color={colors.primary} />
                      <Text style={styles.alarmLabel}>Alarm Reminder</Text>
                    </View>
                    <Switch
                      value={alarmEnabled}
                      onValueChange={setAlarmEnabled}
                      trackColor={{ true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.alarmTimeBtn}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.alarmTimeText}>
                      Set time: {formatTime(alarmTime)}
                    </Text>
                  </TouchableOpacity>
                  {showTimePicker && (
                    <DateTimePicker
                      value={alarmTime}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      onChange={(_, date) => {
                        setShowTimePicker(Platform.OS === "ios");
                        if (date) setAlarmTime(date);
                      }}
                    />
                  )}
                </>
              )}

              <Text style={styles.label}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20 }}
              >
                <View style={styles.categoriesScroll}>
                  {categories.map((cat: Category) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.categoryChip,
                          {
                            backgroundColor: isSelected ? cat.color + "20" : "transparent",
                            borderColor: isSelected ? cat.color : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Feather
                          name={cat.icon as any}
                          size={14}
                          color={isSelected ? cat.color : colors.mutedForeground}
                        />
                        <Text
                          style={[
                            styles.categoryChipText,
                            {
                              color: isSelected ? cat.color : colors.mutedForeground,
                            },
                          ]}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={[
                      styles.addCategoryChip,
                      { borderColor: colors.border },
                    ]}
                    onPress={() => setShowAddCategory(!showAddCategory)}
                  >
                    <Feather name="plus" size={14} color={colors.mutedForeground} />
                    <Text style={[styles.categoryChipText, { color: colors.mutedForeground }]}>
                      Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              {showAddCategory && (
                <View style={styles.addCategorySection}>
                  <TextInput
                    style={styles.addCategoryInput}
                    placeholder="Category name"
                    placeholderTextColor={colors.mutedForeground}
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                  />
                  <View style={styles.colorPicker}>
                    {CATEGORY_COLORS.map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor: c,
                            borderColor: newCategoryColor === c ? colors.foreground : "transparent",
                          },
                        ]}
                        onPress={() => setNewCategoryColor(c)}
                      />
                    ))}
                  </View>
                  <TouchableOpacity style={styles.addCatBtn} onPress={handleAddCategory}>
                    <Text style={styles.addCatBtnText}>Add Category</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.label}>Priority</Text>
              <View style={styles.priorityRow}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = priority === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.priorityBtn,
                        {
                          backgroundColor: isSelected ? opt.color + "20" : "transparent",
                          borderColor: isSelected ? opt.color : colors.border,
                        },
                      ]}
                      onPress={() => setPriority(opt.value)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          { color: isSelected ? opt.color : colors.mutedForeground },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.label}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes..."
                placeholderTextColor={colors.mutedForeground}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Add Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
