export default function handler(req: any, res: any) {
  console.log('[API] Simple test:', req.method, req.url);
  res.status(200).json({
    status: 'ok',
    message: 'API index working',
    url: req.url,
    method: req.method
  });
}