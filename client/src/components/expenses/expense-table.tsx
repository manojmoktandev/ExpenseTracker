import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getCategoryIcon, getCategoryColor } from "@/lib/utils";
import type { ExpenseWithCategory, Category } from "@shared/schema";
import * as Icons from "lucide-react";
import { Search, Edit, Trash2 } from "lucide-react";

interface ExpenseTableProps {
  expenses: ExpenseWithCategory[];
  categories: Category[];
}

export default function ExpenseTable({ expenses, categories }: ExpenseTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date-newest");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/categories"] });
      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(id);
    }
  };

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch = expense.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" ||
        expense.categoryId.toString() === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "amount-high":
          return parseFloat(b.amount) - parseFloat(a.amount);
        case "amount-low":
          return parseFloat(a.amount) - parseFloat(b.amount);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search expenses..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-newest">Date (newest)</SelectItem>
                  <SelectItem value="date-oldest">Date (oldest)</SelectItem>
                  <SelectItem value="amount-high">Amount (high to low)</SelectItem>
                  <SelectItem value="amount-low">Amount (low to high)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">All Expenses</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">No expenses found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || selectedCategory !== "all"
                          ? "Try adjusting your filters"
                          : "Add your first expense to get started"}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => {
                    const iconName = getCategoryIcon(expense.category.icon);
                    const IconComponent = Icons[iconName as keyof typeof Icons] as any;
                    const colorClasses = getCategoryColor(expense.category.color);

                    return (
                      <TableRow key={expense.id} className="hover:bg-accent/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${colorClasses}`}>
                              {IconComponent && <IconComponent className="h-4 w-4" />}
                            </div>
                            <span className="font-medium">{expense.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${
                              expense.category.color === 'red' ? 'bg-red-500/10 text-red-600' :
                              expense.category.color === 'blue' ? 'bg-blue-500/10 text-blue-600' :
                              expense.category.color === 'green' ? 'bg-green-500/10 text-green-600' :
                              expense.category.color === 'purple' ? 'bg-purple-500/10 text-purple-600' :
                              'bg-gray-500/10 text-gray-600'
                            }`}
                          >
                            {expense.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(expense.date)}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(expense.id)}
                              disabled={deleteExpenseMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
