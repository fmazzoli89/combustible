// API endpoint to check environment variables
module.exports = async (req, res) => {
  console.log('==== ENV-CHECK API REQUEST START ====');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
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
    console.log('Handling OPTIONS request');
    res.status(200).end();
    console.log('==== ENV-CHECK API REQUEST END (OPTIONS) ====');
    return;
  }

  try {
    // Get all environment variables (safely)
    const envVars = {};
    
    // System environment variables
    envVars.NODE_ENV = process.env.NODE_ENV || 'not set';
    envVars.VERCEL = process.env.VERCEL || 'not set';
    envVars.VERCEL_ENV = process.env.VERCEL_ENV || 'not set';
    envVars.VERCEL_REGION = process.env.VERCEL_REGION || 'not set';
    envVars.VERCEL_URL = process.env.VERCEL_URL || 'not set';
    
    // Check for our custom environment variables
    envVars.SHEET_ID_EXISTS = process.env.SHEET_ID ? 'yes' : 'no';
    envVars.CLIENT_EMAIL_EXISTS = process.env.CLIENT_EMAIL ? 'yes' : 'no';
    envVars.PRIVATE_KEY_EXISTS = process.env.PRIVATE_KEY ? 'yes' : 'no';
    envVars.API_KEY_EXISTS = process.env.API_KEY ? 'yes' : 'no';
    
    // If SHEET_ID exists, show part of it
    if (process.env.SHEET_ID) {
      const id = process.env.SHEET_ID;
      envVars.SHEET_ID_PREVIEW = id.substring(0, 4) + '...' + id.substring(id.length - 4);
    }
    
    // If CLIENT_EMAIL exists, show part of it
    if (process.env.CLIENT_EMAIL) {
      const email = process.env.CLIENT_EMAIL;
      const atIndex = email.indexOf('@');
      if (atIndex > 0) {
        const username = email.substring(0, atIndex);
        const domain = email.substring(atIndex + 1);
        envVars.CLIENT_EMAIL_PREVIEW = username.substring(0, 3) + '...' + '@' + domain;
      } else {
        envVars.CLIENT_EMAIL_PREVIEW = email.substring(0, 3) + '...';
      }
    }
    
    // If PRIVATE_KEY exists, show its length
    if (process.env.PRIVATE_KEY) {
      envVars.PRIVATE_KEY_LENGTH = process.env.PRIVATE_KEY.length;
      envVars.PRIVATE_KEY_PREVIEW = process.env.PRIVATE_KEY.substring(0, 15) + '...';
      envVars.PRIVATE_KEY_CONTAINS_BEGIN = process.env.PRIVATE_KEY.includes('BEGIN PRIVATE KEY');
      envVars.PRIVATE_KEY_CONTAINS_END = process.env.PRIVATE_KEY.includes('END PRIVATE KEY');
      envVars.PRIVATE_KEY_CONTAINS_NEWLINES = process.env.PRIVATE_KEY.includes('\n');
    }
    
    // If API_KEY exists, show part of it
    if (process.env.API_KEY) {
      const key = process.env.API_KEY;
      envVars.API_KEY_PREVIEW = key.substring(0, 4) + '...' + key.substring(key.length - 4);
    }
    
    // Return the environment variables
    const response = {
      success: true,
      message: 'Environment variables check',
      timestamp: new Date().toISOString(),
      environment: envVars
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.status(200).json(response);
    console.log('==== ENV-CHECK API REQUEST END (SUCCESS) ====');
  } catch (error) {
    console.error('Error in env-check API:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: error.message,
      stack: error.stack
    });
    console.log('==== ENV-CHECK API REQUEST END (ERROR) ====');
  }
}; 