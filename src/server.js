const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// Use JSON middleware for parsing JSON requests
app.use(bodyParser.json());

// Replace with your actual Postmark API token
const postmarkApiToken = 'YOUR_POSTMARK_API_TOKEN';

// Replace with your actual Google OAuth client ID and secret
const googleClientId = 'YOUR_GOOGLE_CLIENT_ID';
const googleClientSecret = 'YOUR_GOOGLE_CLIENT_SECRET';

// In-memory data store for simplicity (use a database in a production environment)
const users = {};

// Middleware to check if the user is authenticated
const authenticateUser = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !users[authorization]) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = users[authorization];
  next();
};

// Google OAuth authentication endpoint
app.post('/auth/google', async (req, res) => {
  try {
    const { code } = req.body;

    // Exchange code for access token and user info from Google
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: 'http://localhost:3000/auth/google/callback', // Replace with your actual redirect URI
      grant_type: 'authorization_code',
    });

    const { access_token, id_token } = response.data;

    // Decode and store user information
    const decodedToken = jwt_decode(id_token); // Use an appropriate library for decoding JWTs
    const userId = decodedToken.sub;
    users[access_token] = { userId, access_token };

    res.json({ access_token });
  } catch (error) {
    console.error('Google OAuth error:', error.response.data);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Communication history endpoint
app.get('/communication-history', authenticateUser, (req, res) => {
  // Fetch communication history for the authenticated user from your data store or database
  const communicationHistory = getCommunicationHistory(req.user.userId);

  res.json(communicationHistory);
});

// Send email endpoint
app.post('/send-email', authenticateUser, async (req, res) => {
  try {
    const { to, subject, body, templateId } = req.body;

    // Use Postmark API to send the email
    const response = await axios.post(
      'https://api.postmarkapp.com/email',
      {
        From: 'your@example.com', // Replace with your sending email address
        To: to,
        Subject: subject,
        TextBody: body,
        TemplateId: templateId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': postmarkApiToken,
        },
      }
    );

    // Record the email in communication history
    recordCommunication(req.user.userId, {
      sender: 'your@example.com', // Replace with your sending email address
      receiver: to,
      subject,
      body,
      timestamp: new Date().toISOString(),
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error sending email:', error.response.data);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to get communication history for a user (replace with database queries in a real-world scenario)
function getCommunicationHistory(userId) {
  // Return communication history for the given user from your data store or database
  return [];
}

// Helper function to record communication in the history for a user (replace with database queries in a real-world scenario)
function recordCommunication(userId, email) {
  // Record the communication history for the given user in your data store or database
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
