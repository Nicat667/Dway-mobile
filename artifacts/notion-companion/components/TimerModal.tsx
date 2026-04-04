import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Props = { visible: boolean; onClose: () => void };

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

const RING_RADIUS = 78;
const STROKE_W = 10;
const SVG_SIZE = (RING_RADIUS + STROKE_W) * 2 + 4;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const CX = SVG_SIZE / 2;
const CY = SVG_SIZE / 2;

// ── WheelDrum ──────────────────────────────────────────────────────────────
const ITEM_H = 44;
const VISIBLE = 3;

type DrumProps = {
  data: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem: (v: number) => string;
  primaryColor: string;
  foreground: string;
  muted: string;
  border: string;
  card: string;
};

function WheelDrum({ data, value, onChange, formatItem, primaryColor, foreground, muted, border, card }: DrumProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [liveIdx, setLiveIdx] = useState(data.indexOf(value));
  const isMounting = useRef(true);

  useEffect(() => {
    const idx = data.indexOf(value);
    if (idx >= 0 && isMounting.current) {
      setTimeout(() => scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: false }), 50);
      isMounting.current = false;
    }
  }, []);

  useEffect(() => {
    const idx = data.indexOf(value);
    if (idx >= 0) {
      scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: true });
      setLiveIdx(idx);
    }
  }, [value]);

  const containerH = ITEM_H * VISIBLE;
  const centerY = ITEM_H * (VISIBLE - 1) / 2;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIdx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(data.length - 1, rawIdx));
    setLiveIdx(clamped);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIdx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(data.length - 1, rawIdx));
    scrollRef.current?.scrollTo({ y: clamped * ITEM_H, animated: true });
    if (data[clamped] !== value) {
      Haptics.selectionAsync();
      onChange(data[clamped]);
    }
  };

  return (
    <View style={{ width: 72, height: containerH, overflow: "hidden" }}>
      {/* top separator */}
      <View style={{ position: "absolute", top: centerY, left: 8, right: 8, height: 1, backgroundColor: border, zIndex: 1 }} />
      {/* bottom separator */}
      <View style={{ position: "absolute", top: centerY + ITEM_H, left: 8, right: 8, height: 1, backgroundColor: border, zIndex: 1 }} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: centerY }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
      >
        {data.map((item, idx) => {
          const dist = Math.abs(idx - liveIdx);
          const isSelected = dist === 0;
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.4 : 0.15;
          return (
            <View key={item} style={{ height: ITEM_H, alignItems: "center", justifyContent: "center" }}>
              <Text
                style={{
                  fontSize: isSelected ? 26 : 20,
                  fontWeight: isSelected ? "700" : "400",
                  color: isSelected ? primaryColor : foreground,
                  opacity,
                  fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
                }}
              >
                {formatItem(item)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const HOURS_DATA = Array.from({ length: 24 }, (_, i) => i);
const MINUTES_DATA = Array.from({ length: 60 }, (_, i) => i);
const SECONDS_DATA = Array.from({ length: 60 }, (_, i) => i);

// ──────────────────────────────────────────────────────────────────────────

export default function TimerModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [started, setStarted] = useState(false);
  const [activePreset, setActivePreset] = useState<number | null>(null);

  const [drumHours, setDrumHours] = useState(0);
  const [drumMinutes, setDrumMinutes] = useState(0);
  const [drumSeconds, setDrumSeconds] = useState(0);

  // Drum change handlers — also clear active preset
  const onHoursChange = (v: number) => { setDrumHours(v); setActivePreset(null); setStarted(false); setIsRunning(false); };
  const onMinutesChange = (v: number) => { setDrumMinutes(v); setActivePreset(null); setStarted(false); setIsRunning(false); };
  const onSecondsChange = (v: number) => { setDrumSeconds(v); setActivePreset(null); setStarted(false); setIsRunning(false); };

  // Derived: what the drums currently show
  const drumTotal = drumHours * 3600 + drumMinutes * 60 + drumSeconds;

  // While not started, ring + text preview the drum value live
  const activeTotal = started ? totalSeconds : (drumTotal > 0 ? drumTotal : 1);
  const activeRemaining = started ? remaining : drumTotal;

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

  const applyPreset = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activePreset === seconds) {
      // Deselect — reset everything to zero
      setActivePreset(null);
      setTotalSeconds(0);
      setRemaining(0);
      setIsRunning(false);
      setStarted(false);
      setDrumHours(0);
      setDrumMinutes(0);
      setDrumSeconds(0);
    } else {
      setActivePreset(seconds);
      setTotalSeconds(seconds);
      setRemaining(seconds);
      setIsRunning(false);
      setStarted(false);
      setDrumHours(Math.floor(seconds / 3600));
      setDrumMinutes(Math.floor((seconds % 3600) / 60));
      setDrumSeconds(seconds % 60);
    }
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!started || remaining === 0) {
      // Fresh start — lock in current drum values
      const t = drumTotal > 0 ? drumTotal : totalSeconds;
      setTotalSeconds(t);
      setRemaining(t);
      setStarted(true);
      setIsRunning(true);
    } else {
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

  const ringProgress = activeTotal > 0 ? activeRemaining / activeTotal : 1;
  const strokeDashoffset = CIRCUMFERENCE * (1 - ringProgress);

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
    // Drum picker section
    drumSection: {
      backgroundColor: colors.muted, borderRadius: 16,
      marginBottom: 24, overflow: "hidden",
    },
    drumRow: {
      flexDirection: "row", alignItems: "center", justifyContent: "center",
      paddingVertical: 10,
    },
    drumWrap: { alignItems: "center" },
    drumLabel: {
      fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular",
      marginTop: 4, textAlign: "center",
    },
    drumColon: {
      fontSize: 30, fontWeight: "700", color: colors.mutedForeground,
      fontFamily: "Inter_700Bold", paddingBottom: 12, paddingHorizontal: 4,
    },
    // SVG ring
    timerContainer: { alignItems: "center", marginBottom: 28 },
    timerSvgWrap: { alignItems: "center", justifyContent: "center" },
    timerDisplay: {
      position: "absolute", alignItems: "center",
      width: SVG_SIZE, height: SVG_SIZE, justifyContent: "center",
    },
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
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
          <View style={styles.container}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>Timer</Text>
              <Text style={styles.sessions}>{sessions} sessions today</Text>
            </View>

            {/* Quick presets */}
            <Text style={styles.presetsLabel}>Quick Presets</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
              {QUICK_PRESETS.map((p) => {
                const isActive = activePreset === p.seconds;
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

            {/* Wheel drum duration picker */}
            <Text style={styles.presetsLabel}>Custom Duration</Text>
            <View style={styles.drumSection}>
              <View style={styles.drumRow}>
                <View style={styles.drumWrap}>
                  <WheelDrum
                    data={HOURS_DATA}
                    value={drumHours}
                    onChange={onHoursChange}
                    formatItem={(v) => v.toString().padStart(2, "0")}
                    primaryColor={colors.primary}
                    foreground={colors.foreground}
                    muted={colors.mutedForeground}
                    border={colors.border}
                    card={colors.card}
                  />
                  <Text style={styles.drumLabel}>Hours</Text>
                </View>

                <Text style={styles.drumColon}>:</Text>

                <View style={styles.drumWrap}>
                  <WheelDrum
                    data={MINUTES_DATA}
                    value={drumMinutes}
                    onChange={onMinutesChange}
                    formatItem={(v) => v.toString().padStart(2, "0")}
                    primaryColor={colors.primary}
                    foreground={colors.foreground}
                    muted={colors.mutedForeground}
                    border={colors.border}
                    card={colors.card}
                  />
                  <Text style={styles.drumLabel}>Minutes</Text>
                </View>

                <Text style={styles.drumColon}>:</Text>

                <View style={styles.drumWrap}>
                  <WheelDrum
                    data={SECONDS_DATA}
                    value={drumSeconds}
                    onChange={onSecondsChange}
                    formatItem={(v) => v.toString().padStart(2, "0")}
                    primaryColor={colors.primary}
                    foreground={colors.foreground}
                    muted={colors.mutedForeground}
                    border={colors.border}
                    card={colors.card}
                  />
                  <Text style={styles.drumLabel}>Seconds</Text>
                </View>
              </View>
            </View>

            {/* SVG Ring Timer */}
            <View style={styles.timerContainer}>
              <View style={styles.timerSvgWrap}>
                <Svg width={SVG_SIZE} height={SVG_SIZE}>
                  <Circle
                    cx={CX} cy={CY} r={RING_RADIUS}
                    stroke={colors.muted} strokeWidth={STROKE_W} fill="none"
                  />
                  <Circle
                    cx={CX} cy={CY} r={RING_RADIUS}
                    stroke={colors.primary} strokeWidth={STROKE_W} fill="none"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    transform={`rotate(-90, ${CX}, ${CY})`}
                  />
                </Svg>
                <View style={styles.timerDisplay}>
                  <Text style={styles.timerText}>{formatTime(activeRemaining)}</Text>
                  <Text style={styles.timerSub}>
                    {isRunning ? "Running" : started ? "Paused" : "Ready"}
                  </Text>
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
      </View>
    </Modal>
  );
}
