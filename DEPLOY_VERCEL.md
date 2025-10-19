# 🚀 Deploy na Vercel com Supabase

Guia completo para fazer deploy da aplicação na Vercel com banco de dados Supabase (PostgreSQL).

## ⚠️ Importante

A aplicação usa **SQLite localmente** e **PostgreSQL (Supabase) em produção**. Isso significa que seus dados locais **NÃO serão sincronizados** automaticamente com produção.

## Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Conta no [Supabase](https://supabase.com)
- Git configurado
- Projeto commitado no Git

## Passo 1: Configurar o Supabase

### 1.1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `codecraft` (ou nome do seu projeto)
   - **Database Password**: Crie uma senha forte e **ANOTE**
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
4. Clique em **"Create new project"**
5. Aguarde 2-3 minutos para o projeto ser criado

### 1.2. Obter as Credenciais

Após o projeto ser criado:

#### A. Database URL (Connection String)
1. No painel lateral, vá em **Settings** → **Database**
2. Na seção **"Connection string"**, selecione **"URI"**
3. Copie a URL que começa com `postgresql://postgres.[...]`
4. **IMPORTANTE**: Substitua `[YOUR-PASSWORD]` pela senha que você criou
5. Exemplo final:
   ```
   postgresql://postgres.abcdefghijk:SuaSenha123@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
   ```

#### B. Project URL e Anon Key
1. Vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://abcdefghijk.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

## Passo 2: Criar as Tabelas no Supabase

1. No painel do Supabase, vá em **SQL Editor**
2. Clique em **"New query"**
3. Cole o script abaixo:

```sql
-- Criar enums
CREATE TYPE transaction_type AS ENUM ('RECEITA', 'DESPESA');
CREATE TYPE transaction_status AS ENUM ('A_VENCER', 'PAGAR', 'PAGO');
CREATE TYPE recurrence_type AS ENUM ('PARCELAS', 'MENSAL', 'ANUAL');

-- Criar tabela users
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

-- Criar tabela categories
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Criar tabela invoices
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_content TEXT NOT NULL,
  processed_text TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar tabela transactions
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
  is_recurring BOOLEAN DEFAULT false NOT NULL,
  recurrence_type recurrence_type,
  total_installments INTEGER,
  current_installment INTEGER,
  recurring_group_id TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar tabela reminders
CREATE TABLE reminders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP NOT NULL,
  sent BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Criar índices para melhor performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_transaction_id ON reminders(transaction_id);
```

4. Clique em **"Run"** (botão no canto inferior direito)
5. Verifique se apareceu "Success. No rows returned"

## Passo 3: Configurar Variáveis de Ambiente na Vercel

### 3.1. Fazer Deploy Inicial

1. Acesse [vercel.com](https://vercel.com)
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório do GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.`
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`

### 3.2. Adicionar Variáveis de Ambiente

**ANTES de fazer o primeiro deploy**, adicione as variáveis de ambiente:

1. Na tela de configuração do projeto, role até **"Environment Variables"**
2. Adicione as seguintes variáveis:

| Name | Value |
|------|-------|
| `DATABASE_URL` | A connection string do Supabase (passo 1.2.A) |
| `SUPABASE_URL` | A Project URL do Supabase (passo 1.2.B) |
| `SUPABASE_ANON_KEY` | A anon key do Supabase (passo 1.2.B) |
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | Uma string aleatória longa (ex: `seu-secret-super-seguro-123`) |

3. Clique em **"Deploy"**

## Passo 4: Verificar o Deploy

1. Aguarde o deploy completar (2-5 minutos)
2. Acesse a URL fornecida pela Vercel
3. Teste:
   - Criar uma conta
   - Fazer login
   - Criar uma categoria
   - Criar uma transação
   - Verificar se os dados aparecem

## Passo 5: Migrar Dados (Opcional)

Se você já tem dados no SQLite local e quer migrar para produção:

### 5.1. Exportar Dados do SQLite

```bash
# Exportar usuários
sqlite3 test.db "SELECT * FROM users;" > users.csv

# Exportar categorias
sqlite3 test.db "SELECT * FROM categories;" > categories.csv

# Exportar transações
sqlite3 test.db "SELECT * FROM transactions;" > transactions.csv
```

### 5.2. Importar no Supabase

1. No painel do Supabase, vá em **Table Editor**
2. Para cada tabela (users, categories, transactions):
   - Selecione a tabela
   - Clique em **"Insert"** → **"Import data from CSV"**
   - Faça upload do arquivo correspondente

## Troubleshooting

### Erro 404 ou 500

**Problema**: Página em branco ou erro 404
**Solução**:
1. Verifique se as variáveis de ambiente estão configuradas
2. Verifique os logs na Vercel (**Deployments** → **Functions**)
3. Confirme que as tabelas foram criadas no Supabase

### Erro de Conexão com Banco

**Problema**: Erro ao conectar com o banco de dados
**Solução**:
1. Verifique se a `DATABASE_URL` está correta
2. Confirme se a senha foi substituída em `[YOUR-PASSWORD]`
3. Teste a conexão no SQL Editor do Supabase

### Tabelas Não Encontradas

**Problema**: Erro dizendo que as tabelas não existem
**Solução**:
1. Execute o script SQL do Passo 2 novamente no Supabase
2. Verifique se todas as tabelas apareceram no **Table Editor**

### Erro de CORS

**Problema**: Erro de CORS ao fazer requisições
**Solução**:
1. No Supabase, vá em **Settings** → **API**
2. Em **"URL Configuration"**, adicione seu domínio da Vercel
3. Aguarde alguns minutos e teste novamente

## Próximos Passos

Após o deploy bem-sucedido:

1. ✅ Configure um domínio personalizado (opcional)
2. ✅ Configure GitHub Actions para deploy automático
3. ✅ Configure alertas de erro (Sentry, LogRocket)
4. ✅ Configure backups automáticos no Supabase

## Comandos Úteis

```bash
# Redeployar após mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push origin main

# A Vercel vai fazer deploy automático!
```

## Suporte

Se encontrar problemas:

1. Verifique os logs na Vercel
2. Verifique os logs no Supabase (**Logs** → **Postgres Logs**)
3. Consulte a documentação:
   - [Vercel Docs](https://vercel.com/docs)
   - [Supabase Docs](https://supabase.com/docs)
