// src/routes/ProtectedRoute.jsx
// Sprint 2 — M1 PR-04: feat/route-guard-deleted
// ─────────────────────────────────────────────────────────────────────────────
// Replaces the Sprint 1 placeholder (isAuthenticated = false hardcoded).
// Now reads real session + user_type from UserRightsContext.
//
// Two guard modes:
//   <ProtectedRoute />              → blocks unauthenticated users only
//   <ProtectedRoute adminOnly />    → additionally blocks USER accounts
//                                     (used on /deleted-items and /admin)
// ─────────────────────────────────────────────────────────────────────────────

import { Navigate } from 'react-router-dom';
import { useRights } from '../contexts/UserRightsContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loadingRights } = useRights();

  // Wait for rights context to finish its initial query before redirecting
  if (loadingRights) return null;

  // Not logged in (or INACTIVE — login guard in App.jsx handles signOut)
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // /deleted-items and /admin are blocked for USER accounts
  if (adminOnly && currentUser.user_type === 'USER') {
    return <Navigate to="/employees" replace />;
  }

  return children;
};

export default ProtectedRoute;