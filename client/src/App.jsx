// client/src/App.jsx
import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Lazy-loaded pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Images = lazy(() => import('./pages/Images'));
const Shorts = lazy(() => import('./pages/Shorts'));
const Films = lazy(() => import('./pages/Films'));
const Upload = lazy(() => import('./pages/Upload'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen w-full">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-white border-opacity-20 rounded-full"></div>
    </div>
  </div>
);

function App() {
  // We'll replace this with actual auth logic later
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Protected route component
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };
  
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout isAuthenticated={isAuthenticated}><Home /></Layout>} />
          <Route path="/explore" element={<Layout isAuthenticated={isAuthenticated}><Explore /></Layout>} />
          <Route path="/images" element={<Layout isAuthenticated={isAuthenticated}><Images /></Layout>} />
          <Route path="/shorts" element={<Layout isAuthenticated={isAuthenticated}><Shorts /></Layout>} />
          <Route path="/films" element={<Layout isAuthenticated={isAuthenticated}><Films /></Layout>} />
          
          {/* Authentication Routes */}
          <Route path="/login" element={
            isAuthenticated 
              ? <Navigate to="/" /> 
              : <Layout withFooter={false} isAuthenticated={false}><Login setIsAuthenticated={setIsAuthenticated} /></Layout>
          } />
          <Route path="/register" element={
            isAuthenticated 
              ? <Navigate to="/" /> 
              : <Layout withFooter={false} isAuthenticated={false}><Register setIsAuthenticated={setIsAuthenticated} /></Layout>
          } />
          
          {/* Protected Routes */}
          <Route path="/upload" element={
            <ProtectedRoute>
              <Layout isAuthenticated={isAuthenticated}><Upload /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile/*" element={
            <ProtectedRoute>
              <Layout isAuthenticated={isAuthenticated}><Profile /></Layout>
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<Layout isAuthenticated={isAuthenticated}><NotFound /></Layout>} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;