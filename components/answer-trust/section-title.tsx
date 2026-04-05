export function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
