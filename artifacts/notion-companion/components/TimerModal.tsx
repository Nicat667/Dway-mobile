import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type TimerType = "focus" | "short" | "long";

const TIMER_PRESETS: Record<TimerType, { label: string; duration: number }> = {
  focus: { label: "Focus", duration: 25 * 60 },
  short: { label: "Short Break", duration: 5 * 60 },
  long: { label: "Long Break", duration: 15 * 60 },
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TimerModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [timerType, setTimerType] = useState<TimerType>("focus");
  const [remaining, setRemaining] = useState(TIMER_PRESETS.focus.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
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

  const switchTimer = (type: TimerType) => {
    setTimerType(type);
    setRemaining(TIMER_PRESETS[type].duration);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemaining(TIMER_PRESETS[timerType].duration);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const total = TIMER_PRESETS[timerType].duration;
  const progress = (total - remaining) / total;
  const circumference = 2 * Math.PI * 100;
  const strokeDashoffset = circumference * (1 - progress);

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    container: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingTop: 12,
      paddingBottom: insets.bottom + 24,
      paddingHorizontal: 24,
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
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    sessions: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    typeSelector: {
      flexDirection: "row",
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 4,
      marginBottom: 40,
    },
    typeBtn: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 10,
    },
    typeBtnText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    timerContainer: {
      alignItems: "center",
      marginBottom: 40,
    },
    svgContainer: {
      width: 220,
      height: 220,
      alignItems: "center",
      justifyContent: "center",
    },
    timerCircleBg: {
      position: "absolute",
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 8,
      borderColor: colors.muted,
    },
    timerDisplay: {
      position: "absolute",
      alignItems: "center",
    },
    timerText: {
      fontSize: 52,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      letterSpacing: -2,
    },
    timerLabel: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 24,
    },
    resetBtn: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    playBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
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

            <View style={styles.typeSelector}>
              {(Object.keys(TIMER_PRESETS) as TimerType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor:
                        timerType === type ? colors.card : "transparent",
                    },
                  ]}
                  onPress={() => switchTimer(type)}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      {
                        color:
                          timerType === type
                            ? colors.primary
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {TIMER_PRESETS[type].label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.timerContainer}>
              <View style={styles.svgContainer}>
                <View style={styles.timerCircleBg} />
                <View
                  style={[
                    styles.timerCircleBg,
                    {
                      borderColor:
                        timerType === "focus"
                          ? colors.primary
                          : timerType === "short"
                          ? colors.success
                          : colors.warning,
                      transform: [{ rotate: "-90deg" }],
                    },
                  ]}
                />
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>{formatTime(remaining)}</Text>
                  <Text style={styles.timerLabel}>
                    {TIMER_PRESETS[timerType].label}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.controls}>
              <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
                <Feather name="rotate-ccw" size={20} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.playBtn} onPress={toggleTimer}>
                <Feather
                  name={isRunning ? "pause" : "play"}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={onClose}>
                <Feather name="x" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
