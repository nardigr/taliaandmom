import { cn } from "@/lib/utils";

type FloralMotifProps = {
  variant?: "frame" | "divider" | "ampersand";
  className?: string;
};

export function FloralMotif({ variant = "divider", className }: FloralMotifProps) {
  if (variant === "ampersand") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className={cn("inline-block h-[0.85em] w-[0.85em] text-rose-deep", className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 6c-2 0-3.5 1.5-3.5 3.5S6 13 8 13s3.5-1.5 3.5-3.5" />
        <path d="M16 18c2 0 3.5-1.5 3.5-3.5S18 11 16 11s-3.5 1.5-3.5 3.5" />
        <path d="M8 13c0 2 2 4 4 4" />
        <path d="M16 11c0-2-2-4-4-4" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <path d="M10.5 10.5c.5-.5 1.2-.8 1.9-.8" />
        <path d="M13.5 13.5c-.5.5-1.2.8-1.9.8" />
      </svg>
    );
  }

  if (variant === "frame") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 400 500"
        className={cn("pointer-events-none absolute inset-0 h-full w-full text-rose-deep", className)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        preserveAspectRatio="none"
      >
        <path d="M24 80 C24 40, 60 24, 100 24 L300 24 C340 24, 376 40, 376 80 L376 420 C376 460, 340 476, 300 476 L100 476 C60 476, 24 460, 24 420 Z" />
        <path d="M60 60c8-12 20-18 32-18" />
        <path d="M340 60c-8-12-20-18-32-18" />
        <path d="M60 440c8 12 20 18 32 18" />
        <path d="M340 440c-8 12-20 18-32 18" />
        <path d="M200 24c-6 10-10 22-10 34" />
        <path d="M200 476c6-10 10-22 10-34" />
        <circle cx="200" cy="58" r="3" fill="currentColor" stroke="none" />
        <circle cx="200" cy="442" r="3" fill="currentColor" stroke="none" />
        <path d="M48 200c-10-6-16-16-16-28" />
        <path d="M352 200c10-6 16-16 16-28" />
        <path d="M48 300c-10 6-16 16-16 28" />
        <path d="M352 300c10 6 16 16 16 28" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden
      viewBox="0 0 120 32"
      className={cn("mx-auto h-8 w-28 text-rose-deep", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 16c0-6 4-10 10-10 3 0 6 1.5 8 4" />
      <path d="M22 10c2-3 5-5 9-5" />
      <path d="M60 16v-8" />
      <circle cx="60" cy="20" r="2.5" fill="currentColor" stroke="none" />
      <path d="M60 22c0 4 2 6 4 6" />
      <path d="M112 16c0-6-4-10-10-10-3 0-6 1.5-8 4" />
      <path d="M98 10c-2-3-5-5-9-5" />
    </svg>
  );
}
