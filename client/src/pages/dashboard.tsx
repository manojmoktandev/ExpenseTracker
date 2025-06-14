import { useState } from "react";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import SummaryCards from "@/components/dashboard/summary-cards";
import RecentExpenses from "@/components/dashboard/recent-expenses";
import CategoryBreakdown from "@/components/dashboard/category-breakdown";
import ExpenseTable from "@/components/expenses/expense-table";
import ExpenseFilters from "@/components/expenses/expense-filters";
import CategoryCard from "@/components/categories/category-card";
import AddExpenseModal from "@/components/expenses/add-expense-modal";
import AddCategoryModal from "@/components/categories/add-category-modal";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";
import { useQuery } from "@tanstack/react-query";
import type { Category, ExpenseWithCategory } from "@shared/schema";
import { Plus } from "lucide-react";

export default function Dashboard() {
  const [location] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
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
            <div className="space-y-6">
              <ExpenseFilters />
              <ExpenseTable expenses={expenses} categories={categories} />
            </div>
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
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-card rounded-lg border-2 border-dashed border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Plus className="text-muted-foreground h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Add Category</h3>
                <p className="text-sm text-muted-foreground">Create a new expense category</p>
              </button>
            </div>
          </main>
        );

      case "analytics":
        return <AnalyticsDashboard />;

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

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />
    </div>
  );
}
