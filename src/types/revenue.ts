export interface RevenueEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  amount: number;
  description?: string;
  category?: string; // Now references category ID
  categoryName?: string; // Display name for category
  categoryColor?: string; // Color for category
  createdAt: Date;
}

export interface Goal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  targetAmount: number;
  period: string; // YYYY-MM-DD for daily, YYYY-WW for weekly, YYYY-MM for monthly, YYYY for yearly
  description?: string;
  category?: string; // Goal category ID (revenue, sales, profit, etc.)
  categoryName?: string; // Display name for goal category
  categoryColor?: string; // Color for goal category
  categoryType?: 'revenue' | 'sales' | 'profit' | 'clients' | 'custom';
  goalType: 'revenue' | 'clients'; // What we're measuring: revenue amount or client count
  createdAt: Date;
}

export interface GoalProgress {
  goal: Goal;
  currentAmount: number;
  progressPercentage: number;
  daysRemaining?: number;
  isCompleted: boolean;
}