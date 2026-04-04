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

  const initIdx = Math.max(0, data.indexOf(value));
  const offsetY = useRef(new Animated.Value(initIdx * H)).current;
  const baseOffset = useRef(initIdx * H);
  const valueRef = useRef(value);
  const [liveIdx, setLiveIdx] = useState(initIdx);

  // Keep valueRef in sync
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Sync animation when value changes externally (e.g. preset tap)
  useEffect(() => {
    const idx = Math.max(0, data.indexOf(value));
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
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        offsetY.stopAnimation((val) => {
          baseOffset.current = val;
          offsetY.setValue(val);
        });
      },
      onPanResponderMove: (_, g) => {
        const raw = baseOffset.current - g.dy;
        const clamped = Math.max(0, Math.min((data.length - 1) * H, raw));
        offsetY.setValue(clamped);
        setLiveIdx(Math.max(0, Math.min(data.length - 1, Math.round(clamped / H))));
      },
      onPanResponderRelease: (_, g) => {
        const raw = baseOffset.current - g.dy - g.vy * 80;
        const snapIdx = Math.max(0, Math.min(data.length - 1, Math.round(raw / H)));
        const snapOffset = snapIdx * H;
        Animated.spring(offsetY, {
          toValue: snapOffset,
          useNativeDriver: false,
          tension: 220,
          friction: 22,
        }).start();
        baseOffset.current = snapOffset;
        setLiveIdx(snapIdx);
        if (data[snapIdx] !== undefined && data[snapIdx] !== valueRef.current) {
          valueRef.current = data[snapIdx];
          Haptics.selectionAsync().catch(() => {});
          onChange(data[snapIdx]);
        }
      },
    })
  ).current;

  // translateY = CENTER * H - offsetY  (item[k] lands in center when offsetY = k*H)
  const translateY = offsetY.interpolate({
    inputRange: [0, (data.length - 1) * H],
    outputRange: [CENTER * H, CENTER * H - (data.length - 1) * H],
    extrapolate: "clamp",
  });

  return (
    <View style={{ width: 72, height: containerH, overflow: "hidden" }}>
      {/* separator lines around center row */}
      <View
        style={{
          position: "absolute", top: CENTER * H,
          left: 8, right: 8, height: 1, backgroundColor: border, zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <View
        style={{
          position: "absolute", top: (CENTER + 1) * H,
          left: 8, right: 8, height: 1, backgroundColor: border, zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <View {...panResponder.panHandlers} style={{ flex: 1 }}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          {data.map((item, idx) => {
            const dist = Math.abs(idx - liveIdx);
            const isSelected = dist === 0;
            return (
              <View key={item} style={{ height: H, alignItems: "center", justifyContent: "center" }}>
                <Text
                  style={{
                    fontSize: isSelected ? 26 : 20,
                    fontWeight: isSelected ? "700" : "400",
                    color: isSelected ? primaryColor : foreground,
                    opacity: dist === 0 ? 1 : dist === 1 ? 0.4 : 0.15,
                    fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
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
