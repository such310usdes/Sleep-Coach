import { CheckCircle2, Flame, Timer, Trophy } from 'lucide-react';
import type { SleepMission } from '../data/sleepMissions';

type DailyMissionCardProps = {
  mission: SleepMission;
  todayKey: string;
  dayCount: number;
  isCompleted: boolean;
  onComplete: () => void;
  onOpenStampCard: () => void;
};

export function DailyMissionCard({
  mission,
  todayKey,
  dayCount,
  isCompleted,
  onComplete,
  onOpenStampCard,
}: DailyMissionCardProps) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">今日の睡眠ミッション</p>
          <p className="mt-1 text-xs font-bold text-teal-700">{todayKey} / 継続 {dayCount}日目</p>
        </div>
        <div className="rounded-md bg-teal-50 px-3 py-2 text-sm font-black text-teal-700">
          Lv.{mission.level}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
        <span className="rounded-md bg-slate-100 px-2 py-1">{mission.category}</span>
        <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
          <Timer size={14} />
          {mission.duration}
        </span>
        <span className="rounded-md bg-slate-100 px-2 py-1">{mission.difficulty}</span>
      </div>

      <h2 className="text-2xl font-black leading-tight text-slate-900">{mission.title}</h2>

      <div className="mt-4 space-y-3">
        <InfoBlock label="やること" text={mission.action} />
        <InfoBlock label="理由" text={mission.reason} />
        <InfoBlock label="おすすめタイミング" text={mission.bestTiming} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3">
        <button
          type="button"
          onClick={onComplete}
          disabled={isCompleted}
          className={`flex h-13 min-h-13 items-center justify-center gap-2 rounded-lg px-4 py-3 font-bold shadow-sm ${
            isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-teal-600 text-white'
          }`}
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Trophy size={20} />}
          {isCompleted ? '今日のスタンプ達成済み' : '達成してスタンプを押す'}
        </button>
        <button
          type="button"
          onClick={onOpenStampCard}
          className="flex h-12 items-center justify-center gap-2 rounded-lg bg-amber-50 font-bold text-amber-800"
        >
          <Flame size={19} />
          スタンプカードを見る
        </button>
      </div>
    </section>
  );
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-700">{text}</p>
    </div>
  );
}
