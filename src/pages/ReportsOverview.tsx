import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { fetchBodyComposition, BodyCompositionRecord } from "../services/bodyCompositionService";
import { formatDate } from "../utils/dateUtils";

const ReportsOverview = () => {
  const [data, setData] = useState<BodyCompositionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const records = await fetchBodyComposition();
        setData(records);
      } catch (e: any) {
        setError(e.message || "Failed to load reports data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const timeSeries = useMemo(
    () =>
      [...data]
        .sort((a, b) => a.date - b.date)
        .map((r) => ({
          dateLabel: formatDate(r.date),
          date: r.date,
          weight: Number(r.weight.toFixed(1)),
          bodyFatPercentage: Number(r.bodyFatPercentage.toFixed(1)),
          muscleMassPercentage: Number(r.muscleMassPercentage.toFixed(1)),
        })),
    [data]
  );

  const latest = data.length ? [...data].sort((a, b) => b.date - a.date)[0] : null;
  const pieData = useMemo(() => {
    if (!latest) return [] as { name: string; value: number; color: string }[];
    const otherPct = Math.max(
      0,
      100 -
        latest.muscleMassPercentage -
        latest.bodyFatPercentage -
        latest.bodyHydration -
        latest.boneMass
    );
    return [
      { name: "Muscle Mass %", value: latest.muscleMassPercentage, color: "#10b981" },
      { name: "Water %", value: latest.bodyHydration, color: "#3b82f6" },
      { name: "Body Fat %", value: latest.bodyFatPercentage, color: "#ef4444" },
      { name: "Bone Mass %", value: Number(latest.boneMass.toFixed(1)), color: "#f59e0b" },
      { name: "Other %", value: Number(otherPct.toFixed(1)), color: "#8b5cf6" },
    ].filter((x) => x.value > 0);
  }, [latest]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Reports Overview</h1>

      {loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      )}
      {error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">No data yet. Add your first entry to see reports.</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trends Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 lg:p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Key Trends</h2>
            {/* Custom Legend outside chart */}
            <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: "#6366f1" }}></div>
                  <span className="text-gray-700 dark:text-gray-300">Weight (kg)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: "#ef4444" }}></div>
                  <span className="text-gray-700 dark:text-gray-300">Body Fat %</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-0.5" style={{ backgroundColor: "#10b981" }}></div>
                  <span className="text-gray-700 dark:text-gray-300">Muscle Mass %</span>
                </div>
              </div>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeries} margin={{ top: 20, right: 20, left: 10, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                  <XAxis dataKey="dateLabel" angle={-35} textAnchor="end" height={50} tick={{ fill: "#6b7280" }} />
                  <YAxis yAxisId="left" tick={{ fill: "#6b7280" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280" }} />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="weight" stroke="#6366f1" name="Weight (kg)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="bodyFatPercentage" stroke="#ef4444" name="Body Fat %" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="muscleMassPercentage" stroke="#10b981" name="Muscle Mass %" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Latest Composition Pie */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 lg:p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Latest Composition</h2>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={110} dataKey="value" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsOverview;

