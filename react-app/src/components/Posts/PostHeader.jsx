import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Pencil, MoreHorizontal } from 'lucide-react';

const PostHeader = ({ 
  post, 
  isAuthor, 
  onEdit, 
  onDelete,
  loading 
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <Link 
          to={`/profile/${post.user.id}`}
          className="block transition-transform hover:scale-105"
        >
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <span className="font-semibold text-white text-lg">
              {post.user.name?.charAt(0) || 'U'}
            </span>
          </div>
        </Link>
        
        <div>
          <Link 
            to={`/profile/${post.user.id}`} 
            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {post.user.name}
          </Link>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
      
      {isAuthor && (
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showActions && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
              <button
                onClick={() => {
                  onEdit();
                  setShowActions(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <Pencil size={16} className="mr-2" />
                Edit post
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowActions(false);
                }}
                disabled={loading}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
              >
                <Trash2 size={16} className="mr-2" />
                Delete post
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeader;