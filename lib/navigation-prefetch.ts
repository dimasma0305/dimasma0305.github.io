type Connection = { saveData?: boolean; effectiveType?: string };

export function shouldPrefetch(
  connection?: Connection,
  hidden = false,
): boolean {
  return (
    !hidden &&
    !connection?.saveData &&
    !["slow-2g", "2g"].includes(connection?.effectiveType || "")
  );
}

/** Only local page destinations; never same-page anchors, downloads or APIs. */
export function prefetchDestination(
  href: string,
  current: string,
  basePath = "",
): string | null {
  try {
    const url = new URL(href, current);
    const here = new URL(current);
    if (
      url.origin !== here.origin ||
      !["http:", "https:"].includes(url.protocol)
    ) {
      return null;
    }
    const clean = (value: string) => value.replace(/\/+$/, "") || "/";
    if (
      clean(url.pathname) === clean(here.pathname) &&
      url.search === here.search
    ) {
      return null;
    }
    let pathname = url.pathname;
    if (basePath) {
      if (pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
        return null;
      }
      pathname = pathname.slice(basePath.length) || "/";
    }
    if (
      !/^\/(?:$|(?:blog|notes|posts|categories|tags|tools|services|search)(?:\/|$))/.test(
        pathname,
      )
    ) {
      return null;
    }
    if (/\.[a-z\d]{2,8}$/i.test(pathname)) {
      return null;
    }
    return `${pathname}${url.search}`;
  } catch {
    return null;
  }
}
