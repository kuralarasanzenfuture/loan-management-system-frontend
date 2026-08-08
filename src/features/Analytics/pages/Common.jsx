const statusMap = {
  Active: "primary",
  Completed: "success",
  Overdue: "danger",
  Paid: "success",
  Pending: "warning",
  Late: "warning",
  Missed: "danger",
};

export function StatusBadge({ status }) {
  const tone = statusMap[status] || "primary";
  return <span className={`badge badge-${tone}`}>{status}</span>;
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 animate-fadeUp">
      <div>
        <h2 className="text-xl font-display font-bold">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title = "Nothing here yet", subtitle = "Data will appear once available.", icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-slate-300" />
        </div>
      )}
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

export function RiskBadge({ risk }) {
  return <span className={`badge badge-${risk.color}`}>{risk.label}</span>;
}
