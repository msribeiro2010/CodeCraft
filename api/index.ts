import express from 'express';
import { registerRoutes } from '../server/routes';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let appReady: Promise<any> | null = null;

// Initialize app once
if (!appReady) {
  appReady = registerRoutes(app);
}

export default async (req: any, res: any) => {
  try {
    // Wait for routes to be registered
    await appReady;
    // Create and call handler
    const handler = serverless(app);
    return await handler(req, res);
  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ error: 'Internal server error', message: (error as any)?.message });
  }
};