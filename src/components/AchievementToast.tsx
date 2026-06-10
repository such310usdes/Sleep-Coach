import { CheckCircle2, X } from 'lucide-react';
import { useEffect } from 'react';

type AchievementToastProps = {
  isVisible: boolean;
  streak: number;
  onClose: () => void;
};

export function AchievementToast({ isVisible, streak, onClose }: AchievementToastProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timerId = window.setTimeout(onClose, 3600);
    return () => window.clearTimeout(timerId);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-md px-5">
      <div className="rounded-lg border border-emerald-100 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={24} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-black text-slate-900">スタンプ獲得！</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">連続{streak}日達成</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              今日も睡眠習慣を1つ積み上げました。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            aria-label="閉じる"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
