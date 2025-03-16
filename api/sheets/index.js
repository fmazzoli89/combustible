const { google } = require('googleapis');

// Create JWT client
const auth = new google.auth.JWT(
    process.env.CLIENT_EMAIL,
    null,
    process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
);

const sheets = google.sheets({ version: 'v4', auth });

// Function to get obras list from sheet
async function getObrasList() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Obras!A2:A',
            majorDimension: 'COLUMNS'
        });

        // Extract the first (and only) column
        const obras = response.data.values ? response.data.values[0] : [];
        return obras;
    } catch (error) {
        console.error('Error fetching obras:', error);
        throw error;
    }
}

// Function to get operarios list from sheet
async function getOperariosList() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Operarios!A2:A',
            majorDimension: 'COLUMNS'
        });

        // Extract the first (and only) column
        const operarios = response.data.values ? response.data.values[0] : [];
        return operarios;
    } catch (error) {
        console.error('Error fetching operarios:', error);
        throw error;
    }
}

// Function to get maquinas list from sheet
async function getMaquinasList() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Maquinas!A2:A',
            majorDimension: 'COLUMNS'
        });

        // Extract the first (and only) column
        const maquinas = response.data.values ? response.data.values[0] : [];
        return maquinas;
    } catch (error) {
        console.error('Error fetching maquinas:', error);
        throw error;
    }
}

// Function to get users list from sheet
async function getUsersList() {
    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: 'Usuarios!A2:B',
            majorDimension: 'ROWS'
        });

        // Extract users and passwords
        const users = response.data.values || [];
        return users.map(row => ({
            username: row[0] || '',
            password: row[1] || ''
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Function to verify user credentials
async function verifyCredentials(username, password) {
    try {
        const users = await getUsersList();
        const user = users.find(u => u.username === username);
        return user && user.password === password;
    } catch (error) {
        console.error('Error verifying credentials:', error);
        throw error;
    }
}

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

// Function to get user history
async function getUserHistory(username) {
    try {
        // Fetch data from both sheets
        const [cargasResponse, descargasResponse] = await Promise.all([
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.SHEET_ID,
                range: 'Cargas!A:K',
                majorDimension: 'ROWS'
            }),
            sheets.spreadsheets.values.get({
                spreadsheetId: process.env.SHEET_ID,
                range: 'Descargas!A:K',
                majorDimension: 'ROWS'
            })
        ]);

        // Extract values from both sheets
        const cargasValues = cargasResponse.data.values || [];
        const descargasValues = descargasResponse.data.values || [];
        
        // Filter by username for each sheet
        const cargasHistory = cargasValues
            .filter(row => row.length > 0 && row[row.length - 1] === username)
            .map(row => [...row, 'Cargas']); // Add sheet name as the last item
            
        const descargasHistory = descargasValues
            .filter(row => row.length > 0 && row[row.length - 1] === username)
            .map(row => [...row, 'Descargas']); // Add sheet name as the last item
        
        // Combine both histories
        const combinedHistory = [...cargasHistory, ...descargasHistory];
        
        // Sort by date in reverse order (most recent first)
        // We're assuming the first column (index 0) contains the date
        combinedHistory.sort((a, b) => {
            const dateA = new Date(a[0]);
            const dateB = new Date(b[0]);
            return dateB - dateA; // Descending order
        });
        
        // Return the most recent 5 entries
        return combinedHistory.slice(0, 5);
    } catch (error) {
        console.error('Error fetching user history:', error);
        throw error;
    }
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Handle GET request for lists
    if (req.method === 'GET') {
        try {
            const [obras, operarios, maquinas, users] = await Promise.all([
                getObrasList(),
                getOperariosList(),
                getMaquinasList(),
                getUsersList()
            ]);
            
            // Only send usernames, not passwords
            const usernames = users.map(user => user.username);
            
            res.status(200).json({
                obras,
                operarios,
                maquinas,
                users: usernames
            });
        } catch (error) {
            console.error('Error getting lists:', error);
            res.status(500).json({
                error: 'Failed to get lists',
                details: error.message
            });
        }
        return;
    }

    // Handle POST request for history
    if (req.method === 'POST') {
        try {
            const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            
            // Check if this is a history request
            if (body.username && ('sheetName' in body)) {
                const history = await getUserHistory(body.username);
                res.status(200).json({ history });
                return;
            }

            // Check if this is an authentication request
            if (body.username && body.password) {
                const isValid = await verifyCredentials(body.username, body.password);
                if (isValid) {
                    res.status(200).json({ success: true });
                } else {
                    res.status(401).json({ error: 'Invalid credentials' });
                }
                return;
            }

            // If not history or authentication, handle as data append request
            const { values } = body;

            // Log environment variables (without sensitive data)
            console.log('Environment check:', {
                hasSheetId: !!process.env.SHEET_ID,
                hasClientEmail: !!process.env.CLIENT_EMAIL,
                hasPrivateKey: !!process.env.PRIVATE_KEY,
                sheetIdLength: process.env.SHEET_ID?.length
            });

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
                
                // Get the sheet ID first
                const spreadsheet = await sheets.spreadsheets.get({
                    spreadsheetId: process.env.SHEET_ID
                });
                const sheetId = spreadsheet.data.sheets.find(s => s.properties.title === sheetName).properties.sheetId;
                
                // First, insert a new row at position 2
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId: process.env.SHEET_ID,
                    resource: {
                        requests: [{
                            insertDimension: {
                                range: {
                                    sheetId: sheetId,
                                    dimension: 'ROWS',
                                    startIndex: 1,  // 0-based index, so 1 means row 2
                                    endIndex: 2
                                }
                            }
                        }]
                    }
                });

                // Then update the newly inserted row with values
                const response = await sheets.spreadsheets.values.update({
                    spreadsheetId: process.env.SHEET_ID,
                    range: `${sheetName}!A2`,
                    valueInputOption: 'USER_ENTERED',
                    resource: {
                        values: [values]
                    }
                });

                console.log('Successfully inserted values:', response.data);

                res.status(200).json({
                    success: true,
                    updatedRange: response.data.updatedRange
                });
            } catch (error) {
                console.error('Error inserting to sheet:', {
                    error: error.message,
                    stack: error.stack,
                    response: error.response?.data,
                    sheetName,
                    values
                });
                res.status(500).json({
                    error: 'Failed to insert to sheet',
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
    }
}; 