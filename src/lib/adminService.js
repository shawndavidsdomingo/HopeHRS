// src/lib/adminService.js
// Sprint 3 — M1 PR-01: feat/admin-api
// ─────────────────────────────────────────────────────────────────────────────
// Admin Module API: getUsers, activateUser, deactivateUser
//
// Schema confirmed from 002_rights_seed.sql:
//   Table : hr_user
//   Cols  : userid, email, user_type, record_status, stamp
//
// SUPERADMIN protection rule (enforced in ALL three functions):
//   No operation may target a row where user_type = 'SUPERADMIN'.
//   This is enforced at the service layer (first guard) and at the
//   DB layer via RLS (second guard — Sprint 3 M3 PR-02).
//
// Auth pattern matches existing service files:
//   - stamp uses userEmail (session.user.email) as the actor identifier
//   - currentUser comes from useRights() → currentUser.email
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ── Stamp helper ──────────────────────────────────────────────────────────────
// "ACTION | email | ISO-timestamp" — trimmed to 60 chars (column max)
function makeStamp(action, userEmail) {
  return `${action} | ${userEmail} | ${new Date().toISOString()}`.slice(0, 60);
}

// ─────────────────────────────────────────────────────────────────────────────
// READ
// getUsers()
//   Returns all hr_user rows ordered by user_type then email.
//   No userType filter — Admin Module is only accessible to
//   ADMIN and SUPERADMIN (enforced by ProtectedRoute adminOnly +
//   ADM_USER right gating in the UI).
//
//   Does NOT expose userid in the returned columns — the UI only
//   needs email, user_type, and record_status for display.
//   userid is included for keying rows in the UI table.
// ─────────────────────────────────────────────────────────────────────────────
export async function getUsers() {
  const { data, error } = await supabase
    .from('hr_user')
    .select('userid, display_id, email, user_type, record_status, stamp')
    .order('email');

  if (error) console.error('[getUsers]', error.message);

  // Sort by display_id numeric part (user1 < user2 < ... < user16)
  // This preserves the defined order: SUPERADMIN user1-6,
  // ADMIN user7-11, USER user12-16
  const sorted = (data ?? []).sort((a, b) => {
    const numA = parseInt((a.display_id ?? '').replace('user', '')) || 999;
    const numB = parseInt((b.display_id ?? '').replace('user', '')) || 999;
    return numA - numB;
  });

  return { data: sorted, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVATE
// activateUser(targetUserId, targetUserType, userEmail)
//   Sets record_status = 'ACTIVE' for the target user.
//   Gated by ADM_USER right — only call when rights.ADM_USER === 1.
//
//   SUPERADMIN protection:
//     Returns an error immediately if targetUserType === 'SUPERADMIN'.
//     Never reaches Supabase. RLS also enforces this at DB level.
//
//   targetUserId   — hr_user.userid of the account to activate
//   targetUserType — hr_user.user_type of the account (for SUPERADMIN check)
//   userEmail      — email of the logged-in user performing the action (stamp)
// ─────────────────────────────────────────────────────────────────────────────
export async function activateUser(targetUserId, targetUserType, userEmail) {
  // ── SUPERADMIN protection — service layer guard ───────────────────────────
  if (targetUserType === 'SUPERADMIN') {
    const err = new Error('SUPERADMIN accounts cannot be modified.');
    console.error('[activateUser] Blocked — target is SUPERADMIN');
    return { error: err };
  }

  const stamp = makeStamp('ACTIVATED', userEmail);

  const { data, error } = await supabase
    .from('hr_user')
    .update({ record_status: 'ACTIVE', stamp })
    .eq('userid', targetUserId)
    .neq('user_type', 'SUPERADMIN')  // DB-level double guard
    .select()
    .single();

  if (error) console.error('[activateUser]', error.message);
  return { data, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// DEACTIVATE
// deactivateUser(targetUserId, targetUserType, userEmail)
//   Sets record_status = 'INACTIVE' for the target user.
//   Gated by ADM_USER right — only call when rights.ADM_USER === 1.
//
//   SUPERADMIN protection:
//     Returns an error immediately if targetUserType === 'SUPERADMIN'.
//     Never reaches Supabase. RLS also enforces this at DB level.
//
//   Effect: deactivated user will be blocked by checkLoginGuard
//   on their next login attempt and shown the pending activation message.
//
//   targetUserId   — hr_user.userid of the account to deactivate
//   targetUserType — hr_user.user_type of the account (for SUPERADMIN check)
//   userEmail      — email of the logged-in user performing the action (stamp)
// ─────────────────────────────────────────────────────────────────────────────
export async function deactivateUser(targetUserId, targetUserType, userEmail) {
  // ── SUPERADMIN protection — service layer guard ───────────────────────────
  if (targetUserType === 'SUPERADMIN') {
    const err = new Error('SUPERADMIN accounts cannot be modified.');
    console.error('[deactivateUser] Blocked — target is SUPERADMIN');
    return { error: err };
  }

  const stamp = makeStamp('DEACTIVATED', userEmail);

  const { data, error } = await supabase
    .from('hr_user')
    .update({ record_status: 'INACTIVE', stamp })
    .eq('userid', targetUserId)
    .neq('user_type', 'SUPERADMIN')  // DB-level double guard
    .select()
    .single();

  if (error) console.error('[deactivateUser]', error.message);
  return { data, error };
}