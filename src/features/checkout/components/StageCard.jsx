/**
 * Shell for one checkout stage, keeps headings, padding and card styling identical
 * across stages.
 *
 * @param {Object} props
 * @param {string} props.heading
 * @param {string} [props.description]
 * @param {React.ReactNode} props.children
 */
export function StageCard({ heading, description, children }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">{heading}</h2>
      {description && <p className="mt-1 text-sm text-body">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}
