import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const QUICK_PRESETS = [
  { label: "5 min", seconds: 5 * 60 },
  { label: "10 min", seconds: 10 * 60 },
  { label: "15 min", seconds: 15 * 60 },
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
  { label: "60 min", seconds: 60 * 60 },
  { label: "90 min", seconds: 90 * 60 },
  { label: "2 hr", seconds: 120 * 60 },
];

export default function TimerModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [started, setStarted] = useState(false);

  const [customHours, setCustomHours] = useState("0");
  const [customMinutes, setCustomMinutes] = useState("25");
  const [customSeconds, setCustomSeconds] = useState("0");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setStarted(false);
            setSessions((s) => s + 1);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const applyCustomTime = () => {
    const h = Math.max(0, Math.min(23, parseInt(customHours) || 0));
    const m = Math.max(0, Math.min(59, parseInt(customMinutes) || 0));
    const s = Math.max(0, Math.min(59, parseInt(customSeconds) || 0));
    const total = h * 3600 + m * 60 + s;
    if (total > 0) {
      setTotalSeconds(total);
      setRemaining(total);
      setIsRunning(false);
      setStarted(false);
    }
  };

  const applyPreset = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTotalSeconds(seconds);
    setRemaining(seconds);
    setIsRunning(false);
    setStarted(false);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    setCustomHours(h.toString());
    setCustomMinutes(m.toString());
    setCustomSeconds(s.toString());
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (remaining === 0) {
      setRemaining(totalSeconds);
      setStarted(true);
      setIsRunning(true);
    } else {
      setStarted(true);
      setIsRunning((prev) => !prev);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setStarted(false);
    setRemaining(totalSeconds);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;

  const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28, borderTopRightRadius: 28,
      paddingTop: 12, paddingBottom: insets.bottom + 24, paddingHorizontal: 24,
    },
    handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
    header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
    title: { fontSize: 20, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    sessions: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    presetsLabel: {
      fontSize: 11, fontWeight: "700", color: colors.mutedForeground, fontFamily: "Inter_700Bold",
      textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10,
    },
    presetsRow: { marginBottom: 20 },
    presetChip: {
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
      borderWidth: 1.5, marginRight: 8,
    },
    presetText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    customRow: {
      flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 24,
    },
    customInputWrap: { flex: 1, alignItems: "center" },
    customInput: {
      width: "100%", textAlign: "center",
      backgroundColor: colors.muted, borderRadius: 12,
      paddingVertical: 12, fontSize: 22, fontWeight: "700",
      color: colors.foreground, fontFamily: "Inter_700Bold",
    },
    customLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 4 },
    colon: { fontSize: 24, fontWeight: "700", color: colors.mutedForeground, fontFamily: "Inter_700Bold", marginBottom: 16 },
    setBtn: {
      backgroundColor: colors.primary + "20", borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 10, alignItems: "center",
    },
    setBtnText: { fontSize: 13, fontWeight: "700", color: colors.primary, fontFamily: "Inter_700Bold" },
    timerContainer: { alignItems: "center", marginBottom: 28 },
    timerCircleWrap: { width: 180, height: 180, alignItems: "center", justifyContent: "center" },
    timerCircleBg: {
      position: "absolute", width: 170, height: 170, borderRadius: 85,
      borderWidth: 8, borderColor: colors.muted,
    },
    timerCircleFg: {
      position: "absolute", width: 170, height: 170, borderRadius: 85,
      borderWidth: 8, borderLeftColor: "transparent", borderBottomColor: "transparent",
    },
    timerDisplay: { position: "absolute", alignItems: "center" },
    timerText: {
      fontSize: 38, fontWeight: "700", color: colors.foreground,
      fontFamily: "Inter_700Bold", letterSpacing: -1,
    },
    timerSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2 },
    controls: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24 },
    controlBtn: {
      width: 52, height: 52, borderRadius: 26,
      backgroundColor: colors.muted, alignItems: "center", justifyContent: "center",
    },
    playBtn: {
      width: 72, height: 72, borderRadius: 36,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
      shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
    },
    progressBg: {
      height: 4, borderRadius: 2, backgroundColor: colors.muted,
      marginHorizontal: 0, marginBottom: 20, overflow: "hidden",
    },
    progressFill: { height: "100%", borderRadius: 2, backgroundColor: colors.primary },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <View style={styles.container}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>Timer</Text>
              <Text style={styles.sessions}>{sessions} sessions today</Text>
            </View>

            <Text style={styles.presetsLabel}>Quick Presets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
              {QUICK_PRESETS.map((p) => {
                const isActive = totalSeconds === p.seconds;
                return (
                  <TouchableOpacity
                    key={p.label}
                    style={[
                      styles.presetChip,
                      {
                        backgroundColor: isActive ? colors.primary + "18" : "transparent",
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => applyPreset(p.seconds)}
                  >
                    <Text style={[styles.presetText, { color: isActive ? colors.primary : colors.mutedForeground }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.presetsLabel}>Custom Duration</Text>
            <View style={styles.customRow}>
              <View style={styles.customInputWrap}>
                <TextInput
                  style={styles.customInput}
                  value={customHours}
                  onChangeText={setCustomHours}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.customLabel}>Hours</Text>
              </View>
              <Text style={styles.colon}>:</Text>
              <View style={styles.customInputWrap}>
                <TextInput
                  style={styles.customInput}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.customLabel}>Minutes</Text>
              </View>
              <Text style={styles.colon}>:</Text>
              <View style={styles.customInputWrap}>
                <TextInput
                  style={styles.customInput}
                  value={customSeconds}
                  onChangeText={setCustomSeconds}
                  keyboardType="number-pad"
                  maxLength={2}
                  selectTextOnFocus
                />
                <Text style={styles.customLabel}>Seconds</Text>
              </View>
              <TouchableOpacity style={styles.setBtn} onPress={applyCustomTime}>
                <Text style={styles.setBtnText}>Set</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>

            <View style={styles.timerContainer}>
              <View style={styles.timerCircleWrap}>
                <View style={styles.timerCircleBg} />
                <View
                  style={[
                    styles.timerCircleFg,
                    {
                      borderTopColor: colors.primary,
                      borderRightColor: progress > 0.25 ? colors.primary : "transparent",
                      transform: [{ rotate: `${progress * 360 - 90}deg` }],
                    },
                  ]}
                />
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>{formatTime(remaining)}</Text>
                  <Text style={styles.timerSub}>{isRunning ? "Running" : started ? "Paused" : "Ready"}</Text>
                </View>
              </View>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.controlBtn} onPress={resetTimer}>
                <Feather name="rotate-ccw" size={20} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playBtn} onPress={toggleTimer}>
                <Feather name={isRunning ? "pause" : "play"} size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlBtn} onPress={onClose}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
