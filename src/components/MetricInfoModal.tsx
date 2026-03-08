import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { getMetricMetadata } from '../utils/healthUtils';


interface MetricInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricField: string;
  metricName: string;
  currentValue: number;
  userGender: string;
  currentWeight?: number;
}

const MetricInfoModal: React.FC<MetricInfoModalProps> = ({
  isOpen,
  onClose,
  metricField,
  metricName,
  currentValue,
  userGender,
  currentWeight
}) => {
  if (!isOpen) return null;

  const metadata = getMetricMetadata(metricField, currentWeight);
  
  const renderScale = (gender: 'M' | 'F') => {
    const segments = metadata.ranges[gender];
    if (segments.length === 0) return null;

    // Boundary for scale visualization
    const minVal = segments[0].min ?? 0;
    const maxVal = segments[segments.length - 1].max ?? 100;
    const totalRange = maxVal - minVal;

    // Calculate marker position
    const isUserGender = gender === userGender;
    let markerPos = -1;
    if (isUserGender) {
      markerPos = ((currentValue - minVal) / totalRange) * 100;
      markerPos = Math.max(0, Math.min(100, markerPos));
    }

    return (
      <div className="mb-10 last:mb-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">
            {gender === 'M' ? 'Male Standards' : 'Female Standards'}
            {isUserGender && <span className="ml-3 text-[10px] font-bold text-white bg-indigo-600 px-2 py-0.5 rounded shadow-sm">YOUR STATUS</span>}
          </h4>
        </div>
        
        {/* The Scale with Numbers */}
        <div className="relative pt-8 pb-12">
          <div className="relative h-8 w-full flex rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            {segments.map((segment, idx) => {
              const start = segment.min ?? minVal;
              const end = segment.max ?? maxVal;
              const width = ((end - start) / totalRange) * 100;
              
              return (
                <React.Fragment key={idx}>
                  <div 
                    style={{ 
                      width: `${width}%`, 
                      backgroundColor: segment.color,
                    }}
                    className={`h-full relative flex items-center justify-center ${idx === 0 ? 'rounded-l-xl' : ''} ${idx === segments.length - 1 ? 'rounded-r-xl' : ''}`}
                  >
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter truncate px-1">
                      {segment.label}
                    </span>
                  </div>

                  {/* Boundary Number (at the start of each segment) */}
                  <div 
                    className="absolute -top-6 flex flex-col items-center z-10"
                    style={{ 
                      left: `${((start - minVal) / totalRange) * 100}%`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                      {start}
                    </span>
                  </div>

                  {/* End Number (only for the very last segment) */}
                  {idx === segments.length - 1 && (
                    <div 
                      className="absolute -top-6 flex flex-col items-center z-10"
                      style={{ 
                        left: `${((end - minVal) / totalRange) * 100}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <span className="text-[11px] font-black text-gray-700 dark:text-gray-300">
                        {end}
                      </span>
                    </div>
                  )}

                </React.Fragment>
              );
            })}
          </div>

          {/* Current Value Marker (Moved to Bottom) */}
          {isUserGender && (
            <div 
              className="absolute bottom-1 flex flex-col items-center transition-all duration-1000 ease-out z-20"
              style={{ left: `${markerPos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[10px] border-b-indigo-600 dark:border-b-indigo-500 drop-shadow-md"></div>
              <div className="bg-indigo-600 dark:bg-indigo-500 text-white text-[12px] font-black px-3 py-1.5 rounded-full shadow-2xl whitespace-nowrap mt-1 flex items-center gap-1 ring-4 ring-white dark:ring-gray-800">
                {currentValue}{metadata.unit}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };





  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg text-indigo-600 dark:text-indigo-400">
                i
              </span>
              {metricName} Status
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Health range guide & analysis</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {/* Description */}
          <div className="mb-8">
            <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
              {metadata.description}
            </p>
          </div>

          <div className="space-y-12">
            {renderScale('M')}
            {renderScale('F')}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};

export default MetricInfoModal;
