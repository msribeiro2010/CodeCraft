# Configuração do Vercel

## Variáveis de Ambiente Necessárias

Para que a aplicação funcione corretamente no Vercel, você precisa configurar as seguintes variáveis de ambiente no painel do Vercel:

### Obrigatórias:
- `DATABASE_URL` - URL de conexão com o banco PostgreSQL
- `SESSION_SECRET` - Chave secreta para sessões (gere uma string aleatória)
- `NODE_ENV` - Defina como `production`

### Firebase (para autenticação):
- `VITE_FIREBASE_API_KEY` - Chave da API do Firebase
- `VITE_FIREBASE_PROJECT_ID` - ID do projeto Firebase
- `VITE_FIREBASE_APP_ID` - ID da aplicação Firebase

## Como configurar no Vercel:

1. Acesse o painel do Vercel
2. Vá para o seu projeto
3. Clique em "Settings" > "Environment Variables"
4. Adicione cada variável listada acima
5. Faça um novo deploy ou aguarde o deploy automático

## Banco de Dados:

Recomendamos usar:
- **Neon** (PostgreSQL gratuito): https://neon.tech
- **Supabase** (PostgreSQL gratuito): https://supabase.com
- **Railway** (PostgreSQL): https://railway.app

## Problemas Comuns:

### Tela em branco:
- Verifique se todas as variáveis de ambiente estão configuradas
- Verifique se o DATABASE_URL está correto
- Verifique os logs do Vercel para erros específicos

### Erro de conexão com banco:
- Verifique se o DATABASE_URL está no formato correto
- Certifique-se de que o banco está acessível publicamente
- Execute `npm run db:push` localmente para criar as tabelas

### Erro de autenticação:
- Verifique se as variáveis do Firebase estão corretas
- Certifique-se de que o domínio do Vercel está autorizado no Firebase