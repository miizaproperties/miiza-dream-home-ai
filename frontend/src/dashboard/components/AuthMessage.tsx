import { AlertCircle } from 'lucide-react';
import { BACKEND_BASE_URL } from '../../config/api';

export const AuthMessage: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-4">
          To access the dashboard, you need to be logged in to Django admin first.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Steps to access the dashboard:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Log in to Django admin at <code className="bg-yellow-100 px-1 rounded">{BACKEND_BASE_URL}/admin/</code></li>
                <li>Make sure your user has <code className="bg-yellow-100 px-1 rounded">is_staff=True</code> or is a superuser</li>
                <li>Return to this page and refresh</li>
              </ol>
            </div>
          </div>
        </div>
        <a
          href={`${BACKEND_BASE_URL}/admin/`}
          target="_blank"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Go to Django Admin Login
        </a>
        <p className="text-xs text-gray-400 mt-4">
          After logging in, refresh this page to access the dashboard
        </p>
      </div>
    </div>
  );
};

