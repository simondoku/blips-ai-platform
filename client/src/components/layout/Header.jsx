// client/src/components/layout/Header.jsx
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';

const Header = ({ isAuthenticated }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const location = useLocation();
  
  // Determine if we're on one of the main content pages
  const isContentPage = ['/images', '/shorts', '/films'].includes(location.pathname);
  
  return (
    <header className="bg-blips-dark h-15 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center">
        <Link to="/" className="mr-8">
          <Logo />
        </Link>
        
        {/* Main Navigation */}
        <nav className="hidden md:flex space-x-6">
          <NavLink to="/" 
            className={({ isActive }) => 
              isActive ? "nav-link-active" : "nav-link"
            }
            end
          >
            Home
          </NavLink>
          <NavLink to="/explore" 
            className={({ isActive }) => 
              isActive ? "nav-link-active" : "nav-link"
            }
          >
            Explore
          </NavLink>
          <NavLink to="/events" 
            className={({ isActive }) => 
              isActive ? "nav-link-active" : "nav-link"
            }
          >
            Events
          </NavLink>
        </nav>
      </div>
      
      {/* Search Bar - Only show on content pages */}
      {isContentPage && (
        <div className="hidden md:block flex-grow max-w-md mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-blips-card rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blips-purple"
              onFocus={() => setIsSearchActive(true)}
              onBlur={() => setIsSearchActive(false)}
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blips-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Right Side Actions */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <Link to="/upload" className="btn-primary hidden sm:block">
              Upload
            </Link>
            <Link to="/profile" className="w-10 h-10 rounded-full bg-blips-card border-2 border-blips-purple flex items-center justify-center">
              <span className="sr-only">Profile</span>
              {/* Avatar image or placeholder */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary hidden sm:block">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;