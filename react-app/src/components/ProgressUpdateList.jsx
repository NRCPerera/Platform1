/* eslint-disable no-unused-vars */
import { useAuth } from '../contexts/AuthContext';
import { deleteProgressUpdate } from '../services/progressUpdateService';
import { Trash2 } from 'lucide-react';

function ProgressUpdatesList({ updates, currentUserEmail, onUpdateDeleted }) {
  const handleDelete = async (updateId) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        await deleteProgressUpdate(updateId, currentUserEmail);
        onUpdateDeleted(updateId);
      } catch (error) {
        console.error('Failed to delete update:', error);
        alert('Failed to delete update. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (updates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No progress updates yet. Be the first to share!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => (
        <div key={update.id} className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-blue-600">{update.user.email}</h4>
              <p className="text-xs text-gray-500 mt-1">{formatDate(update.createdAt)}</p>
            </div>
            
            {currentUserEmail === update.user.email && (
              <button
                onClick={() => handleDelete(update.id)}
                className="text-gray-500 hover:text-red-600"
                title="Delete update"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          
          <div className="mt-3">
            <p className="text-gray-700">{update.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProgressUpdatesList;