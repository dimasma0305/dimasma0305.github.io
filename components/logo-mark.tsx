import { siteBrand } from "@/lib/site-brand.mjs";

type LogoMarkProps = {
  variant?: "light" | "dark";
  size?: number;
  className?: string;
};

/** Decorative when paired with the site's visible, accessible wordmark. */
export function LogoMark({
  variant = "dark",
  size = 32,
  className,
}: LogoMarkProps) {
  const colors = siteBrand.colors[variant];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d={siteBrand.mark} fill={colors.accent} fillRule="evenodd" />
    </svg>
  );
}
