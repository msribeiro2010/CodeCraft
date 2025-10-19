// dotenv só é necessário localmente; Vercel injeta variáveis automaticamente
import express from 'express';
import { type Request, type Response, type NextFunction } from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic, log } from '../server/vite';
import serverless from 'serverless-http';

// Carrega dotenv apenas localmente (não no Vercel)
if (process.env.VERCEL !== '1') {
  import('dotenv/config').catch(console.error);
}

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

// Flag para garantir que rotas sejam registradas apenas uma vez
let routesInitialized = false;
let routesPromise: Promise<any> | null = null;

// Função para inicializar as rotas
async function initializeRoutes() {
  if (!routesInitialized && !routesPromise) {
    routesPromise = registerRoutes(app);
    await routesPromise;
    routesInitialized = true;

    // Em produção local, serve arquivos estáticos; em Vercel, o static-build atende o front-end
    if (process.env.NODE_ENV !== 'development' && process.env.VERCEL !== '1') {
      serveStatic(app);
    }
  } else if (routesPromise && !routesInitialized) {
    await routesPromise;
  }
}

// Handler serverless com inicialização assíncrona
const handler = serverless(app);

export default async (req: any, res: any) => {
  try {
    await initializeRoutes();
    return handler(req, res);
  } catch (error) {
    console.error('Error initializing routes:', error);
    res.status(500).json({ error: 'Internal server error during initialization' });
  }
};