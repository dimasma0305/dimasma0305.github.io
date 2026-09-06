"use client";

// Long-form content styles (notion/prose/prism/TOC) live in a separate
// stylesheet so only post/note routes ship them.
import "@/app/content.css";
import { useEffect, useState, lazy, Suspense } from "react";
import { formatBlogDate } from "@/lib/blog-archive";
import { BlogReturnLink } from "@/components/blog-return-link";
import "@/lib/blog.css";
import { ArrowLeft, ArrowDown, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import { handleHashOnPageLoad } from "@/lib/scroll-utils";
import { optimizedContentCover } from "@/lib/optimized-media.mjs";

import { fetchPostBySlug } from "@/lib/posts-loader";
import { usePosts } from "@/hooks/use-posts";
import type { Post } from "@/lib/posts-client";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
// Server-render the article body so it lands in the static export (SSG). Mdx's
// render output is a pure `dangerouslySetInnerHTML` div (no browser APIs at
// render time — document/window/Prism all live inside useEffect), so it is
// SSR-safe. Keeping `ssr: false` here would exclude the body from the
// prerendered HTML and defeat the build-time `initialPost` we now pass.
const Mdx = dynamic(() => import("@/components/mdx").then((m) => m.Mdx));
import { PostSkeleton } from "@/components/post-skeleton";

// Lazy load heavy components for better initial page load
const TableOfContents = lazy(() =>
  import("@/components/table-of-contents").then((m) => ({
    default: m.TableOfContents,
  })),
);
const ShareButtons = lazy(() =>
  import("@/components/share-buttons").then((m) => ({
    default: m.ShareButtons,
  })),
);
const PostNavigation = lazy(() =>
  import("@/components/post-navigation").then((m) => ({
    default: m.PostNavigation,
  })),
);

interface PostPageClientProps {
  slug: string;
  // Pre-rendered post built at build time (SSG). When provided, the body HTML
  // is already in the static markup; we skip the client fetch entirely.
  initialPost?: Post;
}

export default function PostPageClient({
  slug,
  initialPost,
}: PostPageClientProps) {
  const [post, setPost] = useState<Post | null>(initialPost ?? null);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);
  // If the cover image fails to load (e.g. an expired Notion URL), hide the
  // whole banner rather than showing a broken box or a generic fallback.
  const [coverError, setCoverError] = useState(false);
  const [useOriginalCover, setUseOriginalCover] = useState(false);
  const { posts } = usePosts();

  useEffect(() => {
    // When the post was pre-rendered at build time, its content is already
    // render-ready (the server loader applies the same code-block normalization),
    // so skip the client fetch and avoid any double-processing.
    if (initialPost) {
      return;
    }

    const loadPost = async () => {
      try {
        const fetchedPost = await fetchPostBySlug(slug);
        if (!fetchedPost) {
          setError("Post not found");
          return;
        }

        // Process the content if needed
        if (fetchedPost.content) {
          // Make sure code blocks have proper language classes
          fetchedPost.content = fetchedPost.content
            .replace(/<pre><code>/g, '<pre><code class="language-text">')
            .replace(/<pre><code class="language-(\w+)">/g, (match, lang) => {
              return `<pre><code class="language-${lang}">`;
            });
        }

        setPost(fetchedPost);
      } catch (err) {
        console.error("Error loading post:", err);
        setError("Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug, initialPost]);

  // Handle scroll to hash on page load with lazy loading awareness
  useEffect(() => {
    if (!loading && post) {
      handleHashOnPageLoad({
        behavior: "smooth",
        lazyLoadDelay: 250,
      });
    }
  }, [loading, post]);

  if (loading) {
    return <PostSkeleton />;
  }

  if (error || !post) {
    return (
      <div className="container px-4 py-12 mx-auto max-w-7xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The requested post could not be found."}
          </p>
          <Button asChild>
            <Link href="/blog/" prefetch={false}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Calculate reading time
  const estimateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Get related posts
  const relatedPosts = posts
    .filter(
      (p) =>
        p.id !== post.id &&
        p.categories?.some((cat) => post.categories?.includes(cat)),
    )
    .slice(0, 3);

  return (
    <div className="reading-page blog-reading">
      <header className="reading-hero">
        <div className="container">
          <BlogReturnLink />
          <div
            className={
              post.coverImage && !coverError
                ? "blog-reading-intro"
                : "blog-reading-intro blog-reading-intro-text"
            }
          >
            <div>
              <div className="blog-reading-topics">
                {post.categories.map((category) => (
                  <Link
                    key={category}
                    href={`/blog/?topic=${encodeURIComponent(category)}`}
                    prefetch={false}
                  >
                    {category}
                  </Link>
                ))}
              </div>
              <h1>{post.title}</h1>
              {post.excerpt && (
                <p className="blog-reading-excerpt">{post.excerpt}</p>
              )}
              <div className="blog-reading-meta">
                <span>{post.owner?.name || "Dimas Maulana"}</span>
                <time dateTime={post.createdAt}>
                  {formatBlogDate(post.createdAt)}
                </time>
                {post.content && (
                  <span>
                    <Clock size={14} aria-hidden="true" />
                    {post.readingTime || estimateReadingTime(post.content)} min
                    read
                  </span>
                )}
              </div>
              <div className="blog-reading-actions">
                <a href="#article-body">
                  Start reading <ArrowDown size={15} aria-hidden="true" />
                </a>
                {post.notionUrl && (
                  <a
                    href={post.notionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Original on Notion{" "}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </a>
                )}
              </div>
            </div>
            {post.coverImage && !coverError && (
              <div className="blog-reading-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    useOriginalCover
                      ? post.coverImage
                      : optimizedContentCover(post.coverImage)
                  }
                  alt=""
                  loading="lazy"
                  onError={() => {
                    if (
                      !useOriginalCover &&
                      optimizedContentCover(post.coverImage) !== post.coverImage
                    ) {
                      setUseOriginalCover(true);
                    } else {
                      setCoverError(true);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </header>
      <div className="container blog-reading-content">
        <div className="reading-layout">
          <div className="reading-column">
            {post.content && (
              <div className="lg:hidden mb-8">
                <Suspense fallback={null}>
                  <TableOfContents
                    content={post.content}
                    label="On this page"
                  />
                </Suspense>
              </div>
            )}
            <article
              id="article-body"
              className="reading-body"
              aria-label={post.title}
            >
              {post.content ? (
                <Mdx content={post.content} />
              ) : (
                <p>No content is available for this article yet.</p>
              )}
            </article>
            <footer className="blog-article-footer">
              <div className="blog-article-share">
                <h2>Worth sharing?</h2>
                <Suspense fallback={null}>
                  <ShareButtons
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    categories={post.categories}
                  />
                </Suspense>
              </div>
              {relatedPosts.length > 0 && (
                <section
                  className="blog-related"
                  aria-labelledby="blog-related-heading"
                >
                  <h2 id="blog-related-heading">Keep exploring</h2>
                  <div>
                    {relatedPosts.map((related) => (
                      <Link
                        key={related.id}
                        href={`/posts/${related.slug}/`}
                        prefetch={false}
                      >
                        <h3>{related.title}</h3>
                        <span>
                          {formatBlogDate(related.createdAt)}{" "}
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              <Suspense fallback={null}>
                <PostNavigation currentSlug={post.slug} />
              </Suspense>
              <BlogReturnLink />
            </footer>
          </div>
          <aside className="hidden lg:block" aria-label="Article navigation">
            <div className="reading-sidebar">
              {post.content && (
                <Suspense fallback={null}>
                  <TableOfContents
                    content={post.content}
                    label="On this page"
                  />
                </Suspense>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
