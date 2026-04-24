import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { DASHBOARD_API_BASE_URL, getMediaUrl } from '../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

interface Announcement {
  id: number;
  title: string;
  message: string;
  image?: string | null;
  url?: string | null;
  display_duration: number;
}

// Celebration confetti component
const Confetti = () => {
  const confettiColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: color,
              left: `${left}%`,
              top: '-10px',
            }}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{
              y: window.innerHeight + 100,
              rotate: 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration,
              delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
};

export const AnnouncementPopup: React.FC = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);

  useEffect(() => {
    // Load dismissed announcement IDs from localStorage
    const saved = localStorage.getItem('dismissedAnnouncements');
    if (saved) {
      try {
        setDismissedIds(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing dismissed announcements:', e);
      }
    }

    fetchMajorAnnouncements();
  }, []);

  const fetchMajorAnnouncements = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/announcements/public/major/`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const announcements: Announcement[] = await response.json();
        
        // Filter out dismissed announcements - check localStorage again to ensure we have latest
        const saved = localStorage.getItem('dismissedAnnouncements');
        let currentDismissedIds = dismissedIds;
        if (saved) {
          try {
            currentDismissedIds = JSON.parse(saved);
            setDismissedIds(currentDismissedIds);
          } catch (e) {
            console.error('Error parsing dismissed announcements:', e);
          }
        }
        
        const availableAnnouncements = announcements.filter(
          (ann) => !currentDismissedIds.includes(ann.id)
        );
        
        if (availableAnnouncements.length > 0 && !isVisible) {
          // Show the first available announcement
          setAnnouncement(availableAnnouncements[0]);
          setIsVisible(true);
          setShowConfetti(true);
          
          // Hide confetti after 3 seconds
          setTimeout(() => {
            setShowConfetti(false);
          }, 3000);
          
          // Auto-hide after display_duration seconds
          const duration = availableAnnouncements[0].display_duration * 1000;
          setTimeout(() => {
            handleDismiss(availableAnnouncements[0].id);
          }, duration);
        }
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleDismiss = (id: number) => {
    setIsVisible(false);
    setShowConfetti(false);
    
    // Add to dismissed list - ensure we get the latest from localStorage
    const saved = localStorage.getItem('dismissedAnnouncements');
    let currentDismissedIds = dismissedIds;
    if (saved) {
      try {
        currentDismissedIds = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing dismissed announcements:', e);
      }
    }
    
    // Add the dismissed ID if not already present
    if (!currentDismissedIds.includes(id)) {
      const newDismissedIds = [...currentDismissedIds, id];
      setDismissedIds(newDismissedIds);
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(newDismissedIds));
    }
    
    // Don't fetch more announcements - once dismissed, it stays dismissed
    setAnnouncement(null);
  };

  const handleClick = () => {
    if (announcement?.url) {
      // Dismiss and redirect
      handleDismiss(announcement.id);
      window.open(announcement.url, '_blank');
    }
  };

  if (!announcement) return null;

  const imageUrl = announcement.image 
    ? (announcement.image.startsWith('http') 
        ? announcement.image 
        : getMediaUrl(announcement.image))
    : null;

  return (
    <>
      <AnimatePresence>
        {showConfetti && <Confetti />}
      </AnimatePresence>
      
      <AnimatePresence>
        {isVisible && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss(announcement.id);
              }}
            />
            
            {/* Floating popup */}
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
              }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ 
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4"
            >
            <motion.div
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`bg-white rounded-xl shadow-2xl border-2 border-orange-500 overflow-hidden ${
                announcement.url ? 'cursor-pointer hover:shadow-3xl transition-all hover:scale-[1.02]' : ''
              }`}
              onClick={announcement.url ? handleClick : undefined}
            >
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  >
                    <AlertCircle className="h-5 w-5" />
                  </motion.div>
                  <h3 className="font-bold text-lg">{announcement.title}</h3>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(announcement.id);
                  }}
                  className="text-white hover:text-gray-200 transition-colors z-10 relative"
                  aria-label="Close announcement"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {imageUrl && (
                <div className="w-full h-48 overflow-hidden bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.message}</p>
              </div>
              <div className="px-4 pb-3 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismiss(announcement.id);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium"
                >
                  Dismiss
                </button>
                {announcement.url && (
                  <span className="text-xs text-orange-600 font-medium">Click to view →</span>
                )}
              </div>
            </motion.div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
