// api/index.ts  (ou api/index.js se preferir)
import 'dotenv/config';
import express from 'express';
import { type Request, type Response, type NextFunction } from 'express';
import { registerRoutes } from '../server/routes';         // ajuste caminhos
import { setupVite, serveStatic, log } from '../server/vite';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// middlewares de log (igual aos seus)
app.use((req, res, next) => { /* … mesma lógica … */ next(); });

// registra rotas da API
registerRoutes(app).catch(console.error);

// em produção (Vercel) não precisamos de Vite; ele só roda no dev local
if (process.env.NODE_ENV === 'development') {
  const server = {   // server dummy só p/ setupVite aceitar
    on() {},
    listen() {}
  } as any;
setupVite(app, server).catch(console.error);
} else {
  serveStatic(app);
}

// 🔑  ponto crucial: exporte o handler
export const handler = serverless(app);   // para AWS-Lambda style
export default app;                       // para Vercel Node functions
