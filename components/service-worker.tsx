"use client";

import { useEffect } from "react";
import { withBasePath } from "@/lib/utils";

/** Registers `public/sw.js` after the page has loaded. Production only: the
 * worker caches hashed assets across visits, which is wrong for `next dev`. */
export function ServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    const register = () => {
      navigator.serviceWorker
        .register(withBasePath("/sw.js"), { scope: withBasePath("/") })
        .catch(() => {
          /* The site works identically without it. */
        });
    };
    if (document.readyState === "complete") {
      register();
      return;
    }
    addEventListener("load", register, { once: true });
    return () => removeEventListener("load", register);
  }, []);
  return null;
}
