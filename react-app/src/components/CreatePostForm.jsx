import { useState } from 'react';
import api from '../utils/api';
import { Image, X } from 'lucide-react';

const CreatePostForm = ({ onPostCreated, currentUser }) => {
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() && mediaFiles.length === 0) {
      setError('Post cannot be empty');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('content', content);
      
      mediaFiles.forEach(file => {
        formData.append('mediaFiles', file);
      });
      
      const response = await api.post('/api/posts/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setContent('');
      setMediaFiles([]);
      onPostCreated(response.data);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + mediaFiles.length > 3) {
      setError('You can only upload up to 3 files');
      return;
    }
    
    setMediaFiles([...mediaFiles, ...files]);
    e.target.value = null; // Reset input
  };

  const removeFile = (index) => {
    setMediaFiles(mediaFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="font-medium text-primary-700">
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          </div>
          <div className="flex-1">
            <textarea
              placeholder="What are you learning today?"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows="3"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            
            {mediaFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <div className="bg-gray-100 rounded p-2 text-xs flex items-center">
                      <span className="mr-1 truncate max-w-xs">{file.name}</span>
                      <button 
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-3 flex justify-between items-center">
              <div>
                <label className="cursor-pointer text-primary-600 hover:text-primary-700 flex items-center">
                  <Image size={20} className="mr-2" />
                  Add Media
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={mediaFiles.length >= 3}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-1">Up to 3 files</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-black rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;