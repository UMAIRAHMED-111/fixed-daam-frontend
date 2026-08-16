/**
 * PageHeader: consistent title block for every dashboard screen.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.description] - What this screen is for, in one line
 * @param {React.ReactNode} [props.actions] - Primary action(s), right-aligned
 */
export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-[-0.02em] text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-body">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
