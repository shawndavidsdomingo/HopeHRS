// M5 – Sprint 1 R-01: Supabase mock
// Replaces the real supabase client so tests never hit the network.
// Each test can override individual methods via vi.mocked() or mockResolvedValueOnce().

import { vi } from 'vitest';

// Base mock structure mirrors the real supabase client shape used in the app.
export const supabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    insert: vi.fn(),
  })),
};
