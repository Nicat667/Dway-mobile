import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
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

type Props = { visible: boolean; onClose: () => void };

const PRIORITY_OPTIONS = [
  { value: "low" as const, label: "Low", color: "#22c55e" },
  { value: "medium" as const, label: "Medium", color: "#f59e0b" },
  { value: "high" as const, label: "High", color: "#ef4444" },
];

const CATEGORY_COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ec4899",
  "#10b981", "#8b5cf6", "#f97316", "#06b6d4", "#94a3b8",
];

const ITEM_H = 44;
const VISIBLE = 3;
const CENTER = Math.floor(VISIBLE / 2); // = 1

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

/* ─── Wheel Drum Picker ─── */
function WheelDrum({
  data,
  value,
  onChange,
  formatItem,
  primaryColor,
  foreground,
  muted,
  border,
  card,
}: {
  data: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem?: (v: number) => string;
  primaryColor: string;
  foreground: string;
  muted: string;
  border: string;
  card: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [liveIdx, setLiveIdx] = useState(data.indexOf(value));

  useEffect(() => {
    const idx = data.indexOf(value);
    setLiveIdx(idx);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: false });
    }, 60);
  }, []);

  const commitIdx = (offsetY: number) => {
    const idx = Math.round(offsetY / ITEM_H);
    const clamped = Math.max(0, Math.min(data.length - 1, idx));
    setLiveIdx(clamped);
    onChange(data[clamped]);
  };

  const trackIdx = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    setLiveIdx(Math.max(0, Math.min(data.length - 1, idx)));
  };

  return (
    <View style={{ width: 80, height: ITEM_H * VISIBLE, overflow: "hidden" }}>
      {/* iPhone-style selection band lines */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: ITEM_H * CENTER,
          left: 4, right: 4,
          height: ITEM_H,
          borderTopWidth: 1.5,
          borderBottomWidth: 1.5,
          borderColor: border,
          borderRadius: 4,
          zIndex: 10,
        }}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: ITEM_H * CENTER }}
        onScroll={trackIdx}
        onMomentumScrollEnd={(e) => commitIdx(e.nativeEvent.contentOffset.y)}
        onScrollEndDrag={(e) => commitIdx(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={8}
      >
        {data.map((item, idx) => {
          const dist = Math.abs(idx - liveIdx);
          const isSelected = dist === 0;
          const opacity = isSelected ? 1 : dist === 1 ? 0.5 : 0.2;
          return (
            <View key={item} style={{ height: ITEM_H, alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  fontSize: isSelected ? 28 : 20,
                  fontWeight: isSelected ? "700" : "400",
                  color: isSelected ? foreground : muted,
                  fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
                  opacity,
                }}
              >
                {formatItem ? formatItem(item) : String(item)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

/* ─── Main Modal ─── */
export default function AddTaskModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { categories, addTask, addCategory } = useApp();

  const visibleCategories = categories.filter((c: Category) => c.id !== "other");

  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(visibleCategories[0]?.id ?? "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [alarmEnabled, setAlarmEnabled] = useState(false);
  const [alarmHour, setAlarmHour] = useState(9);
  const [alarmMinute, setAlarmMinute] = useState(0);
  const [notes, setNotes] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);

  const getAlarmDate = () => {
    const d = new Date();
    d.setHours(alarmHour, alarmMinute, 0, 0);
    return d;
  };

  const handleSubmit = () => {
    if (!title.trim()) { Alert.alert("Please enter a task title"); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addTask({
      title: title.trim(),
      categoryId: selectedCategory,
      completed: false,
      priority,
      alarmEnabled,
      alarmTime: alarmEnabled ? getAlarmDate().toISOString() : undefined,
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
    setAlarmHour(9);
    setAlarmMinute(0);
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
    titleInput: {
      backgroundColor: colors.muted, borderRadius: 14, paddingHorizontal: 14,
      paddingVertical: 14, fontSize: 16, color: colors.foreground,
      fontFamily: "Inter_400Regular", marginBottom: 12,
    },
    // ── iPhone-style alarm toggle row ──
    alarmToggleRow: {
      flexDirection: "row", alignItems: "center",
      backgroundColor: colors.muted, borderRadius: 14,
      paddingHorizontal: 16, paddingVertical: 14,
      marginBottom: 12,
    },
    alarmToggleLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    alarmIconCircle: {
      width: 32, height: 32, borderRadius: 9,
      backgroundColor: "#ef4444",
      alignItems: "center", justifyContent: "center",
    },
    alarmToggleLabel: { fontSize: 16, color: colors.foreground, fontFamily: "Inter_500Medium" },
    alarmToggleTime: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    // ── Alarm picker panel ──
    alarmPickerPanel: {
      backgroundColor: colors.muted,
      borderRadius: 16, marginBottom: 20,
      overflow: "hidden",
    },
    drumRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      gap: 0, paddingVertical: 10,
    },
    drumWrap: { alignItems: "center" },
    drumLabel: {
      fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular",
      marginTop: 4, textAlign: "center",
    },
    drumColon: {
      fontSize: 36, fontWeight: "700", color: colors.mutedForeground,
      fontFamily: "Inter_700Bold", paddingBottom: 12, paddingHorizontal: 6,
    },
    // categories
    categoriesSection: { marginBottom: 20 },
    categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    categoryChip: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, gap: 5,
    },
    categoryChipText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    addCatTrigger: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.border, gap: 5,
    },
    addCatTriggerText: { fontSize: 13, fontWeight: "600", color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" },
    addCategorySection: { backgroundColor: colors.muted, borderRadius: 14, padding: 16, marginTop: 12 },
    addCatHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    addCatTitle: { fontSize: 14, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    addCategoryInput: {
      backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
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
      backgroundColor: colors.muted, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 15, color: colors.foreground, minHeight: 80, marginBottom: 24,
      fontFamily: "Inter_400Regular", textAlignVertical: "top",
    },
    submitBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
    submitText: { color: "#ffffff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  });

  const hourStr = alarmHour.toString().padStart(2, "0");
  const minStr = alarmMinute.toString().padStart(2, "0");

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
          <View style={s.container}>
            <View style={s.handle} />
            <View style={s.header}>
              <Text style={s.headerTitle}>New Task</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>

              {/* ── Title ── */}
              <Text style={s.label}>Task Title</Text>
              <TextInput
                style={s.titleInput}
                placeholder="What do you need to do?"
                placeholderTextColor={colors.mutedForeground}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />

              {/* ── Alarm toggle row (iPhone-style) ── */}
              <View style={s.alarmToggleRow}>
                <View style={s.alarmToggleLeft}>
                  <View style={s.alarmIconCircle}>
                    <Feather name="bell" size={16} color="#fff" />
                  </View>
                  <View>
                    <Text style={s.alarmToggleLabel}>Alarm Reminder</Text>
                    {alarmEnabled && (
                      <Text style={s.alarmToggleTime}>{hourStr}:{minStr}</Text>
                    )}
                  </View>
                </View>
                <Switch
                  value={alarmEnabled}
                  onValueChange={(v) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAlarmEnabled(v);
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {/* ── Alarm drum picker ── */}
              {alarmEnabled && (
                <View style={s.alarmPickerPanel}>
                  <View style={s.drumRow}>
                    <View style={s.drumWrap}>
                      <WheelDrum
                        data={HOURS}
                        value={alarmHour}
                        onChange={setAlarmHour}
                        formatItem={(v) => v.toString().padStart(2, "0")}
                        primaryColor={colors.primary}
                        foreground={colors.foreground}
                        muted={colors.mutedForeground}
                        border={colors.border}
                        card={colors.card}
                      />
                      <Text style={s.drumLabel}>Hour</Text>
                    </View>

                    <Text style={s.drumColon}>:</Text>

                    <View style={s.drumWrap}>
                      <WheelDrum
                        data={MINUTES}
                        value={alarmMinute}
                        onChange={setAlarmMinute}
                        formatItem={(v) => v.toString().padStart(2, "0")}
                        primaryColor={colors.primary}
                        foreground={colors.foreground}
                        muted={colors.mutedForeground}
                        border={colors.border}
                        card={colors.card}
                      />
                      <Text style={s.drumLabel}>Minute</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* ── Category ── */}
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
                          { backgroundColor: isSelected ? cat.color + "20" : "transparent", borderColor: isSelected ? cat.color : colors.border },
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                      >
                        <Feather name={cat.icon as any} size={13} color={isSelected ? cat.color : colors.mutedForeground} />
                        <Text style={[s.categoryChipText, { color: isSelected ? cat.color : colors.mutedForeground }]}>{cat.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  <TouchableOpacity style={s.addCatTrigger} onPress={() => setShowAddCategory(!showAddCategory)}>
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
                    />
                    <Text style={s.colorPickerLabel}>Pick a color</Text>
                    <View style={s.colorPicker}>
                      {CATEGORY_COLORS.map((c) => (
                        <TouchableOpacity
                          key={c}
                          style={[s.colorDot, { backgroundColor: c, borderColor: newCategoryColor === c ? colors.foreground : "transparent" }]}
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

              {/* ── Priority ── */}
              <Text style={s.label}>Priority</Text>
              <View style={s.priorityRow}>
                {PRIORITY_OPTIONS.map((opt) => {
                  const isSelected = priority === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        s.priorityBtn,
                        { backgroundColor: isSelected ? opt.color + "20" : "transparent", borderColor: isSelected ? opt.color : colors.border },
                      ]}
                      onPress={() => setPriority(opt.value)}
                    >
                      <Text style={[s.priorityText, { color: isSelected ? opt.color : colors.mutedForeground }]}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ── Notes ── */}
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
      </View>
    </Modal>
  );
}
