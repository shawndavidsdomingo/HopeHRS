// src/contexts/UserRightsContext.jsx
// M4 PR-01  feat/rights-context
// ─────────────────────────────────────────────────────────────────────────────
// On login, queries all 17 user_module_rights rows for currentUser and stores
// them as a flat rights map: { EMP_ADD: 1, EMP_EDIT: 0, ... }
//
// Exports:
//   UserRightsProvider  — wrap the app with this
//   useRights()         — returns { currentUser, rights, loadingRights,
//                                   hasRight, canDo }
//
// hasRight(code)        — returns true if rights[code] === 1
// canDo                 — alias of hasRight (more readable in JSX gates)
//
// Usage examples:
//   const { hasRight, currentUser } = useRights();
//   if (hasRight('EMP_ADD'))  → show Add Employee button
//   if (canDo('JH_EDIT'))     → show Edit Job History button
//   if (currentUser?.user_type === 'ADMIN') → show stamp column
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// ── The 17 right codes this context manages ───────────────────────────────────
// Kept here as a reference / for initialising a zeroed-out map on logout.
const ALL_RIGHT_CODES = [
  'EMP_VIEW',  'EMP_ADD',   'EMP_EDIT',  'EMP_DEL',
  'JH_VIEW',   'JH_ADD',    'JH_EDIT',   'JH_DEL',
  'JOB_VIEW',  'JOB_ADD',   'JOB_EDIT',  'JOB_DEL',
  'DEPT_VIEW', 'DEPT_ADD',  'DEPT_EDIT', 'DEPT_DEL',
  'ADM_USER',
];

// ── Default zeroed-out rights map (used on logout / error) ────────────────────
const EMPTY_RIGHTS = Object.fromEntries(ALL_RIGHT_CODES.map(c => [c, 0]));

// ── Context ───────────────────────────────────────────────────────────────────
const UserRightsContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function UserRightsProvider({ children }) {
  const [currentUser, setCurrentUser]     = useState(null);
  const [rights, setRights]               = useState(EMPTY_RIGHTS);
  const [loadingRights, setLoadingRights] = useState(true);

  // Track the auth user ID so we don't re-query on tab switch / token refresh
  const activeUserId = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadUserAndRights(session);
      else         setLoadingRights(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore silent background refreshes — they don't change the user
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;

        if (session) {
          loadUserAndRights(session);
        } else {
          clearState();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Clear all state (logout / inactive account) ───────────────────────────
  function clearState() {
    activeUserId.current = null;
    setCurrentUser(null);
    setRights(EMPTY_RIGHTS);
    setLoadingRights(false);
  }

  // ── Load hr_user row + all 17 rights for this session ────────────────────
  async function loadUserAndRights(session) {
    // Already loaded for this exact auth user — skip to avoid flickering
    if (activeUserId.current === session.user.id) return;

    setLoadingRights(true);

    try {
      // 1. Fetch hr_user row by email
      const { data: userRow, error: userError } = await supabase
        .from('hr_user')
        .select('userid, email, user_type, record_status')
        .eq('email', session.user.email)
        .single();

      if (userError || !userRow) {
        console.error('[UserRightsContext] hr_user lookup failed:', userError?.message);
        clearState();
        return;
      }

      // Guard: INACTIVE accounts are signed out by the login guard in App.jsx,
      // but double-check here for safety
      if (userRow.record_status !== 'ACTIVE') {
        clearState();
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
        setRights(EMPTY_RIGHTS);
        setLoadingRights(false);
        return;
      }

      // 3. Flatten to map, starting from zeroed defaults so missing rows = 0
      //    e.g. { EMP_VIEW: 1, EMP_ADD: 1, EMP_EDIT: 0, ... }
      const rightsMap = { ...EMPTY_RIGHTS };
      (rightsRows ?? []).forEach(({ rightcode, right_value }) => {
        if (rightcode in rightsMap) {
          rightsMap[rightcode] = right_value;
        }
      });

      setRights(rightsMap);
      activeUserId.current = session.user.id; // Mark as successfully loaded

    } catch (err) {
      console.error('[UserRightsContext] Unexpected error:', err);
      setRights(EMPTY_RIGHTS);
    } finally {
      setLoadingRights(false);
    }
  }

  // ── hasRight(code) ────────────────────────────────────────────────────────
  // Returns true if the current user has right_value === 1 for the given code.
  //
  // SUPERADMIN / ADMIN distinction is handled by the DB seed — this function
  // is intentionally role-agnostic. Gate on rights, not on user_type, unless
  // you specifically need role-level gating (e.g. stamp column visibility).
  //
  // Example:
  //   hasRight('EMP_ADD')   → true / false
  const hasRight = useCallback(
    (code) => rights[code] === 1,
    [rights]
  );

  // ── canDo — readable alias of hasRight ───────────────────────────────────
  // Use whichever reads more naturally at the call site:
  //   hasRight('EMP_ADD')   → "does this user have EMP_ADD?"
  //   canDo('EMP_ADD')      → "can this user do EMP_ADD?"
  const canDo = hasRight;

  // ── isAdminOrAbove ────────────────────────────────────────────────────────
  // Convenience boolean for UI elements gated on role (stamp column, sidebar
  // links, Deleted Items page). Prefer hasRight() for action gating.
  const isAdminOrAbove =
    currentUser?.user_type === 'ADMIN' ||
    currentUser?.user_type === 'SUPERADMIN';

  const value = {
    currentUser,      // { userid, email, user_type, record_status } | null
    rights,           // { EMP_VIEW: 1, EMP_ADD: 0, ... } — all 17 keys always present
    loadingRights,    // true while the initial DB query is in-flight
    hasRight,         // (code: string) => boolean
    canDo,            // alias of hasRight
    isAdminOrAbove,   // boolean — true for ADMIN and SUPERADMIN
  };

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
}

// ── useRights hook ────────────────────────────────────────────────────────────
// Must be called inside a component wrapped by <UserRightsProvider>.
//
// Returns:
//   currentUser      — hr_user row or null
//   rights           — flat map of all 17 right codes → 0 | 1
//   loadingRights    — loading boolean
//   hasRight(code)   — true if rights[code] === 1
//   canDo(code)      — alias of hasRight
//   isAdminOrAbove   — true for ADMIN / SUPERADMIN
export function useRights() {
  const context = useContext(UserRightsContext);
  if (!context) {
    throw new Error('useRights() must be called inside <UserRightsProvider>');
  }
  return context;
}

export default UserRightsContext;
