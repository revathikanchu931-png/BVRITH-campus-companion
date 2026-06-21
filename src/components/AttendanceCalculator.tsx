import React, { useState } from 'react';
import { Calculator, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export default function AttendanceCalculator() {
  const [attendedVal, setAttendedVal] = useState<string>('15');
  const [totalVal, setTotalVal] = useState<string>('20');
  const [targetVal, setTargetVal] = useState<number>(75);

  const attended = parseInt(attendedVal) || 0;
  const total = parseInt(totalVal) || 0;

  // Calculate current stats
  const percentage = total > 0 ? parseFloat(((attended / total) * 100).toFixed(1)) : 0;

  // 1. Calculate for given Target%
  const calculateAnalysis = (target: number) => {
    if (total === 0) return { status: 'neutral', message: 'Enter values to analyze.' };
    if (attended > total) return { status: 'error', message: 'Attended classes cannot be more than total classes!' };

    const currentPct = (attended / total) * 100;
    
    if (currentPct < target) {
      // Need to attend consecutive classes
      // (attended + X) / (total + X) >= target / 100
      // X = Math.ceil((target * total - 100 * attended) / (100 - target))
      const divisor = 100 - target;
      if (divisor <= 0) return { status: 'neutral', message: 'Target cannot be 100%' };
      const req = Math.ceil((target * total - 100 * attended) / divisor);
      return {
        status: 'deficient',
        required: req,
        message: `You need to attend ${req} upcoming ${req === 1 ? 'class' : 'classes'} in a row without slacking to hit your ${target}% target!`
      };
    } else {
      // Can safely skip classes
      // attended / (total + Y) >= target / 100
      // Y = Math.floor((100 * attended - target * total) / target)
      if (target === 0) return { status: 'neutral', message: 'Target cannot be 0%' };
      const safe = Math.floor((100 * attended - target * total) / target);
      return {
        status: 'sufficient',
        safeSkip: safe,
        message: safe > 0 
          ? `Status normal. You can safely skip next ${safe} ${safe === 1 ? 'class' : 'classes'} and still stay above ${target}%.`
          : `Status normal. But you cannot afford to skip any upcoming classes if you want to maintain your ${target}% target!`
      };
    }
  };

  const status75 = calculateAnalysis(75);
  const status80 = calculateAnalysis(80);
  const customStatus = calculateAnalysis(targetVal);

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-8 animate-fade-in" id="attendance-calculator-container">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Attendance Planner & Calculator
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Keep your attendance history compliant. Calculate safety margins and custom percentage stats instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Inputs and Current Radial Percentage Display */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Attended Classes</label>
              <input
                type="number"
                min="0"
                value={attendedVal}
                onChange={(e) => setAttendedVal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 outline-none focus:border-blue-500 text-slate-900 dark:text-white text-base font-medium"
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Classes Conducted</label>
              <input
                type="number"
                min="0"
                value={totalVal}
                onChange={(e) => setTotalVal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 outline-none focus:border-blue-500 text-slate-900 dark:text-white text-base font-medium"
                placeholder="0"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/40 space-y-3">
            <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>CUSTOM TARGET GOAL</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">{targetVal}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="1"
              value={targetVal}
              onChange={(e) => setTargetVal(parseInt(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>50%</span>
              <span>75% (Min standard)</span>
              <span>85% (High honors)</span>
              <span>95%</span>
            </div>
          </div>
        </div>

        {/* Right Side: Circular Gauge or Progress card */}
        <div className="flex flex-col items-center justify-center p-6 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 rounded-2xl relative">
          <div className="relative h-32 w-32 flex items-center justify-center">
            {/* SVG circle stroke representation */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                className={`${percentage >= 75 ? 'text-emerald-500' : 'text-rose-500'} transition-all duration-500`}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - Math.min(percentage, 100) / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">{percentage}%</span>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Attendance</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${percentage >= 75 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'}`}>
              {percentage >= 75 ? 'Shortage Saved' : 'Shortage Alert!'}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Logged: {attended} of {total} total lectures</p>
          </div>
        </div>
      </div>

      {/* Target Analyses (75%, 80%, Custom) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="tracker-analyses">
        {/* 75% Card */}
        <div className={`p-4 rounded-xl border ${status75.status === 'sufficient' ? 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'bg-amber-50/40 border-amber-100 dark:bg-amber-955/10 dark:border-amber-900/30'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">75% Target standard</span>
            {status75.status === 'sufficient' 
              ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              : <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            }
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
            {status75.message}
          </p>
        </div>

        {/* 80% Card */}
        <div className={`p-4 rounded-xl border ${status80.status === 'sufficient' ? 'bg-emerald-50/40 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/30' : 'bg-amber-50/40 border-amber-100 dark:bg-amber-955/10 dark:border-amber-900/30'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">80% Target standard</span>
            {status80.status === 'sufficient' 
              ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
              : <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            }
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
            {status80.message}
          </p>
        </div>

        {/* Custom Card */}
        <div className={`p-4 rounded-xl border ${customStatus.status === 'sufficient' ? 'bg-blue-50/40 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/10' : 'bg-rose-50/40 border-rose-100 dark:bg-rose-955/10 dark:border-rose-900/30'}`}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">Your custom {targetVal}% Target</span>
            {customStatus.status === 'sufficient' 
              ? <CheckCircle2 className="h-4.5 w-4.5 text-blue-500" />
              : <AlertTriangle className="h-4.5 w-4.5 text-rose-550" />
            }
          </div>
          <p className="text-xs text-slate-605 dark:text-slate-350 leading-relaxed">
            {customStatus.message}
          </p>
        </div>
      </div>
    </div>
  );
}
