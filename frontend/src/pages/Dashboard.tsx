import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { letterService, Letter, DashboardStats } from '../services/letterService';
import { Button, Card, CardContent, CardHeader, CardTitle, StatusBadge } from '../components/ui';
import { PageLayout } from '../components/layout';

function Dashboard() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLetters, setRecentLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, lettersResponse] = await Promise.all([
        letterService.getDashboardStats(),
        letterService.getAll({ limit: 5, sortBy: 'updatedAt', sortOrder: 'desc' }),
      ]);
      setStats(statsResponse.stats);
      setRecentLetters(lettersResponse.letters);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <PageLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'User'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Here&apos;s an overview of your demand letters
            </p>
          </div>
          <Button onClick={() => navigate('/letters/new')}>
            Create New Letter
          </Button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-gray-600">Total Letters</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-gray-600">Drafts</div>
                <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.draft}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-gray-600">Generated</div>
                <div className="mt-2 text-3xl font-semibold text-blue-600">{stats.generated}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-gray-600">Finalized</div>
                <div className="mt-2 text-3xl font-semibold text-green-600">{stats.finalized}</div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Recent Letters */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Letters</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/letters')}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            ) : recentLetters.length > 0 ? (
              <div className="space-y-3">
                {recentLetters.map((letter) => (
                  <div
                    key={letter.id}
                    className="flex items-center justify-between py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/letters/${letter.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {letter.clientName} v. {letter.defendantName}
                      </h4>
                      {letter.caseReference && (
                        <p className="text-xs text-gray-500 mt-1">
                          Case: {letter.caseReference}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                      <StatusBadge status={letter.status} />
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(letter.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No letters yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first demand letter.
                </p>
                <div className="mt-6">
                  <Button onClick={() => navigate('/letters/new')}>
                    Create Your First Letter
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/letters/new')}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">New Letter</h3>
                  <p className="text-sm text-gray-500">Create a demand letter</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/letters')}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">All Letters</h3>
                  <p className="text-sm text-gray-500">View and manage letters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/templates')}>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Templates</h3>
                  <p className="text-sm text-gray-500">Manage templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}

export default Dashboard;
