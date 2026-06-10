import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  BedDouble,
  BookOpen,
  ChevronLeft,
  Clock3,
  Coffee,
  MessageSquareText,
  History,
  Lightbulb,
  Moon,
  Save,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Trash2,
} from 'lucide-react';
import { SLEEP_TIPS, getDailyTip } from './sleepTips';

type View = 'home' | 'record' | 'history' | 'tips';

type Mood = 'とても良い' | '良い' | '普通' | '悪い';
type Sleepiness = '少ない' | '普通' | '強い';
type Caffeine = 'なし' | '少し' | '多い';

type SleepRecord = {
  id: string;
  date: string;
  bedtime: string;
  wakeTime: string;
  mood: Mood;
  sleepiness: Sleepiness;
  caffeine: Caffeine;
  phoneMinutes: number;
  durationHours: number;
  score: number;
};

type FormState = {
  recordDate: string;
  bedtime: string;
  wakeTime: string;
  mood: Mood;
  sleepiness: Sleepiness;
  caffeine: Caffeine;
  phoneMinutes: string;
};

const STORAGE_KEY = 'sleep-improvement-records';
const GOAL_KEY = 'sleep-improvement-goal-hours';
const COLLECTED_TIPS_KEY = 'sleep-improvement-collected-tips';
const DEFAULT_GOAL_HOURS = 7.5;
const FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSd4FiHOVO-vlTi1XXdtGjxo_d0NYwLPwXz4Cai_smp7HS1J-w/viewform?usp=header';

function getTodayDateInput() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

const initialForm: FormState = {
  recordDate: getTodayDateInput(),
  bedtime: '23:30',
  wakeTime: '07:00',
  mood: '普通',
  sleepiness: '普通',
  caffeine: '少し',
  phoneMinutes: '30',
};

function loadRecords(): SleepRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SleepRecord[]) : [];
  } catch {
    return [];
  }
}

function loadGoalHours() {
  const saved = localStorage.getItem(GOAL_KEY);
  const parsed = saved ? Number(saved) : DEFAULT_GOAL_HOURS;

  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_GOAL_HOURS;
}

function loadCollectedTipIds(): number[] {
  try {
    const saved = localStorage.getItem(COLLECTED_TIPS_KEY);
    return saved ? (JSON.parse(saved) as number[]) : [];
  } catch {
    return [];
  }
}

function calculateDurationHours(bedtime: string, wakeTime: string) {
  const [bedHour, bedMinute] = bedtime.split(':').map(Number);
  const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
  const bedTotal = bedHour * 60 + bedMinute;
  let wakeTotal = wakeHour * 60 + wakeMinute;

  if (wakeTotal <= bedTotal) {
    wakeTotal += 24 * 60;
  }

  return Math.round(((wakeTotal - bedTotal) / 60) * 10) / 10;
}

function calculateScore(
  record: Omit<SleepRecord, 'id' | 'date' | 'durationHours' | 'score'>,
  goalHours = DEFAULT_GOAL_HOURS,
) {
  const duration = calculateDurationHours(record.bedtime, record.wakeTime);
  let score = 100;

  score -= Math.abs(duration - goalHours) * 7;
  if (record.mood === 'とても良い') score += 4;
  if (record.mood === '悪い') score -= 10;
  if (record.sleepiness === '強い') score -= 12;
  if (record.sleepiness === '少ない') score += 3;
  if (record.caffeine === '少し') score -= 4;
  if (record.caffeine === '多い') score -= 12;
  score -= Math.min(record.phoneMinutes / 10, 12);

  return Math.max(45, Math.min(100, Math.round(score)));
}

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(dateValue));
}

function getScoreTone(score: number) {
  if (score >= 85) return 'text-emerald-700';
  if (score >= 70) return 'text-sky-700';
  return 'text-amber-700';
}

function toDateKey(dateValue: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(dateValue));
}

function getWeeklyData(records: SleepRecord[]) {
  const today = new Date();
  const dateKeys = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return toDateKey(date.toISOString());
  });

  return dateKeys.map((dateKey) => {
    const record = records.find((item) => toDateKey(item.date) === dateKey);
    const date = new Date(`${dateKey}T00:00:00`);

    return {
      dateKey,
      label: new Intl.DateTimeFormat('ja-JP', { weekday: 'short' }).format(date),
      hours: record?.durationHours ?? 0,
      score: record?.score ?? 0,
      hasRecord: Boolean(record),
    };
  });
}

function buildAiComment(record: SleepRecord | undefined, goalHours: number) {
  if (!record) {
    return `まずは1日分を記録して、目標の${goalHours}時間に近づける流れを見ていきましょう。`;
  }

  const gap = Math.round((record.durationHours - goalHours) * 10) / 10;
  const comments: string[] = [];

  if (Math.abs(gap) <= 0.5) {
    comments.push(`睡眠時間は目標の${goalHours}時間にかなり近いです。`);
  } else if (gap < 0) {
    comments.push(`睡眠時間が目標より${Math.abs(gap)}時間短めです。`);
  } else {
    comments.push(`睡眠時間は目標より${gap}時間長めです。`);
  }

  if (record.phoneMinutes >= 60) {
    comments.push('寝る前のスマホ時間を15分だけ短くすると、スコアが伸びやすそうです。');
  } else if (record.caffeine === '多い') {
    comments.push('カフェイン量が多めなので、午後の摂取を少し控えると眠りやすくなりそうです。');
  } else if (record.sleepiness === '強い') {
    comments.push('日中の眠気が強いので、起床時間を固定してリズムを整えるのがおすすめです。');
  } else if (record.mood === 'とても良い' || record.score >= 85) {
    comments.push('今のリズムはかなり良い感じです。この時間帯を数日続けてみましょう。');
  } else {
    comments.push('就寝時間と起床時間を少しずつ固定すると、次の記録で変化が見えやすくなります。');
  }

  return comments.join('');
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [records, setRecords] = useState<SleepRecord[]>(loadRecords);
  const [goalHours, setGoalHours] = useState(loadGoalHours);
  const [collectedTipIds, setCollectedTipIds] = useState<number[]>(loadCollectedTipIds);
  const [form, setForm] = useState<FormState>(initialForm);

  const dailyTip = useMemo(() => getDailyTip(), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem(GOAL_KEY, String(goalHours));
  }, [goalHours]);

  useEffect(() => {
    setCollectedTipIds((current) =>
      current.includes(dailyTip.id) ? current : [...current, dailyTip.id],
    );
  }, [dailyTip.id]);

  useEffect(() => {
    localStorage.setItem(COLLECTED_TIPS_KEY, JSON.stringify(collectedTipIds));
  }, [collectedTipIds]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [records],
  );
  const collectedTips = useMemo(
    () => SLEEP_TIPS.filter((tip) => collectedTipIds.includes(tip.id)),
    [collectedTipIds],
  );
  const latestRecord = sortedRecords[0];
  const latestScore = latestRecord?.score ?? 78;
  const aiComment = buildAiComment(latestRecord, goalHours);
  const weeklyData = useMemo(() => getWeeklyData(sortedRecords), [sortedRecords]);
  const weeklyAverage =
    weeklyData.filter((day) => day.hasRecord).reduce((total, day) => total + day.hours, 0) /
    Math.max(weeklyData.filter((day) => day.hasRecord).length, 1);
  const previewDuration = useMemo(
    () => calculateDurationHours(form.bedtime, form.wakeTime),
    [form.bedtime, form.wakeTime],
  );

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveRecord = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const recordDate = String(formData.get('recordDate') || form.recordDate);

    const draft = {
      bedtime: form.bedtime,
      wakeTime: form.wakeTime,
      mood: form.mood,
      sleepiness: form.sleepiness,
      caffeine: form.caffeine,
      phoneMinutes: Number(form.phoneMinutes || 0),
    };
    const durationHours = calculateDurationHours(draft.bedtime, draft.wakeTime);
    const score = calculateScore(draft, goalHours);
    const record: SleepRecord = {
      id: crypto.randomUUID(),
      date: new Date(`${recordDate}T12:00:00+09:00`).toISOString(),
      durationHours,
      score,
      ...draft,
    };

    setRecords((current) =>
      [record, ...current].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    );
    setView('home');
  };

  const deleteRecord = (id: string) => {
    setRecords((current) => current.filter((record) => record.id !== id));
  };

  return (
    <main className="min-h-screen bg-[#edf5f4] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6">
        <header className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setView('home')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm"
            aria-label="ホームへ戻る"
          >
            {view === 'home' ? <Moon size={22} /> : <ChevronLeft size={22} />}
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
              Sleep Coach
            </p>
            <h1 className="text-lg font-bold">
              {view === 'home' && '睡眠ホーム'}
              {view === 'record' && '睡眠記録'}
              {view === 'history' && '履歴'}
              {view === 'tips' && '豆知識'}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setView('history')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm"
            aria-label="履歴を見る"
          >
            <History size={21} />
          </button>
        </header>

        {view === 'home' && (
          <section className="flex flex-1 flex-col gap-4">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">今日の睡眠スコア</p>
                  <p className={`mt-2 text-6xl font-black leading-none ${getScoreTone(latestScore)}`}>
                    {latestScore}
                  </p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700">
                  <BedDouble size={30} />
                </div>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{ width: `${latestScore}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {latestRecord
                  ? `${formatDate(latestRecord.date)} の記録から計算`
                  : 'まだ記録がないためサンプル値を表示中'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setView('record')}
              className="flex min-h-28 flex-col justify-between rounded-lg bg-teal-600 p-5 text-left font-bold text-white shadow-sm"
            >
              <Clock3 size={26} />
              <span>睡眠を記録</span>
            </button>

            <div className="rounded-lg bg-[#132238] p-5 text-white shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-teal-200">
                <Sparkles size={19} />
                <p className="text-sm font-semibold">AIコメント</p>
              </div>
              <p className="text-base leading-7">
                {aiComment}
              </p>
            </div>

            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-amber-700">
                <Lightbulb size={20} />
                <p className="text-sm font-semibold">今日の睡眠豆知識</p>
              </div>
              <p className="text-xs font-bold text-slate-400">
                {dailyTip.dayLabel} / {collectedTipIds.length} / 365個
              </p>
              <p className="mt-2 text-lg font-black text-slate-900">{dailyTip.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{dailyTip.body}</p>
              <button
                type="button"
                onClick={() => setView('tips')}
                className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-amber-50 font-bold text-amber-800"
              >
                <BookOpen size={18} />
                集めた豆知識を見る
              </button>
            </div>

            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">目標睡眠時間</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{goalHours}時間</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                  <Target size={24} />
                </div>
              </div>
              <input
                type="range"
                min="5"
                max="10"
                step="0.5"
                value={goalHours}
                onChange={(event) => setGoalHours(Number(event.target.value))}
                className="w-full accent-amber-500"
                aria-label="目標睡眠時間"
              />
              <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
                <span>5時間</span>
                <span>10時間</span>
              </div>
            </div>

            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">週間グラフ</p>
                  <p className="mt-1 text-xl font-black text-slate-900">
                    平均 {weeklyAverage ? weeklyAverage.toFixed(1) : '0.0'}時間
                  </p>
                </div>
                <p className="rounded-md bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">
                  7日間
                </p>
              </div>
              <div className="flex h-36 items-end gap-2">
                {weeklyData.map((day) => {
                  const height = day.hasRecord ? Math.max(12, Math.min(100, (day.hours / 10) * 100)) : 8;

                  return (
                    <div key={day.dateKey} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-24 w-full items-end rounded-md bg-slate-50 px-1">
                        <div
                          className={`w-full rounded-md ${
                            day.hasRecord ? 'bg-teal-500' : 'bg-slate-200'
                          }`}
                          style={{ height: `${height}%` }}
                          title={day.hasRecord ? `${day.hours}時間 / ${day.score}点` : '記録なし'}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-lg bg-white font-bold text-slate-700 shadow-sm"
            >
              <MessageSquareText size={19} className="text-teal-700" />
              使ってみた感想を送る
            </a>

          </section>
        )}

        {view === 'record' && (
          <form onSubmit={saveRecord} className="flex flex-1 flex-col gap-4">
            <label className="rounded-lg bg-white p-4 shadow-sm">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <History size={19} className="text-teal-700" />
                記録する日付
              </span>
              <input
                type="date"
                name="recordDate"
                value={form.recordDate}
                onChange={(event) => updateForm('recordDate', event.target.value)}
                className="h-12 w-full rounded-md border border-slate-200 px-3 text-lg font-bold outline-none focus:border-teal-500"
                required
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <TimeField
                label="就寝時間"
                icon={<Moon size={19} />}
                value={form.bedtime}
                onChange={(value) => updateForm('bedtime', value)}
              />
              <TimeField
                label="起床時間"
                icon={<Sun size={19} />}
                value={form.wakeTime}
                onChange={(value) => updateForm('wakeTime', value)}
              />
            </div>

            <SelectField
              label="気分"
              value={form.mood}
              options={['とても良い', '良い', '普通', '悪い']}
              onChange={(value) => updateForm('mood', value as Mood)}
            />
            <SelectField
              label="日中の眠気"
              value={form.sleepiness}
              options={['少ない', '普通', '強い']}
              onChange={(value) => updateForm('sleepiness', value as Sleepiness)}
            />
            <SelectField
              label="カフェイン摂取"
              value={form.caffeine}
              options={['なし', '少し', '多い']}
              onChange={(value) => updateForm('caffeine', value as Caffeine)}
              icon={<Coffee size={19} />}
            />

            <label className="rounded-lg bg-white p-4 shadow-sm">
              <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Smartphone size={19} className="text-teal-700" />
                寝る前のスマホ利用時間
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="180"
                  step="5"
                  value={form.phoneMinutes}
                  onChange={(event) => updateForm('phoneMinutes', event.target.value)}
                  className="w-full accent-teal-600"
                />
                <input
                  type="number"
                  min="0"
                  value={form.phoneMinutes}
                  onChange={(event) => updateForm('phoneMinutes', event.target.value)}
                  className="h-11 w-20 rounded-md border border-slate-200 px-3 text-right font-semibold outline-none focus:border-teal-500"
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">分</p>
            </label>

            <div className="rounded-lg bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">入力中の睡眠時間</p>
              <p className="mt-1 text-3xl font-black text-slate-900">{previewDuration}時間</p>
            </div>

            <button
              type="submit"
              className="mt-auto flex h-14 items-center justify-center gap-2 rounded-lg bg-teal-600 font-bold text-white shadow-sm"
            >
              <Save size={20} />
              保存する
            </button>
          </form>
        )}

        {view === 'history' && (
          <section className="flex flex-1 flex-col gap-3">
            {records.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-sm">
                <BedDouble size={42} className="mb-4 text-teal-700" />
                <p className="text-lg font-bold">まだ記録がありません</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  睡眠を記録すると、睡眠時間とスコアがここに表示されます。
                </p>
                <button
                  type="button"
                  onClick={() => setView('record')}
                  className="mt-6 rounded-lg bg-teal-600 px-5 py-3 font-bold text-white"
                >
                  記録を追加
                </button>
              </div>
            ) : (
              sortedRecords.map((record) => (
                <article key={record.id} className="rounded-lg bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">{formatDate(record.date)}</p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {record.bedtime} - {record.wakeTime}
                      </p>
                    </div>
                    <p className={`text-3xl font-black ${getScoreTone(record.score)}`}>
                      {record.score}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-slate-500">睡眠時間</p>
                      <p className="mt-1 font-bold">{record.durationHours}時間</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3">
                      <p className="text-slate-500">睡眠スコア</p>
                      <p className="mt-1 font-bold">{record.score}点</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteRecord(record.id)}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-rose-50 text-sm font-bold text-rose-700"
                  >
                    <Trash2 size={17} />
                    削除
                  </button>
                </article>
              ))
            )}
          </section>
        )}

        {view === 'tips' && (
          <section className="flex flex-1 flex-col gap-3">
            <div className="rounded-lg bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-500">集めた睡眠豆知識</p>
                  <p className="mt-1 text-3xl font-black text-slate-900">
                    {collectedTips.length} / 365
                  </p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                  <BookOpen size={27} />
                </div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-amber-500"
                  style={{ width: `${(collectedTips.length / SLEEP_TIPS.length) * 100}%` }}
                />
              </div>
            </div>

            {collectedTips.map((tip) => (
              <article key={tip.id} className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs font-bold text-amber-700">No. {tip.id}</p>
                <p className="mt-1 font-black text-slate-900">{tip.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{tip.body}</p>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function TimeField({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-lg bg-white p-4 shadow-sm">
      <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
        <span className="text-teal-700">{icon}</span>
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-slate-200 px-3 text-lg font-bold outline-none focus:border-teal-500"
        required
      />
    </label>
  );
}

function SelectField({
  label,
  icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon?: ReactNode;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-lg bg-white p-4 shadow-sm">
      <span className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-600">
        {icon && <span className="text-teal-700">{icon}</span>}
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 font-bold outline-none focus:border-teal-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
