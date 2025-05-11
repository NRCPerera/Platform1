/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Bell, Search, User, LogOut, Home, BookOpen, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileDropdownOpen && !event.target.closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
      if (isSearchDropdownOpen && !event.target.closest('.search-container')) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileDropdownOpen, isSearchDropdownOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/api/notifications');
      const unread = response.data.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);

  const isActivePath = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/learning-plans', icon: BookOpen, label: 'Learning Plans' },
    { path: '/progress-update', icon: TrendingUp, label: 'Progress' },
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
      return;
    }

    try {
      const response = await api.get('/api/posts');
      const results = response.data.filter(post =>
        post.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearchDropdownOpen(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setIsSearchDropdownOpen(true);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-gray-800/90 backdrop-blur-md shadow-lg py-2' 
        : 'bg-gray-800 py-3 shadow-md'
    }`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-80 items-center">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-20">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 
                             bg-clip-text text-transparent transition-all duration-300
                             group-hover:from-blue-500 group-hover:via-blue-400 group-hover:to-blue-300">
                SkillShare
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-10">
              {navLinks.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 
                             relative overflow-hidden ${
                    isActivePath(path)
                      ? 'bg-white text-black font-medium shadow-sm'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white hover:shadow-sm'
                  }`}
                >
                  <Icon size={18} className={`transition-all duration-300 ${
                    isActivePath(path) ? 'text-black' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span>{label}</span>
                  {isActivePath(path) && (
                    <span className="absolute bottom-0 left-0 h-0.5 bg-primary-500 w-full transform origin-left scale-x-100 
                                   transition-transform duration-300"></span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block relative group search-container">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-white group-focus-within:text-white transition-colors duration-300" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setSearchResults([]);
                    setIsSearchDropdownOpen(false);
                  } else {
                    handleSearch();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="text-sm w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg"
              />
              {isSearchDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-gray-800 rounded-xl shadow-xl py-2 
                              border border-gray-700 z-50 animate-fade-in-down">
                  {searchResults.length > 0 ? (
                    searchResults.map(post => (
                      <Link
                        key={post.id}
                        to={`/post/${post.id}`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => {
                          setIsSearchDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <p className="font-medium">{post.user.name}</p>
                        <p className="text-xs truncate">{post.content}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-400">
                      {searchQuery ? 'No results found' : 'Enter a search term'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {user && (
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white 
                           transition-all duration-300 hover:shadow-sm"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 border-2 border-gray-800 rounded-full 
                                   flex items-center justify-center text-[10px] font-medium text-white
                                   animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative profile-dropdown-container">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-3 py-2 px-4 rounded-full hover:bg-gray-700 
                             transition-all duration-300 hover:shadow-sm"
                  >
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 
                                 flex items-center justify-center text-white font-medium shadow-sm
                                 ring-2 ring-gray-800">
                      {user.profilePhotoUrl ? (
                        <img 
                          src={"http://localhost:8081"+ user.profilePhotoUrl} 
                          alt={`${user.name}'s avatar`}
                          className="h-full w-full object-cover rounded-full" 
                        />
                        ) : (
                          <User size={20} className="text-gray-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-300">{user.name}</span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-gray-800 rounded-xl shadow-xl py-2 
                                  border border-gray-700 transform opacity-100 scale-100 
                                  transition-all duration-300 origin-top-right z-50
                                  animate-fade-in-down">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-xs font-medium text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-300 truncate">{user.email}</p>
                      </div>
                      <Link
                        to={`/profile/${user.id}`}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 
                                 hover:bg-gray-700 transition-colors duration-300 group"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User size={16} className="text-gray-400 group-hover:text-white transition-colors duration-300" />
                        <span className="group-hover:text-white transition-colors duration-300">View Profile</span>
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 
                                 hover:bg-red-700 transition-colors duration-300 w-full group"
                      >
                        <LogOut size={16} className="group-hover:text-red-300 transition-colors duration-300" />
                        <span className="group-hover:text-red-300 transition-colors duration-300">Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white 
                       transition-all duration-300"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X size={24} className="animate-fade-in" />
              ) : (
                <Menu size={24} className="animate-fade-in" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 shadow-lg 
                      animate-slide-in-top fixed top-16 left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto z-50">
          <div className="px-4 pt-4 pb-2">
            <div className="relative search-container">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (!e.target.value.trim()) {
                    setSearchResults([]);
                    setIsSearchDropdownOpen(false);
                  } else {
                    handleSearch();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch();
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-600 rounded-lg text-sm shadow-sm
                         focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20"
              />
              {isSearchDropdownOpen && (
                <div className="absolute left-0 mt-2 w-full bg-gray-800 rounded-xl shadow-xl py-2 
                              border border-gray-700 z-50 animate-fade-in-down">
                  {searchResults.length > 0 ? (
                    searchResults.map(post => (
                      <Link
                        key={post.id}
                        to={`/post/${post.id}`}
                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                        onClick={() => {
                          setIsSearchDropdownOpen(false);
                          setSearchQuery('');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <p className="font-medium">{post.user.name}</p>
                        <p className="text-xs truncate">{post.content}</p>
                      </Link>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-400">
                      {searchQuery ? 'No results found' : 'Enter a search term'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-2 py-3 space-y-1.5">
            {navLinks.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium 
                           transition-all duration-300 ${
                  isActivePath(path)
                    ? 'bg-gray-700 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={18} className={isActivePath(path) ? 'text-white' : 'text-gray-400'} />
                <span>{label}</span>
                {isActivePath(path) && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>
                )}
              </Link>
            ))}

            {user && (
              <>
                <Link
                  to="/notifications"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-gray-300 
                           hover:bg-gray-700 hover:text-white transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bell size={18} className="text-gray-400" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-gray-300 
                           hover:bg-gray-700 hover:text-white transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={18} className="text-gray-400" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-red-400 
                           hover:bg-red-700 w-full transition-all duration-300 group"
                >
                  <LogOut size={18} className="group-hover:text-red-300 transition-colors duration-300" />
                  <span className="group-hover:text-red-300 transition-colors duration-300">Log Out</span>
                </button>
              </>
            )}
          </div>

          <div className="px-4 py-4 border-t border-gray-700 mt-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 
                           flex items-center justify-center text-white shadow-md">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;