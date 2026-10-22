// Never invent a repository owner. Set this at build time after creating a real repo.
function repositoryUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "github.com" &&
      /^\/[\w.-]+\/[\w.-]+\/?$/.test(url.pathname) &&
      !url.username &&
      !url.password
      ? `${url.origin}${url.pathname.replace(/\/$/, "")}`
      : null;
  } catch {
    return null;
  }
}
export const GITHUB_URL = repositoryUrl(import.meta.env.VITE_GITHUB_URL);
export { repositoryUrl };
