import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes';
import { setupVite, log } from './vite';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log
app.use((req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, data);
  };
  
  next();
});

async function startServer() {
  try {
    // Registra as rotas e obtém o servidor HTTP
    const server = await registerRoutes(app);
    
    // Configura o Vite em modo de desenvolvimento
    await setupVite(app, server);
    
    const port = process.env.PORT || 3000;
    
    server.listen(port, () => {
      log(`🚀 Servidor rodando em http://localhost:${port}`);
      log(`📱 Frontend disponível em http://localhost:${port}`);
      log(`🔌 API disponível em http://localhost:${port}/api`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();