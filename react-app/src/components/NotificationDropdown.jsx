import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function NotificationDropdown({ onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    getNotifications();
  }, [currentUser]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50"
    >
      <div className="py-2 px-4 bg-gray-100 border-b border-gray-200 font-semibold text-gray-700">
        Notifications
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="py-4 px-2 text-center text-gray-500">Loading...</div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="py-2 px-4 border-b border-gray-100 hover:bg-gray-50"
            >
              <p className={`text-sm ${notification.isRead ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(notification.createdAt)}
              </p>
              <div className="mt-2 flex space-x-2">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Mark as read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 px-2 text-center text-gray-500">No notifications</div>
        )}
      </div>
    </div>
  );
}

export default NotificationDropdown;