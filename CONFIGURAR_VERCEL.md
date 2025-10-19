# ⚠️ GUIA URGENTE: Configurar Variáveis de Ambiente no Vercel

## 🚨 PROBLEMA ATUAL

Seu ambiente **local funciona perfeitamente**, mas o **Vercel não** porque as variáveis de ambiente não estão configuradas corretamente.

## ✅ Ambiente Local (Funcionando)

```
✅ DATABASE_URL: Configurado
✅ SUPABASE_URL: Configurado
✅ SUPABASE_ANON_KEY: Configurado
✅ Conexão com banco: OK
✅ Transações recorrentes: 1 encontrada
✅ Schema correto: is_recurring, recurrence_type
```

## 📋 Passo a Passo para Corrigir o Vercel

### Passo 1: Acessar Dashboard do Vercel

1. Acesse: **https://vercel.com/dashboard**
2. Faça login se necessário
3. Clique no projeto **CodeCraft** (ou o nome que você deu)

### Passo 2: Ir para Configurações

1. No menu superior, clique em **Settings**
2. No menu lateral esquerdo, clique em **Environment Variables**

### Passo 3: Configurar DATABASE_URL

**OPÇÃO A - Se a variável JÁ EXISTE**:
1. Encontre a linha com `DATABASE_URL`
2. Clique no ícone de **lápis** (Edit) no lado direito
3. **DELETE o valor antigo**
4. Cole o **NOVO VALOR**:
   ```
   postgresql://postgres:QUxM68KnYtgYo2Qr@db.adtarpyqfsjkuvcigzca.supabase.co:5432/postgres
   ```
5. Marque **TODOS** os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Clique em **Save**

**OPÇÃO B - Se a variável NÃO EXISTE**:
1. Clique no botão **Add New** (ou **Add Variable**)
2. No campo **Key**, digite: `DATABASE_URL`
3. No campo **Value**, cole:
   ```
   postgresql://postgres:QUxM68KnYtgYo2Qr@db.adtarpyqfsjkuvcigzca.supabase.co:5432/postgres
   ```
4. Marque **TODOS** os ambientes:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Clique em **Save**

### Passo 4: Configurar SUPABASE_URL

1. Adicione nova variável ou edite existente
2. **Key**: `SUPABASE_URL`
3. **Value**:
   ```
   https://adtarpyqfsjkuvcigzca.supabase.co
   ```
4. Marque todos os ambientes
5. Salve

### Passo 5: Configurar SUPABASE_ANON_KEY

1. Adicione nova variável ou edite existente
2. **Key**: `SUPABASE_ANON_KEY`
3. **Value**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkdGFycHlxZnNqa3V2Y2lnemNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjAxOTQsImV4cCI6MjA3NjM5NjE5NH0.4k5KvQO6ppDfkYdt7yYtGVRCW8cJQzrj_pbBIvUTACU
   ```
4. Marque todos os ambientes
5. Salve

### Passo 6: Fazer Redeploy

**MUITO IMPORTANTE**: As variáveis só são aplicadas após um novo deploy!

1. Vá na aba **Deployments** (menu superior)
2. Encontre o último deployment (topo da lista)
3. Clique nos **3 pontinhos** (⋮) no lado direito
4. Clique em **Redeploy**
5. **NÃO marque** "Use existing Build Cache" (queremos build novo)
6. Clique em **Redeploy** novamente para confirmar
7. Aguarde 2-3 minutos

### Passo 7: Verificar Deploy

1. Aguarde o status mudar para **"Ready"** (verde)
2. O commit deve ser: `7beacd5` ou mais recente
3. Clique em **Visit** para abrir a aplicação
4. Limpe o cache do browser:
   - **Chrome/Edge**: F12 → Botão direito no reload → "Empty Cache and Hard Reload"
   - **Safari**: Cmd+Option+E, depois Cmd+R
   - **Firefox**: Ctrl/Cmd+Shift+Delete, marque "Cache", depois Ctrl/Cmd+Shift+R

### Passo 8: Testar Aplicação

1. Acesse a URL do Vercel
2. Faça login com: `usuario_teste` / `senha que você definiu`
3. Verifique:
   - ✅ Login funciona
   - ✅ Dashboard carrega
   - ✅ Transação "Acordo - Pix 45991062631" aparece
   - ✅ Badge "Parcela 3/45" está visível

## 🔍 Verificar se Configurou Corretamente

Após fazer o redeploy, você pode verificar os logs:

1. No Vercel, vá em **Deployments**
2. Clique no deployment mais recente
3. Clique na aba **Functions**
4. Procure por erros relacionados a `DATABASE_URL`

## ❌ Erros Comuns

### "404: NOT_FOUND"
**Causa**: DATABASE_URL não está configurado ou está errado
**Solução**: Verifique se copiou corretamente a senha `QUxM68KnYtgYo2Qr`

### "Cannot read properties of null (reading 'onAuthStateChanged')"
**Causa**: Build antigo em cache
**Solução**: Limpe cache do browser (Passo 7)

### Tela branca sem erros
**Causa**: Variáveis de ambiente não aplicadas
**Solução**: Faça redeploy (Passo 6)

## 📝 Resumo das Variáveis

```env
DATABASE_URL=postgresql://postgres:QUxM68KnYtgYo2Qr@db.adtarpyqfsjkuvcigzca.supabase.co:5432/postgres
SUPABASE_URL=https://adtarpyqfsjkuvcigzca.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkdGFycHlxZnNqa3V2Y2lnemNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MjAxOTQsImV4cCI6MjA3NjM5NjE5NH0.4k5KvQO6ppDfkYdt7yYtGVRCW8cJQzrj_pbBIvUTACU
```

## ✅ Checklist

- [ ] Acessei Vercel Dashboard
- [ ] Fui em Settings → Environment Variables
- [ ] Configurei DATABASE_URL com senha `QUxM68KnYtgYo2Qr`
- [ ] Configurei SUPABASE_URL
- [ ] Configurei SUPABASE_ANON_KEY
- [ ] Marquei Production, Preview, Development em TODAS
- [ ] Salvei todas as variáveis
- [ ] Fui em Deployments
- [ ] Fiz Redeploy SEM usar cache
- [ ] Aguardei status "Ready"
- [ ] Limpei cache do browser
- [ ] Testei a aplicação

## 🆘 Se Ainda Não Funcionar

Me envie screenshot de:
1. Página de Environment Variables no Vercel
2. Log do deployment mais recente
3. Console do browser (F12)
