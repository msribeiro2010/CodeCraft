# Configuração do Supabase

Este guia irá ajudá-lo a migrar do Neon Database para o Supabase.

## Passos para Configuração

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha sua organização
5. Preencha:
   - **Name**: Nome do seu projeto (ex: "CodeCraft")
   - **Database Password**: Crie uma senha forte e **anote-a**
   - **Region**: Escolha a região mais próxima
6. Clique em "Create new project"

### 2. Obter Credenciais

Após criar o projeto, você precisará de 3 informações:

#### A. Database URL
1. No painel do Supabase, vá em **Settings** → **Database**
2. Na seção "Connection string", copie a URL que começa com `postgresql://`
3. Substitua `[YOUR-PASSWORD]` pela senha que você criou

#### B. Project URL e Anon Key
1. No painel do Supabase, vá em **Settings** → **API**
2. Copie:
   - **Project URL** (ex: `https://abcdefgh.supabase.co`)
   - **anon public** key (chave longa que começa com `eyJ...`)

### 3. Atualizar Arquivo .env

Substitua as variáveis no arquivo `.env`:

```env
# Database URL (substitua pelos seus valores)
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJECT_REF.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 4. Executar Migrações

Após configurar as credenciais:

```bash
npm run db:push
```

### 5. Verificar Conexão

Inicie o servidor para testar:

```bash
npm run dev
```

## Vantagens do Supabase

- ✅ **Interface Web**: Dashboard visual para gerenciar dados
- ✅ **Auth Built-in**: Sistema de autenticação integrado
- ✅ **Real-time**: Subscriptions em tempo real
- ✅ **Storage**: Armazenamento de arquivos
- ✅ **Edge Functions**: Funções serverless
- ✅ **Free Tier**: Plano gratuito generoso

## Próximos Passos

1. Configure as credenciais no `.env`
2. Execute as migrações
3. Teste a aplicação
4. Explore o dashboard do Supabase para gerenciar dados

## Suporte

Se encontrar problemas:
- Verifique se as credenciais estão corretas
- Confirme se a senha do banco está correta
- Verifique se o projeto está ativo no Supabase