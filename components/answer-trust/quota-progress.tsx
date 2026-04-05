import { FREE_LIMIT_PER_DAY } from "@/lib/constants";

export function QuotaProgress({ usedToday, limitPerDay }: { usedToday: number; limitPerDay: number }) {
  const safeUsed = Math.min(usedToday, limitPerDay);
  const progress = (safeUsed / limitPerDay) * 100;
  const remaining = Math.max(limitPerDay - usedToday, 0);

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between text-sm text-white/80">
        <span>本日使用额度</span>
        <span>
          {usedToday} / {limitPerDay}
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-lime-300 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-white/60">
        今日剩余 {remaining} 次免费检测。超过 {FREE_LIMIT_PER_DAY} 次后需要升级付费计划。
      </p>
    </div>
  );
}
