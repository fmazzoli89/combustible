// Serverless function to test Google Sheets access
const { GoogleSpreadsheet } = require('google-spreadsheet');

module.exports = async (req, res) => {
  console.log('Test API request received:', req.method);
  
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
    
    // Get basic information about the document
    const info = {
      title: doc.title,
      sheetCount: doc.sheetCount,
      sheets: doc.sheetsByIndex.map(sheet => ({
        title: sheet.title,
        index: sheet.index,
        rowCount: sheet.rowCount,
        columnCount: sheet.columnCount
      }))
    };
    
    console.log('Document info:', info);
    
    // Return success with document info
    return res.status(200).json({ 
      success: true, 
      message: 'Successfully connected to Google Sheets',
      info
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
}; 