// src/contexts/UserRightsContext.jsx
// M4 PR-01  feat/rights-context
// Sprint 3 fix: replaced .single() with .maybeSingle() in hr_user lookup
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const ALL_RIGHT_CODES = [
  'EMP_VIEW',  'EMP_ADD',   'EMP_EDIT',  'EMP_DEL',
  'JH_VIEW',   'JH_ADD',    'JH_EDIT',   'JH_DEL',
  'JOB_VIEW',  'JOB_ADD',   'JOB_EDIT',  'JOB_DEL',
  'DEPT_VIEW', 'DEPT_ADD',  'DEPT_EDIT', 'DEPT_DEL',
  'ADM_USER',
];

const EMPTY_RIGHTS = Object.fromEntries(ALL_RIGHT_CODES.map(c => [c, 0]));

const UserRightsContext = createContext(null);

export function UserRightsProvider({ children }) {
  const [currentUser, setCurrentUser]     = useState(null);
  const [rights, setRights]               = useState(EMPTY_RIGHTS);
  const [loadingRights, setLoadingRights] = useState(true);
  const activeUserId = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadUserAndRights(session);
      else         setLoadingRights(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;
        if (session) loadUserAndRights(session);
        else clearState();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  function clearState() {
    activeUserId.current = null;
    setCurrentUser(null);
    setRights(EMPTY_RIGHTS);
    setLoadingRights(false);
  }

  async function loadUserAndRights(session) {
    if (activeUserId.current === session.user.id) return;

    setLoadingRights(true);

    try {
      // FIX: .maybeSingle() instead of .single()
      // .single() throws PGRST116 when 0 rows found — caused ADMIN accounts
      // to fail silently, leaving currentUser = null and isAdminOrAbove = false,
      // which hid the Deleted Items and Admin sidebar links for ADMIN accounts
      const { data: userRow, error: userError } = await supabase
        .from('hr_user')
        .select('userid, email, user_type, record_status')
        .eq('email', session.user.email)
        .maybeSingle();

      // Debug log — remove after confirming sidebar fix works
      console.log('[UserRightsContext] hr_user row:', userRow, 'error:', userError?.message);

      if (userError || !userRow) {
        console.error('[UserRightsContext] hr_user lookup failed:', userError?.message);
        clearState();
        return;
      }

      if (userRow.record_status !== 'ACTIVE') {
        clearState();
        return;
      }

      setCurrentUser({ ...userRow });

      // Debug log — confirms user_type value for isAdminOrAbove check
      console.log('[UserRightsContext] user_type:', userRow.user_type,
        '| isAdminOrAbove will be:',
        userRow.user_type === 'ADMIN' || userRow.user_type === 'SUPERADMIN'
      );

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

      const rightsMap = { ...EMPTY_RIGHTS };
      (rightsRows ?? []).forEach(({ rightcode, right_value }) => {
        if (rightcode in rightsMap) {
          rightsMap[rightcode] = right_value;
        }
      });

      // Debug log — confirms rights loaded correctly
      console.log('[UserRightsContext] rights loaded:', rightsRows?.length, 'rows',
        '| ADM_USER:', rightsMap['ADM_USER']
      );

      setRights(rightsMap);
      activeUserId.current = session.user.id;

    } catch (err) {
      console.error('[UserRightsContext] Unexpected error:', err);
      setRights(EMPTY_RIGHTS);
    } finally {
      setLoadingRights(false);
    }
  }

  const hasRight = useCallback((code) => rights[code] === 1, [rights]);
  const canDo = hasRight;

  const isAdminOrAbove =
    currentUser?.user_type === 'ADMIN' ||
    currentUser?.user_type === 'SUPERADMIN';

  const value = {
    currentUser,
    rights,
    loadingRights,
    hasRight,
    canDo,
    isAdminOrAbove,
  };

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
}

export function useRights() {
  const context = useContext(UserRightsContext);
  if (!context) {
    throw new Error('useRights() must be called inside <UserRightsProvider>');
  }
  return context;
}

export default UserRightsContext;