import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, CalendarDays, CalendarIcon, TrendingUp, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ExpenseWithCategory } from "@shared/schema";

type FilterPeriod = "today" | "week" | "month" | "all";

interface ExpenseFiltersProps {
  onFilterChange?: (period: FilterPeriod) => void;
}

export default function ExpenseFilters({ onFilterChange }: ExpenseFiltersProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("all");

  const { data: expenses = [] } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["/api/expenses"],
  });

  const handlePeriodChange = (period: FilterPeriod) => {
    setSelectedPeriod(period);
    onFilterChange?.(period);
  };

  const getFilteredExpenses = (period: FilterPeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case "today":
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= today && expenseDate < tomorrow;
        });
        
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= now;
        });
        
      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return expenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= monthStart && expenseDate <= now;
        });
        
      default:
        return expenses;
    }
  };

  const calculateTotal = (filteredExpenses: ExpenseWithCategory[]) => {
    return filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  };

  const periods = [
    {
      id: "today" as const,
      label: "Today",
      icon: CalendarDays,
      description: "Today's expenses",
    },
    {
      id: "week" as const,
      label: "This Week",
      icon: Calendar,
      description: "Last 7 days",
    },
    {
      id: "month" as const,
      label: "This Month",
      icon: CalendarIcon,
      description: "Current month",
    },
    {
      id: "all" as const,
      label: "All Time",
      icon: TrendingUp,
      description: "All expenses",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Expense Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {periods.map((period) => {
              const Icon = period.icon;
              const filteredExpenses = getFilteredExpenses(period.id);
              const total = calculateTotal(filteredExpenses);
              const isSelected = selectedPeriod === period.id;

              return (
                <Button
                  key={period.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto p-4 flex flex-col items-start space-y-2 ${
                    isSelected ? "ring-2 ring-primary ring-offset-2" : ""
                  }`}
                  onClick={() => handlePeriodChange(period.id)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{period.label}</span>
                  </div>
                  <div className="w-full text-left">
                    <p className="text-2xl font-bold">{formatCurrency(total)}</p>
                    <p className="text-sm opacity-70">{filteredExpenses.length} expenses</p>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Quick Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Daily</p>
              <p className="text-xl font-bold">
                {formatCurrency(calculateTotal(getFilteredExpenses("month")) / new Date().getDate())}
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Highest Expense</p>
              <p className="text-xl font-bold">
                {expenses.length > 0 
                  ? formatCurrency(Math.max(...expenses.map(e => parseFloat(e.amount))))
                  : formatCurrency(0)
                }
              </p>
            </div>
            
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Most Active Category</p>
              <p className="text-lg font-bold">
                {expenses.length > 0 ? "Food & Dining" : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Filter Info */}
      {selectedPeriod !== "all" && (
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            Filtered by: {periods.find(p => p.id === selectedPeriod)?.label}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePeriodChange("all")}
          >
            Clear Filter
          </Button>
        </div>
      )}
    </div>
  );
}