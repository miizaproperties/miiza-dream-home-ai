import { useState, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AlertCircle } from 'lucide-react';

import { DASHBOARD_API_BASE_URL } from '../config/api';

const API_BASE_URL = DASHBOARD_API_BASE_URL;

interface Announcement {
  id: number;
  title: string;
  message: string;
  is_major: boolean;
  created_at: string;
}

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/announcements/public/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Announcements</h1>
            <p className="text-gray-600 mb-8">Stay updated with our latest announcements and news.</p>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading announcements...</p>
                </div>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No announcements available at this time.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                      announcement.is_major ? 'border-orange-500' : 'border-gray-300'
                    }`}
                  >
                    {announcement.is_major && (
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-600 uppercase">Major Announcement</span>
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{announcement.title}</h2>
                    <p className="text-gray-700 whitespace-pre-wrap mb-4">{announcement.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AnnouncementsPage;

