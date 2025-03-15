// Test Google Sheets access
async function testSheetsAccess() {
    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${config.SHEET_ID}`;
    const params = new URLSearchParams({
        key: config.API_KEY,
        includeGridData: false
    });
    
    try {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        console.log('Testing access to:', `${endpoint}?${params}`);
        const response = await fetch(proxyUrl + `${endpoint}?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const responseText = await response.text();
        console.log('Raw response:', responseText);

        try {
            const data = JSON.parse(responseText);
            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
            }
            console.log('Sheet info:', data);
            return data;
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Invalid response from server');
        }
    } catch (error) {
        console.error('Error accessing sheet:', error);
        throw error;
    }
} 