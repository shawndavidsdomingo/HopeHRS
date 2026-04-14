import { useGoogleLogin } from '../hooks/useGoogleLogin'

export default function Landing() {
  const { signInWithPopup } = useGoogleLogin()

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 h-16 border-b border-gray-100">
        <div className="font-extrabold text-xl tracking-tight">
          Hope<span className="text-emerald-600">HRM</span>
        </div>
        <button
          onClick={signInWithPopup}
          className="bg-emerald-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Sign in with Google
        </button>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-10 py-24 border-b border-gray-100">
        <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Hope, Inc. — HR Management System
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-gray-900 mb-5">
          People management,{" "}
          <em className="not-italic text-emerald-600">done right.</em>
        </h1>
        <p className="text-base text-gray-500 leading-relaxed max-w-lg mb-8">
          HopeHRM is Hope, Inc.'s internal platform for managing employees,
          job histories, departments, and records — with a full audit trail
          and nothing ever permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={signInWithPopup}
            className="bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Sign in with Google
          </button>
          <button
            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-medium px-6 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Learn more
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-400">
          Authorized Hope, Inc. personnel only · Google accounts only · No passwords
        </p>
      </section>

      {/* Features */}
      <div id="features" className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
        <div className="px-10 py-10">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5" r="3" stroke="#1D9E75" strokeWidth="1.5" />
              <path d="M2 13c0-3 2-5 6-5s6 2 6 5" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1.5">Employee records</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Manage the full employee lifecycle — from onboarding to separation.
            Records are never hard-deleted; everything is recoverable.
          </p>
        </div>
        <div className="px-10 py-10">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 4h10M3 8h7M3 12h5" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1.5">Audit trail</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Every addition, edit, and recovery is logged with a timestamp.
            Full accountability across all modules, always.
          </p>
        </div>
        <div className="px-10 py-10">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="3" y="2" width="10" height="12" rx="1.5" stroke="#534AB7" strokeWidth="1.5" />
              <path d="M5 6h6M5 9h4" stroke="#534AB7" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900 mb-1.5">Job history &amp; departments</p>
          <p className="text-sm text-gray-500 leading-relaxed">
            Track every role change, salary update, and department transfer —
            all tied to effective dates and fully editable.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center text-center px-10 py-16 bg-gray-50">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">
          Ready to sign in?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Use your Hope, Inc. Google account to access the system.
        </p>
        <button
          onClick={signInWithPopup}
          className="bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Sign in with Google
        </button>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between px-10 py-5 border-t border-gray-100">
        <div className="text-sm font-extrabold tracking-tight">
          Hope<span className="text-emerald-600">HRM</span>
        </div>
        <p className="text-xs text-gray-400">
          Hope, Inc. · Human Resources Management · 2BSIT-3
        </p>
      </footer>

    </div>
  )
}