import Link from "next/link";

export default function BillingSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 py-16 text-slate-900">
      <h1 className="text-2xl font-semibold tracking-tight">支付成功</h1>
      <p className="max-w-md text-center text-sm leading-6 text-slate-600">
        感谢支持。返回首页即可继续使用。若需在应用内自动提升额度，请在{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">/api/billing/webhook</code>{" "}
        中接入数据库同步（Stripe 事件 <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs">checkout.session.completed</code>
        等）。
      </p>
      <Link
        href="/"
        className="mt-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-medium text-white hover:bg-slate-800"
      >
        返回首页
      </Link>
    </div>
  );
}
