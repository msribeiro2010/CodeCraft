// Simplified handler that directly creates Express app with routes
import express from 'express';
import { registerRoutes } from '../server/routes';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes immediately at module level (top-level await)
await registerRoutes(app);

// Create handler after routes are registered
const handler = serverless(app);

export default handler;