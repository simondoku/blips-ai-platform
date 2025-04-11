// client/src/components/feedback/AdminFeedbackTools.jsx
import { useState } from 'react';
import { testEmailConfig } from '../../services/feedbackService';

/**
 * Admin tools for feedback system management
 * Only visible to admin users
 */
const AdminFeedbackTools = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleTestEmail = async () => {
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const testResult = await testEmailConfig();
      setResult(testResult);
    } catch (err) {
      setError(err.message || 'Failed to test email configuration. Please check server logs.');
      console.error('Email test error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Feedback Admin Tools
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4" role="alert">
          <p>Test email sent successfully!</p>
          <p className="text-sm mt-1">Message ID: {result.result?.messageId}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Email Configuration
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Test the email notification system. This will send a test email to simondoku9@gmail.com.
          </p>
          <button
            onClick={handleTestEmail}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending Test Email...' : 'Send Test Email'}
          </button>
        </div>
        
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Email Configuration Instructions
          </h3>
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            <p className="mb-2">
              To configure email notifications, add the following variables to your <code>.env</code> file:
            </p>
            <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
              <code>
                EMAIL_SERVICE=gmail{'\n'}
                EMAIL_USER=simondoku9@gmail.com{'\n'}
                EMAIL_PASSWORD=your_app_password{'\n'}
                EMAIL_FROM=notifications@blips-ai.com
              </code>
            </pre>
            <p className="mt-2">
              Note: For Gmail, you need to use an app password if you have 2-factor authentication enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeedbackTools;