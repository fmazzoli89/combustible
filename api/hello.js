// Simple hello world API endpoint with detailed logging
module.exports = (req, res) => {
  console.log('==== HELLO API REQUEST START ====');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));
  console.log('Request query:', JSON.stringify(req.query, null, 2));
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
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
    console.log('==== HELLO API REQUEST END (OPTIONS) ====');
    return;
  }

  try {
    // Return a simple JSON response
    const response = {
      message: 'Hello, World!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      headers: req.headers
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
    console.log('==== HELLO API REQUEST END (SUCCESS) ====');
  } catch (error) {
    console.error('Error in hello API:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack
    });
    console.log('==== HELLO API REQUEST END (ERROR) ====');
  }
}; 