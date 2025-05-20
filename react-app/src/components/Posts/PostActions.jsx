// PostActions.jsx
import React from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';

const PostActions = ({
  likes,
  commentsCount,
  isLiked,
  onLike,
  onToggleComments,
  showComments,
  onShare,
  isAuthor, // Add isAuthor prop
}) => {
  return (
    <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-3">
      <div className="flex items-center gap-4">
        <button
          onClick={onLike}
          className={`flex items-center gap-1 text-sm ${isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'}`}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" />
          <span>{likes}</span>
        </button>
        <button
          onClick={onToggleComments}
          className={`flex items-center gap-1 text-sm ${showComments ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}
        >
          <MessageCircle size={18} />
          <span>{commentsCount}</span>
        </button>
      </div>
      {!isAuthor && ( // Only render share button if user is not the author
        <button
          onClick={onShare}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-500"
        >
          <Share size={18} />
          <span>Share</span>
        </button>
      )}
    </div>
  );
};

export default PostActions;