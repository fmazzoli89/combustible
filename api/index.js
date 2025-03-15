// Simple API endpoint for the root /api path
module.exports = (req, res) => {
  console.log('==== API ROOT REQUEST ====');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Return a simple JSON response
  res.status(200).json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/hello',
      '/api/env-check',
      '/api/sheets-test',
      '/api/sheets'
    ]
  });
}; 