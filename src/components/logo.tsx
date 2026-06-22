import { cn } from "@/lib/utils";

export function Logo({
  className,
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-7"
        fill="none"
        aria-hidden
      >
        <rect width="32" height="32" rx="8" fill="var(--primary)" />
        <path
          d="M16 7l7 18h-3.6l-1.3-3.6h-4.2L12.6 25H9l7-18zm0 5.6l-1.4 4h2.8L16 12.6z"
          fill="white"
        />
      </svg>
      {showText && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          <span className="text-primary">CRM</span>
        </span>
      )}
    </span>
  );
}
