// Simplified test endpoint with detailed logging
module.exports = async (req, res) => {
  console.log('==== SHEETS-TEST API REQUEST START ====');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request query:', JSON.stringify(req.query, null, 2));
  
  // Log body if it exists
  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  } catch (e) {
    console.log('Could not stringify request body:', e.message);
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  console.log('CORS headers set');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.status(200).end();
    console.log('==== SHEETS-TEST API REQUEST END (OPTIONS) ====');
    return;
  }

  try {
    // Just return a simple success response
    const response = { 
      success: true, 
      message: 'API endpoint is working',
      timestamp: new Date().toISOString(),
      requestMethod: req.method,
      requestBody: req.body || {},
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1' ? 'true' : 'false',
        region: process.env.VERCEL_REGION || 'unknown'
      }
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
    console.log('==== SHEETS-TEST API REQUEST END (SUCCESS) ====');
  } catch (error) {
    console.error('Error in sheets-test API:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack
    });
    console.log('==== SHEETS-TEST API REQUEST END (ERROR) ====');
  }
}; 