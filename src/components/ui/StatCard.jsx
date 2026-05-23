function StatCard({
  title,
  value,
  subtitle,
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className="text-4xl font-bold tracking-tight mt-3">
        {value}
      </h2>

      <p className="text-sm text-gray-400 mt-2">
        {subtitle}
      </p>
    </div>
  );
}

export default StatCard;