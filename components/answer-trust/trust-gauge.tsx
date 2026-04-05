"use client";

import { motion } from "framer-motion";

export function TrustGauge({ score }: { score: number }) {
  const position = `${((score - 1) / 9) * 100}%`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>1</span>
        <span>可信度指针</span>
        <span>10</span>
      </div>

      <div className="relative pt-7">
        <div className="h-4 w-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 via-55% to-emerald-500 shadow-inner" />

        <motion.div
          className="absolute top-0 -translate-x-1/2"
          style={{ left: position }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              {score.toFixed(1)}
            </div>
            <div className="h-6 w-1 rounded-full bg-slate-950" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-xs text-slate-500">
        <div className="rounded-xl bg-red-50 px-2 py-2">非常不可信</div>
        <div className="rounded-xl bg-amber-50 px-2 py-2">比较可以</div>
        <div className="rounded-xl bg-lime-50 px-2 py-2">比较可信</div>
        <div className="rounded-xl bg-emerald-50 px-2 py-2">十分可信</div>
      </div>
    </div>
  );
}
