/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

function ProgressUpdateForm({ onUpdateAdded, initialData, isEditing, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    description: '',
    status: 'IN_PROGRESS',
    skillLevel: 'BEGINNER',
    attachments: [],
    visibility: 'PUBLIC',
    tags: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        title: initialData.title || '',
        topic: initialData.topic || '',
        description: initialData.description || '',
        status: initialData.status || 'IN_PROGRESS',
        skillLevel: initialData.skillLevel || 'BEGINNER',
        attachments: initialData.attachments || [],
        visibility: initialData.visibility || 'PUBLIC',
        tags: initialData.tags?.join(', ') || '',
      });
    }
  }, [initialData, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      return 'Title cannot be empty';
    }
    if (!formData.topic.trim()) {
      return 'Topic cannot be empty';
    }
    if (formData.attachments.some(url => url && !isValidUrl(url.trim()))) {
      return 'One or more attachment URLs are invalid';
    }
    return '';
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: formData.title.trim(),
        topic: formData.topic.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        skillLevel: formData.skillLevel,
        attachments: formData.attachments
          .map(url => url.trim())
          .filter(url => url) || [],
        visibility: formData.visibility,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag) || [],
      };

      let response;
      if (isEditing) {
        response = await api.put(`/api/progress-updates/${initialData.id}`, payload);
      } else {
        response = await api.post('/api/progress-updates/add', payload);
      }

      onUpdateAdded(response.data);

      // Reset form for non-editing mode
      if (!isEditing) {
        setFormData({
          title: '',
          topic: '',
          description: '',
          status: 'IN_PROGRESS',
          skillLevel: 'BEGINNER',
          attachments: [],
          visibility: 'PUBLIC',
          tags: '',
        });
      }
      if (isEditing || onCancel) {
        onCancel();
      }
    } catch (err) {
      const errorMessage = err.response?.data || 'Failed to save update. Please try again.';
      setError(errorMessage);
      console.error('Error saving update:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Completed Java Course"
            value={formData.title}
            onChange={handleInputChange}
            disabled={submitting}
            required
            aria-required="true"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            name="topic"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Java Programming"
            value={formData.topic}
            onChange={handleInputChange}
            disabled={submitting}
            required
            aria-required="true"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows="4"
            placeholder="Describe your progress or achievements"
            value={formData.description}
            onChange={handleInputChange}
            disabled={submitting}
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.status}
            onChange={handleInputChange}
            disabled={submitting}
          >
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-700 mb-1">
            Skill Level
          </label>
          <select
            id="skillLevel"
            name="skillLevel"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.skillLevel}
            onChange={handleInputChange}
            disabled={submitting}
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
            Attachments (comma-separated URLs)
          </label>
          <input
            type="text"
            id="attachments"
            name="attachments"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., https://example.com/certificate.pdf"
            value={formData.attachments.join(', ')}
            onChange={(e) => setFormData({ ...formData, attachments: e.target.value.split(',').map(url => url.trim()) })}
            disabled={submitting}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 mb-1">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.visibility}
            onChange={handleInputChange}
            disabled={submitting}
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="FRIENDS">Friends</option>
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Java, Programming"
            value={formData.tags}
            onChange={handleInputChange}
            disabled={submitting}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {(isEditing || onCancel) && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={submitting}
              aria-label="Cancel form"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={submitting}
            aria-label={isEditing ? 'Update progress' : 'Post progress update'}
          >
            {submitting ? 'Processing...' : isEditing ? 'Update' : 'Post Update'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ProgressUpdateForm;