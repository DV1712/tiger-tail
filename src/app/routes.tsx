import { createBrowserRouter, Navigate } from 'react-router';
import { LoginPage } from './pages/LoginPage';
import { FeedPage } from './pages/FeedPage';
import { GigDetailPage } from './pages/GigDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResearchHubPage } from './pages/ResearchHubPage';
import { ProtectedLayout } from './components/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/',
    Component: ProtectedLayout,
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: 'feed', Component: FeedPage },
      { path: 'gig/:id', Component: GigDetailPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'research', Component: ResearchHubPage },
      { path: '*', element: <Navigate to="/feed" replace /> },
    ],
  },
]);