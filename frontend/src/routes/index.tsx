import { Routes as ReactRoutes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages'
import SpreadsheetPage from '@/pages/SpreadsheetPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function Routes() {
  return (
    <ReactRoutes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SpreadsheetPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect all other routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  )
}
