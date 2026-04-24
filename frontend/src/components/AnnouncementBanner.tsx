import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

import { DASHBOARD_API_BASE_URL } from '../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

interface Announcement {
  id: number;
  title: string;
  message: string;
  image?: string | null;
  url?: string | null;
  display_duration: number;
}

export const AnnouncementBanner: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const url = `${API_BASE_URL}/announcements/public/`;
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data: Announcement[] = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncements(data);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleClick = (url?: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (announcements.length === 0) return null;

  // Combine all announcements into a single scrolling text
  const combinedText = announcements
    .map((ann) => `${ann.title}${ann.message ? ' • ' + ann.message : ''}`)
    .join(' • ');

  const hasUrl = announcements.some(ann => ann.url);
  const firstUrl = announcements.find(ann => ann.url)?.url;

  return (
    <>
      <style>{`
        @keyframes scroll-horizontal {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll-horizontal {
          animation: scroll-horizontal 35s linear infinite;
        }
        
        .animate-scroll-horizontal:hover {
          animation-play-state: paused;
        }
      `}</style>
      <div
        className="fixed left-0 right-0 z-40 bg-gradient-to-r from-blue-600 via-blue-700 via-indigo-700 to-purple-700 shadow-lg"
        style={{ top: '18px' }}
      >
        <div className="relative overflow-hidden h-12 flex items-center">
          <div
            className={`flex items-center gap-4 w-full ${hasUrl ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
            onClick={() => handleClick(firstUrl)}
          >
            <div className="flex-shrink-0 ml-5 sm:ml-7 z-20">
              <AlertCircle className="h-5 w-5 text-yellow-300 drop-shadow-lg" />
            </div>
            
            {/* Scrolling Text Container */}
            <div className="flex-1 overflow-hidden relative">
              <div className="inline-flex items-center gap-16 animate-scroll-horizontal whitespace-nowrap">
                <span className="text-white text-base font-semibold flex-shrink-0 tracking-wide drop-shadow-md">
                  {combinedText}
                </span>
                <span className="text-white text-base font-semibold flex-shrink-0 tracking-wide drop-shadow-md">
                  {combinedText}
                </span>
                <span className="text-white text-base font-semibold flex-shrink-0 tracking-wide drop-shadow-md">
                  {combinedText}
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Gradient fade on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-blue-600 via-blue-600/80 to-transparent pointer-events-none z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-purple-700 via-purple-700/80 to-transparent pointer-events-none z-10" />
        </div>
      </div>
    </>
  );
};
