import { Menu, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  currentTab: string;
  onMenuClick: () => void;
  onAddExpense: () => void;
}

export default function Header({ currentTab, onMenuClick, onAddExpense }: HeaderProps) {
  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      expenses: "Expenses",
      categories: "Categories",
      analytics: "Analytics",
    };
    return titles[currentTab as keyof typeof titles] || "Dashboard";
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden mr-3"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-semibold text-foreground">
            {getPageTitle()}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button onClick={onAddExpense} className="font-medium">
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
