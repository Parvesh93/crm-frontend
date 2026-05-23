import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", clients: 4 },
  { month: "Feb", clients: 7 },
  { month: "Mar", clients: 10 },
  { month: "Apr", clients: 14 },
  { month: "May", clients: 18 },
  { month: "Jun", clients: 22 },
];

function ClientChart() {
  return (
    <div className="h-[350px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />

          <YAxis
            tick={{ fill: "#6b7280", fontSize: 12 }}
          />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="clients"
            stroke="#111827"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ClientChart;