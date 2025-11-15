import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import {
  fetchBodyComposition,
  createBodyComposition,
  deleteBodyComposition,
  BodyCompositionRecord,
  CreateBodyCompositionRequest,
  updateBodyComposition,
} from "../services/bodyCompositionService";
import { formatDate, getFormattedDateFromTimestamp } from "../utils/dateUtils";
import { calculateTrend } from "../utils/trendUtils";
import TrendIndicator from "../components/TrendIndicator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type SortField = keyof BodyCompositionRecord;
type SortDirection = "asc" | "desc";

const DashboardHome = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<BodyCompositionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [editingRecord, setEditingRecord] =
    useState<BodyCompositionRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    recordId: string | null;
  }>({ isOpen: false, recordId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateBodyCompositionRequest>({
    date: Math.floor(Date.now() / 1000), // Current date as Unix timestamp (seconds)
    weight: 0,
    bodyFatPercentage: 0,
    muscleMassPercentage: 0,
    muscleMass: 0,
    subcutaneousFat: 0,
    visceralFat: 0,
    bodyHydration: 0,
    skeletalMuscle: 0,
    boneMass: 0,
    protein: 0,
    bmi: 0,
    bmr: 0,
    metabolicAge: 0,
  });

  type NumericField = Exclude<keyof CreateBodyCompositionRequest, "date">;
  const numericFields: NumericField[] = [
    "weight",
    "bodyFatPercentage",
    "muscleMassPercentage",
    "muscleMass",
    "subcutaneousFat",
    "visceralFat",
    "bodyHydration",
    "skeletalMuscle",
    "boneMass",
    "protein",
    "bmi",
    "bmr",
    "metabolicAge",
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [inputValues, setInputValues] = useState<Record<NumericField, string>>({
    weight: "",
    bodyFatPercentage: "",
    muscleMassPercentage: "",
    muscleMass: "",
    subcutaneousFat: "",
    visceralFat: "",
    bodyHydration: "",
    skeletalMuscle: "",
    boneMass: "",
    protein: "",
    bmi: "",
    bmr: "",
    metabolicAge: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const records = await fetchBodyComposition();
        setData(records);
      } catch (err: any) {
        setError(err.message || "Failed to load body composition data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle numeric values
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle string values
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default descending direction
      setSortField(field);
      setSortDirection("desc");
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Helper to get previous record for a given record (chronologically previous)
  // We need to find the previous record by date, not by current sort order
  const getPreviousRecord = (
    currentRecord: BodyCompositionRecord
  ): BodyCompositionRecord | null => {
    // Sort by date descending to find chronological previous
    const dateSorted = [...sortedData].sort((a, b) => b.date - a.date);
    const currentIndex = dateSorted.findIndex((r) => r.id === currentRecord.id);
    if (currentIndex >= 0 && currentIndex < dateSorted.length - 1) {
      return dateSorted[currentIndex + 1];
    }
    return null;
  };

  // Sort header component
  const SortableHeader = ({
    field,
    label,
    className = "",
  }: {
    field: SortField;
    label: string;
    className?: string;
  }) => {
    const isActive = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className={`${className} cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group`}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <div className="flex flex-col">
            {isActive ? (
              sortDirection === "asc" ? (
                <ChevronUpIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              )
            ) : (
              <div className="flex flex-col opacity-0 group-hover:opacity-50 transition-opacity">
                <ChevronUpIcon className="h-3 w-3 text-gray-400 dark:text-gray-500 -mb-1" />
                <ChevronDownIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </th>
    );
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  // Handle form input changes (string-based, no coercion while typing)
  const handleInputChange = (field: NumericField, value: string) => {
    setInputValues((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev } as { [key: string]: string };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Removed handleFieldBlur; values are committed on submit

  // Handle date change
  const handleDateChange = (dateString: string) => {
    if (dateString) {
      const date = new Date(dateString);
      // Store as seconds (Unix timestamp) for API
      const timestamp = Math.floor(date.getTime() / 1000);
      setFormData((prev) => ({ ...prev, date: timestamp }));
      if (formErrors.date) {
        setFormErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.date;
          return newErrors;
        });
      }
    }
  };

  // Format date for date input (YYYY-MM-DD)
  const formatDateForInput = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Validate form
  const validateForm = (
    data: CreateBodyCompositionRequest = formData
  ): boolean => {
    const errors: { [key: string]: string } = {};

    if (!data.date || data.date === 0) {
      errors.date = "Date is required";
    }

    if (!data.weight || data.weight <= 0) {
      errors.weight = "Weight is required and must be greater than 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Build committed data from input strings
    const committed: CreateBodyCompositionRequest = {
      ...formData,
      ...numericFields.reduce((acc, field) => {
        const raw = inputValues[field].trim();
        const normalized = raw.replace(",", ".");
        const parsed =
          normalized === "" || normalized === "-" ? 0 : Number(normalized);
        (acc as any)[field] = isNaN(parsed)
          ? (formData as any)[field]
          : parseFloat(parsed.toFixed(2));
        return acc;
      }, {} as Partial<CreateBodyCompositionRequest>),
    };

    if (!validateForm(committed)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRecord) {
        await updateBodyComposition(editingRecord.id, committed);
      } else {
        await createBodyComposition(committed);
      }
      // Refresh data
      const records = await fetchBodyComposition();
      setData(records);
      // Close modal and reset form
      setIsModalOpen(false);
      setFormData({
        date: Math.floor(Date.now() / 1000),
        weight: 0,
        bodyFatPercentage: 0,
        muscleMassPercentage: 0,
        muscleMass: 0,
        subcutaneousFat: 0,
        visceralFat: 0,
        bodyHydration: 0,
        skeletalMuscle: 0,
        boneMass: 0,
        protein: 0,
        bmi: 0,
        bmr: 0,
        metabolicAge: 0,
      });
      setFormErrors({});
    } catch (err: any) {
      setFormErrors({
        submit:
          err.message ||
          (editingRecord
            ? "Failed to update record"
            : "Failed to create record"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormErrors({});
    // Reset form to default values
    setFormData({
      date: Math.floor(Date.now() / 1000),
      weight: 0,
      bodyFatPercentage: 0,
      muscleMassPercentage: 0,
      muscleMass: 0,
      subcutaneousFat: 0,
      visceralFat: 0,
      bodyHydration: 0,
      skeletalMuscle: 0,
      boneMass: 0,
      protein: 0,
      bmi: 0,
      bmr: 0,
      metabolicAge: 0,
    });
    // Reset input strings
    setInputValues({
      weight: "",
      bodyFatPercentage: "",
      muscleMassPercentage: "",
      muscleMass: "",
      subcutaneousFat: "",
      visceralFat: "",
      bodyHydration: "",
      skeletalMuscle: "",
      boneMass: "",
      protein: "",
      bmi: "",
      bmr: "",
      metabolicAge: "",
    });
  };

  // Handle edit record
  const handleEditRecord = (record: BodyCompositionRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      weight: parseFloat(record.weight.toFixed(2)),
      bodyFatPercentage: parseFloat(record.bodyFatPercentage.toFixed(2)),
      muscleMassPercentage: parseFloat(record.muscleMassPercentage.toFixed(2)),
      muscleMass: parseFloat(record.muscleMass.toFixed(2)),
      subcutaneousFat: parseFloat(record.subcutaneousFat.toFixed(2)),
      visceralFat: parseFloat(record.visceralFat.toFixed(2)),
      bodyHydration: parseFloat(record.bodyHydration.toFixed(2)),
      skeletalMuscle: parseFloat(record.skeletalMuscle.toFixed(2)),
      boneMass: parseFloat(record.boneMass.toFixed(2)),
      protein: parseFloat(record.protein.toFixed(2)),
      bmi: parseFloat(record.bmi.toFixed(2)),
      bmr: parseFloat(record.bmr.toFixed(2)),
      metabolicAge: parseFloat(record.metabolicAge.toFixed(2)),
    });
    setInputValues({
      weight: record.weight ? String(parseFloat(record.weight.toFixed(2))) : "",
      bodyFatPercentage: record.bodyFatPercentage
        ? String(parseFloat(record.bodyFatPercentage.toFixed(2)))
        : "",
      muscleMassPercentage: record.muscleMassPercentage
        ? String(parseFloat(record.muscleMassPercentage.toFixed(2)))
        : "",
      muscleMass: record.muscleMass
        ? String(parseFloat(record.muscleMass.toFixed(2)))
        : "",
      subcutaneousFat: record.subcutaneousFat
        ? String(parseFloat(record.subcutaneousFat.toFixed(2)))
        : "",
      visceralFat: record.visceralFat
        ? String(parseFloat(record.visceralFat.toFixed(2)))
        : "",
      bodyHydration: record.bodyHydration
        ? String(parseFloat(record.bodyHydration.toFixed(2)))
        : "",
      skeletalMuscle: record.skeletalMuscle
        ? String(parseFloat(record.skeletalMuscle.toFixed(2)))
        : "",
      boneMass: record.boneMass
        ? String(parseFloat(record.boneMass.toFixed(2)))
        : "",
      protein: record.protein
        ? String(parseFloat(record.protein.toFixed(2)))
        : "",
      bmi: record.bmi ? String(parseFloat(record.bmi.toFixed(2))) : "",
      bmr: record.bmr ? String(parseFloat(record.bmr.toFixed(2))) : "",
      metabolicAge: record.metabolicAge
        ? String(parseFloat(record.metabolicAge.toFixed(2)))
        : "",
    });
    setIsModalOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (recordId: string) => {
    setDeleteConfirm({ isOpen: true, recordId });
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, recordId: null });
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.recordId) return;

    setIsDeleting(true);
    try {
      await deleteBodyComposition(deleteConfirm.recordId);
      // Refresh data
      const records = await fetchBodyComposition();
      setData(records);
      setDeleteConfirm({ isOpen: false, recordId: null });
    } catch (err: any) {
      setFormErrors({ submit: err.message || "Failed to delete record" });
      setDeleteConfirm({ isOpen: false, recordId: null });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Dashboard
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Dashboard
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        {/* Mobile Sort Dropdown */}
        <div className="md:hidden">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort by:
          </label>
          <select
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split("-") as [
                SortField,
                SortDirection
              ];
              setSortField(field);
              setSortDirection(direction);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date-desc">Date (Newest First)</option>
            <option value="date-asc">Date (Oldest First)</option>
            <option value="weight-desc">Weight (High to Low)</option>
            <option value="weight-asc">Weight (Low to High)</option>
            <option value="bodyFatPercentage-desc">
              Body Fat % (High to Low)
            </option>
            <option value="bodyFatPercentage-asc">
              Body Fat % (Low to High)
            </option>
            <option value="muscleMassPercentage-desc">
              Muscle Mass % (High to Low)
            </option>
            <option value="muscleMassPercentage-asc">
              Muscle Mass % (Low to High)
            </option>
            <option value="muscleMass-desc">Muscle Mass (High to Low)</option>
            <option value="muscleMass-asc">Muscle Mass (Low to High)</option>
            <option value="subcutaneousFat-desc">
              Subcutaneous Fat (High to Low)
            </option>
            <option value="subcutaneousFat-asc">
              Subcutaneous Fat (Low to High)
            </option>
            <option value="visceralFat-desc">Visceral Fat (High to Low)</option>
            <option value="visceralFat-asc">Visceral Fat (Low to High)</option>
            <option value="skeletalMuscle-desc">
              Skeletal Muscle % (High to Low)
            </option>
            <option value="skeletalMuscle-asc">
              Skeletal Muscle % (Low to High)
            </option>
            <option value="boneMass-desc">Bone Mass % (High to Low)</option>
            <option value="boneMass-asc">Bone Mass % (Low to High)</option>
            <option value="protein-desc">Protein (High to Low)</option>
            <option value="protein-asc">Protein (Low to High)</option>
            <option value="bmi-desc">BMI (High to Low)</option>
            <option value="bmi-asc">BMI (Low to High)</option>
            <option value="bmr-desc">BMR (High to Low)</option>
            <option value="bmr-asc">BMR (Low to High)</option>
            <option value="metabolicAge-desc">
              Metabolic Age (High to Low)
            </option>
            <option value="metabolicAge-asc">
              Metabolic Age (Low to High)
            </option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <SortableHeader
                  field="date"
                  label="Date"
                  className="sticky left-0 z-20 bg-gray-50 dark:bg-gray-900 px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-[95px]"
                />
                <SortableHeader
                  field="weight"
                  label="Weight"
                  className="sticky left-[95px] z-20 bg-gray-50 dark:bg-gray-900 px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-[70px]"
                />
                <SortableHeader
                  field="bodyFatPercentage"
                  label="Body Fat %"
                  className="sticky left-[165px] z-20 bg-gray-50 dark:bg-gray-900 px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-[70px]"
                />
                <SortableHeader
                  field="muscleMassPercentage"
                  label="Muscle Mass %"
                  className="sticky left-[235px] z-20 bg-gray-50 dark:bg-gray-900 px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700 w-[70px]"
                />
                <SortableHeader
                  field="muscleMass"
                  label="Muscle Mass"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="subcutaneousFat"
                  label="Subcutaneous Fat %"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="visceralFat"
                  label="Visceral Fat %"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="skeletalMuscle"
                  label="Skeletal Muscle %"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="boneMass"
                  label="Bone Mass %"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="protein"
                  label="Protein"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="bmi"
                  label="BMI"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="bmr"
                  label="BMR"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <SortableHeader
                  field="metabolicAge"
                  label="Metabolic Age"
                  className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[70px]"
                />
                <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-[65px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedData.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 w-[95px]">
                    {formatDate(record.date)}
                  </td>
                  <td className="sticky left-[95px] z-10 bg-white dark:bg-gray-800 px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 w-[70px]">
                    <span className="flex items-center">
                      {record.weight}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "weight"
                        )}
                      />
                    </span>
                  </td>
                  <td className="sticky left-[165px] z-10 bg-white dark:bg-gray-800 px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 w-[70px]">
                    <span className="flex items-center">
                      {record.bodyFatPercentage}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "bodyFatPercentage"
                        )}
                      />
                    </span>
                  </td>
                  <td className="sticky left-[235px] z-10 bg-white dark:bg-gray-800 px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-700 w-[70px]">
                    <span className="flex items-center">
                      {record.muscleMassPercentage}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "muscleMassPercentage"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.muscleMass}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "muscleMass"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.subcutaneousFat}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "subcutaneousFat"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.visceralFat}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "visceralFat"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.skeletalMuscle}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "skeletalMuscle"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.boneMass}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "boneMass"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.protein}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "protein"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.bmi}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "bmi"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.bmr}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "bmr"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[70px]">
                    <span className="flex items-center">
                      {record.metabolicAge}
                      <TrendIndicator
                        trend={calculateTrend(
                          record,
                          getPreviousRecord(record),
                          "metabolicAge"
                        )}
                      />
                    </span>
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-sm text-gray-900 dark:text-white w-[65px]">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-1.5 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        aria-label="Edit record"
                        title="Edit record"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(record.id)}
                        className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Delete record"
                        title="Delete record"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {paginatedData.map((record) => (
          <div
            key={record.id}
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-shadow"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xl font-bold text-white">
                    {formatDate(record.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-right">
                    <p className="text-3xl font-bold text-white leading-none">
                      {record.weight}{" "}
                      <span className="text-lg text-indigo-100/90 font-semibold uppercase tracking-wide">
                        kg
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditRecord(record)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Edit record"
                      title="Edit record"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(record.id)}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Delete record"
                      title="Delete record"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Body Fat % */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200/50 dark:border-red-800/50">
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">
                    Body Fat %
                  </p>
                  <p className="text-xl font-bold text-red-700 dark:text-red-300 flex items-center">
                    {record.bodyFatPercentage}
                    <span className="text-sm ml-1">%</span>
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "bodyFatPercentage"
                      )}
                    />
                  </p>
                </div>

                {/* Muscle Mass % */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200/50 dark:border-green-800/50">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">
                    Muscle Mass %
                  </p>
                  <p className="text-xl font-bold text-green-700 dark:text-green-300 flex items-center">
                    {record.muscleMassPercentage}
                    <span className="text-sm ml-1">%</span>
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "muscleMassPercentage"
                      )}
                    />
                  </p>
                </div>

                {/* Muscle Mass */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Muscle Mass
                  </p>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center">
                    {record.muscleMass}
                    <span className="text-xs ml-1">kg</span>
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "muscleMass"
                      )}
                    />
                  </p>
                </div>

                {/* BMI */}
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/50">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                    BMI
                  </p>
                  <p className="text-lg font-bold text-amber-700 dark:text-amber-300 flex items-center">
                    {record.bmi}
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "bmi"
                      )}
                    />
                  </p>
                </div>

                {/* Subcutaneous Fat % */}
                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 border border-pink-200/50 dark:border-pink-800/50">
                  <p className="text-xs text-pink-600 dark:text-pink-400 font-medium mb-1">
                    Subcutaneous Fat %
                  </p>
                  <p className="text-lg font-bold text-pink-700 dark:text-pink-300 flex items-center">
                    {record.subcutaneousFat}
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "subcutaneousFat"
                      )}
                    />
                  </p>
                </div>

                {/* Visceral Fat % */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-200/50 dark:border-orange-800/50">
                  <p className="text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
                    Visceral Fat %
                  </p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-300 flex items-center">
                    {record.visceralFat}
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "visceralFat"
                      )}
                    />
                  </p>
                </div>

                {/* Skeletal Muscle % */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200/50 dark:border-purple-800/50">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
                    Skeletal Muscle
                  </p>
                  <p className="text-lg font-bold text-purple-700 dark:text-purple-300 flex items-center">
                    {record.skeletalMuscle}
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "skeletalMuscle"
                      )}
                    />
                  </p>
                </div>

                {/* Bone Mass */}
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl p-3 border border-teal-200/50 dark:border-teal-800/50">
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-medium mb-1">
                    Bone Mass
                  </p>
                  <p className="text-lg font-bold text-teal-700 dark:text-teal-300 flex items-center">
                      {record.boneMass}
                    <span className="text-xs ml-1">%</span>
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "boneMass"
                      )}
                    />
                  </p>
                </div>

                {/* Protein */}
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-200/50 dark:border-indigo-800/50">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">
                    Protein
                  </p>
                  <p className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                    {record.protein}
                    <span className="text-xs ml-1">%</span>
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "protein"
                      )}
                    />
                  </p>
                </div>

                {/* BMR */}
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3 border border-cyan-200/50 dark:border-cyan-800/50">
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium mb-1">
                    BMR
                  </p>
                  <p className="text-lg font-bold text-cyan-700 dark:text-cyan-300 flex items-center">
                    {record.bmr}
                    <span className="text-xs ml-1">kcal</span>
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "bmr"
                      )}
                    />
                  </p>
                </div>

                {/* Metabolic Age */}
                <div className="col-span-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 border border-gray-300/50 dark:border-gray-600/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">
                    Metabolic Age
                  </p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    {record.metabolicAge}
                    <span className="text-sm ml-1 font-normal text-gray-600 dark:text-gray-400">
                      years
                    </span>
                    <TrendIndicator
                      trend={calculateTrend(
                        record,
                        getPreviousRecord(record),
                        "metabolicAge"
                      )}
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {sortedData.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show:
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              of {sortedData.length} records
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page{" "}
              <select
                value={currentPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white mx-1"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  )
                )}
              </select>{" "}
              of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {sortedData.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No body composition records found.
          </p>
        </div>
      )}

      {/* Chart Section */}
      {sortedData.length > 0 &&
        (() => {
          const latestRecord = sortedData[0]; // Most recent record
          const boneMassPercentage = latestRecord.boneMass;
          const otherPercentage = Math.max(
            0,
            100 -
              latestRecord.bodyFatPercentage -
              latestRecord.muscleMassPercentage -
              latestRecord.bodyHydration -
              boneMassPercentage
          );

          const compositionData = [
            {
              name: "Muscle Mass",
              value: latestRecord.muscleMassPercentage,
              color: "#10b981",
            },
            {
              name: "Water",
              value: latestRecord.bodyHydration,
              color: "#3b82f6",
            },
            {
              name: "Body Fat",
              value: latestRecord.bodyFatPercentage,
              color: "#ef4444",
            },
            { name: "Other", value: otherPercentage, color: "#8b5cf6" },
            { name: "Bone Mass", value: boneMassPercentage, color: "#f59e0b" },
          ].filter((item) => item.value > 0); // Filter out zero or negative values

          return (
            <div className="mt-8">
              {/* Desktop View: Side by Side */}
              <div className="hidden md:flex gap-6">
                {/* Line Chart - 50% width */}
                <div className="w-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">
                    Body Composition Trends
                  </h2>
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
                  <div
                    className="w-full"
                    style={{ height: "350px", minHeight: "300px" }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[...sortedData]
                          .sort((a, b) => a.date - b.date)
                          .map((record) => ({
                            date: formatDate(record.date),
                            dateValue: record.date,
                            weight: Number(record.weight.toFixed(1)),
                            bodyFatPercentage: Number(
                              record.bodyFatPercentage.toFixed(1)
                            ),
                            muscleMassPercentage: Number(
                              record.muscleMassPercentage.toFixed(1)
                            ),
                          }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorWeight"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorBodyFat"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorMuscleMass"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          className="dark:stroke-gray-700"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          style={{ fontSize: "11px" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={Math.max(
                            0,
                            Math.floor(sortedData.length / 8)
                          )}
                          tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#6b7280"
                          style={{ fontSize: "12px" }}
                          label={{
                            value: "Weight (kg)",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle", fill: "#6b7280" },
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#6b7280"
                          style={{ fontSize: "12px" }}
                          label={{
                            value: "Percentage (%)",
                            angle: 90,
                            position: "insideRight",
                            style: { textAnchor: "middle", fill: "#6b7280" },
                          }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-4 min-w-[220px] z-50">
                                  <p className="font-bold text-base text-gray-900 dark:text-white mb-3 border-b-2 border-gray-300 dark:border-gray-600 pb-2">
                                    {label}
                                  </p>
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-sm"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Weight:
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.weight} kg
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Body Fat %:
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.bodyFatPercentage}%
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Muscle Mass %:
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.muscleMassPercentage}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{
                            stroke: "#6b7280",
                            strokeWidth: 1,
                            strokeDasharray: "3 3",
                          }}
                          wrapperStyle={{ zIndex: 1000 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="weight"
                          stroke="#6366f1"
                          strokeWidth={3}
                          dot={{
                            fill: "#6366f1",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 7,
                            stroke: "#6366f1",
                            strokeWidth: 3,
                            fill: "#fff",
                          }}
                          name="Weight (kg)"
                          animationDuration={300}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="bodyFatPercentage"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{
                            fill: "#ef4444",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 7,
                            stroke: "#ef4444",
                            strokeWidth: 3,
                            fill: "#fff",
                          }}
                          name="Body Fat %"
                          animationDuration={300}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="muscleMassPercentage"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{
                            fill: "#10b981",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 7,
                            stroke: "#10b981",
                            strokeWidth: 3,
                            fill: "#fff",
                          }}
                          name="Muscle Mass %"
                          animationDuration={300}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart - 50% width */}
                <div className="w-1/2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 md:p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span>
                    Body Composition Breakdown
                  </h2>
                  <div
                    className="w-full"
                    style={{ height: "350px", minHeight: "300px" }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={compositionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(1)}%`
                          }
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={300}
                        >
                          {compositionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0];
                              return (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3">
                                  <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {data.name}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Value:{" "}
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {Number(
                                        (data as any)?.value ?? 0
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Percentage:{" "}
                                    <span className="font-bold text-gray-900 dark:text-white">
                                      {Number(
                                        ((data as any)?.payload?.percent ?? 0) *
                                          100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Mobile View: Stacked */}
              <div className="md:hidden flex flex-col gap-6 mt-6">
                {/* Line Chart - Full width */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Body Composition Trends
                  </h2>
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
                  <div
                    className="w-full"
                    style={{ height: "350px", minHeight: "300px" }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={[...sortedData]
                          .sort((a, b) => a.date - b.date)
                          .map((record) => ({
                            date: formatDate(record.date),
                            dateValue: record.date,
                            weight: Number(record.weight.toFixed(1)),
                            bodyFatPercentage: Number(
                              record.bodyFatPercentage.toFixed(1)
                            ),
                            muscleMassPercentage: Number(
                              record.muscleMassPercentage.toFixed(1)
                            ),
                          }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorWeightMobile"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorBodyFatMobile"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorMuscleMassMobile"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          className="dark:stroke-gray-700"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          style={{ fontSize: "11px" }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={Math.max(
                            0,
                            Math.floor(sortedData.length / 8)
                          )}
                          tick={{ fill: "#6b7280" }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#6b7280"
                          style={{ fontSize: "12px" }}
                          label={{
                            value: "Weight (kg)",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle", fill: "#6b7280" },
                          }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#6b7280"
                          style={{ fontSize: "12px" }}
                          label={{
                            value: "Percentage (%)",
                            angle: 90,
                            position: "insideRight",
                            style: { textAnchor: "middle", fill: "#6b7280" },
                          }}
                        />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 p-4 min-w-[220px] z-50">
                                  <p className="font-bold text-base text-gray-900 dark:text-white mb-3 border-b-2 border-gray-300 dark:border-gray-600 pb-2">
                                    {label}
                                  </p>
                                  <div className="space-y-2.5">
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-indigo-500 shadow-sm"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Weight:
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.weight} kg
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-sm"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Body Fat %:
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.bodyFatPercentage}%
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-green-500 shadow-sm"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          Muscle Mass %:
                                        </span>
                                      </div>
                                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {data.muscleMassPercentage}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{
                            stroke: "#6b7280",
                            strokeWidth: 1,
                            strokeDasharray: "3 3",
                          }}
                          wrapperStyle={{ zIndex: 1000 }}
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="weight"
                          stroke="#6366f1"
                          strokeWidth={3}
                          dot={{
                            fill: "#6366f1",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 7,
                            stroke: "#6366f1",
                            strokeWidth: 3,
                            fill: "#fff",
                          }}
                          name="Weight (kg)"
                          animationDuration={300}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="bodyFatPercentage"
                          stroke="#ef4444"
                          strokeWidth={3}
                          dot={{
                            fill: "#ef4444",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 7,
                            stroke: "#ef4444",
                            strokeWidth: 3,
                            fill: "#fff",
                          }}
                          name="Body Fat %"
                          animationDuration={300}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="muscleMassPercentage"
                          stroke="#10b981"
                          strokeWidth={3}
                          dot={{
                            fill: "#10b981",
                            r: 4,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{
                            r: 7,
                            stroke: "#10b981",
                            strokeWidth: 3,
                            fill: "#fff",
                          }}
                          name="Muscle Mass %"
                          animationDuration={300}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pie Chart - Full width */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></span>
                    Body Composition Breakdown
                  </h2>
                  <div
                    className="w-full"
                    style={{ height: "380px", minHeight: "380px" }}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <Pie
                          data={compositionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          innerRadius={70}
                          outerRadius={130}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={300}
                          paddingAngle={2}
                          activeIndex={activeIndex ?? undefined}
                          activeShape={(props: any) => {
                            const entry = props.payload;
                            if (!entry) return <g></g>;
                            
                            const borderColor = "#fff";
                            const textColor = theme === "dark" ? "#fff" : "#1f2937";
                            
                            return (
                              <g>
                                <Sector
                                  cx={props.cx}
                                  cy={props.cy}
                                  innerRadius={props.innerRadius}
                                  outerRadius={props.outerRadius + 8}
                                  startAngle={props.startAngle}
                                  endAngle={props.endAngle}
                                  fill={entry.color || "#8884d8"}
                                  stroke={borderColor}
                                  strokeWidth={3}
                                  opacity={1}
                                />
                                <text
                                  x={props.cx}
                                  y={props.cy - 8}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  className="font-bold text-sm"
                                  fill={textColor}
                                >
                                  {entry.name}
                                </text>
                                <text
                                  x={props.cx}
                                  y={props.cy + 12}
                                  textAnchor="middle"
                                  dominantBaseline="central"
                                  className="font-semibold text-base"
                                  fill={textColor}
                                >
                                  {Number(entry.value || 0).toFixed(1)}%
                                </text>
                              </g>
                            );
                          }}
                          onClick={(_data: any, index: number) => {
                            try {
                              if (index !== undefined && index !== null) {
                                setActiveIndex(activeIndex === index ? null : index);
                              }
                            } catch (error) {
                              console.error("Error in onClick:", error);
                            }
                          }}
                        >
                          {compositionData.map((entry, index) => (
                            <Cell
                              key={`cell-mobile-${index}`}
                              fill={entry.color}
                              style={{ cursor: 'pointer' }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Mobile Legend */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {compositionData.map((entry, index) => (
                        <div key={`legend-mobile-${index}`} className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: entry.color }}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{entry.name}</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              {Number(entry.value).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => {
          setEditingRecord(null);
          setFormData({
            date: Math.floor(Date.now() / 1000),
            weight: 0,
            bodyFatPercentage: 0,
            muscleMassPercentage: 0,
            muscleMass: 0,
            subcutaneousFat: 0,
            visceralFat: 0,
            bodyHydration: 0,
            skeletalMuscle: 0,
            boneMass: 0,
            protein: 0,
            bmi: 0,
            bmr: 0,
            metabolicAge: 0,
          });
          setInputValues({
            weight: "",
            bodyFatPercentage: "",
            muscleMassPercentage: "",
            muscleMass: "",
            subcutaneousFat: "",
            visceralFat: "",
            bodyHydration: "",
            skeletalMuscle: "",
            boneMass: "",
            protein: "",
            bmi: "",
            bmr: "",
            metabolicAge: "",
          });
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16"
        aria-label="Add new record"
      >
        <PlusIcon className="w-6 h-6 md:w-8 md:h-8" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingRecord ? "Edit Record" : "Add New Record"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {editingRecord
                  ? "Update the fields below and click Update to save your changes."
                  : "Fill in the fields below and click Save to add a new record."}
              </p>
              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {formErrors.submit}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formatDateForInput(formData.date)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.date
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    required
                  />
                  {formData.date && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Selected date:{" "}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getFormattedDateFromTimestamp(formData.date)}
                      </span>
                    </p>
                  )}
                  {formErrors.date && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.date}
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inputValues.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      formErrors.weight
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="0.0"
                    inputMode="decimal"
                    required
                  />
                  {formErrors.weight && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {formErrors.weight}
                    </p>
                  )}
                </div>

                {/* Body Fat % */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Body Fat %
                  </label>
                  <input
                    type="text"
                    value={inputValues.bodyFatPercentage}
                    onChange={(e) =>
                      handleInputChange("bodyFatPercentage", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Muscle Mass % */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Muscle Mass %
                  </label>
                  <input
                    type="text"
                    value={inputValues.muscleMassPercentage}
                    onChange={(e) =>
                      handleInputChange("muscleMassPercentage", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Muscle Mass */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Muscle Mass (kg)
                  </label>
                  <input
                    type="text"
                    value={inputValues.muscleMass}
                    onChange={(e) =>
                      handleInputChange("muscleMass", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Subcutaneous Fat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subcutaneous Fat
                  </label>
                  <input
                    type="text"
                    value={inputValues.subcutaneousFat}
                    onChange={(e) =>
                      handleInputChange("subcutaneousFat", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Visceral Fat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Visceral Fat
                  </label>
                  <input
                    type="text"
                    value={inputValues.visceralFat}
                    onChange={(e) =>
                      handleInputChange("visceralFat", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Body Hydration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Body Hydration %
                  </label>
                  <input
                    type="text"
                    value={inputValues.bodyHydration}
                    onChange={(e) =>
                      handleInputChange("bodyHydration", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Skeletal Muscle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Skeletal Muscle %
                  </label>
                  <input
                    type="text"
                    value={inputValues.skeletalMuscle}
                    onChange={(e) =>
                      handleInputChange("skeletalMuscle", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Bone Mass % */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bone Mass %
                  </label>
                  <input
                    type="text"
                    value={inputValues.boneMass}
                    onChange={(e) =>
                      handleInputChange("boneMass", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Protein */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Protein %
                  </label>
                  <input
                    type="text"
                    value={inputValues.protein}
                    onChange={(e) =>
                      handleInputChange("protein", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* BMI */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    BMI
                  </label>
                  <input
                    type="text"
                    value={inputValues.bmi}
                    onChange={(e) => handleInputChange("bmi", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* BMR */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    BMR (kcal)
                  </label>
                  <input
                    type="text"
                    value={inputValues.bmr}
                    onChange={(e) => handleInputChange("bmr", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>

                {/* Metabolic Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Metabolic Age (years)
                  </label>
                  <input
                    type="text"
                    value={inputValues.metabolicAge}
                    onChange={(e) =>
                      handleInputChange("metabolicAge", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="0.0"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? editingRecord
                      ? "Updating..."
                      : "Saving..."
                    : editingRecord
                    ? "Update"
                    : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Confirm Delete
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this record? This action cannot
                be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
