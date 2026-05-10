// src/contexts/UserRightsContext.jsx
// Sprint 2 — M1 PR-04: feat/route-guard-deleted
// ─────────────────────────────────────────────────────────────────────────────
// Queries all 17 UserModule_Rights rows for the logged-in user on login,
// stores them as a flat rights map: { EMP_VIEW: 1, EMP_ADD: 0, ... }
//
// Consumed by:
//   - useRights() hook  → M4 uses this to gate buttons
//   - UserRightsContext directly → M1 uses userType for getX(userType) calls
//
// Auth pattern: currentUser is built from session.user.email + hr_user row,
// matching the checkLoginGuard pattern already in App.jsx.
//
// Table confirmed from 002_rights_seed.sql:
//   user_module_rights (userId VARCHAR, rightCode VARCHAR, right_value INT)
//   hr_user            (userId VARCHAR, email VARCHAR, user_type VARCHAR, ...)
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// ── Context ───────────────────────────────────────────────────────────────────
const UserRightsContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function UserRightsProvider({ children }) {
  // currentUser: { email, userid, user_type, record_status }
  const [currentUser, setCurrentUser] = useState(null);
  // rights: flat map of all 17 right codes → 0 | 1
  // e.g. { EMP_VIEW: 1, EMP_ADD: 1, EMP_EDIT: 1, EMP_DEL: 0, ... }
  const [rights, setRights] = useState({});
  const [loadingRights, setLoadingRights] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadUserAndRights(session);
      else setLoadingRights(false);
    });

    // Listen for auth changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) loadUserAndRights(session);
        else {
          setCurrentUser(null);
          setRights({});
          setLoadingRights(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Load hr_user row + all 17 rights for this session ─────────────────────
  async function loadUserAndRights(session) {
    setLoadingRights(true);

    try {
      // 1. Get hr_user row by email (matches App.jsx checkLoginGuard pattern)
      const { data: userRow, error: userError } = await supabase
        .from('hr_user')
        .select('userid, email, user_type, record_status')
        .eq('email', session.user.email)
        .single();

      if (userError || !userRow) {
        console.error('[UserRightsContext] hr_user lookup failed:', userError?.message);
        setCurrentUser(null);
        setRights({});
        setLoadingRights(false);
        return;
      }

      // Guard: only ACTIVE accounts should reach here (login guard in App.jsx
      // handles signOut for INACTIVE, but double-check defensively)
      if (userRow.record_status !== 'ACTIVE') {
        setCurrentUser(null);
        setRights({});
        setLoadingRights(false);
        return;
      }

      setCurrentUser({ ...userRow });

      // 2. Query all 17 user_module_rights rows for this user
      const { data: rightsRows, error: rightsError } = await supabase
        .from('user_module_rights')
        .select('rightcode, right_value')
        .eq('userid', userRow.userid);

      if (rightsError) {
        console.error('[UserRightsContext] rights query failed:', rightsError.message);
        setRights({});
        setLoadingRights(false);
        return;
      }

      // 3. Flatten to map: { EMP_VIEW: 1, EMP_ADD: 0, ... }
      const rightsMap = {};
      (rightsRows ?? []).forEach(({ rightcode, right_value }) => {
        rightsMap[rightcode] = right_value;
      });

      setRights(rightsMap);
    } catch (err) {
      console.error('[UserRightsContext] Unexpected error:', err);
      setRights({});
    } finally {
      setLoadingRights(false);
    }
  }

  const value = {
    currentUser,   // { userId, email, user_type, record_status }
    rights,        // { EMP_VIEW: 1, EMP_ADD: 0, EMP_EDIT: 0, EMP_DEL: 0, ... }
    loadingRights,
  };

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
}

// ── useRights hook ────────────────────────────────────────────────────────────
// Usage in any component:
//   const { currentUser, rights } = useRights();
//   {rights.EMP_ADD === 1 && <button>Add Employee</button>}
export function useRights() {
  const context = useContext(UserRightsContext);
  if (!context) {
    throw new Error('useRights must be used inside <UserRightsProvider>');
  }
  return context;
}

export default UserRightsContext;