function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
}) {
  return (
    <div className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.02)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="text-[28px] leading-none font-semibold tracking-[-0.03em] text-slate-950 mt-3">
            {value}
          </h2>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <Icon size={19} />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 min-h-[20px]">
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">
            {badge}
          </span>
        )}
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
  );
}

export default StatCard;
