import { Children, cloneElement, isValidElement } from "react";

/**
 * FormField: label, optional hint, error message, and child input.
 *
 * The `id` is pushed onto the child control so the label actually points at
 * something. Without it `htmlFor` dangles: clicking the label does nothing and
 * screen readers announce an unlabelled field. Hints and errors are wired up
 * through `aria-describedby` for the same reason.
 *
 * @param {Object} props
 * @param {string} [props.label]
 * @param {boolean} [props.required]
 * @param {string} [props.error]
 * @param {string} [props.id]
 * @param {string} [props.hint]
 * @param {React.ReactNode} [props.children]
 */
export function FormField({ label, required, error, id, hint, children }) {
  const hintId = hint && !error && id ? `${id}-hint` : undefined;
  const errorId = error && id ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  // Only the first element child is treated as the control; anything after it
  // (helper text, a password strength meter) is left untouched.
  let controlSeen = false;
  const enhanced = Children.map(children, (child) => {
    if (!isValidElement(child) || controlSeen) return child;
    controlSeen = true;
    return cloneElement(child, {
      id: child.props.id ?? id,
      "aria-invalid": error ? true : child.props["aria-invalid"],
      "aria-describedby": child.props["aria-describedby"] ?? describedBy,
      "aria-required": required || undefined,
    });
  });

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-primary">*</span>}
        </label>
      )}
      {enhanced}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
