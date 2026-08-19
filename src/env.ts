import type { OAuthHelpers } from
  "@cloudflare/workers-oauth-provider";

export interface Env {
  OAUTH_KV: KVNamespace;
  OAUTH_PROVIDER: OAuthHelpers;
  COOKIE_ENCRYPTION_KEY: string;

  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_ALLOWED_LOGIN?: string;
  GITHUB_ALLOWED_ID?: string;
}
