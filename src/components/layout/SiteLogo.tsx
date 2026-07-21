import Image from "next/image";
import { Wordmark } from "@/components/layout/Wordmark";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  logoUrl?: string | null;
  className?: string;
  wordmarkClassName?: string;
  priority?: boolean;
  centered?: boolean;
};

export function SiteLogo({
  logoUrl,
  className,
  wordmarkClassName,
  priority = false,
  centered = false,
}: SiteLogoProps) {
  if (logoUrl) {
    return (
      <span
        className={cn(
          "relative inline-flex h-9 w-auto items-center sm:h-11",
          centered && "mx-auto",
          className,
        )}
      >
        <Image
          src={logoUrl}
          alt="Talja&mom"
          width={180}
          height={44}
          priority={priority}
          className={cn(
            "h-9 w-auto max-w-[160px] object-contain sm:h-11 sm:max-w-[200px]",
            centered ? "object-center" : "object-left",
          )}
          unoptimized={logoUrl.startsWith("/api/uploads/")}
        />
      </span>
    );
  }

  return (
    <Wordmark
      className={cn(
        "text-2xl sm:text-3xl",
        centered && "text-center",
        wordmarkClassName,
      )}
    />
  );
}
