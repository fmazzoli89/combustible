// Test Google Sheets access
async function testSheetsAccess() {
    try {
        // Use our serverless function to test access
        const response = await fetch('https://combustible-tramec.vercel.app/api/sheets-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                test: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check for success in the new API response format
        if (!data.success) {
            console.error('API Error:', data);
            throw new Error(data.message || 'Unknown error occurred');
        }
        
        console.log('Sheet info:', data.info);
        return data.info;
    } catch (error) {
        console.error('Error accessing sheet:', error);
        throw error;
    }
} 