import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 py-16 text-slate-900">
      <h1 className="text-2xl font-semibold tracking-tight">已取消支付</h1>
      <p className="max-w-md text-center text-sm leading-6 text-slate-600">未扣款。你可以随时在首页再次点击升级。</p>
      <Link
        href="/"
        className="mt-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
      >
        返回首页
      </Link>
    </div>
  );
}
