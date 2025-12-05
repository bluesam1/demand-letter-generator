import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Letters from './pages/Letters';
import CreateLetter from './pages/CreateLetter';
import LetterView from './pages/LetterView';
import Templates from './pages/Templates';
import TemplateEditor from './pages/TemplateEditor';
import TeamManagement from './pages/TeamManagement';
import AcceptInvitation from './pages/AcceptInvitation';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/letters"
            element={
              <ProtectedRoute>
                <Letters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/letters/new"
            element={
              <ProtectedRoute>
                <CreateLetter />
              </ProtectedRoute>
            }
          />
          <Route
            path="/letters/:id"
            element={
              <ProtectedRoute>
                <LetterView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates/new"
            element={
              <ProtectedRoute>
                <TemplateEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/templates/:id/edit"
            element={
              <ProtectedRoute>
                <TemplateEditor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/team"
            element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
