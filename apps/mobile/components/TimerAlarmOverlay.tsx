import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

export default function TimerAlarmOverlay() {
  const { timerAlarmActive, dismissTimerAlarm } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  // Pulsing ring animations
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!timerAlarmActive) return;

    // Trigger haptics repeatedly
    const hapticInterval = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }, 1500);

    // Staggered pulsing rings
    const pulse = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 1400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );

    const iconPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );

    const r1 = pulse(ring1, 0);
    const r2 = pulse(ring2, 400);
    const r3 = pulse(ring3, 800);

    r1.start();
    r2.start();
    r3.start();
    iconPulse.start();

    return () => {
      clearInterval(hapticInterval);
      r1.stop();
      r2.stop();
      r3.stop();
      iconPulse.stop();
      ring1.setValue(0);
      ring2.setValue(0);
      ring3.setValue(0);
      iconScale.setValue(1);
    };
  }, [timerAlarmActive]);

  const makeRingStyle = (anim: Animated.Value) => ({
    opacity: anim.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.5, 0] }),
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) }],
  });

  return (
    <Modal
      visible={timerAlarmActive}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={[styles.fullscreen, { backgroundColor: "#0f172a" }]}>
        {/* Pulsing rings */}
        <View style={styles.ringContainer}>
          <Animated.View style={[styles.ring, { borderColor: "#6366f1" }, makeRingStyle(ring3)]} />
          <Animated.View style={[styles.ring, { borderColor: "#818cf8" }, makeRingStyle(ring2)]} />
          <Animated.View style={[styles.ring, { borderColor: "#a5b4fc" }, makeRingStyle(ring1)]} />

          {/* Center icon */}
          <Animated.View style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}>
            <Feather name="clock" size={48} color="#fff" />
          </Animated.View>
        </View>

        {/* Text */}
        <Text style={styles.heading}>Timer Complete!</Text>
        <Text style={styles.subtext}>Your countdown has finished</Text>

        {/* Dismiss button */}
        <TouchableOpacity
          style={[styles.dismissBtn, { marginBottom: insets.bottom + 40 }]}
          onPress={dismissTimerAlarm}
          activeOpacity={0.85}
        >
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ringContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  ring: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6366f1",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 12,
  },
  heading: {
    fontSize: 34,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: "rgba(255,255,255,0.55)",
    fontFamily: "Inter_400Regular",
    marginBottom: 64,
  },
  dismissBtn: {
    position: "absolute",
    bottom: 0,
    left: 32,
    right: 32,
    backgroundColor: "#6366f1",
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  dismissText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
