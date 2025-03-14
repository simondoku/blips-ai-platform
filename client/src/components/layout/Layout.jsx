// client/src/components/layout/Layout.jsx
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, withFooter = true }) => {
  const { isAuthenticated } = useAuth();
  
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