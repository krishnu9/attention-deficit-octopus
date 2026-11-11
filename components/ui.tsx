export const card =
  "rounded-xl border border-border bg-card p-5";
export const input =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent focus-visible:outline-2 focus-visible:outline-accent";
export const btn =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40";
export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm transition-colors hover:border-fg/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-40";
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

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={`h-4 w-4 animate-spin motion-reduce:animate-none ${className}`}
    >
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-border/60 motion-reduce:animate-none ${className}`}
    />
  );
}

export function BusyButton({
  busy = false,
  className = btn,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || busy}
      aria-busy={busy}
      className={className}
    >
      {busy ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function LoadError({
  message = "Could not load this page.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <p className="text-sm text-muted">
      {message}{" "}
      {onRetry ? (
        <button type="button" className="text-accent underline" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </p>
  );
}
