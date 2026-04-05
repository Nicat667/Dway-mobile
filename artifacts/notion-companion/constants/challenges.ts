export type Challenge = {
  id: string;
  title: string;
  description: string;
  participants: number;
  icon: string;
  color: string;
  progress: number;
  total: number;
  points: number;
};

export const CHALLENGES: Challenge[] = [
  {
    id: "c2",
    title: "100 Tasks Club",
    description: "Complete 100 tasks this month",
    participants: 892,
    icon: "award",
    color: "#6366f1",
    progress: 67,
    total: 100,
    points: 500,
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
    points: 200,
  },
  {
    id: "c4",
    title: "Early Bird",
    description: "Complete a task before 9am every day for 5 days",
    participants: 728,
    icon: "sun",
    color: "#f97316",
    progress: 2,
    total: 5,
    points: 300,
  },
  {
    id: "c5",
    title: "Night Owl",
    description: "Complete a task after 10pm for 3 consecutive days",
    participants: 341,
    icon: "moon",
    color: "#8b5cf6",
    progress: 1,
    total: 3,
    points: 250,
  },
  {
    id: "c6",
    title: "Speed Runner",
    description: "Complete 5 tasks in a single day",
    participants: 1105,
    icon: "activity",
    color: "#ef4444",
    progress: 3,
    total: 5,
    points: 180,
  },
  {
    id: "c7",
    title: "Perfect Week",
    description: "Complete every scheduled task for 7 days straight",
    participants: 289,
    icon: "check-circle",
    color: "#22c55e",
    progress: 4,
    total: 7,
    points: 350,
  },
  {
    id: "c8",
    title: "Social Butterfly",
    description: "Comment on 5 community posts",
    participants: 612,
    icon: "message-circle",
    color: "#ec4899",
    progress: 2,
    total: 5,
    points: 120,
  },
  {
    id: "c9",
    title: "Consistent",
    description: "Complete at least one task every day for 14 days",
    participants: 198,
    icon: "trending-up",
    color: "#3b82f6",
    progress: 6,
    total: 14,
    points: 400,
  },
  {
    id: "c10",
    title: "Overachiever",
    description: "Complete 200 tasks total",
    participants: 87,
    icon: "star",
    color: "#f59e0b",
    progress: 67,
    total: 200,
    points: 1000,
  },
  {
    id: "c11",
    title: "Focus Mode",
    description: "Complete 10 Pomodoro timer sessions",
    participants: 543,
    icon: "target",
    color: "#06b6d4",
    progress: 4,
    total: 10,
    points: 220,
  },
];
