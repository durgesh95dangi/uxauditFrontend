import Link from "next/link";

export default function PageToolbar({
  onBack,
  backHref,
  backLabel = "← Back",
  children,
  className = ""
}) {
  const backClassName = "page-toolbar-back btn btn-ghost btn-sm";

  return (
    <header className={`page-toolbar${className ? ` ${className}` : ""}`}>
      {backHref ? (
        <Link href={backHref} className={backClassName}>
          {backLabel}
        </Link>
      ) : onBack ? (
        <button type="button" className={backClassName} onClick={onBack}>
          {backLabel}
        </button>
      ) : (
        <span className="page-toolbar-spacer" aria-hidden="true" />
      )}

      {children ? <div className="page-toolbar-actions">{children}</div> : null}
    </header>
  );
}
