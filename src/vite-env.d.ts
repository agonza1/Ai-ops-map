/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LEAD_CAPTURE_ENDPOINT?: string;
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_HUBSPOT_PORTAL_ID?: string;
  readonly VITE_HUBSPOT_FORM_ID?: string;
  readonly VITE_HUBSPOT_SUBSCRIPTION_TYPE_ID?: string;
  readonly VITE_SCHEDULER_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
