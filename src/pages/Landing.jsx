export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 h-16 border-b border-gray-100">
        <span className="text-xl font-extrabold tracking-tight">
          Hope<span className="text-emerald-600">HRM</span>
        </span>
        <button className="bg-emerald-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-emerald-700 transition-colors">
          Sign in with Google
        </button>
      </nav>

      {/* Hero */}
      <section className="text-center px-10 py-24 border-b border-gray-100">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Hope, Inc. — HR Management System
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight leading-tight text-gray-900 mb-5">
          Manage your people.<br />
          <span className="text-emerald-600">With confidence.</span>
        </h1>

        <p className="text-base text-gray-500 leading-relaxed max-w-lg mx-auto mb-8">
          A secure, internal platform for Hope, Inc. staff. Track employees, job
          histories, departments, and maintain a full audit trail — all in one place.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          <button className="bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors">
            Sign in with Google
          </button>
          <button className="text-sm font-medium text-gray-700 border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
            Learn more
          </button>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-gray-400">
          {["Google accounts only", "No passwords", "Full audit trail", "No hard deletes"].map((item) => (
            <div key={item} className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 flex items-center justify-center">
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3l2 2 4-4" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-3 gap-3 px-10 py-16 border-b border-gray-100">
        {features.map((f) => (
          <div key={f.title} className="bg-gray-50 border border-gray-100 rounded-xl p-6">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${f.iconBg}`}>
              {f.icon}
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1.5">{f.title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="text-center bg-gray-50 border-b border-gray-100 px-10 py-16">
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">
          Ready to sign in?
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Use your Hope, Inc. Google account to access the system.
        </p>
        <button className="bg-emerald-600 text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors">
          Sign in with Google
        </button>
      </section>

      {/* Footer */}
      <footer className="flex items-center justify-between px-10 py-5">
        <span className="text-sm font-extrabold tracking-tight">
          Hope<span className="text-emerald-600">HRM</span>
        </span>
        <span className="text-xs text-gray-400">
          Hope, Inc. · Human Resources Management · 2BSIT-3
        </span>
      </footer>

    </div>
  )
}

const features = [
  {
    title: "Employee records",
    desc: "Add, edit, and manage employee profiles. Separated employees are flagged as inactive — records are never permanently removed.",
    iconBg: "bg-emerald-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="#059669" strokeWidth="1.5"/>
        <path d="M2 13c0-3 2-5 6-5s6 2 6 5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Job history",
    desc: "Track every promotion, transfer, and role change with effective dates and salary records, linked to each employee.",
    iconBg: "bg-blue-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h7M3 12h5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Departments & job codes",
    desc: "Maintain master lists of departments and job codes. All changes are tracked — nothing disappears from the system.",
    iconBg: "bg-violet-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#7c3aed" strokeWidth="1.5"/>
        <path d="M5 7h6M5 10h4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    title: "Audit trail",
    desc: "Every action — add, edit, or recovery — is timestamped and logged. Full transparency across all modules.",
    iconBg: "bg-amber-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v4l3 1.5" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="8" r="6" stroke="#d97706" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Secure access",
    desc: "Sign in with your Hope, Inc. Google account. No passwords to remember — access is managed through Google OAuth.",
    iconBg: "bg-emerald-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M5 8l2.5 2.5L11 5" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="8" r="6" stroke="#059669" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    title: "Reports",
    desc: "Generate and view HR reports across employees, departments, and job histories — for authorized users only.",
    iconBg: "bg-pink-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 8h8M8 4l4 4-4 4" stroke="#db2777" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]