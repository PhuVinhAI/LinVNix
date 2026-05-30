import { createBrowserRouter, Navigate } from 'react-router'
import { ROUTES } from '../../lib/shared/constants'
import { ProtectedRoute, PublicRoute } from './ProtectedRoute'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { PlaceholderPage } from '../pages/placeholder'

/**
 * Router Configuration
 */
export const router = createBrowserRouter([
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      // Học liệu
      {
        path: ROUTES.COURSES,
        element: <PlaceholderPage title="Khóa học" />,
      },
      {
        path: ROUTES.TOPICS,
        element: <PlaceholderPage title="Chủ đề" />,
      },
      {
        path: ROUTES.LESSONS,
        element: <PlaceholderPage title="Bài học" />,
      },
      {
        path: ROUTES.VOCABULARIES,
        element: <PlaceholderPage title="Từ vựng" />,
      },
      {
        path: ROUTES.GRAMMAR,
        element: <PlaceholderPage title="Ngữ pháp" />,
      },
      // Bài tập
      {
        path: ROUTES.EXERCISES,
        element: <PlaceholderPage title="Bài tập" />,
      },
      {
        path: ROUTES.EXERCISE_SETS,
        element: <PlaceholderPage title="Bộ bài tập" />,
      },
      // Hội thoại mô phỏng
      {
        path: ROUTES.SCENARIOS,
        element: <PlaceholderPage title="Tình huống" />,
      },
      {
        path: ROUTES.SCENARIO_CATEGORIES,
        element: <PlaceholderPage title="Danh mục tình huống" />,
      },
      // Người dùng
      {
        path: ROUTES.LEARNERS,
        element: <PlaceholderPage title="Học viên" />,
      },
      // Cài đặt
      {
        path: ROUTES.SETTINGS,
        element: <PlaceholderPage title="Cài đặt" />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
])
