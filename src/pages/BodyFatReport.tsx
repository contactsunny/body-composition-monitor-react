import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { fetchBodyComposition, BodyCompositionRecord } from "../services/bodyCompositionService";
import { formatDate } from "../utils/dateUtils";

const BodyFatReport = () => {
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
        setError(e.message || "Failed to load body fat report");
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
          bodyFatPercentage: Number(r.bodyFatPercentage.toFixed(2)),
          weight: Number(r.weight.toFixed(1)),
        })),
    [data]
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Body Fat Report</h1>

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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 lg:p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Body Fat % Trend</h2>
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 50, right: 20, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                <XAxis dataKey="dateLabel" angle={-35} textAnchor="end" height={50} tick={{ fill: "#6b7280" }} />
                <YAxis tick={{ fill: "#6b7280" }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: 8 }} />
                <Line type="monotone" dataKey="bodyFatPercentage" stroke="#ef4444" name="Body Fat %" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyFatReport;

