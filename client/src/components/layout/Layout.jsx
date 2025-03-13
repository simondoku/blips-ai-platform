// client/src/components/layout/Layout.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, withFooter = true, isAuthenticated = false }) => {
  const location = useLocation();
  
  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  return (
    <div className="flex flex-col min-h-screen bg-blips-black">
      <Header isAuthenticated={isAuthenticated} />
      <main className="flex-grow">
        {children}
      </main>
      {withFooter && <Footer />}
    </div>
  );
};

export default Layout;