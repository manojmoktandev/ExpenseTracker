import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(category);
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid category data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create category" });
      }
    }
  });

  // Expenses routes
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = insertExpenseSchema.parse(req.body);
      const newExpense = await storage.createExpense(expense);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const expense = insertExpenseSchema.partial().parse(req.body);
      const updatedExpense = await storage.updateExpense(id, expense);
      
      if (!updatedExpense) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      
      res.json(updatedExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update expense" });
      }
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExpense(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Expense not found" });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/categories", async (req, res) => {
    try {
      const categoryStats = await storage.getExpensesByCategory();
      res.json(categoryStats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category analytics" });
    }
  });

  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const todayExpenses = await storage.getExpensesByDateRange(today, tomorrow);
      const weekExpenses = await storage.getExpensesByDateRange(weekStart, now);
      const monthExpenses = await storage.getExpensesByDateRange(monthStart, now);
      
      const todayTotal = todayExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const weekTotal = weekExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      const monthTotal = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      
      const daysInMonth = now.getDate();
      const averageDaily = daysInMonth > 0 ? monthTotal / daysInMonth : 0;
      
      res.json({
        todayTotal,
        weekTotal,
        monthTotal,
        averageDaily,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch summary analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
