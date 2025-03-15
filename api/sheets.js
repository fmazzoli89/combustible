// Simplified API endpoint that doesn't use Google Sheets API
module.exports = async (req, res) => {
  console.log('API request received:', req.method);
  
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

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sheetName, values } = req.body;
    console.log('Request body:', { sheetName, values });
    
    // Just return a simple success response with the data we received
    return res.status(200).json({ 
      success: true, 
      message: 'Data received successfully (test mode)',
      timestamp: new Date().toISOString(),
      receivedData: {
        sheetName,
        values
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}; 