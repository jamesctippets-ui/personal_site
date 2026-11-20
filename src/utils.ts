/**
 * Prefix an internal path with the configured base path so links work both
 * locally ("/") and on GitHub Pages ("/personal_site/"). Always use this for
 * internal links and /public assets instead of hard-coding "/...".
 */
export function withBase(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.replace(/^\//, '');
  return clean ? `${base}/${clean}` : `${base}/`;
}
