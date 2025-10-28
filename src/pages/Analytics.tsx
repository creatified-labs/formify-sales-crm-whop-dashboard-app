import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  TrendingUp, 
  Calendar, 
  PoundSterling, 
  Target, 
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Award,
  Zap
} from "lucide-react";
import { RevenueEntry, Goal } from "@/types/revenue";
import { DEFAULT_REVENUE_CATEGORIES } from "@/types/categories";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

interface AnalyticsProps {
  revenueEntries: RevenueEntry[];
  goals: Goal[];
}

const Analytics = ({ revenueEntries, goals }: AnalyticsProps) => {
  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const thisWeekEnd = endOfWeek(now);
    const thisMonthStart = startOfMonth(now);
    const thisMonthEnd = endOfMonth(now);
    
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekEnd);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(thisMonthEnd);
    lastMonthEnd.setMonth(lastMonthEnd.getMonth() - 1);

    // Filter entries by time periods
    const thisWeekEntries = revenueEntries.filter(entry => 
      isWithinInterval(new Date(entry.date), { start: thisWeekStart, end: thisWeekEnd })
    );
    const lastWeekEntries = revenueEntries.filter(entry => 
      isWithinInterval(new Date(entry.date), { start: lastWeekStart, end: lastWeekEnd })
    );
    const thisMonthEntries = revenueEntries.filter(entry => 
      isWithinInterval(new Date(entry.date), { start: thisMonthStart, end: thisMonthEnd })
    );
    const lastMonthEntries = revenueEntries.filter(entry => 
      isWithinInterval(new Date(entry.date), { start: lastMonthStart, end: lastMonthEnd })
    );

    // Calculate totals
    const thisWeekTotal = thisWeekEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const lastWeekTotal = lastWeekEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const thisMonthTotal = thisMonthEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const lastMonthTotal = lastMonthEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    const weeklyGrowth = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
    const monthlyGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Category breakdown
    const categoryBreakdown = DEFAULT_REVENUE_CATEGORIES.map(category => {
      const categoryEntries = revenueEntries.filter(entry => entry.category === category.id);
      const total = categoryEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const count = categoryEntries.length;
      return {
        ...category,
        total,
        count,
        percentage: revenueEntries.length > 0 ? (count / revenueEntries.length) * 100 : 0
      };
    }).filter(cat => cat.total > 0);

    // Day of week analysis
    const dayOfWeekData = Array.from({ length: 7 }, (_, i) => {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][i];
      const dayEntries = revenueEntries.filter(entry => new Date(entry.date).getDay() === i);
      const total = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const average = dayEntries.length > 0 ? total / dayEntries.length : 0;
      return {
        day: dayName.slice(0, 3),
        total,
        average,
        count: dayEntries.length
      };
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (5 - i));
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthEntries = revenueEntries.filter(entry => 
        isWithinInterval(new Date(entry.date), { start: monthStart, end: monthEnd })
      );
      
      const total = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);
      return {
        month: format(date, 'MMM yyyy'),
        total,
        count: monthEntries.length
      };
    });

    // Performance insights
    const totalRevenue = revenueEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const averagePerEntry = revenueEntries.length > 0 ? totalRevenue / revenueEntries.length : 0;
    const bestDay = dayOfWeekData.reduce((best, day) => day.average > best.average ? day : best, dayOfWeekData[0]);
    const mostUsedCategory = categoryBreakdown.reduce((most, cat) => cat.count > most.count ? cat : most, categoryBreakdown[0]);

    return {
      thisWeekTotal,
      lastWeekTotal,
      thisMonthTotal,
      lastMonthTotal,
      weeklyGrowth,
      monthlyGrowth,
      categoryBreakdown,
      dayOfWeekData,
      monthlyTrend,
      totalRevenue,
      averagePerEntry,
      bestDay,
      mostUsedCategory
    };
  }, [revenueEntries]);

  // Goal completion analytics
  const goalAnalytics = useMemo(() => {
    const activeGoals = goals.length;
    const completedGoals = goals.filter(goal => {
      // This is a simplified completion check - you'd want to use your existing goal progress logic
      return false; // Placeholder
    }).length;
    
    return {
      activeGoals,
      completedGoals,
      completionRate: activeGoals > 0 ? (completedGoals / activeGoals) * 100 : 0
    };
  }, [goals]);

  if (revenueEntries.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="card-smooth">
            <CardContent className="py-16 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Data Yet</h2>
              <p className="text-muted-foreground">
                Add some revenue entries to see detailed analytics and insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Revenue Analytics
          </h1>
          <p className="text-muted-foreground">
            Deep insights into your revenue patterns and performance
          </p>
        </div>

        {/* Key Performance Indicators */}
        <div className="stats-grid">
          <Card className="card-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-responsive">Weekly Growth</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl lg:text-3xl number-display ${analytics.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.weeklyGrowth >= 0 ? '+' : ''}{analytics.weeklyGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs last week (£{analytics.lastWeekTotal.toLocaleString()})
              </p>
            </CardContent>
          </Card>

          <Card className="card-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-responsive">Monthly Growth</CardTitle>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl lg:text-3xl number-display ${analytics.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.monthlyGrowth >= 0 ? '+' : ''}{analytics.monthlyGrowth.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                vs last month (£{analytics.lastMonthTotal.toLocaleString()})
              </p>
            </CardContent>
          </Card>

          <Card className="card-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-responsive">Average per Entry</CardTitle>
                <PoundSterling className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl number-display text-primary">
                £{analytics.averagePerEntry.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across {revenueEntries.length} entries
              </p>
            </CardContent>
          </Card>

          <Card className="card-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-responsive">Best Performance Day</CardTitle>
                <Award className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl lg:text-3xl number-display text-primary">
                {analytics.bestDay?.day}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                £{analytics.bestDay?.average.toLocaleString()} average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Monthly Trend */}
          <Card className="card-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-responsive">
                <BarChart3 className="w-6 h-6" />
                Monthly Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `£${value}`} />
                    <Tooltip formatter={(value) => [`£${value}`, 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="card-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-responsive">
                <PieChartIcon className="w-6 h-6" />
                Revenue by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="total"
                    >
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `£${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Day of Week Performance */}
          <Card className="card-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-responsive">
                <Activity className="w-6 h-6" />
                Performance by Day of Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `£${value}`} />
                    <Tooltip formatter={(value) => [`£${value}`, 'Average']} />
                    <Bar 
                      dataKey="average" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Insights Panel */}
          <Card className="card-smooth">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-responsive">
                <Zap className="w-6 h-6" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Most Productive Category</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.mostUsedCategory?.name} accounts for {analytics.mostUsedCategory?.count} entries 
                      (£{analytics.mostUsedCategory?.total.toLocaleString()})
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Best Performance Day</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.bestDay?.day}s generate £{analytics.bestDay?.average.toLocaleString()} on average
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Growth Momentum</p>
                    <p className="text-xs text-muted-foreground">
                      {analytics.weeklyGrowth >= 0 ? 'Positive' : 'Negative'} weekly trend of {Math.abs(analytics.weeklyGrowth).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Performance Table */}
        <Card className="card-smooth">
          <CardHeader>
            <CardTitle className="text-responsive">Category Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.categoryBreakdown.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium text-responsive">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.count} entries</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium number-display">£{category.total.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;