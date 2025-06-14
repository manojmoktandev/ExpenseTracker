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
    
    // Initialize with default categories and sample expenses
    this.initializeDefaultCategories();
    this.initializeSampleExpenses();
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
      const categoryWithId: Category = { ...category, id, description: category.description ?? null };
      this.categories.set(id, categoryWithId);
    });
  }

  private initializeSampleExpenses() {
    const now = new Date();
    const sampleExpenses = [
      // Today's expenses
      { amount: "15.50", description: "Lunch at Pizza Palace", categoryId: 1, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 30) },
      { amount: "8.75", description: "Coffee and pastry", categoryId: 1, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 15) },
      { amount: "45.00", description: "Gas station fill-up", categoryId: 2, date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 45) },
      
      // Yesterday's expenses
      { amount: "89.99", description: "Grocery shopping", categoryId: 1, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 18, 0) },
      { amount: "25.00", description: "Movie tickets", categoryId: 4, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 19, 30) },
      { amount: "12.50", description: "Uber ride", categoryId: 2, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 22, 15) },
      
      // This week's expenses
      { amount: "120.00", description: "Electric bill", categoryId: 5, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 10, 0) },
      { amount: "65.99", description: "New shirt", categoryId: 3, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 15, 30) },
      { amount: "35.00", description: "Dinner with friends", categoryId: 1, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 4, 19, 0) },
      { amount: "18.99", description: "Streaming subscription", categoryId: 4, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 9, 0) },
      
      // Earlier this month
      { amount: "150.00", description: "Doctor visit", categoryId: 6, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 8, 14, 0) },
      { amount: "75.50", description: "Weekend groceries", categoryId: 1, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 10, 11, 30) },
      { amount: "42.00", description: "Phone bill", categoryId: 5, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 12, 16, 0) },
      { amount: "28.99", description: "Book purchase", categoryId: 7, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 15, 20, 0) },
      { amount: "95.00", description: "Gym membership", categoryId: 6, date: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 18, 8, 0) },
    ];

    sampleExpenses.forEach(expenseData => {
      const id = this.currentExpenseId++;
      const expense: Expense = {
        ...expenseData,
        id,
        createdAt: expenseData.date,
      };
      this.expenses.set(id, expense);
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
    const category: Category = { ...insertCategory, id, description: insertCategory.description ?? null };
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
