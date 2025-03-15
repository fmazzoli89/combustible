// Google Sheets API configuration
// To use this application:
// 1. Create a new Google Sheet
// 2. Get the Sheet ID from the URL (the long string between /d/ and /edit in the URL)
// 3. Create a Google Cloud Project and enable the Google Sheets API
// 4. Create API credentials (API Key) with access to Google Sheets API
// 5. Replace the values below with your actual credentials

const SHEET_ID = ''; // Add your Google Sheet ID here
const SHEET_NAME = 'Sheet1'; // The name of your sheet tab

// Service Account credentials
const SERVICE_ACCOUNT_EMAIL = ''; // Add your service account email
const PRIVATE_KEY = ''; // Add your private key here

// API endpoints
const ENDPOINTS = {
    TOKEN: 'https://oauth2.googleapis.com/token',
    SHEETS: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values`,
};

// API endpoint for the serverless function - dynamically set based on environment
const BASE_API_ENDPOINT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? '/api/sheets'  // Local development
    : 'https://combustible-tramec.vercel.app/api/sheets';  // Production

// Get OAuth2 token
async function getAccessToken() {
    const header = {
        alg: 'RS256',
        typ: 'JWT',
        kid: PRIVATE_KEY
    };

    const now = Math.floor(Date.now() / 1000);
    const oneHour = 60 * 60;
    const claim = {
        iss: SERVICE_ACCOUNT_EMAIL,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        aud: ENDPOINTS.TOKEN,
        exp: now + oneHour,
        iat: now
    };

    // Create JWT
    const headerBase64 = btoa(JSON.stringify(header));
    const claimBase64 = btoa(JSON.stringify(claim));
    const signature = `${headerBase64}.${claimBase64}`;
    
    // Sign with private key (you'll need to implement this part)
    // For security reasons, we'll handle the actual signing on the server side
    
    const response = await fetch(ENDPOINTS.TOKEN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: signature
        })
    });

    const data = await response.json();
    return data.access_token;
}

// Function to append data to the sheet
async function appendToSheet(values) {
    try {
        console.log('Sending values to API:', values); // Debug log
        const response = await fetch(BASE_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ values })
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText); // Debug log
            throw new Error(errorText || 'Failed to append data to sheet');
        }

        const result = await response.json();
        console.log('API Response:', result); // Debug log
        return result;
    } catch (error) {
        console.error('Error appending to sheet:', error);
        throw error;
    }
} 