import { useMemo, useState } from "react";
import { Calendar, PoundSterling, Target, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueEntryForm } from "@/components/RevenueEntryForm";
import { RevenueHistory } from "@/components/RevenueHistory";
import { RevenueChart } from "@/components/RevenueChart";
import { FilterPanel } from "@/components/FilterPanel";
import { GoalsManager } from "@/components/GoalsManager";
import CallsManager from "@/components/CallsManager";
import CalendarView from "@/components/CalendarView";
import PerformanceGrowth from "@/components/PerformanceGrowth";
import { TrendingUp as TrendingUpIcon, Target as TargetIcon, Calendar as CalendarIcon, BarChart3, Users, Phone, Activity } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { FilterCriteria } from "@/types/categories";
import { GoalProgress } from "@/types/revenue";
const Index = () => {
  const {
    revenueEntries,
    goals,
    calls,
    addRevenueEntry,
    updateRevenueEntry,
    deleteRevenueEntry,
    addGoal,
    deleteGoal
  } = useData();
  const [filters, setFilters] = useState<FilterCriteria>({
    dateRange: {},
    categories: [],
    amountRange: {},
    searchTerm: undefined
  });

  // Filter revenue entries based on current filters
  const filteredRevenueEntries = useMemo(() => {
    return revenueEntries.filter(entry => {
      // Date range filter
      if (filters.dateRange.from && new Date(entry.date) < filters.dateRange.from) {
        return false;
      }
      if (filters.dateRange.to && new Date(entry.date) > filters.dateRange.to) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && entry.category && !filters.categories.includes(entry.category)) {
        return false;
      }

      // Amount range filter
      if (filters.amountRange.min !== undefined && entry.amount < filters.amountRange.min) {
        return false;
      }
      if (filters.amountRange.max !== undefined && entry.amount > filters.amountRange.max) {
        return false;
      }

      // Search term filter
      if (filters.searchTerm && entry.description && !entry.description.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [revenueEntries, filters]);
  const goalProgress = useMemo((): GoalProgress[] => {
    return goals.map(goal => {
      const today = new Date();
      let relevantEntries = filteredRevenueEntries;
      if (goal.type === 'daily') {
        const goalDate = goal.period;
        relevantEntries = filteredRevenueEntries.filter(entry => entry.date === goalDate);
      } else if (goal.type === 'weekly') {
        const [year, week] = goal.period.split('-W');
        const weekStart = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        relevantEntries = filteredRevenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
      } else if (goal.type === 'monthly') {
        relevantEntries = filteredRevenueEntries.filter(entry => entry.date.startsWith(goal.period));
      } else if (goal.type === 'yearly') {
        relevantEntries = filteredRevenueEntries.filter(entry => entry.date.startsWith(goal.period));
      }
      const currentAmount = relevantEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const progressPercentage = currentAmount / goal.targetAmount * 100;
      const isCompleted = currentAmount >= goal.targetAmount;
      return {
        goal,
        currentAmount,
        progressPercentage: Math.min(progressPercentage, 100),
        isCompleted,
        daysRemaining: 0 // Simplified for now
      };
    });
  }, [goals, filteredRevenueEntries]);
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredRevenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalEntries = filteredRevenueEntries.length;

    // This month's revenue
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const lastMonth = `${now.getFullYear()}-${now.getMonth().toString().padStart(2, '0')}`;
    const thisMonthRevenue = filteredRevenueEntries.filter(entry => entry.date.startsWith(currentMonth)).reduce((sum, entry) => sum + entry.amount, 0);
    const lastMonthRevenue = revenueEntries // Use unfiltered for comparison
    .filter(entry => entry.date.startsWith(lastMonth)).reduce((sum, entry) => sum + entry.amount, 0);

    // This week's revenue
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    const thisWeekRevenue = filteredRevenueEntries.filter(entry => new Date(entry.date) >= startOfWeek).reduce((sum, entry) => sum + entry.amount, 0);
    const lastWeekRevenue = revenueEntries // Use unfiltered for comparison
    .filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startOfLastWeek && entryDate < startOfWeek;
    }).reduce((sum, entry) => sum + entry.amount, 0);

    // Call conversion metrics
    const currentMonthCalls = calls.filter(call => call.date.startsWith(currentMonth));
    const lastMonthCalls = calls.filter(call => call.date.startsWith(lastMonth));
    const currentMonthConversions = currentMonthCalls.filter(call => call.isConverted).length;
    const lastMonthConversions = lastMonthCalls.filter(call => call.isConverted).length;
    const currentMonthCompletedCalls = currentMonthCalls.filter(call => call.status === 'completed').length;
    const lastMonthCompletedCalls = lastMonthCalls.filter(call => call.status === 'completed').length;
    const currentConversionRate = currentMonthCompletedCalls > 0 ? currentMonthConversions / currentMonthCompletedCalls * 100 : 0;
    const lastConversionRate = lastMonthCompletedCalls > 0 ? lastMonthConversions / lastMonthCompletedCalls * 100 : 0;

    // Calculate growth percentages
    const monthlyGrowth = lastMonthRevenue > 0 ? (thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100 : 0;
    const weeklyGrowth = lastWeekRevenue > 0 ? (thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue * 100 : 0;
    const conversionGrowth = lastConversionRate > 0 ? (currentConversionRate - lastConversionRate) / lastConversionRate * 100 : 0;
    const completedGoals = goalProgress.filter(gp => gp.isCompleted).length;
    const totalGoals = goals.length;
    return {
      totalRevenue,
      totalEntries,
      thisMonthRevenue,
      thisWeekRevenue,
      completedGoals,
      totalGoals,
      monthlyGrowth,
      weeklyGrowth,
      currentConversionRate,
      conversionGrowth,
      currentMonthConversions
    };
  }, [filteredRevenueEntries, revenueEntries, goalProgress, goals, calls]);
  const formatGrowthIndicator = (growth: number) => {
    if (growth === 0) return null;
    const isPositive = growth > 0;
    const absGrowth = Math.abs(growth);
    return <div className={`flex items-center gap-1 animate-fade-in ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        <span className="text-xs font-medium">
          {absGrowth.toFixed(1)}%
        </span>
      </div>;
  };
  return <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Revenue & Conversion Dashboard</h1>
          <p className="text-muted-foreground">
            Track your daily revenue and monitor progress towards your goals
          </p>
        </div>

        {/* Filter Panel */}
        <FilterPanel filters={filters} onFiltersChange={setFilters} totalEntries={revenueEntries.length} filteredEntries={filteredRevenueEntries.length} />

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="card-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-responsive">Total Revenue</CardTitle>
              <PoundSterling className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl number-display text-primary">
                £{summaryStats.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {summaryStats.totalEntries} entries
              </p>
            </CardContent>
          </Card>

          <Card className="card-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-responsive">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl number-display text-primary">
                £{summaryStats.thisMonthRevenue.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Current month revenue
                </p>
                {formatGrowthIndicator(summaryStats.monthlyGrowth)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-responsive">This Week</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl number-display text-primary">
                £{summaryStats.thisWeekRevenue.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  Current week revenue
                </p>
                {formatGrowthIndicator(summaryStats.weeklyGrowth)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-responsive">Conversions</CardTitle>
              <Target className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl number-display text-primary">
                {summaryStats.currentMonthConversions}
              </div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {summaryStats.currentConversionRate.toFixed(1)}% rate this month
                </p>
                {formatGrowthIndicator(summaryStats.conversionGrowth)}
              </div>
            </CardContent>
          </Card>

          <Card className="card-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-responsive">Calls This Month</CardTitle>
              <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl number-display text-primary">
                {calls.filter(call => {
                const now = new Date();
                const currentMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
                return call.date.startsWith(currentMonth);
              }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total calls made
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="tabs-list-enhanced">
            <TabsTrigger value="dashboard" className="tab-trigger-enhanced gap-3">
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="tab-trigger-enhanced gap-3">
              <PoundSterling className="w-5 h-5" />
              <span className="hidden sm:inline">Revenue</span>
              <span className="sm:hidden">£</span>
            </TabsTrigger>
            <TabsTrigger value="calls" className="tab-trigger-enhanced gap-3">
              <Phone className="w-5 h-5" />
              <span className="hidden sm:inline">Calls</span>
              <span className="sm:hidden">Calls</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="tab-trigger-enhanced gap-3">
              <Activity className="w-5 h-5" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Perf</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="tab-trigger-enhanced gap-3">
              <TrendingUpIcon className="w-5 h-5" />
              <span className="hidden sm:inline">History</span>
              <span className="sm:hidden">Log</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RevenueChart entries={filteredRevenueEntries} />
              <div>
                <RevenueHistory entries={filteredRevenueEntries} onUpdateEntry={updateRevenueEntry} onDeleteEntry={deleteRevenueEntry} />
              </div>
            </div>
            {goals.length > 0 && <div className="goals-grid">
                {goalProgress.slice(0, 4).map(progress => <Card key={progress.goal.id} className="card-smooth">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg capitalize flex items-center gap-2 text-responsive">
                        <Target className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{progress.goal.type} Goal</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-end text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <div className="text-right">
                          <div className="number-display text-primary text-lg">
                            £{progress.currentAmount.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            / £{progress.goal.targetAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                        <div className="bg-primary h-3 rounded-full transition-all duration-500 ease-out" style={{
                    width: `${Math.min(progress.progressPercentage, 100)}%`
                  }} />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-primary">
                          {progress.progressPercentage.toFixed(1)}% complete
                        </span>
                        {progress.daysRemaining !== undefined && progress.daysRemaining > 0 && <span className="text-muted-foreground">
                            {progress.daysRemaining} days left
                          </span>}
                      </div>
                    </CardContent>
                  </Card>)}
              </div>}
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueEntryForm onAddEntry={addRevenueEntry} />
            <RevenueChart entries={filteredRevenueEntries} />
          </TabsContent>

          <TabsContent value="calls" className="space-y-6">
            <CallsManager />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceGrowth />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <RevenueHistory entries={filteredRevenueEntries} onUpdateEntry={updateRevenueEntry} onDeleteEntry={deleteRevenueEntry} />
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default Index;