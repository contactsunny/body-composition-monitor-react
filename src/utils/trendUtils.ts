import { BodyCompositionRecord } from '../services/bodyCompositionService';

export type TrendDirection = 'up' | 'down' | 'same';

export interface TrendIndicator {
  direction: TrendDirection;
  isGood: boolean; // true = green, false = red
  value: number;
  previousValue: number | null;
}

/**
 * Determine if a trend is good or bad based on the metric
 * Lower is better: Body Fat %, Subcutaneous Fat, Visceral Fat, BMI, Metabolic Age, Weight
 * Higher is better: Muscle Mass %, Muscle Mass, Skeletal Muscle, Bone Mass, Protein, Body Hydration, BMR
 */
const isMetricIncreaseGood = (metric: string): boolean => {
  const lowerIsBetter = [
    'bodyFatPercentage',
    'subcutaneousFat',
    'visceralFat',
    'bmi',
    'metabolicAge',
    'weight',
  ];
  
  return !lowerIsBetter.includes(metric);
};

/**
 * Calculate trend indicator for a metric
 */
export const calculateTrend = (
  current: BodyCompositionRecord,
  previous: BodyCompositionRecord | null,
  metric: keyof BodyCompositionRecord
): TrendIndicator => {
  if (!previous) {
    return {
      direction: 'same',
      isGood: true,
      value: current[metric] as number,
      previousValue: null,
    };
  }

  const currentValue = current[metric] as number;
  const previousValue = previous[metric] as number;
  const difference = currentValue - previousValue;
  const threshold = 0.01; // Small threshold to avoid floating point issues

  let direction: TrendDirection = 'same';
  if (Math.abs(difference) < threshold) {
    direction = 'same';
  } else if (difference > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  const isGood = isMetricIncreaseGood(metric as string)
    ? direction === 'up'
    : direction === 'down';

  return {
    direction,
    isGood,
    value: currentValue,
    previousValue,
  };
};

