import { 
  users, categories, transactions, invoices, reminders, 
  type User, type InsertUser, 
  type Category, type InsertCategory, 
  type Transaction, type InsertTransaction, 
  type Invoice, type InsertInvoice, 
  type Reminder, type InsertReminder
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, asc, not, like } from "drizzle-orm";
import { Decimal } from "decimal.js";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  
  // Category operations
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoriesByUserId(userId: number): Promise<Category[]>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getRecentTransactionsByUserId(userId: number, limit: number): Promise<Transaction[]>;
  getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined>;
  deleteTransaction(id: number): Promise<boolean>;
  
  // Invoice operations
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoicesByUserId(userId: number): Promise<Invoice[]>;
  getInvoiceById(id: number): Promise<Invoice | undefined>;
  updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice | undefined>;
  
  // Reminder operations
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  getRemindersByUserId(userId: number): Promise<Reminder[]>;
  getUpcomingRemindersByUserId(userId: number): Promise<Reminder[]>;
  markReminderAsSent(id: number): Promise<boolean>;
  
  // Dashboard operations
  getUserBalance(userId: number): Promise<Decimal>;
  getSummaryByMonth(userId: number, year: number, month: number): Promise<{
    totalIncome: Decimal;
    totalExpense: Decimal;
  }>;
  getUpcomingTransactions(userId: number, limit: number): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Category operations
  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.userId, userId));
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    // Retorna as transações ordenadas por data (da mais antiga para a mais recente)
    // Filtra para remover qualquer transação que possa representar um saldo inicial
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          // Excluir transações com descrição "Saldo Inicial" se houver
          not(like(transactions.description, '%Saldo Inicial%'))
        )
      )
      .orderBy(transactions.date);
  }

  async getRecentTransactionsByUserId(userId: number, limit: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          // Excluir transações com descrição "Saldo Inicial" se houver
          not(like(transactions.description, '%Saldo Inicial%'))
        )
      )
      .orderBy(transactions.date)
      .limit(limit);
  }

  async getTransactionsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<Transaction[]> {
    console.log(`Buscando transações entre ${startDate.toISOString()} e ${endDate.toISOString()}`);
    
    const result = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, startDate),
          lte(transactions.date, endDate),
          // Excluir transações com descrição "Saldo Inicial" se houver
          not(like(transactions.description, '%Saldo Inicial%'))
        )
      )
      .orderBy(transactions.date);
      
    console.log(`Encontradas ${result.length} transações`);
    
    return result;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction | undefined> {
    // Garantir que a data seja um objeto Date válido
    const updateData = {...data};
    
    if (updateData.date && typeof updateData.date !== 'object') {
      try {
        updateData.date = new Date(updateData.date);
        
        // Se a data for inválida, manter a data atual
        if (isNaN(updateData.date.getTime())) {
          const [currentTransaction] = await db.select().from(transactions).where(eq(transactions.id, id));
          updateData.date = currentTransaction.date;
        }
      } catch (error) {
        console.error("Erro ao processar data:", error);
        const [currentTransaction] = await db.select().from(transactions).where(eq(transactions.id, id));
        updateData.date = currentTransaction.date;
      }
    }
    
    const [updatedTransaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, id))
      .returning();
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    const result = await db.delete(transactions).where(eq(transactions.id, id)).returning();
    return result.length > 0;
  }

  // Invoice operations
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getInvoicesByUserId(userId: number): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoiceById(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }

  async updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set(data)
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }

  // Reminder operations
  async createReminder(reminder: InsertReminder): Promise<Reminder> {
    const [newReminder] = await db.insert(reminders).values(reminder).returning();
    return newReminder;
  }

  async getRemindersByUserId(userId: number): Promise<Reminder[]> {
    return db
      .select()
      .from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(desc(reminders.reminderDate));
  }

  async getUpcomingRemindersByUserId(userId: number): Promise<Reminder[]> {
    const today = new Date();
    return db
      .select()
      .from(reminders)
      .where(
        and(
          eq(reminders.userId, userId),
          gte(reminders.reminderDate, today),
          eq(reminders.sent, false)
        )
      )
      .orderBy(desc(reminders.reminderDate));
  }

  async markReminderAsSent(id: number): Promise<boolean> {
    const result = await db
      .update(reminders)
      .set({ sent: true })
      .where(eq(reminders.id, id))
      .returning();
    return result.length > 0;
  }

  // Dashboard operations
  async getUserBalance(userId: number): Promise<Decimal> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const allTransactions = await this.getTransactionsByUserId(userId);
    
    let balance = new Decimal(user.initialBalance || 0);
    
    for (const transaction of allTransactions) {
      // Consideramos todas as transações para o cálculo do saldo, independente do status
      if (transaction.type === 'RECEITA') {
        balance = balance.plus(transaction.amount);
      } else {
        balance = balance.minus(transaction.amount);
      }
    }
    
    return balance;
  }

  async getSummaryByMonth(userId: number, year: number, month: number): Promise<{
    totalIncome: Decimal;
    totalExpense: Decimal;
  }> {
    // Definir o primeiro dia do mês
    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    
    // Definir o último dia do mês
    const lastDay = new Date(year, month, 0);
    const endDate = new Date(year, month - 1, lastDay.getDate(), 23, 59, 59, 999);
    
    console.log(`Calculando resumo do mês ${month}/${year}: de ${startDate.toISOString()} a ${endDate.toISOString()}`);
    
    // Obter transações do período manualmente
    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId));
    
    // Filtrar manualmente pelo período
    const monthTransactions = allTransactions.filter(tr => {
      const trDate = new Date(tr.date);
      return trDate >= startDate && trDate <= endDate;
    });
    
    console.log(`Encontradas ${monthTransactions.length} transações no período`);
    
    // Calcular totais
    let totalIncome = new Decimal(0);
    let totalExpense = new Decimal(0);
    
    for (const tr of monthTransactions) {
      // Para receitas, incluímos todas independente do status (como estava antes)
      if (tr.type === 'RECEITA') {
        totalIncome = totalIncome.plus(tr.amount);
      } 
      // Para despesas, incluímos APENAS as com status "PAGO"
      else if (tr.status === 'PAGO') {
        totalExpense = totalExpense.plus(tr.amount);
      }
    }
    
    console.log(`Totais calculados: Receitas=${totalIncome}, Despesas=${totalExpense} (apenas PAGAS)`);
    
    return {
      totalIncome,
      totalExpense
    };
  }

  async getUpcomingTransactions(userId: number, limit: number): Promise<Transaction[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, today),
          eq(transactions.status, 'A_VENCER')
        )
      )
      .orderBy(transactions.date)
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
