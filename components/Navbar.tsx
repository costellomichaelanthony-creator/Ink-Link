
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Artists', path: '/artists' },
    { name: 'Design Lab', path: '/design-lab' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Events', path: '/events' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-ink-950/90 backdrop-blur-md border-b border-ink-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-brand to-brand-accent bg-clip-text text-transparent">
                Ink Link
              </span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-ink-800 text-white'
                        : 'text-gray-300 hover:bg-ink-800 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {user ? (
                <>
                  <button className="bg-ink-800 p-2 rounded-full text-gray-400 hover:text-white focus:outline-none relative">
                    <i className="fa-solid fa-bell"></i>
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className="h-8 w-8 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold cursor-pointer overflow-hidden ring-2 ring-transparent hover:ring-brand transition-all"
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span>{profile?.display_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}</span>
                      )}
                    </button>

                    {profileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-ink-900 rounded-md shadow-lg py-1 border border-ink-700 ring-1 ring-black ring-opacity-5">
                         <div className="px-4 py-2 border-b border-ink-800">
                           <p className="text-sm text-white font-medium truncate">{profile?.display_name || 'User'}</p>
                           <p className="text-xs text-gray-400 truncate">{user.email}</p>
                         </div>
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-ink-800 hover:text-white"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile/edit"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-ink-800 hover:text-white"
                        >
                          Edit Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-ink-800 hover:text-red-300"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-md shadow-lg shadow-brand/20 transition-all"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-ink-800 focus:outline-none"
            >
              <i className={`fa-solid ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-ink-900 border-b border-ink-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-ink-800 text-white'
                    : 'text-gray-300 hover:bg-ink-800 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {!user && (
              <div className="mt-4 pt-4 border-t border-ink-800 grid grid-cols-2 gap-2">
                <Link
                  to="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-center text-gray-300 hover:bg-ink-800 hover:text-white bg-ink-950"
                >
                  Log in
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-center text-white bg-brand hover:bg-brand-hover"
                >
                  Sign up
                </Link>
              </div>
            )}
             {user && (
              <div className="mt-4 pt-4 border-t border-ink-800">
                 <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-ink-800 hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile/edit"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-ink-800 hover:text-white"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-ink-800"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;