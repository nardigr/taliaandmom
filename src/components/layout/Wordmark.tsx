import { cn } from "@/lib/utils";
import { FloralMotif } from "@/components/ui/FloralMotif";

type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-0 font-display font-normal tracking-tight text-choco",
        className,
      )}
    >
      Talja
      <span className="relative inline-flex items-center text-rose-deep">
        <span aria-hidden className="absolute -inset-x-1 -inset-y-2 opacity-40">
          <FloralMotif variant="ampersand" className="h-full w-full" />
        </span>
        <span className="relative">&</span>
      </span>
      mom
    </span>
  );
}
