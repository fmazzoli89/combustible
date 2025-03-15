const { google } = require('googleapis');

// Create JWT client
const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

module.exports = async (req, res) => {
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
        // Parse request body
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { values } = body;

        console.log('Received values:', values); // Debug log

        if (!values || !Array.isArray(values)) {
            console.log('Invalid data format:', body); // Debug log
            res.status(400).json({ error: 'Invalid data format' });
            return;
        }

        // Append values to the sheet
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Sheet1!A:K',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [values]
            }
        });

        console.log('Sheets API response:', response.data); // Debug log

        res.status(200).json({
            success: true,
            updatedRange: response.data.updates.updatedRange
        });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({
            error: 'Failed to append data to sheet',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}; 