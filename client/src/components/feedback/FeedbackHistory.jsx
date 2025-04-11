// client/src/components/feedback/FeedbackHistory.jsx
import { useState, useEffect } from 'react';
import { getUserFeedback } from '../../services/feedbackService';

const STATUS_COLORS = {
  pending: 'bg-yellow-900/30 text-yellow-200 border-yellow-600',
  inProgress: 'bg-blue-900/30 text-blue-200 border-blue-600',
  resolved: 'bg-green-900/30 text-green-200 border-green-500',
  rejected: 'bg-red-900/30 text-red-200 border-red-500',
  closed: 'bg-gray-700 text-gray-200 border-gray-500'
};

const STATUS_LABELS = {
  pending: 'Pending',
  inProgress: 'In Progress',
  resolved: 'Resolved',
  rejected: 'Rejected',
  closed: 'Closed'
};

const TYPE_LABELS = {
  bug: 'Bug Report',
  feature: 'Feature Request',
  general: 'General Feedback',
  content: 'Content Issue'
};

const FeedbackHistory = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const data = await getUserFeedback();
        setFeedback(data);
      } catch (err) {
        setError('Failed to load your feedback history. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blips-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded mb-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-blips-dark p-6 rounded-lg text-center">
        <p className="text-blips-text-secondary">You haven't submitted any feedback yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-blips-card rounded-lg shadow-md">
      <h2 className="text-xl font-bold p-4 border-b border-blips-dark text-white">
        Your Feedback History
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-blips-dark">
          <thead className="bg-blips-dark">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blips-text-secondary uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blips-text-secondary uppercase tracking-wider">
                Subject
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blips-text-secondary uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blips-text-secondary uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-blips-card divide-y divide-blips-dark">
            {feedback.map((item) => (
              <tr key={item._id} className="hover:bg-blips-dark transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {TYPE_LABELS[item.type] || item.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blips-text-secondary">
                  {item.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${STATUS_COLORS[item.status] || 'bg-gray-700 text-gray-200 border-gray-500'}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blips-text-secondary">
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FeedbackHistory;