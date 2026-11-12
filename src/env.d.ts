/** Environment variables the site reads (see `.env.example`). */
interface ImportMetaEnv {
  readonly PUBLIC_CONTACT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
