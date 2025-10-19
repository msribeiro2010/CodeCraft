# Guia de Importação de Dados para o Supabase

## Método Recomendado: Importação via SQL

⚠️ **IMPORTANTE**: Use o script SQL ao invés de importação manual via CSV para garantir que os IDs sejam preservados corretamente.

## Pré-requisitos

✅ Certifique-se de que você já executou o arquivo `supabase-setup.sql` no SQL Editor do Supabase
✅ Todas as tabelas devem estar criadas antes de importar os dados

## Passo 1: Executar o Script de Importação

1. No Supabase Dashboard (https://adtarpyqfsjkuvcigzca.supabase.co)
2. Vá em **SQL Editor** (ícone de banco de dados na lateral)
3. Clique em **New Query**
4. Abra o arquivo `import-data.sql` no seu editor de texto
5. Copie **TODO o conteúdo** do arquivo
6. Cole no SQL Editor do Supabase
7. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)
8. ✅ Aguarde a mensagem de sucesso

O script irá:
- Limpar dados existentes (se houver)
- Resetar as sequências de IDs
- Inserir 1 usuário
- Inserir 11 categorias
- Inserir 8 transações (incluindo a transação com parcela 3/45)
- Inserir 12 lembretes
- Executar verificações automáticas

## Dados que Serão Importados

### Usuário
- **Username**: `usuario_teste`
- **Email**: `teste@exemplo.com`
- **Saldo inicial**: R$ 4.794,39
- **Limite de cheque especial**: R$ 5.000,00

### Categorias (11 total)
Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Compras, Salário, Freelance, Investimentos, Outros

### Transações (8 total)
- **ID 7 (CRÍTICA)**: "Acordo - Pix 45991062631"
  - Tipo: DESPESA
  - Valor: R$ 2.250,00
  - `is_recurring`: true
  - `recurrence_type`: PARCELAS
  - `current_installment`: 3
  - `total_installments`: 45
  - Status: A_VENCER

### Lembretes (12 total)
Lembretes vinculados às transações com datas futuras

---

## Método Alternativo: Importação Manual via CSV (Não Recomendado)

⚠️ **ATENÇÃO**: A importação via CSV pode gerar IDs diferentes dos originais, causando erros de foreign key. Use apenas se o método SQL não funcionar.

## Arquivos CSV Disponíveis

- ✅ `users.csv` - Usuários com senhas criptografadas
- ✅ `categories.csv` - Categorias padrão
- ✅ `transactions.csv` - Transações incluindo a com parcelas (ID 7: "Acordo - Pix 45991062631")
- ✅ `reminders.csv` - Lembretes configurados

## Ordem de Importação via CSV

⚠️ **CRÍTICO**: Importe os arquivos **EXATAMENTE** nesta ordem para manter as relações de chave estrangeira:

### 1. Importar Usuários (users.csv)

1. No Supabase Dashboard (https://adtarpyqfsjkuvcigzca.supabase.co)
2. Vá em **Table Editor** (ícone de tabela na lateral esquerda)
3. Selecione a tabela **users**
4. Clique no botão **Insert** → **Import data from CSV**
5. Selecione o arquivo `users.csv`
6. Verifique o preview dos dados
7. Clique em **Import**
8. ✅ Aguarde a mensagem de sucesso

**Dados esperados:**
- 1 usuário: `usuario_teste`
- Email: `teste@exemplo.com`
- Saldo inicial: 4794.39

### 2. Importar Categorias (categories.csv)

1. Selecione a tabela **categories**
2. Clique em **Insert** → **Import data from CSV**
3. Selecione o arquivo `categories.csv`
4. Verifique o preview dos dados
5. Clique em **Import**
6. ✅ Aguarde a mensagem de sucesso

**Dados esperados:**
- 11 categorias: Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Compras, Salário, Freelance, Investimentos, Outros

### 3. Importar Transações (transactions.csv)

1. Selecione a tabela **transactions**
2. Clique em **Insert** → **Import data from CSV**
3. Selecione o arquivo `transactions.csv`
4. **IMPORTANTE**: Verifique o mapeamento das colunas:
   - `is_recurring` deve ser mapeado para o campo booleano
   - `recurrence_type` deve aceitar valores: PARCELAS, MENSAL, ANUAL
   - `total_installments` e `current_installment` são números inteiros
5. Clique em **Import**
6. ✅ Aguarde a mensagem de sucesso

**Dados esperados:**
- 8 transações
- **Transação crítica (ID 7)**:
  - Descrição: "Acordo - Pix 45991062631"
  - Tipo: DESPESA
  - Valor: 2250
  - Status: A_VENCER
  - `is_recurring`: true
  - `recurrence_type`: PARCELAS
  - `current_installment`: 3
  - `total_installments`: 45

### 4. Importar Lembretes (reminders.csv)

1. Selecione a tabela **reminders**
2. Clique em **Insert** → **Import data from CSV**
3. Selecione o arquivo `reminders.csv`
4. Clique em **Import**
5. ✅ Aguarde a mensagem de sucesso

**Dados esperados:**
- 12 lembretes vinculados às transações

## Verificação da Importação

Execute as seguintes queries no SQL Editor para verificar se os dados foram importados corretamente:

### 1. Verificar Usuários
```sql
SELECT id, username, email, initial_balance FROM users;
```
**Resultado esperado:** 1 linha com usuario_teste

### 2. Verificar Categorias
```sql
SELECT COUNT(*) as total FROM categories;
```
**Resultado esperado:** 11 categorias

### 3. Verificar Transações com Parcelas
```sql
SELECT
  id,
  description,
  is_recurring,
  recurrence_type,
  current_installment,
  total_installments,
  amount
FROM transactions
WHERE is_recurring = true;
```
**Resultado esperado:** 1 linha mostrando "Acordo - Pix 45991062631" com 3/45 parcelas

### 4. Verificar Todas as Transações
```sql
SELECT COUNT(*) as total FROM transactions;
```
**Resultado esperado:** 8 transações

### 5. Verificar Lembretes
```sql
SELECT COUNT(*) as total FROM reminders;
```
**Resultado esperado:** 12 lembretes

### 6. Verificar Integridade dos Dados
```sql
-- Esta query verifica se todas as foreign keys estão corretas
SELECT
  t.id,
  t.description,
  u.username,
  c.name as category,
  CASE
    WHEN t.is_recurring THEN
      CONCAT('Parcela ', t.current_installment, '/', t.total_installments)
    ELSE 'Não recorrente'
  END as recurrence_info
FROM transactions t
JOIN users u ON t.user_id = u.id
LEFT JOIN categories c ON t.category_id = c.id
ORDER BY t.id;
```
**Resultado esperado:** Todas as 8 transações com usuário e categoria válidos

## Solução de Problemas

### Erro: "duplicate key value violates unique constraint"

**Causa:** Já existem dados na tabela com os mesmos IDs

**Solução 1 - Limpar tabelas (CUIDADO: apaga todos os dados)**:
```sql
TRUNCATE TABLE reminders CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE users CASCADE;
```

**Solução 2 - Verificar se já tem dados**:
```sql
SELECT 'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'reminders', COUNT(*) FROM reminders;
```

### Erro: "invalid input syntax for type timestamp"

**Causa:** Formato de data incorreto

**Solução:** Os arquivos CSV já foram corrigidos com timestamps no formato `YYYY-MM-DD HH:MM:SS`. Se o erro persistir, verifique se você está usando os arquivos CSV atualizados.

### Erro: "foreign key violation"

**Causa:** Tentou importar na ordem errada

**Solução:** Siga a ordem exata: users → categories → transactions → reminders

### Transação não mostra "Parcela 3/45" no Frontend

**Verificações:**

1. Confirme que a transação foi importada corretamente:
```sql
SELECT * FROM transactions WHERE id = 7;
```

2. Verifique se `is_recurring` está como `true` (não como `1` ou `"1"`)

3. Limpe o cache do browser:
   - Mac: Cmd + Shift + R
   - Windows: Ctrl + Shift + R

4. Verifique a resposta da API:
   - Abra DevTools (F12)
   - Vá em **Network**
   - Recarregue a página
   - Procure pela chamada `/api/transactions`
   - Verifique se o JSON contém:
     ```json
     {
       "id": 7,
       "description": "Acordo - Pix 45991062631",
       "isRecurring": true,
       "recurrenceType": "PARCELAS",
       "currentInstallment": 3,
       "totalInstallments": 45
     }
     ```

## Próximos Passos

Após importar todos os dados com sucesso:

1. ✅ Dados importados no Supabase
2. ⏭️ Fazer deploy no Vercel (veja `DEPLOY_VERCEL.md`)
3. ⏭️ Testar a aplicação em produção
4. ⏭️ Verificar se a transação "Acordo - Pix 45991062631" exibe "Parcela 3/45"

## Suporte

Se encontrar problemas não listados aqui:

1. Verifique os logs do Supabase em **Logs** → **PostgreSQL Logs**
2. Confirme que todas as tabelas foram criadas corretamente
3. Verifique se as variáveis de ambiente estão configuradas no Vercel
