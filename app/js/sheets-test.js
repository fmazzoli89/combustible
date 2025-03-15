// Test Google Sheets access
async function testSheetsAccess() {
    try {
        console.log('Attempting to test Google Sheets access...');
        
        // Use our serverless function to test access
        const response = await fetch('https://combustible-tramec.vercel.app/api/sheets-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                test: true
            })
        }).catch(fetchError => {
            console.error('Fetch error (network level):', fetchError);
            throw fetchError;
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        
        let responseText;
        try {
            responseText = await response.text();
            console.log('Raw response:', responseText);
            const data = JSON.parse(responseText);
            
            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
            }
            
            // Check for success in the new API response format
            if (!data.success) {
                console.error('API Error:', data);
                throw new Error(data.message || 'Unknown error occurred');
            }
            
            console.log('Sheet info:', data.info);
            return data.info;
        } catch (parseError) {
            console.error('Error parsing JSON response:', parseError);
            console.error('Response text was:', responseText);
            throw new Error(`Failed to parse response: ${parseError.message}`);
        }
    } catch (error) {
        console.error('Error accessing sheet:', error);
        throw error;
    }
} 