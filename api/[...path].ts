// Catch-all route for Vercel - handles all /api/* requests
// This file must be named [...path].ts to work as a catch-all in Vercel

import handler from './index';

// Re-export the main handler to handle all API routes
export default handler;
