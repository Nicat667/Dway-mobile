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
  useWindowDimensions,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlarmSound, useApp } from "@/context/AppContext";
import { LANGUAGE_LOCALIZED_NAMES, LANGUAGES, ThemeMode, useTheme } from "@/context/ThemeContext";
import { useColors } from "@/hooks/useColors";
import { CHALLENGES } from "@/constants/challenges";

const ALARM_SOUNDS: { value: AlarmSound; label: string; description: string }[] = [
  { value: "classic", label: "Classic", description: "Traditional double-beep alarm" },
  { value: "gentle", label: "Gentle", description: "Soft ascending chime" },
  { value: "digital", label: "Digital", description: "Modern fast-pulse alarm" },
  { value: "bell", label: "Bell", description: "Church bell with natural decay" },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { tasks, profileSettings, updateProfileSettings, joinedChallenges } = useApp();
  const { themeMode, language, setThemeMode, setLanguage, t } = useTheme();

  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profileSettings.name);
  const [showAllChallenges, setShowAllChallenges] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showAllPartners, setShowAllPartners] = useState(false);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalPoints = CHALLENGES.filter((c) => joinedChallenges.has(c.id)).reduce((sum, c) => sum + c.points, 0);

  // 3-column grid: screenWidth - 40px (section margins) - 20px (2 gaps)
  const achCardWidth = Math.floor((screenWidth - 40 - 20) / 3);

  const ACHIEVEMENTS = [
    { title: "First Task",       icon: "check-circle", color: "#f59e0b", unlocked: completedTasks >= 1 },
    { title: "Getting Started",  icon: "trending-up",  color: "#3b82f6", unlocked: completedTasks >= 5 },
    { title: "On Fire",          icon: "award",        color: "#22c55e", unlocked: completedTasks >= 10 },
    { title: "Halfway Hero",     icon: "star",         color: "#6366f1", unlocked: completedTasks >= 25 },
    { title: "Century",          icon: "zap",          color: "#ec4899", unlocked: completedTasks >= 50 },
    { title: "Task Master",      icon: "target",       color: "#f97316", unlocked: completedTasks >= 100 },
    { title: "Challenger",       icon: "flag",         color: "#06b6d4", unlocked: joinedChallenges.size >= 1 },
    { title: "Team Player",      icon: "shield",       color: "#8b5cf6", unlocked: joinedChallenges.size >= CHALLENGES.length },
  ] as const;

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
    achievementRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    achievementCard: {
      width: achCardWidth, backgroundColor: colors.card, borderRadius: 14, padding: 14, alignItems: "center",
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
            <Text style={styles.statLabel}>{t("tasksDone")}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: "#22c55e" }]}>{completionRate}%</Text>
            <Text style={styles.statLabel}>{t("completion")}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
              <Feather name="star" size={14} color="#f97316" />
              <Text style={[styles.statValue, { color: "#f97316" }]}>{totalPoints}</Text>
            </View>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("achievements")}</Text>
          {(() => {
            const ACH_LIMIT = 6;
            const unlocked = ACHIEVEMENTS.filter((a) => a.unlocked);
            const visible = showAllAchievements ? unlocked : unlocked.slice(0, ACH_LIMIT);
            const hasMore = unlocked.length > ACH_LIMIT;
            if (unlocked.length === 0) {
              return (
                <View style={{ alignItems: "center", paddingVertical: 24 }}>
                  <Feather name="award" size={28} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                    Complete tasks and join challenges to earn achievements
                  </Text>
                </View>
              );
            }
            return (
              <>
                <View style={styles.achievementRow}>
                  {visible.map((a) => (
                    <View key={a.title} style={styles.achievementCard}>
                      <View style={[styles.achievementIcon, { backgroundColor: a.color + "20" }]}>
                        <Feather name={a.icon as any} size={20} color={a.color} />
                      </View>
                      <Text style={styles.achievementTitle}>{a.title}</Text>
                    </View>
                  ))}
                </View>
                {hasMore && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowAllAchievements((v) => !v);
                    }}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingTop: 12 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                      {showAllAchievements ? "Show less" : `Show ${unlocked.length - ACH_LIMIT} more`}
                    </Text>
                    <Feather name={showAllAchievements ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </>
            );
          })()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("communityChallenges")}</Text>
          <View style={styles.settingCard}>
            {joinedChallenges.size === 0 ? (
              <View style={{ paddingHorizontal: 16, paddingVertical: 18, alignItems: "center" }}>
                <Feather name="users" size={24} color={colors.mutedForeground} style={{ marginBottom: 8 }} />
                <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
                  {t("noChallenges")}
                </Text>
              </View>
            ) : (() => {
              const joined = CHALLENGES.filter((c) => joinedChallenges.has(c.id));
              const LIMIT = 3;
              const visible = showAllChallenges ? joined : joined.slice(0, LIMIT);
              const hasMore = joined.length > LIMIT;
              return (
                <>
                  {visible.map((c, i) => (
                    <View
                      key={c.id}
                      style={[
                        { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
                        (i < visible.length - 1 || hasMore) && { borderBottomWidth: 1, borderBottomColor: colors.border },
                      ]}
                    >
                      <View style={[styles.settingIcon, { backgroundColor: c.color + "20" }]}>
                        <Feather name={c.icon as any} size={18} color={c.color} />
                      </View>
                      <Text style={styles.settingLabel}>{c.title}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: c.color + "20" }}>
                        <Feather name="star" size={10} color={c.color} />
                        <Text style={{ fontSize: 11, fontWeight: "700", color: c.color, fontFamily: "Inter_700Bold" }}>{c.points} pts</Text>
                      </View>
                    </View>
                  ))}
                  {hasMore && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowAllChallenges((v) => !v);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                        {showAllChallenges ? "Show less" : `Show ${joined.length - LIMIT} more`}
                      </Text>
                      <Feather name={showAllChallenges ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                </>
              );
            })()}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("notifications")}</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name="bell" size={18} color={colors.primary} />
              </View>
              <Text style={styles.settingLabel}>{t("pushNotifications")}</Text>
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
              <Text style={styles.settingLabel}>{t("alarmSound")}</Text>
              <Text style={styles.settingValue}>{ALARM_SOUNDS.find((s) => s.value === profileSettings.alarmSound)?.label}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("appearance")}</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow} onPress={() => setShowThemePicker(true)}>
              <View style={[styles.settingIcon, { backgroundColor: "#06b6d420" }]}>
                <Feather name={themeMode === "dark" ? "moon" : "sun"} size={18} color="#06b6d4" />
              </View>
              <Text style={styles.settingLabel}>{t("theme")}</Text>
              <Text style={styles.settingValue}>{currentThemeLabel}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRowLast} onPress={() => setShowLanguagePicker(true)}>
              <View style={[styles.settingIcon, { backgroundColor: "#8b5cf620" }]}>
                <Feather name="globe" size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.settingLabel}>{t("language")}</Text>
              <Text style={styles.settingValue}>{currentLangLabel}</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("partners")}</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 12 }}>
            Exclusive perks from our partners — just for using Dway.
          </Text>
          {(() => {
            const PARTNERS = [
              { id: "p1", name: "Headspace", tagline: "Mindfulness & Focus", desc: "3 months of Headspace Plus free when you complete your first 30 tasks.", color: "#f97316", icon: "sun", badge: "3 Months Free" },
              { id: "p2", name: "Notion", tagline: "All-in-one workspace", desc: "Get 6 months of Notion Plus plan free and sync your tasks directly.", color: "#6366f1", icon: "book", badge: "6 Months Free" },
              { id: "p3", name: "Calm", tagline: "Sleep & Relaxation", desc: "Unlock 1-year Calm Premium access when you maintain a 7-day streak.", color: "#3b82f6", icon: "moon", badge: "1 Year Access" },
              { id: "p4", name: "Spotify", tagline: "Music & Podcasts", desc: "2 months of Spotify Premium for free to keep you focused while you work.", color: "#22c55e", icon: "music", badge: "2 Months Free" },
              { id: "p5", name: "Coursera", tagline: "Online Learning", desc: "30% off any Coursera course or specialization for active members.", color: "#06b6d4", icon: "award", badge: "30% Off" },
            ];
            const LIMIT = 2;
            const visible = showAllPartners ? PARTNERS : PARTNERS.slice(0, LIMIT);
            const hasMore = PARTNERS.length > LIMIT;
            return (
              <>
                {visible.map((partner, i) => (
                  <View
                    key={partner.id}
                    style={[styles.settingCard, { marginBottom: 10, overflow: "hidden" }]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 12 }}>
                      <View style={[styles.settingIcon, { backgroundColor: partner.color + "20", width: 44, height: 44, borderRadius: 12 }]}>
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
                        <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>
                          {partner.tagline}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert(partner.name, `${partner.desc}\n\nTap View Offer to visit the partner portal.`, [
                            { text: "Cancel", style: "cancel" },
                            { text: "View Offer", style: "default" },
                          ])
                        }
                        style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: partner.color + "18" }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: partner.color, fontFamily: "Inter_700Bold" }}>
                          Claim
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                {hasMore && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowAllPartners((v) => !v);
                    }}
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                      {showAllPartners ? "Show less" : `Show ${PARTNERS.length - LIMIT} more partners`}
                    </Text>
                    <Feather name={showAllPartners ? "chevron-up" : "chevron-down"} size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </>
            );
          })()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("data")}</Text>
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
              <Text style={[styles.settingLabel, { color: "#ef4444" }]}>{t("clearAllData")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Alarm Sound Picker */}
      <PickerModal visible={showSoundPicker} onClose={() => setShowSoundPicker(false)} title={t("alarmSound")}>
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
      <PickerModal visible={showThemePicker} onClose={() => setShowThemePicker(false)} title={t("chooseTheme")}>
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
      <PickerModal visible={showLanguagePicker} onClose={() => setShowLanguagePicker(false)} title={t("chooseLanguage")}>
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
              <Text style={{ fontSize: 22, marginRight: 12 }}>{lang.flag}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{lang.native}</Text>
                <Text style={styles.optionDesc}>{LANGUAGE_LOCALIZED_NAMES[lang.code][language]}</Text>
              </View>
              {language === lang.code && <Feather name="check" size={18} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </PickerModal>
    </View>
  );
}
