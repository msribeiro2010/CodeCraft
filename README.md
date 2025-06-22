# FinControl - Controle Financeiro Pessoal

Aplicativo de controle financeiro pessoal com gerenciamento de transações, faturas e lembretes de pagamento.

## 🚀 Deploy no Vercel

### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Conta no [Neon](https://neon.tech) ou outro provedor PostgreSQL
- Node.js 18+ instalado

### 1. Configuração Local

```bash
# Clone o repositório
git clone <seu-repositorio>
cd CodeCraft

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
npm run db:push

# Inicie o servidor de desenvolvimento
npm run dev
```

### 2. Deploy via Vercel CLI

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Faça login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

### 3. Deploy via GitHub

1. **Conecte seu repositório ao Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe seu repositório do GitHub

2. **Configure as variáveis de ambiente:**
   - No dashboard do Vercel, vá em Settings > Environment Variables
   - Adicione:
     - `DATABASE_URL`: URL do seu banco PostgreSQL
     - `NODE_ENV`: `production`
     - `SESSION_SECRET`: Uma string aleatória segura

3. **Deploy automático:**
   - Cada push na branch main fará deploy automático

### 4. Configuração do Banco de Dados

#### Opção 1: Neon (Recomendado)
1. Crie uma conta em [neon.tech](https://neon.tech)
2. Crie um novo projeto
3. Copie a connection string
4. Adicione como `DATABASE_URL` no Vercel

#### Opção 2: Vercel Postgres
1. No dashboard do Vercel, vá em Storage
2. Crie um Postgres Database
3. As variáveis serão configuradas automaticamente

### 5. Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento local
npm run build        # Build completo (frontend + backend)
npm run vercel-build # Build apenas do frontend (usado pelo Vercel)
npm run start        # Produção local
npm run check        # Verificação de tipos TypeScript
npm run db:push      # Aplicar mudanças no schema do banco
```

### 6. Estrutura do Projeto

```
├── client/          # Frontend React + Vite
│   ├── src/
│   └── index.html
├── server/          # Backend Express + Node.js
│   ├── index.ts     # Servidor principal
│   ├── routes.ts    # Rotas da API
│   ├── db.ts        # Configuração do banco
│   └── vite.ts      # Configuração do Vite
├── shared/          # Schemas compartilhados
├── vercel.json      # Configuração do Vercel
└── package.json
```

### 7. Tecnologias Utilizadas

- **Frontend:** React, TypeScript, Tailwind CSS, Radix UI
- **Backend:** Node.js, Express, TypeScript
- **Banco de Dados:** PostgreSQL, Drizzle ORM
- **Deploy:** Vercel
- **Build:** Vite, ESBuild

### 8. Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|----------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Ambiente de execução | `production` |
| `SESSION_SECRET` | Chave secreta para sessões | `sua-chave-secreta-aqui` |

### 9. Troubleshooting

#### Erro de Build
- Verifique se todas as dependências estão instaladas
- Confirme que o TypeScript está configurado corretamente

#### Erro de Banco de Dados
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco está acessível
- Execute `npm run db:push` para aplicar o schema

#### Erro de Deploy
- Verifique os logs no dashboard do Vercel
- Confirme que todas as variáveis de ambiente estão configuradas

### 10. Suporte

Para dúvidas ou problemas:
1. Verifique os logs no dashboard do Vercel
2. Consulte a [documentação do Vercel](https://vercel.com/docs)
3. Verifique a [documentação do Drizzle](https://orm.drizzle.team)

---

**🎉 Seu app estará disponível em:** `https://seu-projeto.vercel.app`