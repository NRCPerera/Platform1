import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, BookOpen, Award, Bell, User, LogOut } from 'lucide-react';
import axios from 'axios';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications');
      const unread = response.data.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Learning Plans', path: '/learning-plans', icon: <BookOpen size={20} /> },
    { name: 'Progress', path: '/progress-update', icon: <Award size={20} /> },
    { name: 'Notifications', path: '/notifications', icon: <Bell size={20} />, badge: unreadCount },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-6 sticky top-24 transition-all duration-300 hover:shadow-xl border border-gray-100">
      {user && (
        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-4 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <span className="font-bold text-xl text-white">{user.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-800 truncate group-hover:text-primary-700 transition-colors duration-300">
                {user.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                isActive 
                  ? 'bg-primary-500 text-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-600'
              }`
            }
          >
            <span className="relative z-10">{item.icon}</span>
            <span className="relative z-10">{item.name}</span>
            {item.badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
          </NavLink>
        ))}

        {user && (
          <>
            <NavLink
              to={`/profile/${user.id}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                  isActive 
                    ? 'bg-primary-500 text-black shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-600'
                }`
              }
            >
              <span className="relative z-10"><User size={20} /></span>
              <span className="relative z-10">Profile</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 transition-opacity duration-300 hover:opacity-100"></div>
            </NavLink>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full transition-all duration-200 relative overflow-hidden text-gray-600 hover:text-white group"
            >
              <span className="relative z-10 text-red-500 group-hover:text-white transition-colors duration-200">
                <LogOut size={20} />
              </span>
              <span className="relative z-10 group-hover:text-white transition-colors duration-200">Log Out</span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            </button>
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;