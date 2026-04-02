import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const COMMUNITY_POSTS = [
  {
    id: "1",
    user: "Alex M.",
    avatar: "A",
    avatarColor: "#6366f1",
    time: "2h ago",
    message: "Just completed my 30-day workout challenge! Consistency is everything.",
    likes: 24,
    comments: 5,
    category: "Sport",
    categoryColor: "#f59e0b",
  },
  {
    id: "2",
    user: "Sarah K.",
    avatar: "S",
    avatarColor: "#22c55e",
    time: "4h ago",
    message:
      "Finally finished that big project I've been working on for weeks. Feeling amazing!",
    likes: 41,
    comments: 12,
    category: "Work",
    categoryColor: "#6366f1",
  },
  {
    id: "3",
    user: "Omar T.",
    avatar: "O",
    avatarColor: "#f59e0b",
    time: "6h ago",
    message:
      "Tip: Break your big goals into tiny daily tasks. Makes it so much easier to show up every day.",
    likes: 87,
    comments: 23,
    category: "Learning",
    categoryColor: "#3b82f6",
  },
  {
    id: "4",
    user: "Mia P.",
    avatar: "M",
    avatarColor: "#ec4899",
    time: "Yesterday",
    message:
      "Shared my reading list tasks publicly — 12 books this year so far! Who else tracks their reading?",
    likes: 55,
    comments: 18,
    category: "Personal",
    categoryColor: "#ec4899",
  },
  {
    id: "5",
    user: "James L.",
    avatar: "J",
    avatarColor: "#8b5cf6",
    time: "Yesterday",
    message:
      "Used the Pomodoro timer for the first time today — insane how much I got done in 2 hours.",
    likes: 32,
    comments: 9,
    category: "Work",
    categoryColor: "#6366f1",
  },
];

const CHALLENGES = [
  {
    id: "c1",
    title: "7-Day Streak",
    description: "Complete at least one task every day for 7 days",
    participants: 1243,
    icon: "zap",
    color: "#f59e0b",
    progress: 4,
    total: 7,
  },
  {
    id: "c2",
    title: "100 Tasks Club",
    description: "Complete 100 tasks this month",
    participants: 892,
    icon: "award",
    color: "#6366f1",
    progress: 67,
    total: 100,
  },
  {
    id: "c3",
    title: "Category Master",
    description: "Complete tasks in all 5 categories in one week",
    participants: 456,
    icon: "grid",
    color: "#22c55e",
    progress: 3,
    total: 5,
  },
];

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<"feed" | "challenges">("feed");
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop:
        Platform.OS === "web"
          ? insets.top + 67
          : insets.top + 16,
      paddingBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    subtitle: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 4,
    },
    tabRow: {
      flexDirection: "row",
      marginHorizontal: 20,
      marginTop: 20,
      marginBottom: 20,
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 10,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    postCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 16,
      marginBottom: 12,
      marginHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    postHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
    avatarText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
      fontFamily: "Inter_700Bold",
    },
    postInfo: {
      flex: 1,
    },
    postUser: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    postTime: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    postMessage: {
      fontSize: 15,
      color: colors.foreground,
      lineHeight: 22,
      fontFamily: "Inter_400Regular",
      marginBottom: 14,
    },
    postActions: {
      flexDirection: "row",
      gap: 20,
    },
    actionBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    actionText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
    },
    challengeCard: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 12,
      marginHorizontal: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    challengeHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    challengeIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    challengeTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    challengeDesc: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginTop: 2,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    progressBg: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.muted,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 3,
    },
    progressText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    participantsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    participantsText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    joinBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1.5,
    },
    joinBtnText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:
            Platform.OS === "web" ? 34 + 84 + 24 : insets.bottom + 90,
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
              style={[
                styles.tab,
                {
                  backgroundColor:
                    activeTab === tab ? colors.card : "transparent",
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color:
                      activeTab === tab
                        ? colors.primary
                        : colors.mutedForeground,
                  },
                ]}
              >
                {tab === "feed" ? "Activity Feed" : "Challenges"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "feed"
          ? COMMUNITY_POSTS.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: post.avatarColor },
                    ]}
                  >
                    <Text style={styles.avatarText}>{post.avatar}</Text>
                  </View>
                  <View style={styles.postInfo}>
                    <Text style={styles.postUser}>{post.user}</Text>
                    <Text style={styles.postTime}>{post.time}</Text>
                  </View>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: post.categoryColor + "20" },
                    ]}
                  >
                    <Text
                      style={[styles.categoryText, { color: post.categoryColor }]}
                    >
                      {post.category}
                    </Text>
                  </View>
                </View>
                <Text style={styles.postMessage}>{post.message}</Text>
                <View style={styles.postActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => toggleLike(post.id)}
                  >
                    <Feather
                      name="heart"
                      size={16}
                      color={
                        likedPosts.has(post.id)
                          ? colors.destructive
                          : colors.mutedForeground
                      }
                    />
                    <Text
                      style={[
                        styles.actionText,
                        {
                          color: likedPosts.has(post.id)
                            ? colors.destructive
                            : colors.mutedForeground,
                        },
                      ]}
                    >
                      {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather
                      name="message-circle"
                      size={16}
                      color={colors.mutedForeground}
                    />
                    <Text
                      style={[styles.actionText, { color: colors.mutedForeground }]}
                    >
                      {post.comments}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Feather name="share-2" size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          : CHALLENGES.map((challenge) => (
              <View key={challenge.id} style={styles.challengeCard}>
                <View style={styles.challengeHeader}>
                  <View
                    style={[
                      styles.challengeIcon,
                      { backgroundColor: challenge.color + "20" },
                    ]}
                  >
                    <Feather
                      name={challenge.icon as any}
                      size={20}
                      color={challenge.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeDesc}>
                      {challenge.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressRow}>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${(challenge.progress / challenge.total) * 100}%`,
                          backgroundColor: challenge.color,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[styles.progressText, { color: challenge.color }]}
                  >
                    {challenge.progress}/{challenge.total}
                  </Text>
                </View>
                <View style={styles.participantsRow}>
                  <Feather
                    name="users"
                    size={13}
                    color={colors.mutedForeground}
                  />
                  <Text style={styles.participantsText}>
                    {challenge.participants.toLocaleString()} participants
                  </Text>
                  <View style={{ flex: 1 }} />
                  <TouchableOpacity
                    style={[
                      styles.joinBtn,
                      { borderColor: challenge.color },
                    ]}
                  >
                    <Text
                      style={[styles.joinBtnText, { color: challenge.color }]}
                    >
                      Join
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
      </ScrollView>
    </View>
  );
}
