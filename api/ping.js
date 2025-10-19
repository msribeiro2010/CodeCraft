module.exports = (req, res) => {
  res.status(200).json({
    status: 'pong',
    timestamp: new Date().toISOString()
  });
};
