import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, getCategoryIcon, getCategoryColor } from "@/lib/utils";
import type { ExpenseWithCategory } from "@shared/schema";
import * as Icons from "lucide-react";

interface RecentExpensesProps {
  expenses: ExpenseWithCategory[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Expenses</h3>
          <Button variant="link" className="text-sm text-primary">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {expenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses yet</p>
            <p className="text-sm text-muted-foreground">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((expense) => {
              const iconName = getCategoryIcon(expense.category.icon);
              const IconComponent = Icons[iconName as keyof typeof Icons] as any;
              const colorClasses = getCategoryColor(expense.category.color);

              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 hover:bg-accent rounded-md transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses}`}>
                      {IconComponent && <IconComponent className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category.name} • {formatDateTime(expense.date)}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
