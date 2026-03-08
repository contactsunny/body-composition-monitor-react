export type HealthStatus = 'vlow' | 'low' | 'normal' | 'high' | 'vhigh' | 'obese';

export interface HealthClassification {
  status: HealthStatus;
  label: string;
  colorClass: string;
  bgClass: string;
  softBgClass: string;
  softBorderClass: string;
  hexColor: string;
}

export interface RangeSegment {
  min: number | null;
  max: number | null;
  status: HealthStatus;
  color: string;
  label: string;
}

export interface MetricMetadata {
  unit: string;
  description: string;
  ranges: {
    M: RangeSegment[];
    F: RangeSegment[];
  };
}




export const getStatusConfig = (status: HealthStatus): HealthClassification => {
  switch (status) {
    case 'vlow':
      return { 
        status, 
        label: 'Very Low', 
        colorClass: 'text-red-500 dark:text-red-400',
        bgClass: 'bg-red-500 dark:bg-red-400',
        softBgClass: 'bg-red-50 dark:bg-red-900/20',
        softBorderClass: 'border-red-100 dark:border-red-800/30',
        hexColor: '#ef4444'
      };
    case 'low':
      return { 
        status, 
        label: 'Low', 
        colorClass: 'text-yellow-500 dark:text-yellow-400',
        bgClass: 'bg-yellow-500 dark:bg-yellow-400',
        softBgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
        softBorderClass: 'border-yellow-100 dark:border-yellow-800/30',
        hexColor: '#eab308'
      };
    case 'normal':
      return { 
        status, 
        label: 'Normal', 
        colorClass: 'text-green-500 dark:text-green-400',
        bgClass: 'bg-green-500 dark:bg-green-400',
        softBgClass: 'bg-green-50 dark:bg-green-900/20',
        softBorderClass: 'border-green-100 dark:border-green-800/30',
        hexColor: '#22c55e'
      };
    case 'high':
      return { 
        status, 
        label: 'High', 
        colorClass: 'text-red-500 dark:text-red-400',
        bgClass: 'bg-red-500 dark:bg-red-400',
        softBgClass: 'bg-red-50 dark:bg-red-900/20',
        softBorderClass: 'border-red-100 dark:border-red-800/30',
        hexColor: '#ef4444'
      };

    case 'vhigh':
    case 'obese':
      return { 
        status, 
        label: status === 'obese' ? 'Obese' : 'Very High', 
        colorClass: 'text-red-500 dark:text-red-400',
        bgClass: 'bg-red-500 dark:bg-red-400',
        softBgClass: 'bg-red-50 dark:bg-red-900/20',
        softBorderClass: 'border-red-100 dark:border-red-800/30',
        hexColor: '#ef4444'
      };
    default:
      return { 
        status: 'normal', 
        label: 'Normal', 
        colorClass: 'text-green-500 dark:text-green-400',
        bgClass: 'bg-green-500 dark:bg-green-400',
        softBgClass: 'bg-green-50 dark:bg-green-900/20',
        softBorderClass: 'border-green-100 dark:border-green-800/30',
        hexColor: '#22c55e'
      };
  }
};




export const getBMICategory = (bmi: number): HealthStatus => {
  if (bmi < 18.5) return 'low';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'high';
  return 'obese';
};

export const getBodyFatCategory = (value: number, gender: string): HealthStatus => {
  if (gender === 'F') {
    if (value < 21) return 'low';
    if (value <= 33) return 'normal';
    if (value <= 39) return 'high';
    return 'vhigh';
  } else {
    // Male
    if (value < 8) return 'low';
    if (value <= 20) return 'normal';
    if (value <= 25) return 'high';
    return 'vhigh';
  }
};

export const getVisceralFatCategory = (value: number): HealthStatus => {
  if (value <= 9) return 'normal';
  if (value <= 14) return 'high';
  return 'vhigh';
};



export const getMuscleMassPercentageCategory = (value: number, gender: string): HealthStatus => {
  if (gender === 'F') {
    if (value < 63) return 'low';
    if (value <= 75) return 'normal';
    return 'high';
  } else {
    if (value < 75) return 'low';
    if (value <= 89) return 'normal';
    return 'high';
  }
};

export const getWaterPercentageCategory = (value: number, gender: string): HealthStatus => {
  if (gender === 'F') {
    if (value < 45) return 'low';
    if (value <= 60) return 'normal';
    return 'high';
  } else {
    if (value < 50) return 'low';
    if (value <= 65) return 'normal';
    return 'high';
  }
};

export const getSkeletalMuscleCategory = (value: number, gender: string): HealthStatus => {
  if (gender === 'F') {
    if (value < 38) return 'low';
    if (value <= 48) return 'normal';
    return 'high';
  } else {
    if (value < 49) return 'low';
    if (value <= 59) return 'normal';
    return 'high';
  }
};

export const getProteinCategory = (value: number): HealthStatus => {
  if (value < 16) return 'low';
  if (value <= 18) return 'normal';
  return 'high';
};


export const getBoneMassCategory = (value: number, gender: string, weight: number): HealthStatus => {
  let target = 0;
  if (gender === 'F') {
    if (weight < 50) target = 1.95;
    else if (weight <= 75) target = 2.40;
    else target = 2.95;
  } else {
    if (weight < 65) target = 2.65;
    else if (weight <= 95) target = 3.29;
    else target = 3.69;
  }

  if (value < target * 0.9) return 'low';
  if (value >= target) return 'normal';
  return 'normal'; // simplified
};

export const getMetabolicAgeCategory = (metabolicAge: number, chronologicalAge: number): HealthStatus => {
  if (metabolicAge <= chronologicalAge) return 'normal';
  if (metabolicAge <= chronologicalAge + 5) return 'normal';
  if (metabolicAge <= chronologicalAge + 15) return 'high';
  return 'vhigh';
};


export const getSubcutaneousFatCategory = (value: number, gender: string): HealthStatus => {
  if (gender === 'F') {
    if (value < 10) return 'low';
    if (value <= 25) return 'normal';
    if (value <= 30) return 'high';
    return 'vhigh';
  } else {
    // Male
    if (value < 5) return 'low';
    if (value <= 15) return 'normal';
    if (value <= 20) return 'high';
    return 'vhigh';
  }
};


export const getBMRCategory = (value: number, gender: string): HealthStatus => {
  const target = gender === 'F' ? 1410 : 1696;
  if (value < target * 0.9) return 'low';
  if (value >= target) return 'normal';
  return 'normal';
};

export const getMetricMetadata = (field: string, currentWeight: number = 70): MetricMetadata => {
  const ranges: MetricMetadata = {
    unit: '',
    description: '',
    ranges: { M: [], F: [] }
  };

  switch (field) {
    case 'bmi':
    case 'weight':
      ranges.unit = field === 'bmi' ? '' : 'kg';
      ranges.description = 'Body Mass Index (BMI) is a measure of body fat based on height and weight.';
      const bmiRanges: RangeSegment[] = [
        { min: 0, max: 18.5, status: 'low' as HealthStatus, color: '#eab308', label: 'Underweight' },
        { min: 18.5, max: 25, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
        { min: 25, max: 30, status: 'high' as HealthStatus, color: '#ef4444', label: 'Overweight' },
        { min: 30, max: 50, status: 'obese' as HealthStatus, color: '#ef4444', label: 'Obese' },
      ];


      ranges.ranges = { M: bmiRanges, F: bmiRanges };
      break;

    case 'bodyFatPercentage':
      ranges.unit = '%';
      ranges.description = 'The total mass of fat divided by total body mass.';
      ranges.ranges = {
        F: [
          { min: 0, max: 21, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 21, max: 33, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 33, max: 39, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
          { min: 39, max: 60, status: 'vhigh' as HealthStatus, color: '#ef4444', label: 'Very High' },
        ],
        M: [
          { min: 0, max: 8, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 8, max: 20, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 20, max: 25, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
          { min: 25, max: 50, status: 'vhigh' as HealthStatus, color: '#ef4444', label: 'Very High' },
        ]
      };


      break;

    case 'visceralFat':
      ranges.unit = '';
      ranges.description = 'Fat stored within the abdominal cavity around several important internal organs.';
      const visceralRanges: RangeSegment[] = [
        { min: 0, max: 9, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Healthy' },
        { min: 9, max: 14, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        { min: 14, max: 30, status: 'vhigh' as HealthStatus, color: '#ef4444', label: 'Very High' },
      ];


      ranges.ranges = { M: visceralRanges, F: visceralRanges };
      break;

    case 'muscleMassPercentage':
    case 'muscleMass':
      ranges.unit = field === 'muscleMass' ? 'kg' : '%';
      ranges.description = 'The weight of muscle in your body.';
      ranges.ranges = {
        F: [
          { min: 0, max: 63, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 63, max: 75, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 75, max: 100, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        ],
        M: [
          { min: 0, max: 75, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 75, max: 89, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 89, max: 100, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        ]
      };


      break;

    case 'bodyHydration':
      ranges.unit = '%';
      ranges.description = 'The total amount of fluid in the body as a percentage of total weight.';
      ranges.ranges = {
        F: [
          { min: 0, max: 45, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 45, max: 60, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 60, max: 100, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        ],
        M: [
          { min: 0, max: 50, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 50, max: 65, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 65, max: 100, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        ]
      };


      break;

    case 'skeletalMuscle':
      ranges.unit = '%';
      ranges.description = 'The muscle that is connected to the skeleton to form part of the mechanical system that moves the limbs.';
      ranges.ranges = {
        F: [
          { min: 0, max: 38, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 38, max: 48, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 48, max: 100, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        ],
        M: [
          { min: 0, max: 49, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 49, max: 59, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 59, max: 100, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        ]
      };


      break;

    case 'protein':
      ranges.unit = '%';
      ranges.description = 'Protein is a key component of muscles, organs, and the immune system.';
      const proteinRanges: RangeSegment[] = [
        { min: 0, max: 16, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
        { min: 16, max: 18, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
        { min: 18, max: 30, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
      ];


      ranges.ranges = { M: proteinRanges, F: proteinRanges };
      break;

    case 'boneMass':
      ranges.unit = 'kg';
      ranges.description = 'The amount of bone mineral (calcium, phosphorus, etc.) in the body.';
      const getBoneRanges = (gender: string) => {
        let target = 0;
        if (gender === 'F') {
          if (currentWeight < 50) target = 1.95;
          else if (currentWeight <= 75) target = 2.40;
          else target = 2.95;
        } else {
          if (currentWeight < 65) target = 2.65;
          else if (currentWeight <= 95) target = 3.29;
          else target = 3.69;
        }
        return [
          { min: 0, max: target * 0.9, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: target * 0.9, max: 6, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
        ];

      };
      ranges.ranges = { M: getBoneRanges('M'), F: getBoneRanges('F') };
      break;

    case 'metabolicAge':
      ranges.unit = 'years';
      ranges.description = 'A comparison of your Basal Metabolic Rate (BMR) to the average BMR of your age group.';
      const metabRanges: RangeSegment[] = [
        { min: 0, max: 25, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Healthy' },
        { min: 25, max: 30, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
        { min: 30, max: 40, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
        { min: 40, max: 100, status: 'vhigh' as HealthStatus, color: '#ef4444', label: 'Very High' },
      ];


      ranges.ranges = { M: metabRanges, F: metabRanges };
      break;

    case 'subcutaneousFat':
      ranges.unit = '%';
      ranges.description = 'Fat stored directly under the skin.';
      ranges.ranges = {
        F: [
          { min: 0, max: 10, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 10, max: 25, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 25, max: 30, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
          { min: 30, max: 60, status: 'vhigh' as HealthStatus, color: '#ef4444', label: 'Very High' },
        ],
        M: [
          { min: 0, max: 5, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 5, max: 15, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
          { min: 15, max: 20, status: 'high' as HealthStatus, color: '#ef4444', label: 'High' },
          { min: 20, max: 50, status: 'vhigh' as HealthStatus, color: '#ef4444', label: 'Very High' },
        ]
      };


      break;

    case 'bmr':
      ranges.unit = 'kcal';
      ranges.description = 'Basal Metabolic Rate: The number of calories your body needs to accomplish its most basic life-sustaining functions.';
      ranges.ranges = {
        F: [
          { min: 0, max: 1410 * 0.9, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 1410 * 0.9, max: 3000, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
        ],
        M: [
          { min: 0, max: 1696 * 0.9, status: 'low' as HealthStatus, color: '#eab308', label: 'Low' },
          { min: 1696 * 0.9, max: 4000, status: 'normal' as HealthStatus, color: '#22c55e', label: 'Normal' },
        ]
      };

      break;
  }

  return ranges;
};


