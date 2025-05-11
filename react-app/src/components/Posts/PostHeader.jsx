import React from 'react';
import { Link } from 'react-router-dom';
import { MoreHorizontal, User, Trash, Edit } from 'lucide-react';

const PostHeader = ({ post, isAuthor, onEdit, onDelete, loading }) => {
  const [showOptions, setShowOptions] = React.useState(false);

  // Format date to be more readable
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const toggleOptions = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <Link 
          to={`/profile/${post.user.id}`} 
          className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {post.user.profilePhotoUrl ? (
            <img 
              src={"http://localhost:8081" + post.user.profilePhotoUrl} 
              alt={`${post.user.name}'s avatar`}
              className="h-full w-full object-cover" 
            />
          ) : (
            <User size={20} className="text-gray-500" />
          )}
        </Link>
        <div>
          <Link 
            to={`/profile/${post.user.id}`}
            className="font-medium text-gray-900 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {post.user.name}
          </Link>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>

      {isAuthor && (
        <div className="relative">
          <button
            onClick={toggleOptions}
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={loading}
          >
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>

          {showOptions && (
            <div 
              className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  setShowOptions(false);
                  onEdit(e);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={(e) => {
                  setShowOptions(false);
                  onDelete(e);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                disabled={loading}
              >
                <Trash size={16} />
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeader;