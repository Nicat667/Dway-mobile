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
  { value: "medium" as const, label: "Medium", color: "#f59e0b" },
  { value: "high" as const, label: "High", color: "#ef4444" },
];

const CATEGORY_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899",
  "#10b981", "#8b5cf6", "#f97316", "#06b6d4", "#94a3b8",
];

export default function AddTaskModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, addTask, addCategory } = useApp();

  const visibleCategories = categories.filter((c: Category) => c.id !== "other");

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(visibleCategories[0]?.id ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
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
    setSelectedCategory(visibleCategories[0]?.id ?? "");
    setPriority("medium");
    setAlarmEnabled(false);
    setAlarmTime(new Date());
    setNotes("");
    setShowAddCategory(false);
    setNewCategoryName("");
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory({ name: newCategoryName.trim(), color: newCategoryColor, icon: "tag", isCustom: true });
    setShowAddCategory(false);
    setNewCategoryName("");
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    container: {
      backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingTop: 12, paddingBottom: insets.bottom + 16, maxHeight: "92%",
    },
    handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 24 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    content: { paddingHorizontal: 20 },
    label: {
      fontSize: 12, fontWeight: "700", color: colors.mutedForeground,
      marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Inter_700Bold",
    },
    titleRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.muted, borderRadius: 14, paddingHorizontal: 14, marginBottom: 20,
    },
    titleInput: { flex: 1, fontSize: 16, color: colors.foreground, paddingVertical: 14, fontFamily: "Inter_400Regular" },
    alarmIconBtn: { padding: 6 },
    alarmRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
      backgroundColor: colors.muted, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 12,
    },
    alarmRowLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    alarmLabel: { fontSize: 15, color: colors.foreground, fontFamily: "Inter_500Medium" },
    alarmTimeBtn: {
      backgroundColor: colors.primary + "20", borderRadius: 10,
      paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, alignItems: "center",
    },
    alarmTimeText: { color: colors.primary, fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
    categoriesSection: { marginBottom: 20 },
    categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    categoryChip: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1.5, gap: 5,
    },
    categoryChipText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    addCatTrigger: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.border, gap: 5,
    },
    addCatTriggerText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" },
    addCategorySection: {
      backgroundColor: colors.muted, borderRadius: 14, padding: 16, marginTop: 12,
    },
    addCatHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    addCatTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    addCategoryInput: {
      backgroundColor: colors.card, borderRadius: 10,
      paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 15, color: colors.foreground, marginBottom: 12, fontFamily: "Inter_400Regular",
    },
    colorPickerLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 8 },
    colorPicker: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 },
    colorDot: { width: 30, height: 30, borderRadius: 15, borderWidth: 3 },
    addCatBtn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
    addCatBtnText: { color: "#fff", fontWeight: "700", fontFamily: "Inter_700Bold", fontSize: 14 },
    priorityRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
    priorityBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", borderWidth: 2 },
    priorityText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
    notesInput: {
      backgroundColor: colors.muted, borderRadius: 14,
      paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 15, color: colors.foreground, minHeight: 80,
      marginBottom: 24, fontFamily: "Inter_400Regular", textAlignVertical: "top",
    },
    submitBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
    submitText: { color: "#ffffff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.overlay} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={s.container}>
            <View style={s.handle} />
            <View style={s.header}>
              <Text style={s.headerTitle}>New Task</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
              <Text style={s.label}>Task Title</Text>
              <View style={s.titleRow}>
                <TextInput
                  style={s.titleInput}
                  placeholder="What do you need to do?"
                  placeholderTextColor={colors.mutedForeground}
                  value={title}
                  onChangeText={setTitle}
                  autoFocus
                />
                <TouchableOpacity style={s.alarmIconBtn} onPress={() => setAlarmEnabled(!alarmEnabled)}>
                  <Feather name="clock" size={20} color={alarmEnabled ? colors.primary : colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {alarmEnabled && (
                <>
                  <View style={s.alarmRow}>
                    <View style={s.alarmRowLeft}>
                      <Feather name="bell" size={18} color={colors.primary} />
                      <Text style={s.alarmLabel}>Alarm Reminder</Text>
                    </View>
                    <Switch
                      value={alarmEnabled}
                      onValueChange={setAlarmEnabled}
                      trackColor={{ true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                  <TouchableOpacity style={s.alarmTimeBtn} onPress={() => setShowTimePicker(true)}>
                    <Text style={s.alarmTimeText}>Set time: {formatTime(alarmTime)}</Text>
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

              <Text style={s.label}>Category</Text>
              <View style={s.categoriesSection}>
                <View style={s.categoryRow}>
                  {visibleCategories.map((cat: Category) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          s.categoryChip,
                          {
                            backgroundColor: isSelected ? cat.color + "20" : "transparent",
                            borderColor: isSelected ? cat.color : colors.border,
                          },
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Feather
                          name={cat.icon as any}
                          size={13}
                          color={isSelected ? cat.color : colors.mutedForeground}
                        />
                        <Text style={[s.categoryChipText, { color: isSelected ? cat.color : colors.mutedForeground }]}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity
                    style={s.addCatTrigger}
                    onPress={() => setShowAddCategory(!showAddCategory)}
                  >
                    <Feather name="plus" size={13} color={colors.mutedForeground} />
                    <Text style={s.addCatTriggerText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {showAddCategory && (
                  <View style={s.addCategorySection}>
                    <View style={s.addCatHeader}>
                      <Text style={s.addCatTitle}>New Category</Text>
                      <TouchableOpacity onPress={() => setShowAddCategory(false)}>
                        <Feather name="x" size={18} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      style={s.addCategoryInput}
                      placeholder="Category name"
                      placeholderTextColor={colors.mutedForeground}
                      value={newCategoryName}
                      onChangeText={setNewCategoryName}
                      autoFocus
                    />
                    <Text style={s.colorPickerLabel}>Pick a color</Text>
                    <View style={s.colorPicker}>
                      {CATEGORY_COLORS.map((c) => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            s.colorDot,
                            {
                              backgroundColor: c,
                              borderColor: newCategoryColor === c ? colors.foreground : "transparent",
                            },
                          ]}
                          onPress={() => setNewCategoryColor(c)}
                        />
                      ))}
                    </View>
                    <TouchableOpacity style={s.addCatBtn} onPress={handleAddCategory}>
                      <Text style={s.addCatBtnText}>Add Category</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Text style={s.label}>Priority</Text>
              <View style={s.priorityRow}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = priority === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        s.priorityBtn,
                        {
                          backgroundColor: isSelected ? opt.color + "20" : "transparent",
                          borderColor: isSelected ? opt.color : colors.border,
                        },
                      ]}
                      onPress={() => setPriority(opt.value)}
                    >
                      <Text style={[s.priorityText, { color: isSelected ? opt.color : colors.mutedForeground }]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={s.label}>Notes (optional)</Text>
              <TextInput
                style={s.notesInput}
                placeholder="Add notes..."
                placeholderTextColor={colors.mutedForeground}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
                <Text style={s.submitText}>Add Task</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
