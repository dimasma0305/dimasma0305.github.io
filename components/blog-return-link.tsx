"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { validBlogReturn } from "@/lib/blog-archive";

export function BlogReturnLink() {
  const [href, setHref] = useState("/blog/");
  useEffect(() => {
    try {
      setHref(validBlogReturn(sessionStorage.getItem("blog:filters") || ""));
    } catch {
      /* Storage is optional. */
    }
  }, []);
  return (
    <Link className="blog-return-link" href={href} prefetch={false}>
      <ArrowLeft size={16} aria-hidden="true" />
      {href.includes("?") ? "Back to your results" : "Back to all posts"}
    </Link>
  );
}
