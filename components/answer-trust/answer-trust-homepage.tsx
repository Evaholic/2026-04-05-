"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Gauge,
  Loader2,
  LogIn,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { apiEvaluate, apiGetQuota } from "@/lib/api";
import { APP_EN_NAME, APP_NAME, FREE_LIMIT_PER_DAY, modelMeta } from "@/lib/constants";
import type { EvaluateResponse, ModelKey, UserSession } from "@/lib/types";
import { getTrustStyles } from "@/lib/trust";
import { ModelCard } from "@/components/answer-trust/model-card";
import { QuotaProgress } from "@/components/answer-trust/quota-progress";
import { SectionTitle } from "@/components/answer-trust/section-title";
import { TrustGauge } from "@/components/answer-trust/trust-gauge";

export function AnswerTrustHomepage() {
  const { data: authData, status: authStatus } = useSession();
  const session: UserSession | null = useMemo(() => {
    if (authStatus === "loading") return null;
    if (!authData?.user) {
      return { isLoggedIn: false, name: null, email: null, avatarUrl: null };
    }
    return {
      isLoggedIn: true,
      name: authData.user.name ?? null,
      email: authData.user.email ?? null,
      avatarUrl: authData.user.image ?? null,
    };
  }, [authData, authStatus]);
  const [question, setQuestion] = useState("长期熬夜后，周末补觉可以完全抵消伤害吗？");
  const [answer, setAnswer] = useState(
    "周末多睡几个小时就可以完全恢复，熬夜造成的影响基本都能补回来，所以平时晚睡问题不大。"
  );
  const [usedToday, setUsedToday] = useState(0);
  const [limitPerDay, setLimitPerDay] = useState(FREE_LIMIT_PER_DAY);
  const [quotaLoading, setQuotaLoading] = useState(true);
  const [result, setResult] = useState<EvaluateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  /** 支付流程提示（不依赖 alert，避免内置预览无提示、外链跳转被拦截时「没反应」） */
  const [billingBanner, setBillingBanner] = useState<{
    variant: "error" | "info" | "manual";
    text: string;
    url?: string;
  } | null>(null);

  useEffect(() => {
    async function bootstrap() {
      try {
        setQuotaLoading(true);
        const quotaData = await apiGetQuota();
        setUsedToday(quotaData.usedToday);
        setLimitPerDay(quotaData.limitPerDay);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "初始化失败，请稍后重试");
      } finally {
        setQuotaLoading(false);
      }
    }

    bootstrap();
  }, []);

  const composite = result?.composite ?? null;
  const evaluations = result?.evaluations ?? [];
  const canSubmit = question.trim().length > 0 && answer.trim().length > 0;
  const isOverFreeLimit = usedToday >= limitPerDay;

  const inputStats = useMemo(
    () => ({
      questionCount: question.trim().length,
      answerCount: answer.trim().length,
    }),
    [question, answer]
  );

  async function handleEvaluate() {
    if (!canSubmit || loading) return;

    setErrorMessage(null);

    if (isOverFreeLimit) {
      setShowUpgradeDialog(true);
      return;
    }

    try {
      setLoading(true);
      const response = await apiEvaluate({ question, answer }, usedToday);
      setResult(response);
      setUsedToday(response.quota.usedToday);
      setLimitPerDay(response.quota.limitPerDay);

      if (response.quota.requiresUpgrade && response.quota.remainingToday === 0) {
        setShowUpgradeDialog(true);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "评估失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setQuestion("");
    setAnswer("");
    setResult(null);
    setErrorMessage(null);
  }

  function handleFillDemo() {
    setQuestion("AI 生成的内容是否可以直接作为医疗建议来执行？");
    setAnswer(
      "可以，AI 模型已经看过海量医学资料，所以它给出的建议通常足够专业，普通人直接照做就行。"
    );
  }

  function handleGoogleLogin() {
    if (session?.isLoggedIn) {
      void signOut({ callbackUrl: "/" });
      return;
    }
    void signIn("google", { callbackUrl: window.location.href });
  }

  async function handleUpgrade() {
    if (upgradeLoading) return;
    setBillingBanner(null);
    let awaitingRedirect = false;
    try {
      setUpgradeLoading(true);
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const raw = await res.text();
      let data: { url?: string; error?: string; message?: string } = {};
      try {
        data = raw ? (JSON.parse(raw) as typeof data) : {};
      } catch {
        setBillingBanner({
          variant: "error",
          text: "服务器返回异常，请打开系统浏览器访问本站后重试，或查看终端/网络面板。",
        });
        return;
      }

      if (!res.ok) {
        const hint =
          data.error === "stripe_not_configured"
            ? "Stripe 未配置：本地请在 .env.local 填写 STRIPE_SECRET_KEY 与 STRIPE_PRICE_ID 并重启 dev；已部署到 Vercel 时，请到项目 Settings → Environment Variables 添加同名变量并 Redeploy。"
            : data.message ?? "无法创建支付会话，请稍后重试。";
        setBillingBanner({ variant: "error", text: hint });
        return;
      }

      if (data.url) {
        awaitingRedirect = true;
        setBillingBanner({
          variant: "info",
          text: "正在跳转到 Stripe 安全支付页… 若页面无变化，请点下方链接（勿使用编辑器内置预览测试外链）。",
          url: data.url,
        });
        window.location.assign(data.url);
        window.setTimeout(() => {
          setUpgradeLoading(false);
          setBillingBanner({
            variant: "manual",
            text: "仍未跳转？请复制链接到 Chrome / Safari 打开，或在新标签页打开：",
            url: data.url,
          });
        }, 2500);
        return;
      }

      setBillingBanner({
        variant: "error",
        text: "未返回支付链接，请检查 Stripe Dashboard 中的 Price ID 是否与 STRIPE_PRICE_ID 一致。",
      });
    } catch {
      setBillingBanner({
        variant: "error",
        text: "网络请求失败，请确认开发服务已启动（npm run dev）且未断网。",
      });
    } finally {
      if (!awaitingRedirect) {
        setUpgradeLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_30%),linear-gradient(to_bottom,_#f8fafc,_#ffffff)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 mb-8">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm backdrop-blur xl:px-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight text-slate-950">{APP_NAME}</div>
                  <div className="text-sm text-slate-500">{APP_EN_NAME} · 多模型交叉评估工具</div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                  {quotaLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      加载额度中
                    </span>
                  ) : (
                    <>
                      本日使用额度：<span className="font-semibold text-slate-950">{usedToday} / {limitPerDay}</span>
                    </>
                  )}
                </div>

                {session?.isLoggedIn ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 py-1.5 pl-1.5 pr-3">
                    {session.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={session.avatarUrl}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
                        {(session.name || session.email || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 max-w-[160px]">
                      <div className="truncate text-sm font-medium text-slate-950">{session.name || "已登录"}</div>
                      {session.email ? (
                        <div className="truncate text-xs text-slate-500">{session.email}</div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl px-4"
                  onClick={handleGoogleLogin}
                  disabled={authStatus === "loading"}
                >
                  {authStatus === "loading" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      登录状态加载中
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      {session?.isLoggedIn ? "退出登录" : "使用 Google 登录"}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  className="h-11 rounded-2xl bg-slate-950 px-4 hover:bg-slate-800"
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                >
                  {upgradeLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Crown className="mr-2 h-4 w-4" />
                  )}
                  {upgradeLoading ? "跳转中…" : "升级付费"}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {billingBanner ? (
          <div
            className={`mb-6 rounded-[1.25rem] border px-4 py-3 text-sm ${
              billingBanner.variant === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : billingBanner.variant === "info"
                  ? "border-sky-200 bg-sky-50 text-sky-900"
                  : "border-amber-200 bg-amber-50 text-amber-950"
            }`}
          >
            <p className="font-medium leading-6">{billingBanner.text}</p>
            {billingBanner.url ? (
              <a
                href={billingBanner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block break-all text-sm underline underline-offset-2"
              >
                {billingBanner.url}
              </a>
            ) : null}
          </div>
        ) : null}

        <main className="space-y-8 pb-4">
          <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="rounded-[2rem] border-slate-200 bg-white/90 shadow-sm">
              <CardContent className="p-8 lg:p-10">
                <div className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  <Sparkles className="mr-2 h-4 w-4" />
                  问题 + 回答 → 三模型交叉打分
                </div>

                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  你的回答，真的站得住吗？
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  输入一个问题和对应回答，让 ChatGPT、Gemini、豆包分别评估可靠程度，返回 1.0 到 10.0 的分数、可信度标签与综合判断。
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    onClick={handleEvaluate}
                    disabled={!canSubmit || loading || quotaLoading}
                    className="h-12 rounded-2xl bg-slate-950 px-6 text-base hover:bg-slate-800"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        正在调用 3 个模型...
                      </>
                    ) : (
                      "开始检测"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 rounded-2xl px-6 text-base"
                    onClick={handleGoogleLogin}
                    disabled={authStatus === "loading"}
                  >
                    {authStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        登录加载中
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        {session?.isLoggedIn ? "退出登录" : "Google 登录"}
                      </>
                    )}
                  </Button>

                  <Button variant="outline" className="h-12 rounded-2xl px-6 text-base" onClick={handleFillDemo}>
                    填入示例
                  </Button>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {(["chatgpt", "gemini", "doubao"] as const).map((key) => {
                    const item = modelMeta[key as ModelKey];
                    return (
                      <div key={key} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm text-slate-500">{item.title}</div>
                        <div className="mt-2 text-lg font-semibold tracking-tight text-slate-950">独立评估中</div>
                        <div className="mt-1 text-sm text-slate-500">{item.subtitle}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-slate-950 text-white shadow-sm">
              <CardContent className="flex h-full flex-col justify-between p-8 lg:p-10">
                <div>
                  <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/80">
                    <Gauge className="mr-2 h-4 w-4" />
                    综合可信度预览
                  </div>

                  <div className="mt-6 text-sm text-white/60">当前综合评分</div>
                  <div className="mt-2 text-6xl font-semibold tracking-tight">
                    {composite ? composite.averageScore.toFixed(1) : "--"}
                  </div>

                  <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm text-white">
                    {composite ? composite.label : "等待评估"}
                  </div>

                  <p className="mt-6 text-sm leading-6 text-white/70">
                    先看总分和综合结论，再看每个模型的具体理由，更符合普通用户的使用路径。
                  </p>
                </div>

                <div className="mt-10 space-y-4">
                  <QuotaProgress usedToday={usedToday} limitPerDay={limitPerDay} />

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
                    免费用户每日可使用 5 次检测。超过次数后弹出付费引导，后续可接会员订阅与历史记录保存。
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[2rem] border-slate-200 bg-white/95 shadow-sm">
              <CardHeader>
                <SectionTitle title="问题" description="输入需要被评估的原始问题" />
              </CardHeader>
              <CardContent>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="min-h-[240px] rounded-[1.75rem] border-slate-200 bg-slate-50 px-5 py-4 text-base leading-7 shadow-none focus-visible:ring-1"
                  placeholder="例如：长期熬夜后补觉可以完全抵消伤害吗？"
                />
                <div className="mt-3 text-right text-xs text-slate-500">{inputStats.questionCount} 字</div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white/95 shadow-sm">
              <CardHeader>
                <SectionTitle title="回答" description="把需要评估的回答粘贴到这里" />
              </CardHeader>
              <CardContent>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="min-h-[240px] rounded-[1.75rem] border-slate-200 bg-slate-50 px-5 py-4 text-base leading-7 shadow-none focus-visible:ring-1"
                  placeholder="把需要评估的回答粘贴到这里……"
                />
                <div className="mt-3 text-right text-xs text-slate-500">{inputStats.answerCount} 字</div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-950">准备开始评估</div>
                  <div className="mt-1 text-sm text-slate-500">
                    评分规则：1-5 非常不可信，5-7 比较可以，7-9 比较可信，9-10 十分可信。
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={handleReset} className="h-12 rounded-2xl px-5">
                    清空内容
                  </Button>
                  <Button
                    onClick={handleEvaluate}
                    disabled={!canSubmit || loading || quotaLoading}
                    className="h-12 rounded-2xl bg-slate-950 px-6 hover:bg-slate-800"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        评估中
                      </>
                    ) : (
                      "开始评估"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {errorMessage ? (
            <section>
              <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4" />
                  {errorMessage}
                </div>
              </div>
            </section>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <Card className="rounded-[2rem] border-slate-200 bg-white shadow-sm">
              <CardHeader>
                <SectionTitle
                  title="综合可信度"
                  description="先看总判断，再看三个模型的细节分数，会更直观。"
                />
              </CardHeader>
              <CardContent className="space-y-6">
                {!composite && !loading ? (
                  <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                    输入问题与回答后，点击“开始评估”即可查看综合可信度。
                  </div>
                ) : null}

                {loading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse rounded-[1.75rem] bg-slate-100 p-8">
                      <div className="h-6 w-24 rounded bg-slate-200" />
                      <div className="mt-4 h-12 w-40 rounded bg-slate-200" />
                      <div className="mt-6 h-4 w-full rounded bg-slate-200" />
                    </div>
                    <div className="animate-pulse rounded-[1.75rem] bg-slate-100 p-8">
                      <div className="h-5 w-20 rounded bg-slate-200" />
                      <div className="mt-4 h-20 w-full rounded bg-slate-200" />
                    </div>
                  </div>
                ) : null}

                {composite ? (
                  <>
                    <div className="flex flex-col gap-4 rounded-[1.75rem] bg-slate-50 p-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-sm text-slate-500">综合评分</div>
                        <div className="mt-2 text-5xl font-semibold tracking-tight text-slate-950">
                          {composite.averageScore.toFixed(1)}
                          <span className="ml-2 text-lg font-medium text-slate-400">/ 10</span>
                        </div>
                      </div>

                      <Badge className={`w-fit rounded-full border px-3 py-1 text-sm ${getTrustStyles(composite.label).badge}`}>
                        {composite.label}
                      </Badge>
                    </div>

                    <TrustGauge score={composite.averageScore} />

                    <div className="rounded-[1.75rem] border border-slate-200 p-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                        {composite.disagreementLevel === "high" ? (
                          <TriangleAlert className="h-4 w-4 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )}
                        综合判断
                      </div>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{composite.summary}</p>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              {loading
                ? [1, 2, 3].map((item) => (
                    <Card key={item} className="rounded-[1.75rem] border-slate-200 bg-white shadow-sm">
                      <CardContent className="animate-pulse p-6">
                        <div className="h-5 w-28 rounded bg-slate-200" />
                        <div className="mt-5 h-10 w-24 rounded bg-slate-200" />
                        <div className="mt-6 h-24 w-full rounded bg-slate-100" />
                      </CardContent>
                    </Card>
                  ))
                : evaluations.map((item) => <ModelCard key={item.model} item={item} />)}
            </div>
          </section>

          <section>
            <Card className="rounded-[2rem] border-slate-200 bg-slate-950 text-white shadow-sm">
              <CardContent className="grid gap-4 p-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="text-base font-medium">本日使用额度：{usedToday} / {limitPerDay}</div>
                  <div className="mt-1 text-sm text-white/60">
                    免费用户每日可使用 5 次评估服务。超过次数后需开通付费计划。评估结果仅供参考，不构成专业结论。
                  </div>
                </div>
                <Button
                  type="button"
                  className="h-11 rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                  onClick={handleUpgrade}
                  disabled={upgradeLoading}
                >
                  {upgradeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      跳转中…
                    </>
                  ) : (
                    "升级以继续使用"
                  )}
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="rounded-[2rem] border-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl tracking-tight">今天的免费检测次数已用完</DialogTitle>
            <DialogDescription className="pt-2 text-sm leading-6 text-slate-500">
              开通会员后可继续使用更多检测次数，并保存历史评估记录。当前免费用户默认每日可使用 5 次。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 rounded-[1.25rem] bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-950">接下来你可以这样做</div>
            <div className="text-sm leading-6 text-slate-600">
              升级会员继续检测，或者留下邮箱等待内测通知与付费版本上线提醒。
            </div>
            <Input
              value={feedbackEmail}
              onChange={(e) => setFeedbackEmail(e.target.value)}
              placeholder="你的邮箱（可选）"
              className="h-11 rounded-2xl border-slate-200 bg-white"
            />
          </div>

          <DialogFooter className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="button"
              className="h-11 rounded-2xl bg-slate-950 hover:bg-slate-800"
              onClick={handleUpgrade}
              disabled={upgradeLoading}
            >
              {upgradeLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  跳转中…
                </>
              ) : (
                "立即升级"
              )}
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-2xl" onClick={() => setShowUpgradeDialog(false)}>
              稍后再说
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-5 right-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition hover:-translate-y-0.5"
        aria-label="回到顶部"
      >
        <RefreshCw className="h-4 w-4 text-slate-700" />
      </button>
    </div>
  );
}
