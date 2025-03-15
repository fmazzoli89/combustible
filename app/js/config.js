// Google Sheets API configuration
// To use this application:
// 1. Create a new Google Sheet
// 2. Get the Sheet ID from the URL (the long string between /d/ and /edit in the URL)
// 3. Create a Google Cloud Project and enable the Google Sheets API
// 4. Create API credentials (API Key) with access to Google Sheets API
// 5. Replace the values below with your actual credentials

const SHEET_ID = ''; // Example: '1hUZfOdDwG44M5k2-dI0NXpH8248LAcwlBde9emw2GP8'
const API_KEY = ''; // Example: 'AIzaSyA9DajDlIlCLytHNPCkrCCfVUx5yQRohxI'

// API endpoints - DO NOT MODIFY
const ENDPOINTS = {
    APPEND: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:J:append?valueInputOption=USER_ENTERED&key=${API_KEY}`,
    GET: `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:J?key=${API_KEY}`
}; 