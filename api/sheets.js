// Simplified API endpoint with detailed logging
module.exports = async (req, res) => {
  console.log('==== SHEETS API REQUEST START ====');
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
    console.log('==== SHEETS API REQUEST END (OPTIONS) ====');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Method not allowed:', req.method);
    res.status(405).json({ error: 'Method not allowed' });
    console.log('==== SHEETS API REQUEST END (METHOD NOT ALLOWED) ====');
    return;
  }

  try {
    const { sheetName, values } = req.body || {};
    console.log('Extracted from request body:', { sheetName, values });
    
    if (!sheetName) {
      console.log('Missing sheetName in request');
      res.status(400).json({ error: 'Bad Request', message: 'sheetName is required' });
      console.log('==== SHEETS API REQUEST END (BAD REQUEST) ====');
      return;
    }
    
    if (!values) {
      console.log('Missing values in request');
      res.status(400).json({ error: 'Bad Request', message: 'values is required' });
      console.log('==== SHEETS API REQUEST END (BAD REQUEST) ====');
      return;
    }
    
    // Just return a simple success response with the data we received
    const response = { 
      success: true, 
      message: 'Data received successfully (test mode)',
      timestamp: new Date().toISOString(),
      receivedData: {
        sheetName,
        values
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercel: process.env.VERCEL === '1' ? 'true' : 'false',
        region: process.env.VERCEL_REGION || 'unknown'
      }
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
    console.log('==== SHEETS API REQUEST END (SUCCESS) ====');
  } catch (error) {
    console.error('Error in sheets API:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack
    });
    console.log('==== SHEETS API REQUEST END (ERROR) ====');
  }
}; 