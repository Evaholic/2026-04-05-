import { FREE_LIMIT_PER_DAY } from "@/lib/constants";
import type { QuotaResponse } from "@/lib/types";

/**
 * 开发用内存额度，上线后替换为按用户 ID 查询数据库的实现。
 */
let usedToday = 2;

export const quotaStore = {
  get(): QuotaResponse {
    return { usedToday, limitPerDay: FREE_LIMIT_PER_DAY };
  },
  setUsedToday(next: number) {
    usedToday = Math.max(0, next);
  },
};
