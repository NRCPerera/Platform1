import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

const PostActions = ({
  likes,
  commentsCount,
  isLiked = false,
  onLike,
  onToggleComments,
  showComments,
  onShare // New prop for share action
}) => {
  return (
    <div className="mt-4 flex items-center gap-74 border-t border-b border-gray-100 py-3">
      <button
        onClick={onLike}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
          isLiked 
            ? 'text-red-500 bg-red-50' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Heart 
          size={30} 
          className={`transition-transform duration-300 ${isLiked ? 'fill-red-500 scale-110' : 'hover:scale-110'}`} 
        />
        <span className="font-medium">{likes}</span>
      </button>
      
      <button
        onClick={onToggleComments}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${
          showComments 
            ? 'text-blue-500 bg-blue-50' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <MessageCircle 
          size={30} 
          className={`transition-transform duration-300 ${showComments ? 'fill-blue-100 scale-110' : 'hover:scale-110'}`} 
        />
        <span className="font-medium">{commentsCount}</span>
      </button>

      <button
        onClick={onShare}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition-all duration-200"
      >
        <Share2 
          size={30} 
          className="transition-transform duration-300 hover:scale-110" 
        />
        <span className="font-medium">Share</span>
      </button>
    </div>
  );
};

export default PostActions;