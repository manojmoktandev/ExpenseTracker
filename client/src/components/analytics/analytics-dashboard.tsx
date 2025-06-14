import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from "@/lib/utils";
import { TrendingUp, PieChart, BarChart3, Activity, DollarSign, Calendar, Target } from "lucide-react";
import type { Category, ExpenseWithCategory } from "@shared/schema";
import * as Icons from "lucide-react";

interface SummaryData {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  averageDaily: number;
}

export default function AnalyticsDashboard() {
  const { data: expenses = [] } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categoryStats = [] } = useQuery<{ category: Category; total: number; count: number }[]>({
    queryKey: ["/api/analytics/categories"],
  });

  const { data: summary } = useQuery<SummaryData>({
    queryKey: ["/api/analytics/summary"],
  });

  // Calculate spending trends
  const getSpendingTrend = () => {
    const now = new Date();
    const lastWeek = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      return expenseDate >= twoWeeksAgo && expenseDate < weekAgo;
    });
    
    const thisWeek = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return expenseDate >= weekAgo;
    });

    const lastWeekTotal = lastWeek.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const thisWeekTotal = thisWeek.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    const change = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : 0;
    return { change, thisWeekTotal, lastWeekTotal };
  };

  const spendingTrend = getSpendingTrend();

  // Top expenses this month
  const topExpenses = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return expenseDate >= monthStart;
    })
    .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount))
    .slice(0, 5);

  // Daily spending for the last 7 days
  const dailySpending = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.toDateString() === date.toDateString();
    });
    const total = dayExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      total,
      count: dayExpenses.length,
    };
  }).reverse();

  const maxDailySpending = Math.max(...dailySpending.map(day => day.total), 1);

  return (
    <div className="space-y-6 p-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.monthTotal || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {expenses.filter(e => {
                    const expenseDate = new Date(e.date);
                    const now = new Date();
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    return expenseDate >= monthStart;
                  }).length} transactions
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Trend</p>
                <p className="text-2xl font-bold">{formatCurrency(spendingTrend.thisWeekTotal)}</p>
                <p className={`text-xs mt-1 flex items-center ${
                  spendingTrend.change > 0 ? 'text-red-500' : 'text-green-500'
                }`}>
                  <TrendingUp className={`h-3 w-3 mr-1 ${spendingTrend.change < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(spendingTrend.change).toFixed(1)}% vs last week
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.averageDaily || 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories Used</p>
                <p className="text-2xl font-bold">{categoryStats.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Active categories</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Daily Spending (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailySpending.map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{day.date}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(day.total)} ({day.count} expenses)
                    </span>
                  </div>
                  <Progress 
                    value={(day.total / maxDailySpending) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="mr-2 h-5 w-5" />
              Category Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryStats.slice(0, 6).map((stat) => {
                const iconName = getCategoryIcon(stat.category.icon);
                const IconComponent = Icons[iconName as keyof typeof Icons] as any;
                const colorClasses = getCategoryColor(stat.category.color);
                const totalSpent = categoryStats.reduce((sum, s) => sum + s.total, 0);
                const percentage = totalSpent > 0 ? (stat.total / totalSpent) * 100 : 0;

                return (
                  <div key={stat.category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses}`}>
                          {IconComponent && <IconComponent className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-medium">{stat.category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">{formatCurrency(stat.total)}</span>
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Expenses and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expenses This Month */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Top Expenses This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topExpenses.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No expenses this month</p>
              ) : (
                topExpenses.map((expense, index) => {
                  const iconName = getCategoryIcon(expense.category.icon);
                  const IconComponent = Icons[iconName as keyof typeof Icons] as any;
                  const colorClasses = getCategoryColor(expense.category.color);

                  return (
                    <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-muted-foreground w-4">#{index + 1}</span>
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses}`}>
                            {IconComponent && <IconComponent className="h-4 w-4" />}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{expense.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {expense.category.name} • {formatDate(expense.date)}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spending Goals */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Monthly Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Budget */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Budget</span>
                  <Badge variant="secondary">$2,000</Badge>
                </div>
                <Progress value={((summary?.monthTotal || 0) / 2000) * 100} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Spent: {formatCurrency(summary?.monthTotal || 0)}</span>
                  <span>Remaining: {formatCurrency(2000 - (summary?.monthTotal || 0))}</span>
                </div>
              </div>

              {/* Category Budgets */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Category Budgets</h4>
                {[
                  { name: "Food & Dining", budget: 600, spent: categoryStats.find(s => s.category.name === "Food & Dining")?.total || 0 },
                  { name: "Transportation", budget: 300, spent: categoryStats.find(s => s.category.name === "Transportation")?.total || 0 },
                  { name: "Entertainment", budget: 200, spent: categoryStats.find(s => s.category.name === "Entertainment")?.total || 0 },
                ].map((item) => {
                  const percentage = (item.spent / item.budget) * 100;
                  const isOverBudget = percentage > 100;
                  
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{item.name}</span>
                        <span className={isOverBudget ? "text-red-500" : "text-muted-foreground"}>
                          {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-1.5 ${isOverBudget ? '[&>div]:bg-red-500' : ''}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}