"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { modelMeta } from "@/lib/constants";
import type { ModelEvaluation } from "@/lib/types";
import { getTrustStyles, scoreToLabel } from "@/lib/trust";

export function ModelCard({ item }: { item: ModelEvaluation }) {
  const label = scoreToLabel(item.score);
  const styles = getTrustStyles(label);
  const meta = modelMeta[item.model];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
        <CardHeader className="space-y-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg text-slate-950">{meta.title}</CardTitle>
              <CardDescription className="mt-1">{meta.subtitle}</CardDescription>
            </div>
            <Badge className={`rounded-full border ${styles.badge}`}>{label}</Badge>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-4xl font-semibold tracking-tight text-slate-950">{item.score.toFixed(1)}</div>
              <div className="mt-1 text-sm text-slate-400">/ 10.0</div>
            </div>
            <div className={`text-sm font-medium ${styles.text}`}>{label}</div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-[1.25rem] bg-slate-50 p-4 text-sm leading-7 text-slate-600">{item.reason}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
