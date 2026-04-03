import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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

type Comment = { id: string; user: string; text: string; time: string; avatarColor: string };
type Post = {
  id: string;
  user: string;
  avatar: string;
  avatarColor: string;
  time: string;
  message: string;
  likes: number;
  comments: Comment[];
  category: string;
  categoryColor: string;
};

const INITIAL_POSTS: Post[] = [
  {
    id: "1", user: "Alex M.", avatar: "A", avatarColor: "#6366f1",
    time: "2h ago", likes: 24, category: "Sport", categoryColor: "#f59e0b",
    message: "Just completed my 30-day workout challenge! Consistency is everything. 💪",
    comments: [
      { id: "c1", user: "Sara K.", text: "Incredible! I'm on day 12 of mine. So inspiring!", time: "1h ago", avatarColor: "#22c55e" },
      { id: "c2", user: "Omar T.", text: "That's dedication right there. Well done!", time: "45m ago", avatarColor: "#f59e0b" },
    ],
  },
  {
    id: "2", user: "Sarah K.", avatar: "S", avatarColor: "#22c55e",
    time: "4h ago", likes: 41, category: "Work", categoryColor: "#6366f1",
    message: "Finally finished that big project I've been working on for weeks. Feeling amazing! The late nights were worth it.",
    comments: [
      { id: "c3", user: "Alex M.", text: "Congrats! You deserve a break after all that hard work.", time: "3h ago", avatarColor: "#6366f1" },
    ],
  },
  {
    id: "3", user: "Omar T.", avatar: "O", avatarColor: "#f59e0b",
    time: "6h ago", likes: 87, category: "Learning", categoryColor: "#3b82f6",
    message: "Tip: Break your big goals into tiny daily tasks. Makes it so much easier to show up every day. This single habit changed my life.",
    comments: [
      { id: "c4", user: "Mia P.", text: "This is so true. I started doing this last month and already seeing results!", time: "5h ago", avatarColor: "#ec4899" },
      { id: "c5", user: "James L.", text: "100% agree. Atomic Habits was a game changer for me too.", time: "4h ago", avatarColor: "#8b5cf6" },
      { id: "c6", user: "Sarah K.", text: "Bookmarking this reminder for myself!", time: "3h ago", avatarColor: "#22c55e" },
    ],
  },
  {
    id: "4", user: "Mia P.", avatar: "M", avatarColor: "#ec4899",
    time: "Yesterday", likes: 55, category: "Personal", categoryColor: "#ec4899",
    message: "Shared my reading list tasks publicly — 12 books this year so far! Who else tracks their reading?",
    comments: [
      { id: "c7", user: "Omar T.", text: "12 books already?! What's your favorite so far?", time: "Yesterday", avatarColor: "#f59e0b" },
    ],
  },
  {
    id: "5", user: "James L.", avatar: "J", avatarColor: "#8b5cf6",
    time: "Yesterday", likes: 32, category: "Work", categoryColor: "#6366f1",
    message: "Used the Pomodoro timer for the first time today — insane how much I got done in 2 hours. Never going back to my old way of working.",
    comments: [],
  },
];

const CHALLENGES = [
  {
    id: "c1", title: "7-Day Streak", description: "Complete at least one task every day for 7 days",
    participants: 1243, icon: "zap", color: "#f59e0b", progress: 4, total: 7,
  },
  {
    id: "c2", title: "100 Tasks Club", description: "Complete 100 tasks this month",
    participants: 892, icon: "award", color: "#6366f1", progress: 67, total: 100,
  },
  {
    id: "c3", title: "Category Master", description: "Complete tasks in all 5 categories in one week",
    participants: 456, icon: "grid", color: "#22c55e", progress: 3, total: 5,
  },
  {
    id: "c4", title: "Early Bird", description: "Complete a task before 9am every day for 5 days",
    participants: 728, icon: "sun", color: "#f97316", progress: 2, total: 5,
  },
];

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { joinedChallenges, toggleChallenge } = useApp();
  const [activeTab, setActiveTab] = useState<"feed" | "challenges">("feed");
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  const toggleLike = (postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: likedPosts.has(postId) ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const submitComment = (postId: string) => {
    if (!commentText.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newComment: Comment = {
      id: Date.now().toString(),
      user: "You",
      text: commentText.trim(),
      time: "Just now",
      avatarColor: "#6366f1",
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
    setCommentText("");
    setActiveCommentPost(null);
  };

  const handleToggleChallenge = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleChallenge(id);
  };

  const activePost = posts.find((p) => p.id === activeCommentPost);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingHorizontal: 20,
      paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 16,
      paddingBottom: 8,
    },
    title: { fontSize: 28, fontWeight: "800", color: colors.foreground, fontFamily: "Inter_700Bold" },
    subtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 4 },
    tabRow: {
      flexDirection: "row", marginHorizontal: 20, marginTop: 20, marginBottom: 16,
      backgroundColor: colors.muted, borderRadius: 12, padding: 4,
    },
    tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
    tabText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    postCard: {
      backgroundColor: colors.card, borderRadius: 18, padding: 16,
      marginBottom: 12, marginHorizontal: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    postHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
    avatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", marginRight: 10 },
    avatarText: { fontSize: 14, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
    postUser: { fontSize: 14, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    postTime: { fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: "auto" },
    categoryText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
    postMessage: {
      fontSize: 14, color: colors.foreground, lineHeight: 21,
      fontFamily: "Inter_400Regular", marginBottom: 12,
    },
    postActions: { flexDirection: "row", gap: 20 },
    actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
    actionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
    commentsSection: {
      marginTop: 12, paddingTop: 12,
      borderTopWidth: 1, borderTopColor: colors.border,
    },
    commentItem: { flexDirection: "row", marginBottom: 10 },
    commentAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", marginRight: 8 },
    commentAvatarText: { fontSize: 11, fontWeight: "700", color: "#fff", fontFamily: "Inter_700Bold" },
    commentBubble: {
      flex: 1, backgroundColor: colors.muted,
      borderRadius: 12, padding: 10,
    },
    commentUser: { fontSize: 12, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    commentText: { fontSize: 13, color: colors.foreground, fontFamily: "Inter_400Regular", lineHeight: 18, marginTop: 2 },
    commentTime: { fontSize: 10, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 3 },
    challengeCard: {
      backgroundColor: colors.card, borderRadius: 18, padding: 18,
      marginBottom: 12, marginHorizontal: 20,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    },
    challengeHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    challengeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginRight: 12 },
    challengeTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    challengeDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginTop: 2, flex: 1 },
    progressBg: { height: 6, borderRadius: 3, backgroundColor: colors.muted, overflow: "hidden", marginBottom: 10 },
    progressFill: { height: "100%", borderRadius: 3 },
    challengeFooter: { flexDirection: "row", alignItems: "center" },
    participantsText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular", flex: 1, marginLeft: 4 },
    joinBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
    joinBtnText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
    // Comment modal
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    modalContainer: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      paddingTop: 12, maxHeight: "80%",
    },
    modalHandle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: "center", marginBottom: 16,
    },
    modalTitle: {
      fontSize: 17, fontWeight: "700", color: colors.foreground,
      fontFamily: "Inter_700Bold", paddingHorizontal: 20, marginBottom: 16,
    },
    commentsList: { paddingHorizontal: 20, maxHeight: 300 },
    noComments: { textAlign: "center", color: colors.mutedForeground, fontFamily: "Inter_400Regular", paddingVertical: 20 },
    commentInputRow: {
      flexDirection: "row", alignItems: "center",
      paddingHorizontal: 16, paddingVertical: 12,
      paddingBottom: insets.bottom + 12,
      borderTopWidth: 1, borderTopColor: colors.border, gap: 10,
    },
    commentInput: {
      flex: 1, backgroundColor: colors.muted,
      borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10,
      fontSize: 14, color: colors.foreground, fontFamily: "Inter_400Regular",
    },
    sendBtn: {
      width: 38, height: 38, borderRadius: 19,
      backgroundColor: colors.primary, alignItems: "center", justifyContent: "center",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 34 + 84 + 24 : insets.bottom + 90,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Share your wins, find your tribe</Text>
        </View>

        <View style={styles.tabRow}>
          {(["feed", "challenges"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, { backgroundColor: activeTab === tab ? colors.card : "transparent" }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
                {tab === "feed" ? "Activity Feed" : "Challenges"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "feed"
          ? posts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}>
                    <Text style={styles.avatarText}>{post.avatar}</Text>
                  </View>
                  <View>
                    <Text style={styles.postUser}>{post.user}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: post.categoryColor + "20" }]}>
                    <Text style={[styles.categoryText, { color: post.categoryColor }]}>{post.category}</Text>
                  </View>
                </View>
                <Text style={styles.postMessage}>{post.message}</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(post.id)}>
                    <Feather name="heart" size={16} color={likedPosts.has(post.id) ? "#ef4444" : colors.mutedForeground} />
                    <Text style={[styles.actionText, { color: likedPosts.has(post.id) ? "#ef4444" : colors.mutedForeground }]}>
                      {post.likes}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveCommentPost(post.id)}>
                    <Feather name="message-circle" size={16} color={activeCommentPost === post.id ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.actionText, { color: activeCommentPost === post.id ? colors.primary : colors.mutedForeground }]}>
                      {post.comments.length} {post.comments.length === 1 ? "comment" : "comments"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          : CHALLENGES.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <View style={[styles.challengeIcon, { backgroundColor: challenge.color + "20" }]}>
                    <Feather name={challenge.icon as any} size={20} color={challenge.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDesc}>{challenge.description}</Text>
                  </View>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${(challenge.progress / challenge.total) * 100}%`, backgroundColor: challenge.color }]} />
                </View>
                <View style={styles.challengeFooter}>
                  <Feather name="users" size={13} color={colors.mutedForeground} />
                  <Text style={styles.participantsText}>{challenge.participants.toLocaleString()} participants</Text>
                  <TouchableOpacity
                    style={[
                      styles.joinBtn,
                      {
                        borderColor: challenge.color,
                        backgroundColor: joinedChallenges.has(challenge.id) ? challenge.color : "transparent",
                      },
                    ]}
                    onPress={() => handleToggleChallenge(challenge.id)}
                  >
                    <Text style={[styles.joinBtnText, { color: joinedChallenges.has(challenge.id) ? "#fff" : challenge.color }]}>
                      {joinedChallenges.has(challenge.id) ? "Joined" : "Join"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
      </ScrollView>

      {/* Comment modal */}
      <Modal visible={!!activeCommentPost} transparent animationType="slide" onRequestClose={() => setActiveCommentPost(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setActiveCommentPost(null)}>
          <Pressable onPress={() => {}}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>Comments</Text>
                <ScrollView style={styles.commentsList}>
                  {activePost?.comments.length === 0 && (
                    <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                  )}
                  {activePost?.comments.map((c) => (
                    <View key={c.id} style={[styles.commentItem, { marginBottom: 14 }]}>
                      <View style={[styles.commentAvatar, { backgroundColor: c.avatarColor }]}>
                        <Text style={styles.commentAvatarText}>{c.user.charAt(0)}</Text>
                      </View>
                      <View style={styles.commentBubble}>
                        <Text style={styles.commentUser}>{c.user}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                        <Text style={styles.commentTime}>{c.time}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.commentInputRow}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Write a comment..."
                    placeholderTextColor={colors.mutedForeground}
                    value={commentText}
                    onChangeText={setCommentText}
                    returnKeyType="send"
                    onSubmitEditing={() => activeCommentPost && submitComment(activeCommentPost)}
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, { opacity: commentText.trim() ? 1 : 0.5 }]}
                    onPress={() => activeCommentPost && submitComment(activeCommentPost)}
                  >
                    <Feather name="send" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
