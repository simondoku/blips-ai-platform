// client/src/App.jsx
import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const Images = lazy(() => import('./pages/Images'));
const ImageDetail = lazy(() => import('./pages/Images/ImageDetail'));
const Shorts = lazy(() => import('./pages/Shorts'));
const ShortDetail = lazy(() => import('./pages/Shorts/ShortDetail'));
const Films = lazy(() => import('./pages/Films'));
const FilmDetail = lazy(() => import('./pages/Films/FilmDetail'));
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

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Separate component to use useAuth hook inside Router
function AppContent() {
  const { isAuthenticated } = useAuth();
  
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/explore" element={<Layout><Explore /></Layout>} />
        <Route path="/images" element={<Layout><Images /></Layout>} />
        <Route path="/images/:id" element={<Layout><ImageDetail /></Layout>} />
        <Route path="/shorts" element={<Layout><Shorts /></Layout>} />
        <Route path="/shorts/:id" element={<Layout><ShortDetail /></Layout>} />
        <Route path="/films" element={<Layout><Films /></Layout>} />
        <Route path="/films/:id" element={<Layout><FilmDetail /></Layout>} />
        
        {/* Authentication Routes */}
<Route path="/login" element={
  isAuthenticated 
    ? <Navigate to="/" /> 
    : <Layout withFooter={false}><Login /></Layout>
} />

<Route path="/register" element={
  isAuthenticated 
    ? <Navigate to="/" /> 
    : <Layout withFooter={false}><Register /></Layout>
} />
        
        {/* Protected Routes */}
        <Route path="/upload" element={
          <ProtectedRoute>
            <Layout><Upload /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile/*" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  );
}

export default App;