import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  BUTTON_DANGER_CLASS,
  BUTTON_PRIMARY_CLASS,
  BUTTON_SECONDARY_CLASS,
  BUTTON_SIZES,
  BUTTON_TERTIARY_CLASS,
} from "@/lib/styles";

const variantClasses = {
  primary: BUTTON_PRIMARY_CLASS,
  secondary: BUTTON_SECONDARY_CLASS,
  tertiary: BUTTON_TERTIARY_CLASS,
  danger: BUTTON_DANGER_CLASS,
};

/**
 * Button: one shape, four intents, three sizes.
 *
 * @param {Object} props
 * @param {"primary"|"secondary"|"tertiary"|"danger"} [props.variant="primary"]
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 * @param {boolean} [props.isLoading=false] - Swaps in a spinner and blocks input
 * @param {boolean} [props.fullWidth=false]
 */
export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...rest
}) {
  const base = variantClasses[variant] ?? variantClasses.primary;
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(base, BUTTON_SIZES[size], fullWidth && "w-full", className)}
      {...rest}
    >
      {isLoading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
