import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function startServer() {
  try {
    // Registra as rotas e obtém o servidor HTTP
    const server = await registerRoutes(app);

    const port = process.env.PORT || 3000;

    server.listen(port, () => {
      console.log(`🚀 API rodando em http://localhost:${port}/api`);
      console.log(`⚠️  Frontend não disponível (rodando sem Vite)`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();
