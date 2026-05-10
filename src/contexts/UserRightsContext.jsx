// src/contexts/UserRightsContext.jsx
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

// ── Context ───────────────────────────────────────────────────────────────────
const UserRightsContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function UserRightsProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [rights, setRights] = useState({});
  const [loadingRights, setLoadingRights] = useState(true);

  // FIX: Track the user ID so we don't wipe state on tab switch
  const activeUserId = useRef(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadUserAndRights(session);
      else setLoadingRights(false);
    });

    // Listen for auth changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        // Ignore background refreshes completely
        if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') return;

        if (session) {
          loadUserAndRights(session);
        } else {
          activeUserId.current = null;
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
    // FIX: If we already loaded rights for this user, do nothing!
    // This stops the UI from flickering/resetting when switching tabs
    if (activeUserId.current === session.user.id) {
      return;
    }

    setLoadingRights(true);

    try {
      // 1. Get hr_user row by email
      const { data: userRow, error: userError } = await supabase
        .from('hr_user')
        .select('userid, email, user_type, record_status')
        .eq('email', session.user.email)
        .single();

      if (userError || !userRow) {
        console.error('[UserRightsContext] hr_user lookup failed:', userError?.message);
        activeUserId.current = null;
        setCurrentUser(null);
        setRights({});
        setLoadingRights(false);
        return;
      }

      // Guard: only ACTIVE accounts should reach here
      if (userRow.record_status !== 'ACTIVE') {
        activeUserId.current = null;
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
      activeUserId.current = session.user.id; // Mark as successfully loaded!

    } catch (err) {
      console.error('[UserRightsContext] Unexpected error:', err);
      setRights({});
    } finally {
      setLoadingRights(false);
    }
  }

  const value = {
    currentUser,   
    rights,        
    loadingRights,
  };

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
}

// ── useRights hook ────────────────────────────────────────────────────────────
export function useRights() {
  const context = useContext(UserRightsContext);
  if (!context) {
    throw new Error('useRights must be used inside <UserRightsProvider>');
  }
  return context;
}

export default UserRightsContext;