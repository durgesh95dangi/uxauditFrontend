import { Suspense } from "react";
import PublicConfigScript from "../../components/supabase/PublicConfigScript.jsx";

export const dynamic = "force-dynamic";

export default function AuthLayout({ children }) {
  return (
    <>
      <PublicConfigScript />
      <Suspense fallback={null}>{children}</Suspense>
    </>
  );
}
