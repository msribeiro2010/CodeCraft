import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base tables for SQLite
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  initialBalance: real("initial_balance").default(0).notNull(),
  overdraftLimit: real("overdraft_limit").default(0).notNull(),
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" }).default(true).notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type", { enum: ["RECEITA", "DESPESA"] }).notNull(),
  amount: real("amount").notNull(),
  date: text("date").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  description: text("description").notNull(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  notes: text("notes"),
  status: text("status", { enum: ["A_VENCER", "PAGAR", "PAGO"] }).notNull(),
  // Campos de recorrência
  isRecurring: integer("is_recurring", { mode: "boolean" }).default(false).notNull(),
  recurrenceType: text("recurrence_type", { enum: ["PARCELAS", "MENSAL", "ANUAL"] }),
  totalInstallments: integer("total_installments"), // Total de parcelas
  currentInstallment: integer("current_installment"), // Parcela atual (1, 2, 3...)
  recurringGroupId: text("recurring_group_id"), // ID do grupo de recorrência
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  filename: text("filename").notNull(),
  fileContent: text("file_content").notNull(),
  processedText: text("processed_text"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

export const reminders = sqliteTable("reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).notNull(),
  transactionId: integer("transaction_id").references(() => transactions.id).notNull(),
  reminderDate: text("reminder_date").notNull(),
  sent: integer("sent", { mode: "boolean" }).default(false).notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
  });

export const insertCategorySchema = createInsertSchema(categories)
  .omit({
    id: true,
  });

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({
    id: true,
    createdAt: true,
  })
  .extend({
    date: z.string(), // Força a data como string para SQLite
  });

export const transactionFormSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, "Valor é obrigatório"),
  date: z.union([
    z.string().transform((str) => new Date(str)),
    z.date()
  ])
});

export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({
    id: true,
    createdAt: true,
  });

export const insertReminderSchema = createInsertSchema(reminders)
  .omit({
    id: true,
    createdAt: true,
    sent: true,
  });

// Inferred types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;