# 🚨 URGENTE: Configurar Variáveis de Ambiente no Vercel

## ⚠️ PROBLEMA COMUM

Seu aplicativo está dando **erro 500 em todas as APIs** porque o Vercel **NÃO** tem acesso às variáveis de ambiente necessárias para conectar ao banco de dados Supabase.

**Erros comuns**:
- ❌ Login falha (500)
- ❌ Dashboard não carrega (500)
- ❌ Transações não aparecem (500)

**Causa**: `DATABASE_URL` e outras variáveis não estão configuradas no Vercel

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Abrir Configurações

1. Acesse: **https://vercel.com/dashboard**
2. Clique no seu projeto **CodeCraft**
3. Clique em **Settings** (menu superior)
4. Clique em **Environment Variables** (menu lateral esquerdo)

### Passo 2: Adicionar Variáveis

Você precisa adicionar **3 variáveis**. Para cada uma:

1. Clique no botão **"Add New"** ou **"Add Variable"**
2. Preencha os campos conforme abaixo
3. **IMPORTANTE**: Marque os 3 checkboxes (Production, Preview, Development)
4. Clique em **Save**

---

#### Variável 1 de 3: DATABASE_URL

**Name** (campo "Key"):
```
DATABASE_URL
```

**Value** (campo "Value"):
```
postgresql://postgres:[SUA_SENHA_SUPABASE]@db.[SEU_PROJETO].supabase.co:5432/postgres
```

⚠️ **ATENÇÃO**: Substitua `[SUA_SENHA_SUPABASE]` e `[SEU_PROJETO]` pelos valores do seu `.env` local!

**Environments** (checkboxes):
- ✅ Production
- ✅ Preview
- ✅ Development

Clique em **Save**

---

#### Variável 2 de 3: SUPABASE_URL

**Name** (campo "Key"):
```
SUPABASE_URL
```

**Value** (campo "Value"):
```
https://[SEU_PROJETO].supabase.co
```

⚠️ **ATENÇÃO**: Substitua `[SEU_PROJETO]` pelo ID do seu projeto Supabase!

**Environments** (checkboxes):
- ✅ Production
- ✅ Preview
- ✅ Development

Clique em **Save**

---

#### Variável 3 de 3: SUPABASE_ANON_KEY

**Name** (campo "Key"):
```
SUPABASE_ANON_KEY
```

**Value** (campo "Value"):
```
[SUA_CHAVE_ANON_DO_SUPABASE]
```

⚠️ **ATENÇÃO**: Copie o valor completo do `SUPABASE_ANON_KEY` do seu arquivo `.env` local!

**Environments** (checkboxes):
- ✅ Production
- ✅ Preview
- ✅ Development

Clique em **Save**

---

### Passo 3: Fazer Redeploy

**IMPORTANTE**: As variáveis só são aplicadas após um novo deploy!

1. Clique na aba **Deployments** (menu superior)
2. Encontre o último deployment (primeiro da lista)
3. Clique nos **3 pontinhos** (⋮) no lado direito
4. Clique em **Redeploy**
5. Pode marcar ✅ "Use existing Build Cache" (mais rápido)
6. Clique em **Redeploy** novamente para confirmar
7. Aguarde 1-2 minutos até status "Ready" (verde)

### Passo 4: Testar

1. **Limpe o cache do browser**:
   - Pressione **F12** para abrir DevTools
   - **Botão direito** no ícone de reload (↻)
   - Selecione **"Empty Cache and Hard Reload"**

2. **Ou teste em aba anônima**:
   - Chrome/Edge: `Cmd/Ctrl + Shift + N`
   - Safari: `Cmd + Shift + N`
   - Firefox: `Cmd/Ctrl + Shift + P`

3. **Faça login** e verifique se tudo funciona

## 📋 Checklist

- [ ] Abri Vercel Dashboard
- [ ] Fui em Settings → Environment Variables
- [ ] Adicionei DATABASE_URL com valores do meu `.env`
- [ ] Adicionei SUPABASE_URL com valores do meu `.env`
- [ ] Adicionei SUPABASE_ANON_KEY com valores do meu `.env`
- [ ] Marquei Production, Preview, Development em TODAS as 3
- [ ] Salvei todas as variáveis
- [ ] Fui em Deployments
- [ ] Fiz Redeploy
- [ ] Aguardei status "Ready"
- [ ] Limpei cache do browser
- [ ] Testei login

## ❓ Como Verificar se Está Configurado

Depois de adicionar as variáveis, você deve ver algo assim na página de Environment Variables:

```
DATABASE_URL                    [hidden]    Production, Preview, Development
SUPABASE_URL                    https://... Production, Preview, Development
SUPABASE_ANON_KEY              [hidden]    Production, Preview, Development
```

Se não vê isso, as variáveis **NÃO** foram adicionadas corretamente.

## 🆘 Ainda com Erro?

Se após fazer tudo isso ainda der erro 500:

1. Verifique se o redeploy completou (status "Ready")
2. Confirme que marcou os 3 ambientes em cada variável
3. Tente fazer login em **aba anônima** (para garantir que não é cache)
4. Verifique os logs do deployment no Vercel para ver erro específico
5. Confirme que copiou os valores EXATOS do seu arquivo `.env` local

## 💡 Onde Encontrar os Valores

Todos os valores corretos estão no seu arquivo `.env` local:

```env
DATABASE_URL=postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres
SUPABASE_URL=https://[projeto].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Copie e cole cada valor diretamente do `.env` para o Vercel!
