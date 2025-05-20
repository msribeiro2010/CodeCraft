import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  registerSchema, 
  insertTransactionSchema, 
  insertCategorySchema, 
  insertInvoiceSchema, 
  insertReminderSchema
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import multer from "multer";
import { createWorker } from "tesseract.js";
import { createId } from "@paralleldrive/cuid2";
import MemoryStore from "memorystore";

// Setup multer for file uploads
const storage2 = multer.memoryStorage();
const upload = multer({ storage: storage2 });
// Use para qualquer campo
const uploadAny = multer({ storage: storage2 }).any();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === "production" 
      },
      store: new SessionStore({
        checkPeriod: 86400000 // 24 hours
      })
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Email não encontrado" });
          }

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Senha incorreta" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Não autenticado" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validation.error.format() });
      }

      const { username, email, password, initialBalance, overdraftLimit, notificationsEnabled } = validation.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const newUser = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        initialBalance,
        overdraftLimit,
        notificationsEnabled
      });

      // Create default categories for the user
      const defaultCategories = [
        { name: "Alimentação", userId: newUser.id },
        { name: "Moradia", userId: newUser.id },
        { name: "Transporte", userId: newUser.id },
        { name: "Lazer", userId: newUser.id },
        { name: "Saúde", userId: newUser.id },
        { name: "Educação", userId: newUser.id },
        { name: "Receita", userId: newUser.id }
      ];

      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }

      // Login the user
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Erro ao fazer login", error: err });
        }
        return res.status(201).json({ message: "Usuário criado com sucesso", user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email,
          initialBalance: newUser.initialBalance,
          overdraftLimit: newUser.overdraftLimit,
          notificationsEnabled: newUser.notificationsEnabled
        } });
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao registrar usuário" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ message: "Dados inválidos", errors: validation.error.format() });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Email ou senha incorretos" });
      }
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json({ 
          message: "Login realizado com sucesso", 
          user: { 
            id: user.id, 
            username: user.username, 
            email: user.email,
            initialBalance: user.initialBalance,
            overdraftLimit: user.overdraftLimit,
            notificationsEnabled: user.notificationsEnabled
          } 
        });
      });
    })(req, res, next);
  });

  app.get("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      return res.json({ 
        isAuthenticated: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          initialBalance: user.initialBalance,
          overdraftLimit: user.overdraftLimit,
          notificationsEnabled: user.notificationsEnabled
        } 
      });
    }
    res.json({ isAuthenticated: false });
  });

  // User settings routes
  app.patch("/api/users/settings", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { initialBalance, overdraftLimit, notificationsEnabled } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        initialBalance,
        overdraftLimit,
        notificationsEnabled
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({ 
        message: "Configurações atualizadas com sucesso", 
        user: { 
          id: updatedUser.id, 
          username: updatedUser.username, 
          email: updatedUser.email,
          initialBalance: updatedUser.initialBalance,
          overdraftLimit: updatedUser.overdraftLimit,
          notificationsEnabled: updatedUser.notificationsEnabled
        } 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar configurações" });
    }
  });

  // Category routes
  app.get("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const categories = await storage.getCategoriesByUserId(userId);
      res.json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const validation = insertCategorySchema.safeParse({
        ...req.body,
        userId
      });
      
      if (!validation.success) {
        return res.status(400).json({ message: "Dados inválidos", errors: validation.error.format() });
      }

      const newCategory = await storage.createCategory(validation.data);
      res.status(201).json(newCategory);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar transações" });
    }
  });

  app.get("/api/transactions/recent", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 5;
      const transactions = await storage.getRecentTransactionsByUserId(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar transações recentes" });
    }
  });

  app.get("/api/transactions/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const limit = parseInt(req.query.limit as string) || 5;
      const transactions = await storage.getUpcomingTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar transações a vencer" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      
      // Ajuste os dados antes da validação
      let transactionData = {
        ...req.body,
        userId
      };
      
      // Converta a data para formato Date se for string
      if (typeof transactionData.date === 'string') {
        transactionData.date = new Date(transactionData.date);
      }
      
      // Certifique-se de que categoryId seja um número
      if (transactionData.categoryId && typeof transactionData.categoryId === 'string') {
        transactionData.categoryId = parseInt(transactionData.categoryId, 10);
      }
      
      console.log("Dados de transação recebidos:", transactionData);
      
      const validation = insertTransactionSchema.safeParse(transactionData);
      
      if (!validation.success) {
        console.error("Erro de validação:", validation.error.format());
        return res.status(400).json({ message: "Dados inválidos", errors: validation.error.format() });
      }

      const newTransaction = await storage.createTransaction(validation.data);
      
      // Create reminder if status is A_VENCER and date is in the future
      if (newTransaction.status === 'A_VENCER') {
        const transactionDate = new Date(newTransaction.date);
        const today = new Date();
        
        if (transactionDate > today) {
          // Create reminder for 1 day before
          const oneDayBefore = new Date(transactionDate);
          oneDayBefore.setDate(oneDayBefore.getDate() - 1);
          
          if (oneDayBefore > today) {
            await storage.createReminder({
              userId,
              transactionId: newTransaction.id,
              reminderDate: oneDayBefore
            });
          }
          
          // Create reminder for the day of
          await storage.createReminder({
            userId,
            transactionId: newTransaction.id,
            reminderDate: transactionDate
          });
        }
      }

      res.status(201).json(newTransaction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao criar transação" });
    }
  });

  app.patch("/api/transactions/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const transactionId = parseInt(req.params.id);
      
      // Verify transaction belongs to user
      const transaction = await storage.getTransactionById(transactionId);
      if (!transaction || transaction.userId !== userId) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }

      const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }

      res.json(updatedTransaction);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao atualizar transação" });
    }
  });

  app.delete("/api/transactions/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const transactionId = parseInt(req.params.id);
      
      // Verify transaction belongs to user
      const transaction = await storage.getTransactionById(transactionId);
      if (!transaction || transaction.userId !== userId) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }

      const success = await storage.deleteTransaction(transactionId);
      if (!success) {
        return res.status(404).json({ message: "Transação não encontrada" });
      }

      res.json({ message: "Transação excluída com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao excluir transação" });
    }
  });

  // Invoice routes
  app.get("/api/invoices", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const invoices = await storage.getInvoicesByUserId(userId);
      res.json(invoices);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar faturas" });
    }
  });

  app.post("/api/invoices/upload", isAuthenticated, uploadAny, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const barcode = req.body.barcode;
      
      let processedText = '';
      let filename = '';
      let fileContent = '';
      
      // Caso 1: Upload de arquivo para processamento
      const uploadedFile = req.files && Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null;
      
      if (uploadedFile) {
        const fileBuffer = uploadedFile.buffer;
        fileContent = fileBuffer.toString("base64");
        const fileId = createId();
        const fileExtension = uploadedFile.originalname.split(".").pop();
        filename = `${fileId}.${fileExtension}`;

        // Process with OCR
        const worker = await createWorker("por");
        const result = await worker.recognize(fileBuffer);
        await worker.terminate();
        
        processedText = result.data.text;
        
        // Tenta encontrar um código de barras se não foi fornecido manualmente
        if (!barcode) {
          const barcodeRegex = /(\d{5}[.]\d{5}\s\d{5}[.]\d{6}\s\d{5}[.]\d{6}\s\d{1}\s\d{14})|(\d{47})/g;
          const matches = processedText.match(barcodeRegex);
          
          if (matches && matches.length > 0) {
            // Adiciona informação sobre o código de barras encontrado
            processedText += "\n\n--- CÓDIGO DE BARRAS DETECTADO ---\n" + matches[0];
          }
        }
      } 
      // Caso 2: Apenas código de barras fornecido manualmente
      else if (barcode) {
        processedText = `Código de barras inserido manualmente: ${barcode}`;
        filename = `barcode-${Date.now()}.txt`;
        fileContent = Buffer.from(processedText).toString('base64');
      }
      // Caso 3: Nenhum arquivo ou código de barras fornecido
      else {
        return res.status(400).json({ 
          message: "Nenhum arquivo ou código de barras fornecido" 
        });
      }

      // Adiciona o código de barras manual ao texto processado, se fornecido
      if (barcode && !processedText.includes(barcode)) {
        processedText += `\n\n--- CÓDIGO DE BARRAS INSERIDO MANUALMENTE ---\n${barcode}`;
      }

      const newInvoice = await storage.createInvoice({
        userId,
        filename,
        fileContent,
        processedText
      });

      // Criar uma transação do tipo despesa para esta fatura
      if (barcode) {
        try {
          // Tenta extrair valor do código de barras (posições específicas)
          let amount = "0";
          if (barcode.length >= 44) {
            // Tenta extrair o valor do código de barras padrão de boleto
            const valorField = barcode.substring(37, 47);
            const valorNumerico = parseInt(valorField, 10) / 100; // Converte para decimal
            if (!isNaN(valorNumerico)) {
              amount = valorNumerico.toString();
            }
          }
          
          // Cria uma transação associada à fatura
          await storage.createTransaction({
            userId,
            description: `Fatura #${newInvoice.id}`,
            type: "DESPESA",
            categoryId: 1, // Assume categoria padrão "Outros" ou "Contas"
            amount,
            date: new Date(),
            status: "A_VENCER",
            invoiceId: newInvoice.id
          });
        } catch (err) {
          console.error("Erro ao criar transação para a fatura:", err);
          // Não interrompe o fluxo se falhar na criação da transação
        }
      }

      res.status(201).json({ 
        id: newInvoice.id,
        filename: newInvoice.filename,
        processedText: newInvoice.processedText,
        createdAt: newInvoice.createdAt,
        barcode: barcode || null
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao processar fatura" });
    }
  });

  // Reminder routes
  app.get("/api/reminders", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const reminders = await storage.getRemindersByUserId(userId);
      res.json(reminders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar lembretes" });
    }
  });

  app.get("/api/reminders/upcoming", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const reminders = await storage.getUpcomingRemindersByUserId(userId);
      res.json(reminders);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar lembretes próximos" });
    }
  });

  app.patch("/api/reminders/:id/mark-sent", isAuthenticated, async (req, res) => {
    try {
      const reminderId = parseInt(req.params.id);
      const success = await storage.markReminderAsSent(reminderId);
      if (!success) {
        return res.status(404).json({ message: "Lembrete não encontrado" });
      }
      res.json({ message: "Lembrete marcado como enviado" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao marcar lembrete como enviado" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard/balance", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const balance = await storage.getUserBalance(userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json({ 
        balance,
        initialBalance: user.initialBalance,
        overdraftLimit: user.overdraftLimit
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao calcular saldo" });
    }
  });

  app.get("/api/dashboard/monthly-summary", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      
      const summary = await storage.getSummaryByMonth(userId, year, month);
      res.json(summary);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar resumo mensal" });
    }
  });

  app.get("/api/dashboard/monthly-summary/last-6-months", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const now = new Date();
      const result = [];
      
      for (let i = 0; i < 6; i++) {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        const summary = await storage.getSummaryByMonth(userId, year, month);
        
        const monthNames = [
          "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
          "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
        
        result.unshift({
          month: monthNames[month - 1],
          year,
          income: summary.totalIncome,
          expense: summary.totalExpense
        });
      }
      
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro ao buscar resumo dos últimos 6 meses" });
    }
  });

  return httpServer;
}
