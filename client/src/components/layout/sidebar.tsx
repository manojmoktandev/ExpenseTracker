import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { PieChart, Receipt, Tags, BarChart3, X } from "lucide-react";

interface SidebarProps {
  currentTab: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ currentTab, isOpen, onClose }: SidebarProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: PieChart, path: "/dashboard" },
    { id: "expenses", label: "Expenses", icon: Receipt, path: "/expenses" },
    { id: "categories", label: "Categories", icon: Tags, path: "/categories" },
    { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  ];

  const handleNavClick = (path: string) => {
    setLocation(path);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background border-r border-sidebar-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <h1 className="text-xl font-semibold text-sidebar-foreground">ExpenseTracker</h1>
          <button
            className="lg:hidden text-sidebar-foreground hover:text-sidebar-foreground/80"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <Icon className={cn("mr-3 h-4 w-4", isActive && "text-sidebar-primary")} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
