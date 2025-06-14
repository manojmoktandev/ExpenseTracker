import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, getCategoryIcon, getCategoryColor } from "@/lib/utils";
import type { Category } from "@shared/schema";
import * as Icons from "lucide-react";
import { MoreVertical } from "lucide-react";

interface CategoryCardProps {
  category: Category;
  total: number;
  count: number;
}

export default function CategoryCard({ category, total, count }: CategoryCardProps) {
  const iconName = getCategoryIcon(category.icon);
  const IconComponent = Icons[iconName as keyof typeof Icons] as any;
  const colorClasses = getCategoryColor(category.color);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses}`}>
            {IconComponent && <IconComponent className="h-6 w-6" />}
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
        
        <h3 className="font-semibold text-foreground mb-2">{category.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {category.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-foreground">
            {formatCurrency(total)}
          </span>
          <span className="text-sm text-muted-foreground">
            {count} expense{count !== 1 ? 's' : ''}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
