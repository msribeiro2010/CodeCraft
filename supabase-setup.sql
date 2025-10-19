-- ===================================
-- SCRIPT DE CONFIGURAÇÃO DO SUPABASE
-- ===================================
-- Execute este script no SQL Editor do Supabase
-- (Settings → SQL Editor → New Query → Cole este script → Run)

-- 1. Criar tipos ENUM
CREATE TYPE transaction_type AS ENUM ('RECEITA', 'DESPESA');
CREATE TYPE transaction_status AS ENUM ('A_VENCER', 'PAGAR', 'PAGO');
CREATE TYPE recurrence_type AS ENUM ('PARCELAS', 'MENSAL', 'ANUAL');

-- 2. Criar tabela de usuários
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  initial_balance DECIMAL(10,2) DEFAULT 0 NOT NULL,
  overdraft_limit DECIMAL(10,2) DEFAULT 0 NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Criar tabela de categorias
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Criar tabela de faturas
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_content TEXT NOT NULL,
  processed_text TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 5. Criar tabela de transações (COM CAMPOS DE RECORRÊNCIA)
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP NOT NULL,
  category_id INTEGER REFERENCES categories(id),
  description TEXT NOT NULL,
  invoice_id INTEGER REFERENCES invoices(id),
  notes TEXT,
  status transaction_status NOT NULL,
  -- Campos de recorrência/parcelas
  is_recurring BOOLEAN DEFAULT false NOT NULL,
  recurrence_type recurrence_type,
  total_installments INTEGER,
  current_installment INTEGER,
  recurring_group_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 6. Criar tabela de lembretes
CREATE TABLE reminders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 7. Criar índices para melhor performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_recurring ON transactions(is_recurring, recurring_group_id);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_transaction_id ON reminders(transaction_id);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);

-- 8. Inserir categorias padrão (opcional - você pode pular esta parte se preferir)
-- Descomente as linhas abaixo se quiser categorias padrão para todos os usuários

-- INSERT INTO categories (name, user_id) VALUES
-- ('Alimentação', 1),
-- ('Transporte', 1),
-- ('Moradia', 1),
-- ('Saúde', 1),
-- ('Educação', 1),
-- ('Lazer', 1),
-- ('Vestuário', 1),
-- ('Outros', 1);

-- ===================================
-- VERIFICAÇÃO
-- ===================================
-- Execute estas queries para verificar se tudo foi criado:

-- Listar todas as tabelas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar estrutura da tabela transactions (com campos de recorrência)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;
