// Simple auth test serverless function
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Test registration endpoint
  if (req.method === 'POST') {
    try {
      // Parse JSON if content-type is application/json
      let userData;
      if (req.headers['content-type'] === 'application/json') {
        userData = req.body;
      } else {
        // Mock data if no body
        userData = { username: 'test', email: 'test@example.com' };
      }

      return res.json({
        success: true,
        message: 'Test auth endpoint successful',
        user: { 
          ...userData,
          id: 'test-user-id-123',
          created: new Date().toISOString()
        },
        token: 'test-jwt-token-would-be-here'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  // For GET requests, return instructions
  return res.json({
    message: 'This is a test auth endpoint. Send a POST request with JSON data to test.',
    requestMethod: req.method,
    expectedBody: {
      username: 'yourUsername',
      email: 'your@email.com',
      password: 'yourPassword'
    }
  });
};