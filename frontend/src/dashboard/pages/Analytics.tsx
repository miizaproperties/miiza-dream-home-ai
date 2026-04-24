import { useAnalytics } from '../hooks/useDashboardStats';
import { Chart } from '../components/Chart';
import { AlertCircle } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Property Analytics</h1>
        <p className="text-gray-600">Detailed insights into your property portfolio</p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800">
              Unable to load analytics data. Please refresh the page or check your connection.
            </p>
          </div>
        </div>
      )}

      {!error && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Property Types</h2>
          {analytics?.property_types && analytics.property_types.length > 0 ? (
            <>
              <Chart
                type="pie"
                data={analytics.property_types.map(pt => ({
                  name: pt.property_type || 'Unknown',
                  value: pt.count || 0,
                }))}
                height={300}
              />
              <div className="mt-4 space-y-2">
                {analytics.property_types.map((pt, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 capitalize">{pt.property_type || 'Unknown'}</span>
                    <span className="font-semibold">{pt.count || 0}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No property type data available
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Status Distribution</h2>
          <Chart
            type="bar"
            data={analytics?.status_distribution.map(s => ({
              name: s.status,
              value: s.count,
            })) || []}
            height={300}
          />
          <div className="mt-4 space-y-2">
            {analytics?.status_distribution.map((s, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{s.status}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-bold mb-4">Properties Added (Last 12 Months)</h2>
          <Chart
            type="line"
            data={analytics?.monthly_trend || []}
            xKey="month"
            yKey="count"
            height={300}
          />
        </div>

        {/* Properties by City */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Top Cities</h2>
          <div className="space-y-3">
            {analytics?.by_city.map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">{city.city}</span>
                <span className="text-blue-600 font-semibold">{city.count} properties</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Price Statistics</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <div className="text-sm text-gray-600">Average Price</div>
              <div className="text-2xl font-bold text-blue-600">
                KSh {analytics?.price_stats?.avg_price ? Number(analytics.price_stats.avg_price).toLocaleString() : '0'}
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <div className="text-sm text-gray-600">Maximum Price</div>
              <div className="text-2xl font-bold text-green-600">
                KSh {analytics?.price_stats?.max_price ? Number(analytics.price_stats.max_price).toLocaleString() : '0'}
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded">
              <div className="text-sm text-gray-600">Minimum Price</div>
              <div className="text-2xl font-bold text-orange-600">
                KSh {analytics?.price_stats?.min_price ? Number(analytics.price_stats.min_price).toLocaleString() : '0'}
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      {!error && !analytics && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No analytics data available yet.</p>
        </div>
      )}
    </div>
  );
};

