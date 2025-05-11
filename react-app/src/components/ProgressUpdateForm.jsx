/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

function ProgressUpdateForm({ onUpdateAdded, initialData, isEditing, onCancel }) {
  const [topic, setTopic] = useState('');
  const [completed, setCompleted] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (initialData && isEditing) {
      setTopic(initialData.topic || '');
      setCompleted(initialData.completed || '');
      setNewSkills(initialData.newSkills || '');
    }
  }, [initialData, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic.trim()) {
      setError('Topic cannot be empty');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const update = {
        topic: topic.trim(),
        completed: completed.trim(),
        newSkills: newSkills.trim(),
      };

      let response;
      if (isEditing) {
        response = await api.put(`/api/progress-updates/${initialData.id}`, update);
      } else {
        response = await api.post('/api/progress-updates/add', update);
      }

      onUpdateAdded(response.data);

      // Reset form
      setTopic('');
      setCompleted('');
      setNewSkills('');
      if (isEditing) {
        onCancel();
      }
    } catch (err) {
      setError('Failed to post update. Please try again.');
      console.error('Error creating update:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium mb-4">
        {isEditing ? 'Edit Progress Update' : 'Share Your Progress'}
      </h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What are you learning?"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={submitting}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="completed" className="block text-sm font-medium text-gray-700 mb-1">
            What You Completed
          </label>
          <textarea
            id="completed"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="What did you accomplish?"
            value={completed}
            onChange={(e) => setCompleted(e.target.value)}
            disabled={submitting}
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="newSkills" className="block text-sm font-medium text-gray-700 mb-1">
            New Skills
          </label>
          <textarea
            id="newSkills"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            placeholder="What new skills did you learn?"
            value={newSkills}
            onChange={(e) => setNewSkills(e.target.value)}
            disabled={submitting}
          ></textarea>
        </div>

        <div className="flex justify-end space-x-2">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              disabled={submitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : isEditing ? 'Update' : 'Post Update'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProgressUpdateForm;