// Serverless function to handle Google Sheets API requests
const { GoogleSpreadsheet } = require('google-spreadsheet');

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
    const CLIENT_EMAIL = process.env.CLIENT_EMAIL;
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    
    if (!CLIENT_EMAIL || !PRIVATE_KEY) {
      console.error('Missing credentials');
      return res.status(500).json({ error: 'Server configuration error', message: 'Missing credentials' });
    }
    
    console.log('Using configuration:', { SHEET_ID, CLIENT_EMAIL });
    
    // Initialize the sheet
    const doc = new GoogleSpreadsheet(SHEET_ID);
    
    // Authenticate with the Google Sheets API
    await doc.useServiceAccountAuth({
      client_email: CLIENT_EMAIL,
      private_key: PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix for escaped newlines in environment variables
    });
    
    // Load document properties and sheets
    await doc.loadInfo();
    console.log('Loaded document:', doc.title);
    
    // Get the sheet
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      console.error('Sheet not found:', sheetName);
      return res.status(404).json({ error: 'Sheet not found', message: `Sheet "${sheetName}" not found` });
    }
    
    // Add the row
    const result = await sheet.addRow(values);
    console.log('Added row:', result._rowNumber);
    
    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Data added successfully',
      rowNumber: result._rowNumber
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}; 