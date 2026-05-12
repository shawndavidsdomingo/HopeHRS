export default function UserTypeBadge({ type }) {
  const map = {
    SUPERADMIN: 'bg-purple-50 text-purple-700 border border-purple-200',
    ADMIN:      'bg-blue-50 text-blue-700 border border-blue-200',
    USER:       'bg-slate-100 text-slate-500 border border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase ${map[type] ?? map.USER}`}>
      {type}
    </span>
  );
}
