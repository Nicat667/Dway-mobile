import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

type Props = {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
};

export default function ProgressCircle({
  percentage,
  size = 100,
  strokeWidth = 10,
  color,
  label,
  sublabel,
}: Props) {
  const colors = useColors();
  const activeColor = color ?? colors.primary;
  const radius = (size - strokeWidth) / 2;
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  const getEmoji = (pct: number) => {
    if (pct >= 90) return "🌟";
    if (pct >= 70) return "🔥";
    if (pct >= 50) return "💪";
    if (pct >= 30) return "🌱";
    return "🎯";
  };

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
    },
    ring: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: strokeWidth,
      borderColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    fill: {
      position: "absolute",
      top: -strokeWidth,
      left: -strokeWidth,
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: strokeWidth,
      borderColor: activeColor,
      borderTopColor: clampedPercentage > 0 ? activeColor : "transparent",
      borderRightColor: clampedPercentage > 25 ? activeColor : "transparent",
      borderBottomColor: clampedPercentage > 50 ? activeColor : "transparent",
      borderLeftColor: clampedPercentage > 75 ? activeColor : "transparent",
    },
    inner: {
      alignItems: "center",
      justifyContent: "center",
    },
    icon: {
      fontSize: size > 80 ? 22 : 14,
    },
    percentText: {
      fontSize: size > 80 ? 20 : 14,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      marginTop: 2,
    },
    label: {
      fontSize: 12,
      color: colors.foreground,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
      marginTop: 8,
      textAlign: "center",
    },
    sublabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.ring, { borderColor: colors.muted + "60" }]}>
        <View
          style={[
            styles.fill,
            {
              borderTopColor: clampedPercentage >= 12 ? activeColor : "transparent",
              borderRightColor: clampedPercentage >= 37 ? activeColor : "transparent",
              borderBottomColor: clampedPercentage >= 62 ? activeColor : "transparent",
              borderLeftColor: clampedPercentage >= 87 ? activeColor : "transparent",
            },
          ]}
        />
        <View style={styles.inner}>
          <Text style={styles.icon}>{getEmoji(clampedPercentage)}</Text>
          <Text style={styles.percentText}>{clampedPercentage}%</Text>
        </View>
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
      {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
    </View>
  );
}
