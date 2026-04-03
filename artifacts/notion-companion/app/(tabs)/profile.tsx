import { Feather } from "@expo/vector-icons";
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

import { AlarmSound, useApp } from "@/context/AppContext";
import { LANGUAGES, ThemeMode, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";

const ALARM_SOUNDS: { value: AlarmSound; label: string; description: string }[] = [
  { value: "default", label: "Default", description: "Standard alarm sound" },
  { value: "gentle", label: "Gentle", description: "Soft, gradual chime" },
  { value: "beep", label: "Beep", description: "Classic beep tone" },
  { value: "bell", label: "Bell", description: "Clear bell ring" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "smartphone" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, profileSettings, updateProfileSettings, joinedChallenges } = useApp();
  const { themeMode, language, setThemeMode, setLanguage, t } = useTheme();

  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profileSettings.name);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const weekTasks = tasks.filter((t) => {
    const d = new Date(t.createdAt);
    const week = new Date(); week.setDate(week.getDate() - 7);
    return d >= week;
  });
  const streakDays = Math.min(7, weekTasks.filter((t) => t.completed).length);

  const handleSaveName = () => {
    if (nameInput.trim()) updateProfileSettings({ name: nameInput.trim() });
    setEditingName(false);
  };

  const currentThemeLabel = THEME_OPTIONS.find((o) => o.value === themeMode)?.label ?? "System";
  const currentLangLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "English";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
      paddingBottom: 24,
      alignItems: "center",
    },
    avatarCircle: {
      width: 84, height: 84, borderRadius: 42,
      backgroundColor: colors.primary,
      alignItems: "center", justifyContent: "center", marginBottom: 14,
    },
    avatarText: { fontSize: 34, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
    name: { fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    editNameInput: {
      fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold",
      borderBottomWidth: 2, borderBottomColor: colors.primary, minWidth: 120, textAlign: "center",
    },
    memberSince: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    statsRow: { flexDirection: "row", marginHorizontal: 20, gap: 10, marginBottom: 24 },
    statCard: {
      flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16, alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    statValue: { fontSize: 24, fontWeight: "800", color: colors.foreground, fontFamily: "Inter_700Bold" },
    statLabel: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 3, textAlign: "center" },
    section: { marginHorizontal: 20, marginBottom: 20 },
    sectionTitle: {
      fontSize: 12, fontWeight: "700", color: colors.mutedForeground, fontFamily: "Inter_700Bold",
      marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.8,
    },
    settingCard: {
      backgroundColor: colors.card, borderRadius: 16, overflow: "hidden",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    settingRow: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    settingRowLast: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
    settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
    settingLabel: { flex: 1, fontSize: 15, color: colors.foreground, fontFamily: "Inter_500Medium" },
    settingValue: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    achievementRow: { flexDirection: "row", gap: 10 },
    achievementCard: {
      flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14, alignItems: "center",
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    },
    achievementIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    achievementTitle: { fontSize: 12, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContainer: {
      backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingTop: 12, paddingBottom: insets.bottom + 24,
    },
    modalHandle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", paddingHorizontal: 20, marginBottom: 16 },
    optionRow: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 20, paddingVertical: 14,
      borderBottomWidth: 1, borderBottomColor: colors.border,
    },
    optionLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground },
    optionDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    optionRowActive: { backgroundColor: colors.primary + "12" },
    themeOptionRow: {
      flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingVertical: 8,
    },
    themeOption: {
      flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 14,
      borderWidth: 2, gap: 8,
    },
    themeOptionText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  });

  const PickerModal = ({
    visible, onClose, title, children,
  }: { visible: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{title}</Text>
            {children}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 + 84 + 24 : insets.bottom + 90 }}
      >
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{profileSettings.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.nameRow}>
            {editingName ? (
              <TextInput
                style={styles.editNameInput}
                value={nameInput}
                onChangeText={setNameInput}
                onBlur={handleSaveName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
            ) : (
              <Text style={styles.name}>{profileSettings.name}</Text>
            )}
            <TouchableOpacity onPress={() => { setNameInput(profileSettings.name); setEditingName(true); }}>
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={styles.memberSince}>Member since April 2025</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#f59e0b" }]}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#22c55e" }]}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementRow}>
            {/* First Task */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: completedTasks >= 1 ? "#f59e0b20" : colors.muted }]}>
                <Feather name={completedTasks >= 1 ? "zap" : "lock"} size={20} color={completedTasks >= 1 ? "#f59e0b" : colors.mutedForeground} />
              </View>
              <Text style={[styles.achievementTitle, { color: completedTasks >= 1 ? colors.foreground : colors.mutedForeground }]}>
                First Task
              </Text>
            </View>
            {/* 10 Done */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: completedTasks >= 10 ? "#22c55e20" : colors.muted }]}>
                <Feather name={completedTasks >= 10 ? "award" : "lock"} size={20} color={completedTasks >= 10 ? "#22c55e" : colors.mutedForeground} />
              </View>
              <Text style={[styles.achievementTitle, { color: completedTasks >= 10 ? colors.foreground : colors.mutedForeground }]}>
                10 Done
              </Text>
            </View>
            {/* 20 Club */}
            <View style={styles.achievementCard}>
              <View style={[styles.achievementIcon, { backgroundColor: completedTasks >= 20 ? "#6366f120" : colors.muted }]}>
                <Feather name={completedTasks >= 20 ? "star" : "lock"} size={20} color={completedTasks >= 20 ? "#6366f1" : colors.mutedForeground} />
              </View>
              <Text style={[styles.achievementTitle, { color: completedTasks >= 20 ? colors.foreground : colors.mutedForeground }]}>
                20 Club
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Challenges</Text>
          <View style={styles.settingCard}>
            {joinedChallenges.size === 0 ? (
              <View style={{ paddingHorizontal: 16, paddingVertical: 18, alignItems: "center" }}>
                <Feather name="users" size={24} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                  No challenges joined yet.{"\n"}Visit Community to join one!
                </Text>
              </View>
            ) : (
              [
                { id: "c1", title: "7-Day Streak", icon: "zap", color: "#f59e0b" },
                { id: "c2", title: "100 Tasks Club", icon: "award", color: "#6366f1" },
                { id: "c3", title: "Category Master", icon: "grid", color: "#22c55e" },
                { id: "c4", title: "Early Bird", icon: "sun", color: "#f97316" },
              ]
                .filter((c) => joinedChallenges.has(c.id))
                .map((c, i, arr) => (
                  <View
                    key={c.id}
                    style={[
                      { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
                      i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={[styles.settingIcon, { backgroundColor: c.color + "20" }]}>
                      <Feather name={c.icon as any} size={18} color={c.color} />
                    </View>
                    <Text style={styles.settingLabel}>{c.title}</Text>
                    <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: c.color + "20" }}>
                      <Text style={{ fontSize: 11, fontWeight: "700", color: c.color, fontFamily: "Inter_700Bold" }}>Joined</Text>
                    </View>
                  </View>
                ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="bell" size={18} color={colors.primary} />
              </View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={profileSettings.notificationsEnabled}
                onValueChange={(v) => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  updateProfileSettings({ notificationsEnabled: v });
                }}
                trackColor={{ true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <TouchableOpacity style={styles.settingRowLast} onPress={() => setShowSoundPicker(true)}>
              <View style={[styles.settingIcon, { backgroundColor: "#f59e0b20" }]}>
                <Feather name="volume-2" size={18} color="#f59e0b" />
              </View>
              <Text style={styles.settingLabel}>Alarm Sound</Text>
              <Text style={styles.settingValue}>{ALARM_SOUNDS.find((s) => s.value === profileSettings.alarmSound)?.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowThemePicker(true)}>
              <View style={[styles.settingIcon, { backgroundColor: "#06b6d420" }]}>
                <Feather name={themeMode === "dark" ? "moon" : themeMode === "light" ? "sun" : "smartphone"} size={18} color="#06b6d4" />
              </View>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingValue}>{currentThemeLabel}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRowLast} onPress={() => setShowLanguagePicker(true)}>
              <View style={[styles.settingIcon, { backgroundColor: "#8b5cf620" }]}>
                <Feather name="globe" size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingValue}>{currentLangLabel}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partners</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 12 }}>
            Exclusive perks from our partners — just for using Notion Companion.
          </Text>
          {[
            {
              id: "p1",
              name: "Headspace",
              tagline: "Mindfulness & Focus",
              desc: "3 months of Headspace Plus free when you complete your first 30 tasks.",
              color: "#f97316",
              icon: "sun",
              badge: "3 Months Free",
            },
            {
              id: "p2",
              name: "Notion",
              tagline: "All-in-one workspace",
              desc: "Get 6 months of Notion Plus plan free and sync your tasks directly.",
              color: "#6366f1",
              icon: "book",
              badge: "6 Months Free",
            },
            {
              id: "p3",
              name: "Calm",
              tagline: "Sleep & Relaxation",
              desc: "Unlock 1-year Calm Premium access when you maintain a 7-day streak.",
              color: "#3b82f6",
              icon: "moon",
              badge: "1 Year Access",
            },
            {
              id: "p4",
              name: "Spotify",
              tagline: "Music & Podcasts",
              desc: "2 months of Spotify Premium for free to keep you focused while you work.",
              color: "#22c55e",
              icon: "music",
              badge: "2 Months Free",
            },
            {
              id: "p5",
              name: "Coursera",
              tagline: "Online Learning",
              desc: "30% off any Coursera course or specialization for active members.",
              color: "#06b6d4",
              icon: "award",
              badge: "30% Off",
            },
          ].map((partner, i, arr) => (
            <View
              key={partner.id}
              style={[
                styles.settingCard,
                { marginBottom: i < arr.length - 1 ? 10 : 0, overflow: "hidden" },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", padding: 16, gap: 12 }}>
                <View
                  style={[
                    styles.settingIcon,
                    { backgroundColor: partner.color + "20", width: 46, height: 46, borderRadius: 14 },
                  ]}
                >
                  <Feather name={partner.icon as any} size={20} color={partner.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" }}>
                      {partner.name}
                    </Text>
                    <View style={{ backgroundColor: partner.color + "18", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 10, fontWeight: "700", color: partner.color, fontFamily: "Inter_700Bold" }}>
                        {partner.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: partner.color, fontFamily: "Inter_500Medium", marginBottom: 6 }}>
                    {partner.tagline}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", lineHeight: 18 }}>
                    {partner.desc}
                  </Text>
                </View>
              </View>
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginHorizontal: 16 }} />
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 }}
                onPress={() =>
                  Alert.alert(partner.name, `Your exclusive offer: ${partner.desc}\n\nTap OK to visit the partner portal.`, [
                    { text: "Cancel", style: "cancel" },
                    { text: "View Offer", style: "default" },
                  ])
                }
              >
                <Feather name="external-link" size={14} color={partner.color} />
                <Text style={{ fontSize: 13, fontWeight: "700", color: partner.color, fontFamily: "Inter_700Bold" }}>
                  View Offer
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity
              style={styles.settingRowLast}
              onPress={() =>
                Alert.alert("Clear Data", "This will remove all your custom tasks. Are you sure?", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Clear", style: "destructive" },
                ])
              }
            >
              <View style={[styles.settingIcon, { backgroundColor: "#ef444420" }]}>
                <Feather name="trash-2" size={18} color="#ef4444" />
              </View>
              <Text style={[styles.settingLabel, { color: "#ef4444" }]}>Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Alarm Sound Picker */}
      <PickerModal visible={showSoundPicker} onClose={() => setShowSoundPicker(false)} title="Alarm Sound">
        {ALARM_SOUNDS.map((sound, i) => (
          <TouchableOpacity
            key={sound.value}
            style={[
              i < ALARM_SOUNDS.length - 1 ? styles.optionRow : { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
              profileSettings.alarmSound === sound.value && styles.optionRowActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              updateProfileSettings({ alarmSound: sound.value });
              setShowSoundPicker(false);
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>{sound.label}</Text>
              <Text style={styles.optionDesc}>{sound.description}</Text>
            </View>
            {profileSettings.alarmSound === sound.value && (
              <Feather name="check" size={18} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </PickerModal>

      {/* Theme Picker */}
      <PickerModal visible={showThemePicker} onClose={() => setShowThemePicker(false)} title="Choose Theme">
        <View style={styles.themeOptionRow}>
          {THEME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.themeOption,
                {
                  borderColor: themeMode === opt.value ? colors.primary : colors.border,
                  backgroundColor: themeMode === opt.value ? colors.primary + "14" : "transparent",
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setThemeMode(opt.value);
                setShowThemePicker(false);
              }}
            >
              <Feather
                name={opt.icon as any}
                size={22}
                color={themeMode === opt.value ? colors.primary : colors.mutedForeground}
              />
              <Text style={[styles.themeOptionText, { color: themeMode === opt.value ? colors.primary : colors.foreground }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </PickerModal>

      {/* Language Picker */}
      <PickerModal visible={showLanguagePicker} onClose={() => setShowLanguagePicker(false)} title="Choose Language">
        <ScrollView style={{ maxHeight: 400 }}>
          {LANGUAGES.map((lang, i) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                i < LANGUAGES.length - 1 ? styles.optionRow : { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
                language === lang.code && styles.optionRowActive,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setLanguage(lang.code);
                setShowLanguagePicker(false);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{lang.native}</Text>
                <Text style={styles.optionDesc}>{lang.label}</Text>
              </View>
              {language === lang.code && <Feather name="check" size={18} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PickerModal>
    </View>
  );
}
