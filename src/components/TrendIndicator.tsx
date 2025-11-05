import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { TrendIndicator as TrendIndicatorType } from '../utils/trendUtils';

interface TrendIndicatorProps {
  trend: TrendIndicatorType;
}

const TrendIndicator = ({ trend }: TrendIndicatorProps) => {
  if (trend.direction === 'same' || trend.previousValue === null) {
    return null;
  }

  const Icon = trend.direction === 'up' ? ArrowUpIcon : ArrowDownIcon;
  const colorClass = trend.isGood
    ? 'text-green-500 dark:text-green-400'
    : 'text-red-500 dark:text-red-400';

  return (
    <Icon className={`inline-block h-3 w-3 ml-1 ${colorClass}`} />
  );
};

export default TrendIndicator;

