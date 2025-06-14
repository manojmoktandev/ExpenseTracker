import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Calendar, CalendarIcon, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SummaryData {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  averageDaily: number;
}

export default function SummaryCards() {
  const { data, isLoading } = useQuery<SummaryData>({
    queryKey: ["/api/analytics/summary"],
  });

  const cards = [
    {
      title: "Today's Expenses",
      value: data?.todayTotal || 0,
      icon: CalendarDays,
      color: "blue",
      change: "+12% from yesterday",
    },
    {
      title: "This Week",
      value: data?.weekTotal || 0,
      icon: Calendar,
      color: "emerald",
      change: "-5% from last week",
    },
    {
      title: "This Month",
      value: data?.monthTotal || 0,
      icon: CalendarIcon,
      color: "purple",
      change: "+8% from last month",
    },
    {
      title: "Average Daily",
      value: data?.averageDaily || 0,
      icon: TrendingUp,
      color: "orange",
      change: "Based on 30 days",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(card.value)}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  card.color === 'blue' ? 'bg-blue-500/10' :
                  card.color === 'emerald' ? 'bg-emerald-500/10' :
                  card.color === 'purple' ? 'bg-purple-500/10' : 'bg-orange-500/10'
                }`}>
                  <Icon className={`h-6 w-6 ${
                    card.color === 'blue' ? 'text-blue-500' :
                    card.color === 'emerald' ? 'text-emerald-500' :
                    card.color === 'purple' ? 'text-purple-500' : 'text-orange-500'
                  }`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {card.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
