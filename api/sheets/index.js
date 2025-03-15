const { google } = require('googleapis');

// Create JWT client
const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

// Function to ensure sheet exists
async function ensureSheetExists(spreadsheetId, sheetName) {
    try {
        console.log('Checking if sheet exists:', sheetName);
        const response = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId
        });

        console.log('Spreadsheet data:', JSON.stringify(response.data, null, 2));
        const sheet = response.data.sheets.find(s => s.properties.title === sheetName);
        
        if (!sheet) {
            console.log(`Creating sheet: ${sheetName}`);
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: spreadsheetId,
                resource: {
                    requests: [{
                        addSheet: {
                            properties: {
                                title: sheetName
                            }
                        }
                    }]
                }
            });
        }
    } catch (error) {
        console.error(`Error ensuring sheet exists: ${sheetName}`, {
            error: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        throw error;
    }
}

module.exports = async (req, res) => {
    console.log('API Request received:', {
        method: req.method,
        headers: req.headers,
        body: req.body
    });

    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Log environment variables (without sensitive data)
        console.log('Environment check:', {
            hasSheetId: !!process.env.SHEET_ID,
            hasClientEmail: !!process.env.CLIENT_EMAIL,
            hasPrivateKey: !!process.env.PRIVATE_KEY,
            sheetIdLength: process.env.SHEET_ID?.length
        });

        // Parse request body
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { values } = body;

        console.log('Received values:', values);

        if (!values || !Array.isArray(values)) {
            console.log('Invalid data format:', body);
            res.status(400).json({ error: 'Invalid data format' });
            return;
        }

        // First, try to get the sheet to verify access
        try {
            console.log('Verifying sheet access...');
            const sheetInfo = await sheets.spreadsheets.get({
                spreadsheetId: process.env.SHEET_ID
            });
            console.log('Sheet access verified:', sheetInfo.data.properties.title);
        } catch (error) {
            console.error('Error accessing sheet:', {
                error: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            res.status(500).json({
                error: 'Failed to access sheet',
                details: error.message,
                response: error.response?.data
            });
            return;
        }

        // Determine which sheet to use
        const sheetName = values[1] === 'DESCARGA' ? 'Descargas' : 'Cargas';
        console.log('Selected sheet:', sheetName);
        
        // Ensure the sheet exists
        try {
            await ensureSheetExists(process.env.SHEET_ID, sheetName);
            console.log('Sheet exists or was created:', sheetName);
        } catch (error) {
            console.error('Error ensuring sheet exists:', {
                error: error.message,
                stack: error.stack,
                response: error.response?.data
            });
            res.status(500).json({
                error: 'Failed to ensure sheet exists',
                details: error.message,
                response: error.response?.data
            });
            return;
        }

        // Append values to the appropriate sheet
        try {
            console.log('Attempting to append values:', {
                sheetName,
                values
            });
            
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId: process.env.SHEET_ID,
                range: `${sheetName}!A:K`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: [values]
                }
            });

            console.log('Successfully appended values:', response.data);

            res.status(200).json({
                success: true,
                updatedRange: response.data.updates.updatedRange
            });
        } catch (error) {
            console.error('Error appending to sheet:', {
                error: error.message,
                stack: error.stack,
                response: error.response?.data,
                sheetName,
                values
            });
            res.status(500).json({
                error: 'Failed to append to sheet',
                details: error.message,
                response: error.response?.data,
                sheetName,
                values
            });
        }
    } catch (error) {
        console.error('API Error:', {
            error: error.message,
            stack: error.stack,
            response: error.response?.data
        });
        res.status(500).json({
            error: 'Failed to process request',
            details: error.message,
            response: error.response?.data
        });
    }
}; 