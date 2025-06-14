import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SummaryCards from "@/components/dashboard/summary-cards";
import RecentExpenses from "@/components/dashboard/recent-expenses";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import ExpenseTable from "@/components/expenses/expense-table";
import CategoryCard from "@/components/categories/category-card";
import AddExpenseModal from "@/components/expenses/add-expense-modal";
import { useQuery } from "@tanstack/react-query";
import type { Category, ExpenseWithCategory } from "@shared/schema";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const [location] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine current tab from URL
  const getCurrentTab = () => {
    if (location === "/" || location === "/dashboard") return "dashboard";
    if (location === "/expenses") return "expenses";
    if (location === "/categories") return "categories";
    if (location === "/analytics") return "analytics";
    return "dashboard";
  };

  const currentTab = getCurrentTab();

  const { data: expenses = [] } = useQuery<ExpenseWithCategory[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: categoryStats = [] } = useQuery<{ category: Category; total: number; count: number }[]>({
    queryKey: ["/api/analytics/categories"],
  });

  const renderTabContent = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <main className="p-6">
            <SummaryCards />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
              <div className="lg:col-span-2">
                <RecentExpenses expenses={expenses.slice(0, 4)} />
              </div>
              <CategoryBreakdown categoryStats={categoryStats.slice(0, 4)} />
            </div>
          </main>
        );

      case "expenses":
        return (
          <main className="p-6">
            <ExpenseTable expenses={expenses} categories={categories} />
          </main>
        );

      case "categories":
        return (
          <main className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryStats.map(({ category, total, count }) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  total={total}
                  count={count}
                />
              ))}
              <div className="bg-card rounded-lg border-2 border-dashed border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <span className="text-muted-foreground text-xl">+</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Add Category</h3>
                <p className="text-sm text-muted-foreground">Create a new expense category</p>
              </div>
            </div>
          </main>
        );

      case "analytics":
        return (
          <main className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Spending Trends</h3>
                <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-muted-foreground">Chart visualization would be implemented here</p>
                    <p className="text-sm text-muted-foreground">Using Recharts library</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Category Distribution</h3>
                <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-muted-foreground">Pie chart would be implemented here</p>
                    <p className="text-sm text-muted-foreground">Showing expense distribution by category</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Comparison</h3>
                <div className="h-64 bg-muted/20 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mb-2 mx-auto" />
                    <p className="text-muted-foreground">Bar chart comparing monthly expenses</p>
                    <p className="text-sm text-muted-foreground">Last 6 months comparison</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Expenses This Month</h3>
                <div className="space-y-4">
                  {expenses.slice(0, 3).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${expense.category.color === 'red' ? 'bg-red-500/10' : expense.category.color === 'blue' ? 'bg-blue-500/10' : expense.category.color === 'green' ? 'bg-green-500/10' : 'bg-purple-500/10'}`}>
                          <span className="text-xs">
                            {expense.category.icon.includes('utensils') ? '🍽️' : 
                             expense.category.icon.includes('car') ? '🚗' : 
                             expense.category.icon.includes('shopping') ? '🛒' : '🎮'}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{expense.description}</span>
                      </div>
                      <span className="font-semibold text-foreground">${expense.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentTab={currentTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="lg:ml-64">
        <Header
          currentTab={currentTab}
          onMenuClick={() => setIsSidebarOpen(true)}
          onAddExpense={() => setIsModalOpen(true)}
        />
        {renderTabContent()}
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
      />
    </div>
  );
}
