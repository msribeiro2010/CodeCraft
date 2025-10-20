export default function handler(req: any, res: any) {
  console.log('[TEST] Request received:', req.method, req.url);
  res.status(200).json({
    status: 'ok',
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      isVercel: process.env.VERCEL === '1',
      nodeVersion: process.version
    }
  });
}
