// Simple health check endpoint to test Vercel function
export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasDatabase: !!process.env.DATABASE_URL,
      hasSupabase: !!process.env.SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV,
      isVercel: process.env.VERCEL === '1'
    }
  });
}
