import type { MissionLevel, SleepMission } from '../data/sleepMissions';

export type MissionStats = {
  lastCompletedDate: string | null;
  currentStreak: number;
  longestStreak: number;
};

export function getDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T12:00:00+09:00`);
}

export function addDays(dateKey: string, amount: number) {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
}

export function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getMonthDays(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return {
      day,
      dateKey: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    };
  });
}

export function moveMonth(monthKey: string, amount: number) {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + amount, 1);
  return getMonthKey(date);
}

export function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split('-').map(Number);
  return `${year}年${month}月`;
}

export function calculateCompletionDay(stampedDates: string[], todayKey = getDateKey()) {
  const sorted = [...new Set(stampedDates)].sort();
  const firstDate = sorted[0];

  if (!firstDate) return 0;

  const elapsedDays =
    Math.floor((parseDateKey(todayKey).getTime() - parseDateKey(firstDate).getTime()) / 86400000) + 1;

  return Math.max(0, elapsedDays);
}

export function getUnlockedLevel(dayCount: number): MissionLevel {
  if (dayCount >= 90) return 5;
  if (dayCount >= 45) return 4;
  if (dayCount >= 21) return 3;
  if (dayCount >= 7) return 2;
  return 1;
}

export function selectDailyMission(
  missions: SleepMission[],
  stampedDates: string[],
  todayKey = getDateKey(),
) {
  const dayCount = calculateCompletionDay(stampedDates, todayKey);
  const level = getUnlockedLevel(dayCount);
  const candidates = missions.filter((mission) => mission.level === level);
  const date = parseDateKey(todayKey);
  const seed = Math.floor(date.getTime() / 86400000) + dayCount;
  const index = candidates.length ? seed % candidates.length : 0;

  return {
    mission: candidates[index] ?? missions[0],
    dayCount,
    level,
  };
}

export function recalculateStats(stampedDates: string[], todayKey = getDateKey()): MissionStats {
  const sorted = [...new Set(stampedDates)].sort();
  let longestStreak = 0;
  let activeStreak = 0;
  let previousDate: string | null = null;

  for (const dateKey of sorted) {
    if (previousDate && addDays(previousDate, 1) === dateKey) {
      activeStreak += 1;
    } else {
      activeStreak = 1;
    }

    longestStreak = Math.max(longestStreak, activeStreak);
    previousDate = dateKey;
  }

  let currentStreak = 0;
  let cursor = sorted.includes(todayKey) ? todayKey : addDays(todayKey, -1);

  while (sorted.includes(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    lastCompletedDate: sorted[sorted.length - 1] ?? null,
    currentStreak,
    longestStreak,
  };
}

export function getMonthStats(stampedDates: string[], monthKey: string) {
  const days = getMonthDays(monthKey);
  const stampedSet = new Set(stampedDates);
  const completedCount = days.filter((day) => stampedSet.has(day.dateKey)).length;
  const completionRate = Math.round((completedCount / days.length) * 100);

  return {
    days,
    completedCount,
    completionRate,
  };
}
