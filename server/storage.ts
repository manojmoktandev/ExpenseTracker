import { categories, expenses, type Category, type Expense, type InsertCategory, type InsertExpense, type ExpenseWithCategory } from "@shared/schema";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Expenses
  getExpenses(): Promise<ExpenseWithCategory[]>;
  getExpenseById(id: number): Promise<ExpenseWithCategory | undefined>;
  createExpense(expense: InsertExpense): Promise<ExpenseWithCategory>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<ExpenseWithCategory | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Analytics
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]>;
  getExpensesByCategory(): Promise<{ category: Category; total: number; count: number }[]>;
}

export class MemStorage implements IStorage {
  private categories: Map<number, Category>;
  private expenses: Map<number, Expense>;
  private currentCategoryId: number;
  private currentExpenseId: number;

  constructor() {
    this.categories = new Map();
    this.expenses = new Map();
    this.currentCategoryId = 1;
    this.currentExpenseId = 1;
    
    // Initialize with default categories
    this.initializeDefaultCategories();
  }

  private initializeDefaultCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Food & Dining", icon: "fas fa-utensils", color: "red", description: "Restaurants, cafes, groceries" },
      { name: "Transportation", icon: "fas fa-car", color: "blue", description: "Gas, public transport, ride-sharing" },
      { name: "Shopping", icon: "fas fa-shopping-cart", color: "green", description: "Clothes, electronics, household items" },
      { name: "Entertainment", icon: "fas fa-gamepad", color: "purple", description: "Movies, games, events" },
      { name: "Utilities", icon: "fas fa-bolt", color: "yellow", description: "Electricity, water, internet" },
      { name: "Healthcare", icon: "fas fa-heartbeat", color: "pink", description: "Medical expenses, pharmacy" },
      { name: "Other", icon: "fas fa-question", color: "gray", description: "Miscellaneous expenses" },
    ];

    defaultCategories.forEach(category => {
      const id = this.currentCategoryId++;
      const categoryWithId: Category = { ...category, id };
      this.categories.set(id, categoryWithId);
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getExpenses(): Promise<ExpenseWithCategory[]> {
    const expensesList = Array.from(this.expenses.values());
    const result: ExpenseWithCategory[] = [];
    
    for (const expense of expensesList) {
      const category = this.categories.get(expense.categoryId);
      if (category) {
        result.push({ ...expense, category });
      }
    }
    
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpenseById(id: number): Promise<ExpenseWithCategory | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const category = this.categories.get(expense.categoryId);
    if (!category) return undefined;
    
    return { ...expense, category };
  }

  async createExpense(insertExpense: InsertExpense): Promise<ExpenseWithCategory> {
    const id = this.currentExpenseId++;
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: new Date(),
    };
    
    this.expenses.set(id, expense);
    
    const category = this.categories.get(expense.categoryId);
    if (!category) throw new Error("Category not found");
    
    return { ...expense, category };
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<ExpenseWithCategory | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...updateData };
    this.expenses.set(id, updatedExpense);
    
    const category = this.categories.get(updatedExpense.categoryId);
    if (!category) return undefined;
    
    return { ...updatedExpense, category };
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<ExpenseWithCategory[]> {
    const allExpenses = await this.getExpenses();
    return allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }

  async getExpensesByCategory(): Promise<{ category: Category; total: number; count: number }[]> {
    const allExpenses = await this.getExpenses();
    const categoryTotals = new Map<number, { total: number; count: number }>();
    
    for (const expense of allExpenses) {
      const current = categoryTotals.get(expense.categoryId) || { total: 0, count: 0 };
      current.total += parseFloat(expense.amount);
      current.count += 1;
      categoryTotals.set(expense.categoryId, current);
    }
    
    const result: { category: Category; total: number; count: number }[] = [];
    for (const [categoryId, totals] of categoryTotals) {
      const category = this.categories.get(categoryId);
      if (category) {
        result.push({ category, ...totals });
      }
    }
    
    return result.sort((a, b) => b.total - a.total);
  }
}

export const storage = new MemStorage();
