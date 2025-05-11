import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import Sidebar from './Sidebar';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { user } = useAuth();

  // Optional: Render a loading state if user is null (shouldn't happen due to App.jsx redirects)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col gap-6">
      <Navbar />
      <div className="container mx-auto px-4 py-20 flex gap-6">  
        <main className="flex-1 bg-white shadow-lg rounded-2xl p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;