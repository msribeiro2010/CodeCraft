import 'dotenv/config';
import express from 'express';
import { type Request, type Response, type NextFunction } from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic, log } from '../server/vite';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de log
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const originalSend = res.send;
  
  res.send = function(body) {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    return originalSend.call(this, body);
  };
  
  next();
});

// Registra rotas da API
registerRoutes(app).catch(console.error);

// Em produção, serve arquivos estáticos
if (process.env.NODE_ENV !== 'development') {
  serveStatic(app);
}

// Exporta o handler para Vercel
export default serverless(app);