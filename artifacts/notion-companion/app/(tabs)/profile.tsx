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
import { useColors } from "@/hooks/useColors";

const ALARM_SOUNDS: { value: AlarmSound; label: string; description: string }[] = [
  { value: "default", label: "Default", description: "Standard alarm sound" },
  { value: "gentle", label: "Gentle", description: "Soft, gradual chime" },
  { value: "beep", label: "Beep", description: "Classic beep tone" },
  { value: "bell", label: "Bell", description: "Clear bell ring" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks, categories, profileSettings, updateProfileSettings } = useApp();
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profileSettings.name);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const streakDays = 7;

  const handleSaveName = () => {
    if (nameInput.trim()) {
      updateProfileSettings({ name: nameInput.trim() });
    }
    setEditingName(false);
  };

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
      paddingBottom: 24,
      alignItems: "center",
    },
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarText: {
      fontSize: 32,
      fontWeight: "700",
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 6,
    },
    name: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    editNameInput: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      minWidth: 120,
      textAlign: "center",
    },
    memberSince: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      gap: 10,
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "800",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    statLabel: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 3,
      textAlign: "center",
    },
    section: {
      marginHorizontal: 20,
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    settingCard: {
      backgroundColor: colors.card,
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    settingLastRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    settingLabel: {
      flex: 1,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },
    settingValue: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "flex-end",
    },
    modalContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: insets.bottom + 24,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    soundOption: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    soundOptionContent: {
      flex: 1,
    },
    soundOptionLabel: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
    soundOptionDesc: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    achievementRow: {
      flexDirection: "row",
      gap: 10,
    },
    achievementCard: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 14,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    achievementIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    achievementTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:
            Platform.OS === "web" ? 34 + 84 + 24 : insets.bottom + 90,
        }}
      >
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profileSettings.name.charAt(0).toUpperCase()}
            </Text>
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
            <TouchableOpacity
              onPress={() => {
                setNameInput(profileSettings.name);
                setEditingName(true);
              }}
            >
              <Feather name="edit-2" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <Text style={styles.memberSince}>Member since April 2025</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {completedTasks}
            </Text>
            <Text style={styles.statLabel}>Tasks Done</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {streakDays}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {completionRate}%
            </Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementRow}>
            <View style={styles.achievementCard}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#f59e0b20" }]}
              >
                <Feather name="zap" size={20} color="#f59e0b" />
              </View>
              <Text style={styles.achievementTitle}>First Task</Text>
            </View>
            <View style={styles.achievementCard}>
              <View
                style={[styles.achievementIcon, { backgroundColor: "#22c55e20" }]}
              >
                <Feather name="award" size={20} color="#22c55e" />
              </View>
              <Text style={styles.achievementTitle}>10 Done</Text>
            </View>
            <View style={styles.achievementCard}>
              <View
                style={[
                  styles.achievementIcon,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Feather name="lock" size={20} color={colors.mutedForeground} />
              </View>
              <Text
                style={[styles.achievementTitle, { color: colors.mutedForeground }]}
              >
                100 Club
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View
                style={[styles.settingIcon, { backgroundColor: colors.primary + "20" }]}
              >
                <Feather name="bell" size={18} color={colors.primary} />
              </View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Switch
                value={profileSettings.notificationsEnabled}
                onValueChange={(v) =>
                  updateProfileSettings({ notificationsEnabled: v })
                }
                trackColor={{ true: colors.primary }}
                thumbColor="#fff"
              />
            </View>
            <TouchableOpacity
              style={styles.settingLastRow}
              onPress={() => setShowSoundPicker(true)}
            >
              <View
                style={[styles.settingIcon, { backgroundColor: "#f59e0b20" }]}
              >
                <Feather name="volume-2" size={18} color="#f59e0b" />
              </View>
              <Text style={styles.settingLabel}>Alarm Sound</Text>
              <Text style={styles.settingValue}>
                {ALARM_SOUNDS.find((s) => s.value === profileSettings.alarmSound)?.label}
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.settingCard}>
            <TouchableOpacity style={styles.settingRow}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#8b5cf620" }]}
              >
                <Feather name="globe" size={18} color="#8b5cf6" />
              </View>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingValue}>English</Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingRow}>
              <View
                style={[styles.settingIcon, { backgroundColor: "#06b6d420" }]}
              >
                <Feather name="moon" size={18} color="#06b6d4" />
              </View>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingValue}>System</Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingLastRow}
              onPress={() =>
                Alert.alert(
                  "Clear Data",
                  "This will remove all your tasks. Are you sure?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Clear", style: "destructive" },
                  ]
                )
              }
            >
              <View
                style={[styles.settingIcon, { backgroundColor: colors.destructive + "20" }]}
              >
                <Feather name="trash-2" size={18} color={colors.destructive} />
              </View>
              <Text
                style={[styles.settingLabel, { color: colors.destructive }]}
              >
                Clear All Data
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showSoundPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSoundPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSoundPicker(false)}
        >
          <Pressable onPress={() => {}}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Alarm Sound</Text>
              {ALARM_SOUNDS.map((sound, index) => (
                <TouchableOpacity
                  key={sound.value}
                  style={[
                    index === ALARM_SOUNDS.length - 1
                      ? { paddingHorizontal: 20, paddingVertical: 14 }
                      : styles.soundOption,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    updateProfileSettings({ alarmSound: sound.value });
                    setShowSoundPicker(false);
                  }}
                >
                  <View style={styles.soundOptionContent}>
                    <Text style={styles.soundOptionLabel}>{sound.label}</Text>
                    <Text style={styles.soundOptionDesc}>{sound.description}</Text>
                  </View>
                  {profileSettings.alarmSound === sound.value && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
