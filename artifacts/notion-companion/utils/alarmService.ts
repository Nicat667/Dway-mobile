import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { AlarmSound } from "@/context/AppContext";

// ─── Foreground notification display ────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Sound file map ──────────────────────────────────────────────────────────
const SOUND_FILES: Record<AlarmSound, ReturnType<typeof require>> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  classic: require("../assets/sounds/alarm_classic.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  gentle: require("../assets/sounds/alarm_gentle.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  digital: require("../assets/sounds/alarm_digital.wav"),
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  bell: require("../assets/sounds/alarm_bell.wav"),
};

// Notification sound filenames (must match files registered in app.json)
const NOTIFICATION_SOUNDS: Record<AlarmSound, string> = {
  classic: "alarm_classic.wav",
  gentle: "alarm_gentle.wav",
  digital: "alarm_digital.wav",
  bell: "alarm_bell.wav",
};

// ─── In-app looping alarm (used when timer ends while app is open) ───────────
let _alarmSound: Audio.Sound | null = null;

export async function playLoopingAlarm(alarmSound: AlarmSound = "classic"): Promise<void> {
  try {
    await stopLoopingAlarm();
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    const { sound } = await Audio.Sound.createAsync(
      SOUND_FILES[alarmSound],
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );
    _alarmSound = sound;
  } catch {
    // Fallback: fire an immediate notification sound if audio fails
    await Notifications.scheduleNotificationAsync({
      content: { title: "⏰ Timer Complete!", body: "Your timer has finished!" },
      trigger: null,
    }).catch(() => {});
  }
}

export async function stopLoopingAlarm(): Promise<void> {
  try {
    if (_alarmSound) {
      await _alarmSound.stopAsync();
      await _alarmSound.unloadAsync();
      _alarmSound = null;
    }
  } catch {}
}

// ─── Android notification channel ───────────────────────────────────────────
// Uses ALARM audio usage so the notification respects the device's alarm
// volume and sounds like a real alarm rather than a notification.
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("alarms", {
    name: "Alarms & Timers",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 300, 200, 300],
    enableVibrate: true,
    audioAttributes: {
      usage: Notifications.AndroidAudioUsage.ALARM,
      contentType: Notifications.AndroidAudioContentType.SONIFICATION,
      flags: { enforceAudibility: true, requestHardwareAV: false },
    },
  });
}

// ─── Permission request ──────────────────────────────────────────────────────
export async function requestPermissions(): Promise<boolean> {
  try {
    await setupAndroidChannel();
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

// ─── Emoji prefix per sound type (visual distinction in notification) ────────
const SOUND_ICON: Record<AlarmSound, string> = {
  classic: "⏰",
  gentle: "🔔",
  digital: "📳",
  bell: "🛎️",
};

// ─── Schedule a task alarm notification ─────────────────────────────────────
export async function scheduleTaskAlarm(
  taskId: string,
  taskTitle: string,
  alarmTime: string,
  alarmSound: AlarmSound
): Promise<string | null> {
  try {
    const granted = await requestPermissions();
    if (!granted) return null;

    const date = new Date(alarmTime);
    if (date <= new Date()) return null;

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${SOUND_ICON[alarmSound]} Alarm`,
        body: taskTitle,
        sound: NOTIFICATION_SOUNDS[alarmSound],
        data: { taskId, type: "task_alarm" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: "alarms",
      },
    });
    return notifId;
  } catch {
    return null;
  }
}

// ─── Cancel a scheduled task alarm ──────────────────────────────────────────
export async function cancelAlarm(notificationId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

// ─── Fire an immediate "timer done" notification ─────────────────────────────
export async function fireTimerDone(alarmSound: AlarmSound): Promise<void> {
  try {
    const granted = await requestPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${SOUND_ICON[alarmSound]} Timer Complete`,
        body: "Your timer has finished!",
        sound: NOTIFICATION_SOUNDS[alarmSound],
      },
      trigger: null,
    });
  } catch {}
}
