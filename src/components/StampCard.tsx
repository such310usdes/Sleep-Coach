import { ChevronLeft, ChevronRight, Flame, Stamp } from 'lucide-react';
import {
  formatMonthLabel,
  getDateKey,
  getMonthStats,
  moveMonth,
} from '../utils/streak';

type StampCardProps = {
  monthKey: string;
  stampedDates: string[];
  currentStreak: number;
  longestStreak: number;
  onChangeMonth: (monthKey: string) => void;
};

export function StampCard({
  monthKey,
  stampedDates,
  currentStreak,
  longestStreak,
  onChangeMonth,
}: StampCardProps) {
  const todayKey = getDateKey();
  const stampedSet = new Set(stampedDates);
  const { days, completedCount, completionRate } = getMonthStats(stampedDates, monthKey);

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => onChangeMonth(moveMonth(monthKey, -1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            aria-label="前の月"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-500">1ヶ月スタンプカード</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{formatMonthLabel(monthKey)}</h2>
          </div>
          <button
            type="button"
            onClick={() => onChangeMonth(moveMonth(monthKey, 1))}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            aria-label="次の月"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Stat label="今月の達成数" value={`${completedCount}日`} />
          <Stat label="達成率" value={`${completionRate}%`} />
          <Stat label="現在の連続達成" value={`${currentStreak}日`} />
          <Stat label="最長連続達成" value={`${longestStreak}日`} />
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2">
          {days.map(({ day, dateKey }) => {
            const isStamped = stampedSet.has(dateKey);
            const isToday = dateKey === todayKey;

            return (
              <div
                key={dateKey}
                className={`flex aspect-square min-h-11 flex-col items-center justify-center rounded-md border text-xs font-bold ${
                  isToday
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-slate-100 bg-slate-50 text-slate-500'
                }`}
              >
                <span>{day}</span>
                <span className={`mt-1 ${isStamped ? 'text-amber-600' : 'text-transparent'}`}>
                  {isStamped ? <Stamp size={18} /> : <Flame size={18} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-900">{value}</p>
    </div>
  );
}
