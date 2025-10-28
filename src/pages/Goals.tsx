import { useMemo } from "react";
import { GoalsManager } from "@/components/GoalsManager";
import { useData } from "@/contexts/DataContext";
import { GoalProgress } from "@/types/revenue";

const Goals = () => {
  const { goals, addGoal, deleteGoal, revenueEntries } = useData();

  const goalProgress = useMemo((): GoalProgress[] => {
    return goals.map(goal => {
      let relevantEntries = revenueEntries;

      if (goal.type === 'daily') {
        const goalDate = goal.period;
        relevantEntries = revenueEntries.filter(entry => entry.date === goalDate);
      } else if (goal.type === 'weekly') {
        const [year, week] = goal.period.split('-W');
        const weekStart = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        relevantEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
      } else if (goal.type === 'monthly') {
        relevantEntries = revenueEntries.filter(entry => entry.date.startsWith(goal.period));
      } else if (goal.type === 'yearly') {
        relevantEntries = revenueEntries.filter(entry => entry.date.startsWith(goal.period));
      }

      const currentAmount = relevantEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const progressPercentage = (currentAmount / goal.targetAmount) * 100;
      const isCompleted = currentAmount >= goal.targetAmount;

      return {
        goal,
        currentAmount,
        progressPercentage: Math.min(progressPercentage, 100),
        isCompleted,
        daysRemaining: 0
      };
    });
  }, [goals, revenueEntries]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Goals Management
          </h1>
          <p className="text-muted-foreground">
            Set and track your revenue goals across different time periods
          </p>
        </div>

        {/* Goals Manager */}
        <GoalsManager 
          goals={goals}
          goalProgress={goalProgress}
          onAddGoal={addGoal}
          onDeleteGoal={deleteGoal}
        />
      </div>
    </div>
  );
};

export default Goals;
