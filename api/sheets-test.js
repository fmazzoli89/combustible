// Serverless function to test Google Sheets access
const fetch = require('node-fetch');

module.exports = async (req, res) => {
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

  try {
    // Configuration
    const SHEET_ID = process.env.SHEET_ID || '1hUZfOdDwG44M5k2-dI0NXpH8248LAcwlBde9emw2GP8';
    const API_KEY = process.env.API_KEY || 'AIzaSyA9DajDlIlCLytHNPCkrCCfVUx5yQRohxI';
    
    // Build the API endpoint
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
    const params = new URLSearchParams({
      key: API_KEY,
      includeGridData: false
    });

    // Make the request to Google Sheets API
    const response = await fetch(`${endpoint}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Get the response
    const data = await response.json();
    
    // Return the response
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}; 