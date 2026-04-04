import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Animated, PanResponder, Text, View } from "react-native";

export const DRUM_ITEM_H = 44;
export const DRUM_VISIBLE = 3;
const CENTER = Math.floor(DRUM_VISIBLE / 2); // = 1

export type WheelDrumProps = {
  data: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem: (v: number) => string;
  primaryColor: string;
  foreground: string;
  border: string;
};

export function WheelDrum({
  data,
  value,
  onChange,
  formatItem,
  primaryColor,
  foreground,
  border,
}: WheelDrumProps) {
  const H = DRUM_ITEM_H;
  const containerH = H * DRUM_VISIBLE;

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Keep data fresh inside the PanResponder closure (created once)
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const initIdx = Math.max(0, data.indexOf(value));
  const offsetY = useRef(new Animated.Value(initIdx * H)).current;
  const baseOffset = useRef(initIdx * H);
  const lastEmitted = useRef(value);
  const isDragging = useRef(false);
  const [liveIdx, setLiveIdx] = useState(initIdx);

  // Sync when value changes externally (form reset, preset tap).
  // Skipped while the user is dragging so the external update never fights the gesture.
  useEffect(() => {
    if (isDragging.current) return;
    const idx = Math.max(0, data.indexOf(value));
    if (idx * H === baseOffset.current) return; // already in sync
    baseOffset.current = idx * H;
    setLiveIdx(idx);
    Animated.timing(offsetY, {
      toValue: idx * H,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      // ── Capture phase: claim the touch BEFORE the parent ScrollView can steal it on iOS.
      // This fires top-down (parent → child in capture, child → parent in bubble).
      // ScrollView only registers in the bubble phase, so claiming here wins on iOS.
      // Android was never broken — capture just makes it more reliable there too.
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dy) > 2,

      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        isDragging.current = true;
        offsetY.stopAnimation((val) => {
          baseOffset.current = val;
          offsetY.setValue(val);
        });
      },

      onPanResponderMove: (_, g) => {
        const raw = baseOffset.current - g.dy;
        const clamped = Math.max(0, Math.min((dataRef.current.length - 1) * H, raw));
        offsetY.setValue(clamped);
        const newIdx = Math.max(0, Math.min(dataRef.current.length - 1, Math.round(clamped / H)));
        setLiveIdx((prev) => {
          if (prev !== newIdx) {
            // Fire onChange live so the time display updates while dragging
            const newVal = dataRef.current[newIdx];
            if (newVal !== undefined && newVal !== lastEmitted.current) {
              lastEmitted.current = newVal;
              Haptics.selectionAsync().catch(() => {});
              onChangeRef.current(newVal);
            }
            return newIdx;
          }
          return prev;
        });
      },

      onPanResponderRelease: (_, g) => {
        isDragging.current = false;
        const raw = baseOffset.current - g.dy - g.vy * 40;
        const snapIdx = Math.max(0, Math.min(dataRef.current.length - 1, Math.round(raw / H)));
        const snapOffset = snapIdx * H;
        Animated.spring(offsetY, {
          toValue: snapOffset,
          useNativeDriver: false,
          tension: 120,
          friction: 14,
        }).start();
        baseOffset.current = snapOffset;
        setLiveIdx(snapIdx);
        const snapVal = dataRef.current[snapIdx];
        if (snapVal !== undefined && snapVal !== lastEmitted.current) {
          lastEmitted.current = snapVal;
          Haptics.selectionAsync().catch(() => {});
          onChangeRef.current(snapVal);
        }
      },

      onPanResponderTerminate: () => {
        isDragging.current = false;
      },
    })
  ).current;

  const translateY = offsetY.interpolate({
    inputRange: [0, Math.max(1, (data.length - 1) * H)],
    outputRange: [CENTER * H, CENTER * H - Math.max(0, (data.length - 1) * H)],
    extrapolate: "clamp",
  });

  return (
    <View style={{ width: 72, height: containerH, overflow: "hidden" }}>
      {/* separator lines around center row */}
      <View
        style={{
          position: "absolute",
          top: CENTER * H,
          left: 8, right: 8, height: 1,
          backgroundColor: border,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: (CENTER + 1) * H,
          left: 8, right: 8, height: 1,
          backgroundColor: border,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          {data.map((item, idx) => {
            const dist = Math.abs(idx - liveIdx);
            const isSelected = dist === 0;
            return (
              <View
                key={item}
                style={{ height: H, alignItems: "center", justifyContent: "center" }}
              >
                <Text
                  style={{
                    fontSize: 22,
                    fontFamily: "Inter_700Bold",
                    color: isSelected ? primaryColor : foreground,
                    opacity: dist === 0 ? 1 : dist === 1 ? 0.38 : 0.12,
                  }}
                >
                  {formatItem(item)}
                </Text>
              </View>
            );
          })}
        </Animated.View>
      </View>
    </View>
  );
}
