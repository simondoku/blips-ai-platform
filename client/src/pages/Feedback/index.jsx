// client/src/pages/Feedback/index.jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FeedbackForm from '../../components/feedback/FeedbackForm';
import FeedbackHistory from '../../components/feedback/FeedbackHistory';
import AdminFeedbackTools from '../../components/feedback/AdminFeedbackTools';

const Feedback = () => {
  const { currentUser: user } = useAuth();
  const [activeTab, setActiveTab] = useState('submit');
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">
        Feedback Center
      </h1>
      
      {user && (
        <div className="flex justify-center mb-6">
          <div className="bg-blips-dark rounded-lg shadow">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => handleTabChange('submit')}
                className={`py-2 px-4 text-sm font-medium border-b-2 focus:outline-none ${
                  activeTab === 'submit'
                    ? 'border-blips-purple text-blips-purple'
                    : 'border-transparent text-blips-text-secondary hover:text-white'
                }`}
              >
                Submit Feedback
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`py-2 px-4 text-sm font-medium border-b-2 focus:outline-none ${
                  activeTab === 'history'
                    ? 'border-blips-purple text-blips-purple'
                    : 'border-transparent text-blips-text-secondary hover:text-white'
                }`}
              >
                Your Feedback History
              </button>
              {user.isAdmin && (
                <button
                  onClick={() => handleTabChange('admin')}
                  className={`py-2 px-4 text-sm font-medium border-b-2 focus:outline-none ${
                    activeTab === 'admin'
                      ? 'border-blips-purple text-blips-purple'
                      : 'border-transparent text-blips-text-secondary hover:text-white'
                  }`}
                >
                  Admin Tools
                </button>
              )}
            </nav>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        {activeTab === 'submit' && <FeedbackForm onSubmitSuccess={() => user && handleTabChange('history')} />}
        {activeTab === 'history' && user && <FeedbackHistory />}
        {activeTab === 'admin' && user && user.isAdmin && <AdminFeedbackTools />}
      </div>
    </div>
  );
};

export default Feedback;