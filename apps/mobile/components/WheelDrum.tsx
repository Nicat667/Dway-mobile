import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder, Text, View } from "react-native";

export const DRUM_ITEM_H = 44;
export const DRUM_VISIBLE = 3;
const CENTER = Math.floor(DRUM_VISIBLE / 2); // = 1

// How many copies of the data to repeat for circular scrolling.
// 5 copies means the user can spin ~2 full rotations in either direction
// before hitting the edge — enough for any practical use.
const CIRCULAR_COPIES = 5;
const CIRCULAR_MID = Math.floor(CIRCULAR_COPIES / 2); // = 2

export type WheelDrumProps = {
  data: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem: (v: number) => string;
  primaryColor: string;
  foreground: string;
  border: string;
  circular?: boolean;
};

export function WheelDrum({
  data,
  value,
  onChange,
  formatItem,
  primaryColor,
  foreground,
  border,
  circular = false,
}: WheelDrumProps) {
  const H = DRUM_ITEM_H;
  const containerH = H * DRUM_VISIBLE;

  // For circular mode, repeat the data CIRCULAR_COPIES times.
  // We always start/snap back to the middle copy so there is room to scroll both ways.
  const displayData = useMemo(
    () =>
      circular
        ? Array.from({ length: CIRCULAR_COPIES }, () => data).flat()
        : data,
    [data, circular]
  );

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const dataRef = useRef(data);
  const displayDataRef = useRef(displayData);
  useEffect(() => {
    dataRef.current = data;
    displayDataRef.current = circular
      ? Array.from({ length: CIRCULAR_COPIES }, () => data).flat()
      : data;
  }, [data, circular]);

  // Return the display-array index that corresponds to `val` in the middle copy.
  const midIdxFor = (val: number) => {
    const base = Math.max(0, data.indexOf(val));
    return circular ? CIRCULAR_MID * data.length + base : base;
  };

  // Normalize a display index back into the middle copy (for circular wrap).
  const normalizeIdx = (idx: number): number => {
    if (!circular) return idx;
    const len = dataRef.current.length;
    const real = ((idx % len) + len) % len; // always positive modulo
    return CIRCULAR_MID * len + real;
  };

  const initIdx = midIdxFor(value);
  const maxOffset = (displayData.length - 1) * H;

  const offsetY = useRef(new Animated.Value(initIdx * H)).current;
  const baseOffset = useRef(initIdx * H);
  const lastEmitted = useRef(value);
  const isDragging = useRef(false);
  const [liveIdx, setLiveIdx] = useState(initIdx);

  // Sync when value prop changes externally (form reset, preset tap).
  useEffect(() => {
    if (isDragging.current) return;
    const idx = midIdxFor(value);
    if (idx * H === baseOffset.current) return;
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
        // Circular: no clamping — free scroll through all copies.
        // Non-circular: clamp to valid range.
        const clamped = circular
          ? Math.max(0, Math.min(maxOffset, raw))
          : Math.max(0, Math.min((dataRef.current.length - 1) * H, raw));
        offsetY.setValue(clamped);

        const displayLen = displayDataRef.current.length;
        const newIdx = Math.max(0, Math.min(displayLen - 1, Math.round(clamped / H)));

        // Get the real value from the data array (handles circular wrapping)
        const newVal = circular
          ? dataRef.current[newIdx % dataRef.current.length]
          : dataRef.current[newIdx];

        if (newVal !== undefined && newVal !== lastEmitted.current) {
          lastEmitted.current = newVal;
          Haptics.selectionAsync().catch(() => {});
          onChangeRef.current(newVal);
        }
        setLiveIdx((prev) => (prev !== newIdx ? newIdx : prev));
      },

      onPanResponderRelease: (_, g) => {
        isDragging.current = false;
        const displayLen = displayDataRef.current.length;

        const raw = baseOffset.current - g.dy - g.vy * 40;
        const snapIdx = Math.max(0, Math.min(displayLen - 1, Math.round(raw / H)));
        const snapOffset = snapIdx * H;

        Animated.spring(offsetY, {
          toValue: snapOffset,
          useNativeDriver: false,
          tension: 120,
          friction: 14,
        }).start(() => {
          // After animation settles, silently jump back to middle copy (circular only).
          // The user won't see this — they just released, no animation playing.
          if (circular) {
            const normalized = normalizeIdx(snapIdx);
            if (normalized !== snapIdx) {
              const normOffset = normalized * H;
              offsetY.setValue(normOffset);
              baseOffset.current = normOffset;
              setLiveIdx(normalized);
            }
          }
        });

        baseOffset.current = snapOffset;
        setLiveIdx(snapIdx);

        const snapVal = circular
          ? dataRef.current[snapIdx % dataRef.current.length]
          : dataRef.current[snapIdx];

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
    inputRange: [0, Math.max(1, maxOffset)],
    outputRange: [CENTER * H, CENTER * H - Math.max(0, maxOffset)],
    extrapolate: "clamp",
  });

  return (
    <View style={{ width: 72, height: containerH, overflow: "hidden" }}>
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
          {displayData.map((item, idx) => {
            const dist = Math.abs(idx - liveIdx);
            const isSelected = dist === 0;
            return (
              // Use idx as key (not item) because circular data has duplicate values
              <View
                key={idx}
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
