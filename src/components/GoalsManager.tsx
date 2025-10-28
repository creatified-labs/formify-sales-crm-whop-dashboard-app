import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Target, Plus, Edit, Trash2, CheckCircle } from "lucide-react";
import { Goal, GoalProgress } from "@/types/revenue";

interface GoalsManagerProps {
  goals: Goal[];
  goalProgress: GoalProgress[];
  onAddGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalsManager = ({ goals, goalProgress, onAddGoal, onDeleteGoal }: GoalsManagerProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalType, setGoalType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [goalCategory, setGoalCategory] = useState<'revenue' | 'clients'>('revenue');
  const [targetAmount, setTargetAmount] = useState("");
  const [description, setDescription] = useState("");

  const getCurrentPeriod = (type: Goal['type']): string => {
    const now = new Date();
    switch (type) {
      case 'daily':
        return now.toISOString().split('T')[0];
      case 'weekly':
        const year = now.getFullYear();
        const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
        return `${year}-W${week.toString().padStart(2, '0')}`;
      case 'monthly':
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'yearly':
        return now.getFullYear().toString();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      return;
    }

    const newGoal: Goal = {
      id: crypto.randomUUID(),
      type: goalType,
      targetAmount: parseFloat(targetAmount),
      period: getCurrentPeriod(goalType),
      description: description.trim() || undefined,
      goalType: goalCategory,
      createdAt: new Date(),
    };

    onAddGoal(newGoal);
    
    // Reset form
    setTargetAmount("");
    setDescription("");
    setGoalCategory('revenue');
    setShowAddForm(false);
  };

  const formatPeriod = (goal: Goal): string => {
    switch (goal.type) {
      case 'daily':
        return new Date(goal.period).toLocaleDateString();
      case 'weekly':
        const [year, week] = goal.period.split('-W');
        return `Week ${week}, ${year}`;
      case 'monthly':
        const [monthYear, month] = goal.period.split('-');
        return new Date(parseInt(monthYear), parseInt(month) - 1).toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        });
      case 'yearly':
        return goal.period;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">Goals Manager</h2>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="button-smooth">
          <Plus className="w-4 h-4 mr-2" />
          Set New Goal
        </Button>
      </div>

      {showAddForm && (
        <Card className="card-smooth">
          <CardHeader>
            <CardTitle>Set New Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalCategory">Goal Type</Label>
                  <Select value={goalCategory} onValueChange={(value: any) => setGoalCategory(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue Goal</SelectItem>
                      <SelectItem value="clients">Client Goal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goalType">Goal Period</Label>
                  <Select value={goalType} onValueChange={(value: any) => setGoalType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">
                    Target {goalCategory === 'revenue' ? 'Amount (£)' : 'Number of Clients'}
                  </Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    step={goalCategory === 'revenue' ? "0.01" : "1"}
                    min="0"
                    placeholder={goalCategory === 'revenue' ? "0.00" : "0"}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goalDescription">Description (optional)</Label>
                <Textarea
                  id="goalDescription"
                  placeholder="Describe your goal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="button-smooth">Set Goal</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="button-smooth">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="goals-grid">
        {goalProgress.map((progress) => (
          <Card key={progress.goal.id} className={`card-smooth ${progress.isCompleted ? "border-green-500" : ""}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize flex items-center gap-2 text-responsive">
                  {progress.isCompleted && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
                  <span className="truncate">{progress.goal.type} {progress.goal.goalType} Goal</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteGoal(progress.goal.id)}
                  className="text-destructive hover:text-destructive button-smooth flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-responsive">
                {formatPeriod(progress.goal)}
              </p>
              {progress.goal.description && (
                <p className="text-sm text-muted-foreground italic text-responsive mt-1">
                  {progress.goal.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <div className="text-right">
                  <div className="number-display text-primary text-lg">
                    {progress.goal.goalType === 'revenue' ? '£' : ''}{progress.currentAmount.toLocaleString()}{progress.goal.goalType === 'clients' ? ' clients' : ''}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    / {progress.goal.goalType === 'revenue' ? '£' : ''}{progress.goal.targetAmount.toLocaleString()}{progress.goal.goalType === 'clients' ? ' clients' : ''}
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${Math.min(progress.progressPercentage, 100)}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary">
                  {progress.progressPercentage.toFixed(1)}% complete
                </span>
                {progress.daysRemaining !== undefined && progress.daysRemaining > 0 && (
                  <span className="text-muted-foreground">
                    {progress.daysRemaining} days left
                  </span>
                )}
              </div>
              
              {progress.progressPercentage >= 100 && (
                <div className="text-sm text-green-600 font-medium flex items-center gap-1 animate-fade-in">
                  <CheckCircle className="w-4 h-4" />
                  Goal achieved! 🎉
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {goalProgress.length === 0 && (
        <Card className="card-smooth">
          <CardContent className="py-8 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals set yet</h3>
            <p className="text-muted-foreground mb-4">Set your first revenue goal to start tracking progress!</p>
            <Button onClick={() => setShowAddForm(true)} className="button-smooth">
              <Plus className="w-4 h-4 mr-2" />
              Set Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};