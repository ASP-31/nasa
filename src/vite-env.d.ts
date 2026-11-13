/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MARS_ADVISOR_API_KEY?: string;
  readonly VITE_MARS_ADVISOR_BASE_URL?: string;
  readonly VITE_MARS_ADVISOR_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
