import SiteNav from "./SiteNav.jsx";

export default function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <SiteNav minimal />
      <main className="auth-main">{children}</main>
    </div>
  );
}
