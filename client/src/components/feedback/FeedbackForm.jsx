// client/src/components/feedback/FeedbackForm.jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { submitFeedback } from '../../services/feedbackService';

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General Feedback' },
  { value: 'content', label: 'Content Issue' }
];

const FeedbackForm = ({ onSubmitSuccess }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    type: 'general',
    subject: '',
    message: '',
    email: currentUser?.email || ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!formData.subject.trim()) {
      setError('Subject is required');
      setLoading(false);
      return;
    }

    if (!formData.message.trim()) {
      setError('Message is required');
      setLoading(false);
      return;
    }

    // Email validation if user is not logged in
    if (!currentUser && !formData.email.trim()) {
      setError('Email is required when not logged in');
      setLoading(false);
      return;
    }

    try {
      const response = await submitFeedback(formData);
      setSuccess('Feedback submitted successfully! Thank you for your input.');
      
      // Reset form after successful submission
      setFormData({
        type: 'general',
        subject: '',
        message: '',
        email: currentUser?.email || ''
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess(response);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blips-card rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">Share Your Feedback</h2>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-900/30 border border-green-500 text-green-200 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-white mb-1">
            Feedback Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-blips-dark border border-blips-card rounded-md shadow-sm focus:outline-none focus:ring-blips-purple focus:border-blips-purple text-white"
          >
            {FEEDBACK_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-white mb-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Brief description of your feedback"
            className="w-full px-3 py-2 bg-blips-dark border border-blips-card rounded-md shadow-sm focus:outline-none focus:ring-blips-purple focus:border-blips-purple text-white"
            required
          />
        </div>
        
        {!currentUser && (
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
              className="w-full px-3 py-2 bg-blips-dark border border-blips-card rounded-md shadow-sm focus:outline-none focus:ring-blips-purple focus:border-blips-purple text-white"
              required={!currentUser}
            />
            <p className="text-xs text-blips-text-secondary mt-1">Required when not logged in</p>
          </div>
        )}
        
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={5}
            placeholder="Please provide detailed information about your feedback"
            className="w-full px-3 py-2 bg-blips-dark border border-blips-card rounded-md shadow-sm focus:outline-none focus:ring-blips-purple focus:border-blips-purple text-white"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blips-purple hover:bg-blips-purple-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blips-purple disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;