/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App*/

// Import required modules
import React, { useState, useEffect } from 'react';
import { GoogleLogin, GoogleLoginResponse, GoogleLoginResponseOffline } from 'react-google-login';
import axios from 'axios';

// Interface for email data
interface Email {
  id: number;
  sender: string;
  receiver: string;
  subject: string;
  body: string;
  timestamp: string;
}

// Interface for compose email data
interface ComposeEmailData {
  to: string;
  subject: string;
  body: string;
  templateId: string;
}

// React Component
const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [communicationHistory, setCommunicationHistory] = useState<Email[]>([]);
  const [composeEmailData, setComposeEmailData] = useState<ComposeEmailData>({
    to: '',
    subject: '',
    body: '',
    templateId: '', // The template ID will be set based on the selected email type
  });

  useEffect(() => {
    // Fetch communication history from your backend API
    const fetchCommunicationHistory = async () => {
      try {
        const response = await axios.get('/api/communication-history'); // Replace with your actual API endpoint
        setCommunicationHistory(response.data);
      } catch (error) {
        console.error('Error fetching communication history:', error);
      }
    };

    fetchCommunicationHistory();
  }, []);

  const handleGoogleLoginSuccess = (response: GoogleLoginResponse | GoogleLoginResponseOffline) => {
    console.log('Google login success:', response);
    // You can send the response to your backend for authentication
    setIsLoggedIn(true);
  };

  const handleGoogleLoginFailure = (error: any) => {
    console.error('Google login failure:', error);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setComposeEmailData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = event.target.value;

    // Set the template ID based on the selected email type
    setComposeEmailData((prevData) => ({ ...prevData, templateId: getTemplateId(selectedType) }));
  };

  const getTemplateId = (emailType: string): string => {
    // Map email types to corresponding Postmark template IDs
    switch (emailType) {
      case 'userOnboarding':
        return 'USER_ONBOARDING_TEMPLATE_ID'; // Replace with your actual template ID
      case 'marketingNewsletter':
        return 'MARKETING_NEWSLETTER_TEMPLATE_ID'; // Replace with your actual template ID
      case 'transactional':
        return 'TRANSACTIONAL_TEMPLATE_ID'; // Replace with your actual template ID
      case 'userEngagement':
        return 'USER_ENGAGEMENT_TEMPLATE_ID'; // Replace with your actual template ID
      default:
        return '';
    }
  };

  const handleSendEmail = async () => {
    try {
      // Call your backend API to send the email using Postmark
      const response = await axios.post('/api/send-email', composeEmailData, {
        headers: {
          'Content-Type': 'application/json',
          'X-Postmark-Server-Token': 'YOUR_POSTMARK_SERVER_TOKEN', // Replace with your Postmark server token
        },
      });

      console.log('Email sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  return (
    <div className="App">
      <h1>Your App</h1>

      {isLoggedIn ? (
        <>
          <h2>Welcome User!</h2>
          {/* Display Communication History */}
          <div>
            <h3>Communication History</h3>
            <ul>
              {communicationHistory.map((email) => (
                <li key={email.id}>
                  <strong>From:</strong> {email.sender}
                  <br />
                  <strong>To:</strong> {email.receiver}
                  <br />
                  <strong>Subject:</strong> {email.subject}
                  <br />
                  <strong>Body:</strong> {email.body}
                  <br />
                  <strong>Timestamp:</strong> {email.timestamp}
                </li>
              ))}
            </ul>
          </div>
          {/* Compose Email Form */}
          <div>
            <h3>Compose Email</h3>
            <form>
              <label>
                To:
                <input
                  type="email"
                  name="to"
                  value={composeEmailData.to}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <br />
              <label>
                Subject:
                <input
                  type="text"
                  name="subject"
                  value={composeEmailData.subject}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <br />
              <label>
                Body:
                <textarea
                  name="body"
                  value={composeEmailData.body}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <br />
              <label>
                Email Type:
                <select value={composeEmailData.templateId} onChange={handleSelectChange}>
                  <option value="" disabled>
                    Select Email Type
                  </option>
                  <option value="userOnboarding">User Onboarding</option>
                  <option value="marketingNewsletter">Marketing/Newsletter</option>
                  <option value="transactional">Transactional</option>
                  <option value="userEngagement">User Engagement</option>
                </select>
              </label>
              <br />
              <button type="button" onClick={handleSendEmail}>
                Send Email
              </button>
            </form>
          </div>
        </>
      ) : (
        // Google OAuth Integration
        <GoogleLogin
          clientId="804937672020-b71heo8h7283l99osle0asoiv89gaun5.apps.googleusercontent.com"
          buttonText="Login with Google"
          onSuccess={handleGoogleLoginSuccess}
          onFailure={handleGoogleLoginFailure}
          cookiePolicy={'single_host_origin'}
        />
      )}
    </div>
  );
};

export default App;

