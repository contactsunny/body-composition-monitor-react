import { HealthStatus, getStatusConfig } from '../utils/healthUtils';

interface HealthIndicatorProps {
  status: HealthStatus;
  showLabel?: boolean;
  className?: string;
}

const HealthIndicator = ({ status, showLabel = false, className = '' }: HealthIndicatorProps) => {
  const config = getStatusConfig(status);
  if (!config) return null;
  
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span 
        className={`w-2 h-2 rounded-full flex-shrink-0 ${config.bgClass}`} 
        style={{ backgroundColor: config.hexColor }}
        title={config.label}
      />
      {showLabel && (
        <span 
          className={`text-xs font-medium ${config.colorClass}`}
          style={{ color: config.hexColor }}
        >
          {config.label}
        </span>
      )}
    </div>


  );
};


export default HealthIndicator;
