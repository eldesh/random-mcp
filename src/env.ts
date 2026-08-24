import type { OAuthHelpers } from
  "@cloudflare/workers-oauth-provider";

export interface Env extends Cloudflare.Env {
  OAUTH_PROVIDER: OAuthHelpers;
  GITHUB_ALLOWED_LOGIN?: string;
  GITHUB_ALLOWED_ID?: string;
}
