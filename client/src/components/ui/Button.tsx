import { type ReactNode, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "glass" | "ghost";
type Size = "md" | "lg";

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
  children: ReactNode;
}

type ButtonProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps>;

const variantClasses: Record<Variant, string> = {
  primary: [
    "bg-brand-gradient text-white font-semibold",
    "shadow-[0_0_0_0_rgba(37,99,235,0)]",
    "hover:shadow-[0_0_24px_6px_rgba(37,99,235,0.40)] hover:scale-[1.03]",
    "active:scale-[0.97]",
  ].join(" "),
  glass: [
    "glass text-foreground font-medium",
    "hover:shadow-[0_0_20px_4px_rgba(37,99,235,0.18)] hover:scale-[1.02]",
    "active:scale-[0.97]",
  ].join(" "),
  ghost: [
    "bg-transparent text-foreground font-medium border border-transparent",
    "hover:border-border hover:bg-surface hover:scale-[1.02]",
    "active:scale-[0.97]",
  ].join(" "),
};

const sizeClasses: Record<Size, string> = {
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

function isInternalHref(href: string): boolean {
  return href.startsWith("/") || href.startsWith("#");
}

// Only true http(s) links should open in a new tab with noopener/noreferrer.
// Protocol links (`mailto:`, `tel:`, `sms:`) navigate in-place and are handled
// by the plain-anchor branch WITHOUT target/rel.
function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full transition-all duration-200 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );

  if (href) {
    if (isInternalHref(href)) {
      // Next.js Link for internal routes/anchors
      return (
        <Link
          href={href}
          className={classes}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }
    // Plain anchor. Real external http(s) links open in a new tab;
    // protocol links (mailto:/tel:/sms:) navigate in-place — no target/rel.
    const external = isExternalHref(href);
    return (
      <a
        href={href}
        className={classes}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
