// src/tests/TestRights.jsx
import { useRights } from '../contexts/UserRightsContext';

export default function TestRights() {
  const { currentUser, rights } = useRights();

  console.log('=== PR-04: UserRightsContext ===');
  console.log('currentUser:', currentUser);
  console.log('rights:', rights);
  console.log('Rights count:', Object.keys(rights).length, '(expect 17)');

  return (
    <div style={{ padding: 24 }}>
      <h2>PR-04 — Rights Debug</h2>
      <p>Rights count: {Object.keys(rights).length} (expect 17)</p>
      <pre>{JSON.stringify({ currentUser, rights }, null, 2)}</pre>
    </div>
  );
}