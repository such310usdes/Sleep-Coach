import { CheckCircle2, Flame, Stamp } from 'lucide-react';
import type { MissionLevel } from '../data/sleepMissions';

const LEVEL_TITLES: Record<MissionLevel, string> = {
  1: '睡眠ビギナー',
  2: 'リズム整え中',
  3: '夜習慣チャレンジャー',
  4: '睡眠デザイナー',
  5: 'スリープマスター',
};

const NEXT_LEVEL_DAYS: Record<MissionLevel, number | null> = {
  1: 7,
  2: 21,
  3: 45,
  4: 90,
  5: null,
};

type LevelProgressCardProps = {
  level: MissionLevel;
  dayCount: number;
  isTodayCompleted: boolean;
  currentStreak: number;
  monthCompletedCount: number;
  onOpenStampCard: () => void;
};

export function LevelProgressCard({
  level,
  dayCount,
  isTodayCompleted,
  currentStreak,
  monthCompletedCount,
  onOpenStampCard,
}: LevelProgressCardProps) {
  const nextLevelDay = NEXT_LEVEL_DAYS[level];
  const daysToNext = nextLevelDay === null ? 0 : Math.max(0, nextLevelDay - dayCount);

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">ミッション達成状況</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">
            Lv.{level} {LEVEL_TITLES[level]}
          </h2>
          <p className="mt-2 text-sm font-semibold text-teal-700">
            {nextLevelDay === null ? '最高レベルに到達中' : `あと${daysToNext}日でLv.${level + 1}`}
          </p>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${
          isTodayCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {isTodayCompleted ? <CheckCircle2 size={28} /> : <Stamp size={27} />}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <StatusTile label="今日" value={isTodayCompleted ? '達成' : '未達成'} />
        <StatusTile label="連続" value={`${currentStreak}日`} />
        <StatusTile label="今月" value={`${monthCompletedCount}日`} />
      </div>

      <button
        type="button"
        onClick={onOpenStampCard}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-amber-50 font-bold text-amber-800"
      >
        <Flame size={19} />
        スタンプカードを見る
      </button>
    </section>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}
