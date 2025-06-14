import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, getCategoryIcon, getCategoryColor } from "@/lib/utils";
import type { Category } from "@shared/schema";
import * as Icons from "lucide-react";

interface CategoryBreakdownProps {
  categoryStats: { category: Category; total: number; count: number }[];
}

export default function CategoryBreakdown({ categoryStats }: CategoryBreakdownProps) {
  const maxTotal = Math.max(...categoryStats.map(stat => stat.total), 1);

  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Category Breakdown</h3>
        <p className="text-sm text-muted-foreground">This month's spending</p>
      </CardHeader>
      <CardContent className="p-6">
        {categoryStats.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No expenses yet</p>
            <p className="text-sm text-muted-foreground">Start adding expenses to see breakdown</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryStats.map((stat) => {
              const iconName = getCategoryIcon(stat.category.icon);
              const IconComponent = Icons[iconName as keyof typeof Icons] as any;
              const colorClasses = getCategoryColor(stat.category.color);
              const percentage = (stat.total / maxTotal) * 100;

              return (
                <div key={stat.category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses}`}>
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {stat.category.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(stat.total)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
