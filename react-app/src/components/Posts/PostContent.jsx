import React from 'react';

const PostContent = ({ content, mediaUrls }) => {
  const renderMediaGallery = () => {
    if (!mediaUrls || mediaUrls.length === 0) return null;

    if (mediaUrls.length === 1) {
      const mediaUrl = mediaUrls[0];
      const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);
      return (
        <div className="mt-3 rounded-lg overflow-hidden shadow-sm">
          {isVideo ? (
            <video
              src={encodeURI(mediaUrl)}
              controls
              className="w-full max-h-96 object-cover"
            />
          ) : (
            <img
              src={encodeURI(mediaUrl)}
              alt="Post media"
              className="w-full max-h-96 object-cover"
            />
          )}
        </div>
      );
    } else if (mediaUrls.length === 2) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {mediaUrls.map((url, index) => (
            <div key={index} className="rounded-lg overflow-hidden shadow-sm">
              <img
                src={encodeURI(url)}
                alt={`Post media ${index + 1}`}
                className="w-full h-64 object-cover"
              />
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="mt-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg overflow-hidden shadow-sm">
              <img
                src={encodeURI(mediaUrls[0])}
                alt="Post media 1"
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="grid grid-rows-2 gap-2">
              {mediaUrls.slice(1, 3).map((url, index) => (
                <div key={index} className="rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={encodeURI(url)}
                    alt={`Post media ${index + 2}`}
                    className="w-full h-[7.75rem] object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {mediaUrls.length > 3 && (
            <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 pb-2">
              {mediaUrls.slice(3).map((url, index) => (
                <div key={index} className="flex-shrink-0 w-48 rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={encodeURI(url)}
                    alt={`Post media ${index + 4}`}
                    className="w-full h-32 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="mt-3">
      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
      {renderMediaGallery()}
    </div>
  );
};

export default PostContent;