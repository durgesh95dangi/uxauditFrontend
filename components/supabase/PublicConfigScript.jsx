import { getPublicSupabaseConfig, hasPublicSupabaseConfig } from "../../lib/supabase/publicConfig.js";

export default function PublicConfigScript() {
  const config = getPublicSupabaseConfig();
  if (!hasPublicSupabaseConfig(config)) return null;

  const payload = JSON.stringify({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey
  });

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `window.__UXAUDITX_PUBLIC_CONFIG__=${payload}`
      }}
    />
  );
}
