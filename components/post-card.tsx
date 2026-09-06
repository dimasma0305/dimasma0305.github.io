"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar } from "lucide-react";

import type { Post } from "@/lib/posts-client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { FallbackImage } from "@/components/fallback-image";
import { NotionLinkButton } from "@/components/notion-link-button";
import { withBasePath } from "@/lib/utils";

interface PostCardProps {
  post: Post;
  /** Eager-load the cover (first row of an above-the-fold grid): a lazy
      LCP image starts downloading only after layout, wrecking LCP. */
  priority?: boolean;
}

// Memoized cover image component
const CoverImage = memo(
  ({
    coverImage,
    title,
    iconEmoji,
    notionUrl,
    priority,
  }: {
    coverImage: string;
    title: string;
    iconEmoji?: string;
    notionUrl?: string | null;
    priority?: boolean;
  }) => {
    // Only apply withBasePath to internal/relative paths, not external URLs
    const imageSrc = coverImage?.startsWith("http")
      ? coverImage
      : withBasePath(coverImage);

    return (
      <div className="post-cover relative w-full h-48 overflow-hidden bg-muted">
        {/* Token gradient fills the letterbox bars behind the object-contain cover
          (which is shown whole, never cropped). A static gradient — not a copy of
          the cover — so the box paints instantly and never eagerly fetches the
          image, leaving the lazy foreground to control the actual download. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-muted via-card to-muted"
        />
        <FallbackImage
          src={imageSrc}
          alt={title}
          fill
          priority={priority}
          className="object-contain transition-transform duration-300 group-hover:scale-105"
          fallbackSrc={withBasePath("/placeholder.svg?height=192&width=384")}
        />
        {iconEmoji && (
          <div className="absolute flex items-center justify-center w-10 h-10 text-xl rounded-full bg-background/90 border border-border top-4 right-4 shadow-sm">
            {iconEmoji}
          </div>
        )}
        {/* Bottom-right keeps the badge clear of cover-art titles and banner
          strips (typically top/left); z-10 keeps it clickable above the
          card's stretched link overlay. */}
        {notionUrl && (
          <div className="absolute bottom-3 right-3 z-10">
            <NotionLinkButton notionUrl={notionUrl} variant="badge" />
          </div>
        )}
      </div>
    );
  },
);

CoverImage.displayName = "CoverImage";

// Memoized card footer
const PostFooter = memo(
  ({ createdAt, categories }: { createdAt: string; categories: string[] }) => {
    const formattedDate = useMemo(
      () => format(new Date(createdAt), "MMM d, yyyy"),
      [createdAt],
    );

    return (
      <CardFooter className="post-card-footer flex flex-wrap items-center justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4 mr-1" />
          <time dateTime={createdAt}>{formattedDate}</time>
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary">{categories[0]}</Badge>
            {categories.length > 1 && (
              <Badge variant="outline" className="text-xs">
                +{categories.length - 1}
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
    );
  },
);

PostFooter.displayName = "PostFooter";

// CSS-based hover effect only

function PostCard({ post, priority }: PostCardProps) {
  // Memoize post URL
  const postUrl = useMemo(() => `/posts/${post.slug}`, [post.slug]);

  return (
    <div className="post-card group relative transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-1">
      <Card className="post-card-surface overflow-hidden h-full transition-shadow duration-[var(--dur-base)] ease-[var(--ease-out)] group-hover:shadow-[var(--elevation-2)]">
        {post.coverImage ? (
          <CoverImage
            coverImage={post.coverImage}
            title={post.title}
            iconEmoji={post.iconEmoji}
            notionUrl={post.notionUrl}
            priority={priority}
          />
        ) : (
          /* Branded header keeps the grid rhythm when a post has no cover. */
          <div className="post-cover relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-card to-background">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary/70">
              {post.categories?.[0] ?? "Writeup"}
            </span>
            {post.iconEmoji && (
              <div className="absolute flex items-center justify-center w-10 h-10 text-xl rounded-full bg-background/90 border border-border top-4 right-4 shadow-sm">
                {post.iconEmoji}
              </div>
            )}
            {post.notionUrl && (
              <div className="absolute bottom-3 right-3 z-10">
                <NotionLinkButton notionUrl={post.notionUrl} variant="badge" />
              </div>
            )}
          </div>
        )}

        <CardHeader className="post-card-header pb-2">
          {/* overflow-wrap:anywhere lets long unbreakable tokens (file paths,
              CVE ids) break instead of forcing the card wider than a phone. */}
          <h2 className="post-card-title text-xl font-bold line-clamp-2 [overflow-wrap:anywhere] group-hover:text-primary transition-colors">
            {post.title}
          </h2>
        </CardHeader>

        <CardContent className="post-card-content">
          <p className="text-muted-foreground line-clamp-3 leading-relaxed [overflow-wrap:anywhere]">
            {post.excerpt}
          </p>
        </CardContent>

        <PostFooter
          createdAt={post.createdAt}
          categories={post.categories as string[]}
        />
      </Card>

      {/* Stretched primary link — covers the card without nesting other controls */}
      <Link
        href={postUrl}
        prefetch={false}
        aria-label={post.title}
        className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </div>
  );
}

export default memo(PostCard);
