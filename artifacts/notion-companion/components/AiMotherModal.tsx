import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const AI_SUGGESTIONS = [
  "How can I improve my productivity?",
  "What tasks should I prioritize today?",
  "Help me create a weekly plan",
  "Give me motivation to complete my goals",
];

function getAIResponse(userMsg: string, taskCount: number, completedCount: number): string {
  const completionRate = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  const lowerMsg = userMsg.toLowerCase();

  if (lowerMsg.includes("priorit")) {
    return `Based on your current task list, I'd recommend focusing on your high-priority incomplete tasks first. You've completed ${completedCount} out of ${taskCount} tasks — a ${completionRate}% completion rate. Try tackling your top 3 most important tasks before anything else today.`;
  }
  if (lowerMsg.includes("motivat") || lowerMsg.includes("goal")) {
    return `You're doing great! With a ${completionRate}% completion rate, you're making real progress. Remember: consistency beats intensity. Even completing just one task today moves you forward. What's one thing you can do right now to build momentum?`;
  }
  if (lowerMsg.includes("plan") || lowerMsg.includes("week")) {
    return `For a productive week, I suggest: Monday — tackle your hardest tasks (energy is high). Tuesday-Thursday — steady progress on medium tasks. Friday — review and plan ahead. Try setting clear category goals. Your current completion across categories shows room to grow in some areas!`;
  }
  if (lowerMsg.includes("produc")) {
    return `To boost productivity: 1) Use time-blocking — schedule specific tasks at specific times. 2) Enable alarms for important deadlines. 3) Break large tasks into smaller ones. 4) Review your Progress tab weekly to see where you're excelling and where you need focus.`;
  }
  if (completionRate >= 80) {
    return `Exceptional work! You're crushing it with a ${completionRate}% task completion rate. You clearly have great discipline. To maintain this momentum, make sure you're also taking breaks and celebrating your wins. What's your biggest challenge right now?`;
  }
  if (completionRate >= 50) {
    return `Good progress! You've completed ${completedCount} of ${taskCount} tasks (${completionRate}%). To push past the halfway mark, try identifying which category is holding you back and dedicate focused time to it. Small, consistent actions lead to big results!`;
  }
  return `I'm your AI Mother — here to support and guide you. You have ${taskCount} tasks, having completed ${completedCount} (${completionRate}%). Let's work together to improve. What specific area would you like help with — time management, focus, or setting better goals?`;
}

export default function AiMotherModal({ visible, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { tasks } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Mother. I'm here to help you stay focused, motivated, and on track with your goals. How can I support you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const completedTasks = tasks.filter((t) => t.completed).length;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiResponse = getAIResponse(text, tasks.length, completedTasks);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1200);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: insets.top + 20,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    headerInfo: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    headerSub: {
      fontSize: 12,
      color: colors.success,
      fontFamily: "Inter_400Regular",
      marginTop: 1,
    },
    closeBtn: {
      padding: 6,
    },
    messages: {
      flex: 1,
      padding: 16,
    },
    messageBubble: {
      maxWidth: "80%",
      marginBottom: 12,
      borderRadius: 18,
      padding: 14,
    },
    userBubble: {
      alignSelf: "flex-end",
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    aiBubble: {
      alignSelf: "flex-start",
      backgroundColor: colors.card,
      borderBottomLeftRadius: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    messageText: {
      fontSize: 15,
      lineHeight: 22,
      fontFamily: "Inter_400Regular",
    },
    typingIndicator: {
      alignSelf: "flex-start",
      backgroundColor: colors.card,
      borderRadius: 18,
      borderBottomLeftRadius: 4,
      padding: 14,
      marginBottom: 12,
    },
    typingDots: {
      flexDirection: "row",
      gap: 4,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.mutedForeground,
    },
    suggestions: {
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    suggestionsLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: "Inter_500Medium",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    suggestionChips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    suggestionChip: {
      backgroundColor: colors.muted,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    suggestionText: {
      fontSize: 12,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: insets.bottom + 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },
    textInput: {
      flex: 1,
      backgroundColor: colors.muted,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: "Inter_400Regular",
      maxHeight: 100,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={{ flex: 1 }} onPress={() => {}}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <View style={styles.avatarCircle}>
                  <Feather name="cpu" size={20} color="#fff" />
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>AI Mother</Text>
                  <Text style={styles.headerSub}>Online — here to help</Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Feather name="x" size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <ScrollView
                ref={scrollRef}
                style={styles.messages}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
              >
                {messages.map((msg) => (
                  <View
                    key={msg.id}
                    style={[
                      styles.messageBubble,
                      msg.role === "user" ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        {
                          color: msg.role === "user" ? "#fff" : colors.foreground,
                        },
                      ]}
                    >
                      {msg.content}
                    </Text>
                  </View>
                ))}
                {isTyping && (
                  <View style={styles.typingIndicator}>
                    <View style={styles.typingDots}>
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                      <View style={styles.dot} />
                    </View>
                  </View>
                )}
              </ScrollView>

              {messages.length <= 2 && (
                <View style={styles.suggestions}>
                  <Text style={styles.suggestionsLabel}>Quick questions</Text>
                  <View style={styles.suggestionChips}>
                    {AI_SUGGESTIONS.map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={styles.suggestionChip}
                        onPress={() => sendMessage(s)}
                      >
                        <Text style={styles.suggestionText}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ask AI Mother..."
                  placeholderTextColor={colors.mutedForeground}
                  value={input}
                  onChangeText={setInput}
                  multiline
                  returnKeyType="send"
                  onSubmitEditing={() => sendMessage(input)}
                />
                <TouchableOpacity
                  style={[styles.sendBtn, { opacity: input.trim() ? 1 : 0.5 }]}
                  onPress={() => sendMessage(input)}
                  disabled={!input.trim()}
                >
                  <Feather name="send" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
