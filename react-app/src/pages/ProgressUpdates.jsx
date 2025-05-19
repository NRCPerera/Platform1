import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import ProgressUpdateForm from '../components/ProgressUpdateForm';
import { useAuth } from '../contexts/AuthContext';

const ProgressUpdates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUpdate, setEditingUpdate] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const formRef = useRef(null);

  useEffect(() => {
    fetchUpdates();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsFormVisible(false);
      }
    };

    if (isFormVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFormVisible]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/progress-updates');
      console.log('Fetched updates:', response.data);
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching progress updates:', error);
      setError('Failed to load updates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAdded = (newUpdate) => {
    setUpdates((prev) => [newUpdate, ...prev]);
    setIsFormVisible(false);
    setError(null);
  };

  const handleEdit = (update) => {
    setEditingUpdate(update);
    setIsFormVisible(false);
    setError(null);
  };

  const handleUpdateSubmit = async (updatedData) => {
    try {
      setError(null);
      const response = await api.put(`/api/progress-updates/${editingUpdate.id}`, updatedData);
      setUpdates(updates.map((update) =>
        update.id === editingUpdate.id ? response.data : update
      ));
      setEditingUpdate(null);
    } catch (error) {
      console.error('Error updating progress update:', error);
      setError('Failed to update. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    try {
      setError(null);
      await api.delete(`/api/progress-updates/${id}`);
      setUpdates(updates.filter((update) => update.id !== id));
    } catch (error) {
      console.error('Error deleting progress update:', error);
      setError('Failed to delete. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatEnum = (value) => {
    if (!value) return '';
    return value.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Progress Updates</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {!editingUpdate && !isFormVisible && (
        <button
          onClick={() => setIsFormVisible(true)}
          className="mb-6 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Add new progress update"
        >
          Add New Progress Update
        </button>
      )}

      {(isFormVisible || editingUpdate) && (
        <div ref={formRef}>
          {editingUpdate ? (
            <ProgressUpdateForm
              onUpdateAdded={handleUpdateSubmit}
              initialData={editingUpdate}
              isEditing={true}
              onCancel={() => setEditingUpdate(null)}
            />
          ) : (
            <ProgressUpdateForm
              onUpdateAdded={handleUpdateAdded}
              onCancel={() => setIsFormVisible(false)}
            />
          )}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading updates...</p>
          </div>
        ) : updates.length === 0 ? (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <p className="text-gray-600">No progress updates yet.</p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{update.title}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(update.createdAt)}
                    {update.updatedAt && update.updatedAt !== update.createdAt && (
                      <span> (Updated: {formatDate(update.updatedAt)})</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">By: {update.name}</p>
                </div>
                {update.name === user?.name && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(update)}
                      className="text-gray-400 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Edit update ${update.title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.379-8.379-2.828-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(update.id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      aria-label={`Delete update ${update.title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <div className="inline-block bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full mb-2">
                  {update.topic}
                </div>
                {update.tags?.length > 0 && (
                  <div className="mb-2">
                    {update.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full mr-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {update.status && (
                  <p className="text-gray-700 mt-1">
                    <strong>Status:</strong> {formatEnum(update.status)}
                  </p>
                )}
                {update.skillLevel && (
                  <p className="text-gray-700 mt-1">
                    <strong>Skill Level:</strong> {formatEnum(update.skillLevel)}
                  </p>
                )}
                {update.description && (
                  <p className="text-gray-700 mt-1">
                    <strong>Description:</strong> {update.description}
                  </p>
                )}
                {update.attachments?.length > 0 && (
                  <p className="text-gray-700 mt-1">
                    <strong>Attachments:</strong>{' '}
                    {update.attachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline mr-2"
                      >
                        Link {index + 1}
                      </a>
                    ))}
                  </p>
                )}
                {update.visibility && (
                  <p className="text-gray-700 mt-1">
                    <strong>Visibility:</strong> {formatEnum(update.visibility)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProgressUpdates;