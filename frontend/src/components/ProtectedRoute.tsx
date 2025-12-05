import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { RootState, AppDispatch } from '../store';
import { getCurrentUser, clearAuth } from '../store/authSlice';
import authService from '../services/authService';

interface ProtectedRouteProps {
  children: JSX.Element;
  roles?: string[]; // Optional: restrict by role
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    let isMounted = true;

    const verifyAuth = async () => {
      const accessToken = authService.getAccessToken();
      const refreshToken = authService.getRefreshToken();

      // No tokens at all - redirect immediately
      if (!accessToken && !refreshToken) {
        dispatch(clearAuth());
        if (isMounted) setAuthStatus('unauthenticated');
        return;
      }

      // Have access token but no refresh token - clear and redirect
      if (!refreshToken) {
        dispatch(clearAuth());
        authService.clearTokens();
        if (isMounted) setAuthStatus('unauthenticated');
        return;
      }

      // Already authenticated in Redux - we're good
      if (isAuthenticated) {
        if (isMounted) setAuthStatus('authenticated');
        return;
      }

      // Have tokens but not authenticated in Redux - try to restore session
      if (accessToken) {
        authService.initializeAuth();
        try {
          await dispatch(getCurrentUser()).unwrap();
          if (isMounted) setAuthStatus('authenticated');
        } catch {
          // Token invalid or expired, clear auth
          dispatch(clearAuth());
          authService.clearTokens();
          if (isMounted) setAuthStatus('unauthenticated');
        }
      } else {
        if (isMounted) setAuthStatus('unauthenticated');
      }
    };

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - run once on mount

  // Show loading while checking authentication
  if (authStatus === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (authStatus === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (roles && roles.length > 0 && user) {
    if (!roles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Access Denied</h3>
              <p className="mt-2 text-sm text-gray-600">
                You do not have permission to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}
