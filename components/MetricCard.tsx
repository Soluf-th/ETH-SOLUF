
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  loading?: boolean;
  footer?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, trend, loading, footer }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 p-5 rounded-2xl backdrop-blur-sm transition-all hover:border-blue-500/50 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-slate-900/50 rounded-lg text-blue-400">
            {icon}
          </div>
          {trend && (
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
              trend === 'Low' || trend === 'Cheap' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : trend === 'High' 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <div className="mt-1 h-8 flex items-center">
            {loading ? (
              <div className="w-24 h-6 bg-slate-700 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-2xl font-bold tracking-tight text-white">{value}</h3>
            )}
          </div>
        </div>
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          {footer}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
