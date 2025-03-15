// Serverless function to handle Google Sheets API requests
const fetch = require('node-fetch');

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
    
    // Configuration
    const SHEET_ID = process.env.SHEET_ID || '1hUZfOdDwG44M5k2-dI0NXpH8248LAcwlBde9emw2GP8';
    const API_KEY = process.env.API_KEY || 'AIzaSyA9DajDlIlCLytHNPCkrCCfVUx5yQRohxI';
    
    console.log('Using configuration:', { SHEET_ID, API_KEY: API_KEY.substring(0, 5) + '...' });
    
    // Build the API endpoint
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}!A:Z:append`;
    const params = new URLSearchParams({
      valueInputOption: 'USER_ENTERED',
      key: API_KEY,
      insertDataOption: 'INSERT_ROWS'
    });

    console.log('Making request to:', `${endpoint}?${params}`);

    // Make the request to Google Sheets API
    const response = await fetch(`${endpoint}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${sheetName}!A:Z`,
        majorDimension: "ROWS",
        values: [values]
      })
    });

    // Get the response
    const data = await response.json();
    console.log('Google Sheets API response:', data);
    
    // Return the response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}; 