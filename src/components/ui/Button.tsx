import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  form?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-choco text-ivory hover:bg-choco-soft border border-transparent",
  secondary:
    "border border-choco text-choco bg-transparent hover:bg-cream",
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full px-8 py-3 font-sans text-[13px] uppercase tracking-widest transition-colors duration-200";

export function Button({
  variant = "primary",
  href,
  className,
  children,
  onClick,
  disabled = false,
  type = "button",
  form,
}: ButtonProps) {
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    disabled && "pointer-events-none opacity-50",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      form={form}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
