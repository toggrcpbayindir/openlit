export interface ProductivityTask {
  id: string;
  title: string;
  description?: string;
  priority: number; // 1-5 scale
  difficulty: number; // 1-5 scale
  status: "pending" | "in_progress" | "completed" | "cancelled";
  userId: string;
  estimatedHours: number;
  actualHours?: number;
  coinsEarned: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  coinRecords?: CoinRecord[];
}

export interface CoinRecord {
  id: string;
  taskId: string;
  userId: string;
  amount: number;
  reason: string;
  timestamp: Date;
  metadata?: string;
  task?: ProductivityTask;
}

export interface DailyProductivitySummary {
  id: string;
  userId: string;
  date: Date;
  totalCoins: number;
  tasksCompleted: number;
  totalHours: number;
  avgPriority: number;
  avgDifficulty: number;
  efficiency: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductivityStatistics {
  totalCoins: number;
  periodCoins: number;
  completedTasks: number;
  totalHours: number;
  avgPriority: number;
  avgDifficulty: number;
  efficiency: number;
}

export interface DailyCoinsData {
  date: string;
  totalCoins: number;
  recordCount: number;
}

export interface ProductivityTrends {
  avgDailyCoins: number;
  avgDailyTasks: number;
  coinTrend: number;
  taskTrend: number;
}

export interface ProductivityReport {
  summary: DailyProductivitySummary;
  completedTasks: ProductivityTask[];
  pendingTasks: ProductivityTask[];
  trends: ProductivityTrends;
  insights: string[];
  historicalData: DailyProductivitySummary[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: number;
  difficulty: number;
  estimatedHours: number;
}

export interface TaskUpdateData extends Partial<TaskFormData> {
  status?: "pending" | "in_progress" | "completed" | "cancelled";
  actualHours?: number;
}

export const TASK_PRIORITIES = [
  { value: 1, label: "Very Low", color: "bg-gray-100 text-gray-800" },
  { value: 2, label: "Low", color: "bg-blue-100 text-blue-800" },
  { value: 3, label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: 4, label: "High", color: "bg-orange-100 text-orange-800" },
  { value: 5, label: "Critical", color: "bg-red-100 text-red-800" },
];

export const TASK_DIFFICULTIES = [
  { value: 1, label: "Very Easy", color: "bg-green-100 text-green-800" },
  { value: 2, label: "Easy", color: "bg-green-100 text-green-700" },
  { value: 3, label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: 4, label: "Hard", color: "bg-orange-100 text-orange-800" },
  { value: 5, label: "Very Hard", color: "bg-red-100 text-red-800" },
];

export const TASK_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];