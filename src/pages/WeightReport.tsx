import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Area, AreaChart } from "recharts";
import { fetchBodyComposition, BodyCompositionRecord } from "../services/bodyCompositionService";
import { formatDate } from "../utils/dateUtils";

const WeightReport = () => {
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
        setError(e.message || "Failed to load weight report");
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
          weight: Number(r.weight.toFixed(2)),
        })),
    [data]
  );

  // Simple moving average (7 points)
  const sma7 = useMemo(() => {
    const vals = timeSeries.map((p) => p.weight);
    const out: number[] = [];
    for (let i = 0; i < vals.length; i++) {
      const start = Math.max(0, i - 6);
      const slice = vals.slice(start, i + 1);
      out.push(Number((slice.reduce((a, b) => a + b, 0) / slice.length).toFixed(2)));
    }
    return timeSeries.map((p, i) => ({ ...p, sma7: out[i] }));
  }, [timeSeries]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Weight Report</h1>

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

      {!loading && !error && timeSeries.length > 0 && (
        <div className="space-y-6">
          {/* Weight Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 lg:p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Weight Trend</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The 7‑pt Avg line is a simple moving average over the most recent seven
              entries. It smooths out day‑to‑day noise (hydration, meal timing, scale
              variance) to reveal your underlying direction of change. Use it to judge
              progress more reliably than single‑day values.
            </p>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sma7} margin={{ top: 50, right: 20, left: 10, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                  <XAxis dataKey="dateLabel" angle={-35} textAnchor="end" height={50} tick={{ fill: "#6b7280" }} />
                  <YAxis tick={{ fill: "#6b7280" }} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: 8 }} />
                  <Line type="monotone" dataKey="weight" stroke="#6366f1" name="Weight (kg)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sma7" stroke="#f59e0b" name="7-pt Avg" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area mini */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 lg:p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Cumulative Change</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              This area view highlights how your weight has evolved across the whole
              timeline. It’s useful for spotting longer‑term phases (plateaus vs.
              consistent loss/gain) rather than focusing on individual ups and downs.
            </p>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeSeries} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                  <XAxis dataKey="dateLabel" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="weight" stroke="#6366f1" fillOpacity={1} fill="url(#wg)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeightReport;

