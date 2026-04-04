import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { AlarmSound } from "@/context/AppContext";

// ─── Foreground notification display ────────────────────────────────────────
// Without this, iOS silently drops foreground notifications.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ─── Android notification channel ───────────────────────────────────────────
// Android 8+ requires a channel. Must be created before scheduling.
export async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("alarms", {
    name: "Alarms & Timers",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 300, 200, 300],
    enableVibrate: true,
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
  default: "⏰",
  gentle: "🔔",
  beep: "📳",
  bell: "🛎️",
};

// ─── Schedule a task alarm notification ─────────────────────────────────────
// Returns the notification ID (store it on the task to cancel later).
// Returns null if permissions denied or time is already past.
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
    if (date <= new Date()) return null; // past time — don't schedule

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${SOUND_ICON[alarmSound]} Alarm`,
        body: taskTitle,
        sound: true,
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
// Used when the countdown timer reaches zero.
// trigger: null means "fire right now" — the OS plays the sound.
export async function fireTimerDone(alarmSound: AlarmSound): Promise<void> {
  try {
    const granted = await requestPermissions();
    if (!granted) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${SOUND_ICON[alarmSound]} Timer Complete`,
        body: "Your timer has finished!",
        sound: true,
      },
      trigger: null, // immediate
    });
  } catch {}
}
