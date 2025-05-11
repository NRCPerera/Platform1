import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Book, TrendingUp, Bell, User, LogOut } from 'lucide-react';

const MobileSidebar = ({ closeSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    closeSidebar();
  };

  return (
    <div className="md:hidden bg-white shadow-lg py-4">
      <div className="space-y-2 px-4">
        <Link 
          to="/" 
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          onClick={closeSidebar}
        >
          <Home size={20} className="mr-3" />
          Home
        </Link>
        <Link 
          to="/learning-plans" 
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          onClick={closeSidebar}
        >
          <Book size={20} className="mr-3" />
          Learning Plans
        </Link>
        <Link 
          to="/progress-updates" 
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          onClick={closeSidebar}
        >
          <TrendingUp size={20} className="mr-3" />
          Progress Updates
        </Link>
        <Link 
          to="/notifications" 
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          onClick={closeSidebar}
        >
          <Bell size={20} className="mr-3" />
          Notifications
        </Link>
        <Link 
          to={`/profile/${user?.id}`} 
          className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
          onClick={closeSidebar}
        >
          <User size={20} className="mr-3" />
          Profile
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded text-left"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default MobileSidebar;