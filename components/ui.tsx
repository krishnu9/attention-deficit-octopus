export const card =
  "rounded-2xl border border-border bg-card p-5 shadow-sm";
export const input =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent";
export const btn =
  "rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:opacity-40";
export const btnGhost =
  "rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent";
export const label = "text-xs font-medium uppercase tracking-wide text-muted";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`${card} ${className}`}>{children}</section>;
}
