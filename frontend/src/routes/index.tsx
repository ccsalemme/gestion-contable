import { Routes as ReactRoutes, Route, Navigate } from 'react-router-dom'

export default function Routes() {
  return (
    <ReactRoutes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
      <Route path="/login" element={<div>Login - Coming Soon</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  )
}
