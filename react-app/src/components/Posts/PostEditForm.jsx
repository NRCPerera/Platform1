import React, { useState, useRef, useEffect } from 'react';
import { X, Image, Loader } from 'lucide-react';

const PostEditForm = ({ content, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(content);
  const [editedMedia, setEditedMedia] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const [mediaPreview, setMediaPreview] = useState([]);

  const handleMediaChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setEditedMedia(e.target.files);
      
      const previews = [];
      for (let i = 0; i < e.target.files.length; i++) {
        previews.push(URL.createObjectURL(e.target.files[i]));
      }
      setMediaPreview(previews);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSave(editedContent, editedMedia);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      mediaPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mediaPreview]);

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div className="relative">
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
          rows={3}
          placeholder="What's on your mind?"
          disabled={isSubmitting}
        />
      </div>
      
      {mediaPreview.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediaPreview.map((url, index) => (
            <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  const newPreviews = [...mediaPreview];
                  newPreviews.splice(index, 1);
                  setMediaPreview(newPreviews);
                  URL.revokeObjectURL(url);
                }}
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-0.5 text-white hover:bg-opacity-70 transition-all"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <Image size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            onChange={handleMediaChange}
            className="hidden"
            accept="image/*"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            disabled={isSubmitting || editedContent.trim() === ''}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PostEditForm;