import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

const SocialFloatingButton: React.FC = () => {
  const [fbUrl, setFbUrl] = useState<string>('');

  useEffect(() => {
    const config = StorageService.getSiteConfig();
    if (config.facebookUrl) {
        setFbUrl(config.facebookUrl);
    }
  }, []);

  if (!fbUrl) return null;

  return (
    <a 
      href={fbUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 flex items-center gap-2 group border-4 border-white/20 active:scale-95"
      title="Chat với chúng tôi qua Facebook"
    >
      <span className="hidden group-hover:block whitespace-nowrap text-sm font-bold pr-1 transition-all">Chat Facebook</span>
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
         <path d="M12 0C5.373 0 0 4.986 0 11.138c0 3.518 1.748 6.64 4.502 8.653.218.156.357.408.357.676v2.333c0 .548.604.88 1.07.604l2.807-1.636c.204-.12.446-.153.673-.092 1.05.28 2.152.428 3.287.428 6.627 0 12-4.986 12-11.138S18.627 0 12 0zm-1.008 14.167l-2.458-3.923-4.8 3.923 5.275-5.602 2.458 3.923 4.802-3.923-5.277 5.602z"/>
      </svg>
    </a>
  );
};

export default SocialFloatingButton;