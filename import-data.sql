-- ===================================
-- SCRIPT DE IMPORTAÇÃO DE DADOS
-- ===================================
-- Execute este script no SQL Editor do Supabase
-- APÓS ter executado o supabase-setup.sql

-- Limpar dados existentes (se houver)
TRUNCATE TABLE reminders CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE invoices CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE users CASCADE;

-- Resetar sequências
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE reminders_id_seq RESTART WITH 1;

-- 1. INSERIR USUÁRIO
INSERT INTO users (id, username, password, email, initial_balance, overdraft_limit, notifications_enabled, created_at) VALUES
(1, 'usuario_teste', '$2b$10$kjl8rWfteDGKP4eYbdGqg.ALWVcb1JWZvwaoYA4exzjNn9pdeNIpW', 'teste@exemplo.com', 4794.39, 5000, true, '2025-09-17 18:28:53');

-- Atualizar sequência de users
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. INSERIR CATEGORIAS
INSERT INTO categories (id, name, user_id) VALUES
(1, 'Alimentação', 1),
(2, 'Transporte', 1),
(3, 'Moradia', 1),
(4, 'Saúde', 1),
(5, 'Educação', 1),
(6, 'Lazer', 1),
(7, 'Compras', 1),
(8, 'Salário', 1),
(9, 'Freelance', 1),
(10, 'Investimentos', 1),
(11, 'Outros', 1);

-- Atualizar sequência de categories
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- 3. INSERIR TRANSAÇÕES (com campos de recorrência)
INSERT INTO transactions (id, user_id, type, amount, date, category_id, description, invoice_id, notes, status, is_recurring, recurrence_type, total_installments, current_installment, recurring_group_id, created_at) VALUES
(6, 1, 'RECEITA', 10770, '2025-10-22T03:00:00.000Z', 8, 'TRT156', NULL, '', 'A_VENCER', false, NULL, NULL, NULL, NULL, '2025-10-19 13:38:02'),
(7, 1, 'DESPESA', 2250, '2025-10-22T03:00:00.000Z', 1, 'Acordo - Pix 45991062631', NULL, '', 'A_VENCER', true, 'PARCELAS', 45, 3, NULL, '2025-10-19 13:38:02'),
(9, 1, 'DESPESA', 3757.11, '2025-10-23T03:00:00.000Z', 7, 'Uniclass', NULL, '', 'A_VENCER', false, NULL, NULL, NULL, NULL, '2025-10-19 13:38:02'),
(11, 1, 'DESPESA', 882.03, '2025-10-25T03:00:00.000Z', 7, 'Bradesco Amazon', NULL, '', 'A_VENCER', false, NULL, NULL, NULL, NULL, '2025-10-19 13:38:02'),
(13, 1, 'DESPESA', 1086, '2025-10-22T03:00:00.000Z', 3, 'Moradia', NULL, '', 'A_VENCER', false, NULL, NULL, NULL, NULL, '2025-10-19 13:38:02'),
(14, 1, 'DESPESA', 1703.02, '2025-10-23T03:00:00.000Z', 4, 'ANAJUSTTRA', NULL, '', 'A_VENCER', false, NULL, NULL, NULL, NULL, '2025-10-19 13:38:02'),
(15, 1, 'DESPESA', 1806.35, '2025-10-23T03:00:00.000Z', 1, 'Latam', NULL, '', 'A_VENCER', false, NULL, NULL, NULL, NULL, '2025-10-19 13:38:02'),
(16, 1, 'DESPESA', 2335, '2025-10-27T03:00:00.000Z', 1, 'Neon', NULL, '', 'A_VENCER', false, NULL, NULL, NULL, NULL, '2025-10-19 13:38:02');

-- Atualizar sequência de transactions
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));

-- 4. INSERIR LEMBRETES
INSERT INTO reminders (id, user_id, transaction_id, reminder_date, sent, created_at) VALUES
(1, 1, 6, '2025-09-21T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(2, 1, 6, '2025-09-22T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(3, 1, 7, '2025-09-21T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(4, 1, 7, '2025-09-22T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(9, 1, 11, '2025-09-24T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(10, 1, 11, '2025-09-25T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(13, 1, 14, '2025-09-27T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(14, 1, 14, '2025-09-28T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(15, 1, 15, '2025-10-22T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(16, 1, 15, '2025-10-23T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(17, 1, 16, '2025-10-26T03:00:00.000Z', false, '2025-10-19 13:38:03'),
(18, 1, 16, '2025-10-27T03:00:00.000Z', false, '2025-10-19 13:38:03');

-- Atualizar sequência de reminders
SELECT setval('reminders_id_seq', (SELECT MAX(id) FROM reminders));

-- ===================================
-- VERIFICAÇÃO
-- ===================================

-- Verificar se todos os dados foram inseridos
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'reminders', COUNT(*) FROM reminders;

-- Verificar a transação com parcelas
SELECT
  id,
  description,
  is_recurring,
  recurrence_type,
  current_installment,
  total_installments,
  amount
FROM transactions
WHERE id = 7;

-- Verificar integridade das foreign keys
SELECT
  t.id,
  t.description,
  u.username,
  c.name as category,
  COUNT(r.id) as num_reminders
FROM transactions t
JOIN users u ON t.user_id = u.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN reminders r ON r.transaction_id = t.id
GROUP BY t.id, t.description, u.username, c.name
ORDER BY t.id;
