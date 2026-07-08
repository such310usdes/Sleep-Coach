import { BarChart3 } from 'lucide-react';

type WeeklyReviewCardProps = {
  averageHours: number;
  averageScore: number;
  missionCompletedDays: number;
  noSleepDays: number;
  comment: string;
};

export function WeeklyReviewCard({
  averageHours,
  averageScore,
  missionCompletedDays,
  noSleepDays,
  comment,
}: WeeklyReviewCardProps) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">今週の振り返り</p>
          <h2 className="mt-1 text-xl font-black text-slate-900">小さな変化を確認</h2>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-700">
          <BarChart3 size={25} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <Stat label="平均睡眠" value={`${averageHours.toFixed(1)}h`} />
        <Stat label="平均スコア" value={`${Math.round(averageScore)}点`} />
        <Stat label="ミッション" value={`${missionCompletedDays}日`} />
        <Stat label="寝ていない日" value={`${noSleepDays}日`} />
      </div>

      <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        {comment}
      </p>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}
