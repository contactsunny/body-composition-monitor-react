import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { fetchBodyComposition, BodyCompositionRecord } from "../services/bodyCompositionService";
import { formatDate } from "../utils/dateUtils";

type MetricKey = keyof Pick<BodyCompositionRecord,
  | "weight"
  | "bodyFatPercentage"
  | "muscleMassPercentage"
  | "muscleMass"
  | "subcutaneousFat"
  | "visceralFat"
  | "bodyHydration"
  | "skeletalMuscle"
  | "boneMass"
  | "protein"
  | "bmi"
  | "bmr"
  | "metabolicAge"
>;

const METRIC_OPTIONS: { key: MetricKey; label: string; color: string; yAxis: "left" | "right" }[] = [
  { key: "weight", label: "Weight (kg)", color: "#6366f1", yAxis: "left" },
  { key: "bodyFatPercentage", label: "Body Fat %", color: "#ef4444", yAxis: "right" },
  { key: "muscleMassPercentage", label: "Muscle Mass %", color: "#10b981", yAxis: "right" },
  { key: "muscleMass", label: "Muscle Mass (kg)", color: "#3b82f6", yAxis: "left" },
  { key: "subcutaneousFat", label: "Subcutaneous Fat", color: "#f97316", yAxis: "right" },
  { key: "visceralFat", label: "Visceral Fat", color: "#fb7185", yAxis: "right" },
  { key: "bodyHydration", label: "Water %", color: "#22d3ee", yAxis: "right" },
  { key: "skeletalMuscle", label: "Skeletal Muscle (kg)", color: "#8b5cf6", yAxis: "left" },
  { key: "boneMass", label: "Bone Mass (kg)", color: "#f59e0b", yAxis: "left" },
  { key: "protein", label: "Protein %", color: "#a3e635", yAxis: "right" },
  { key: "bmi", label: "BMI", color: "#64748b", yAxis: "right" },
  { key: "bmr", label: "BMR (kcal)", color: "#14b8a6", yAxis: "left" },
  { key: "metabolicAge", label: "Metabolic Age", color: "#eab308", yAxis: "right" },
];

const CustomMetricsReport = () => {
  const [data, setData] = useState<BodyCompositionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<MetricKey[]>(["weight", "bodyFatPercentage", "muscleMassPercentage"]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const records = await fetchBodyComposition();
        setData(records);
      } catch (e: any) {
        setError(e.message || "Failed to load data");
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
          bodyFatPercentage: Number(r.bodyFatPercentage.toFixed(2)),
          muscleMassPercentage: Number(r.muscleMassPercentage.toFixed(2)),
          muscleMass: Number(r.muscleMass.toFixed(2)),
          subcutaneousFat: Number(r.subcutaneousFat.toFixed(2)),
          visceralFat: Number(r.visceralFat.toFixed(2)),
          bodyHydration: Number(r.bodyHydration.toFixed(2)),
          skeletalMuscle: Number(r.skeletalMuscle.toFixed(2)),
          boneMass: Number(r.boneMass.toFixed(2)),
          protein: Number(r.protein.toFixed(2)),
          bmi: Number(r.bmi.toFixed(2)),
          bmr: Number(r.bmr.toFixed(2)),
          metabolicAge: Number(r.metabolicAge.toFixed(2)),
        })),
    [data]
  );

  const toggleMetric = (key: MetricKey) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Custom Metrics</h1>

      <div className="mb-4 relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
          Select metrics ({selected.length})
        </button>
        {open && (
          <div className="absolute mt-2 z-20 w-80 max-h-80 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3">
            {METRIC_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-3 px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.key)}
                  onChange={() => toggleMetric(opt.key)}
                  className="h-4 w-4"
                />
                <span className="text-sm" style={{ color: opt.color }}>{opt.label}</span>
              </label>
            ))}
            <div className="mt-2 flex gap-2">
              <button onClick={() => setSelected(METRIC_OPTIONS.map((m) => m.key))} className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Select all</button>
              <button onClick={() => setSelected([])} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700">Clear</button>
              <button onClick={() => setOpen(false)} className="ml-auto text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600">Close</button>
            </div>
          </div>
        )}
      </div>

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
          <div className="h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 50, right: 20, left: 10, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-700" />
                <XAxis dataKey="dateLabel" angle={-35} textAnchor="end" height={50} tick={{ fill: "#6b7280" }} />
                <YAxis yAxisId="left" tick={{ fill: "#6b7280" }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6b7280" }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                {METRIC_OPTIONS.filter((m) => selected.includes(m.key)).map((m) => (
                  <Line
                    key={m.key}
                    yAxisId={m.yAxis}
                    type="monotone"
                    dataKey={m.key as string}
                    stroke={m.color}
                    name={m.label}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomMetricsReport;


