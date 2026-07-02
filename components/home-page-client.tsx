"use client";

import { memo, useMemo, Suspense, lazy, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { handleHashOnPageLoad } from "@/lib/scroll-utils";
import { usePosts } from "@/hooks/use-posts";
import PostCard from "@/components/post-card";
import { CardSkeleton } from "@/components/card-skeleton";
import { FallbackImage } from "@/components/fallback-image";
import { SectionHeader } from "@/components/section-header";
import { Parallax } from "@/components/parallax";
import { ScrollSky } from "@/components/scroll-sky";

// Lazy load heavy sections for better initial page load
const HeroSection = lazy(() =>
  import("@/components/hero-section").then((m) => ({ default: m.HeroSection })),
);
const ProjectsSection = lazy(() =>
  import("@/components/projects-section").then((m) => ({
    default: m.ProjectsSection,
  })),
);
const SkillsSection = lazy(() =>
  import("@/components/skills-section").then((m) => ({
    default: m.SkillsSection,
  })),
);
const CTFSection = lazy(() =>
  import("@/components/ctf-section").then((m) => ({ default: m.CTFSection })),
);
const ExperienceSection = lazy(() =>
  import("@/components/experience-section").then((m) => ({
    default: m.ExperienceSection,
  })),
);
const ServicesSection = lazy(() =>
  import("@/components/services-section").then((m) => ({
    default: m.ServicesSection,
  })),
);
const PhotoGallerySection = lazy(() =>
  import("@/components/photo-gallery-section").then((m) => ({
    default: m.PhotoGallerySection,
  })),
);

// Memoized About section component
const AboutSection = memo(() => (
  <section
    id="about"
    className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20"
  >
    <SectionHeader eyebrow="Introduction" title="About Me" />
    <div className="grid gap-8 md:grid-cols-2 glass-panel p-8 rounded-2xl">
      <div className="space-y-4">
        <p className="text-lg">
          I'm a security researcher and award-winning competitive hacker based
          in Denpasar, Bali, Indonesia. I've discovered 170+ CVEs in widely used
          software, including CVE-2025-26909, a critical flaw that affected
          200,000+ WordPress sites.
        </p>
        <p className="text-lg">
          I founded{" "}
          <Link
            href="https://github.com/TCP1P"
            className="text-primary hover:underline"
          >
            @TCP1P
          </Link>
          , Indonesia's #1 nationally ranked CTF team on CTFtime, and compete
          internationally with{" "}
          <Link
            href="https://github.com/project-sekai-ctf"
            className="text-primary hover:underline"
          >
            @project-sekai-ctf
          </Link>{" "}
          as well as the{" "}
          <span className="text-primary font-semibold">SKSD</span> and{" "}
          <span className="text-primary font-semibold">HCS</span> teams.
        </p>
        <p className="text-lg">
          I enjoy creating CTF challenges, developing security tools, and
          sharing what I learn through{" "}
          <Link href="/blog" className="text-primary hover:underline">
            writeups and tutorials
          </Link>{" "}
          on my blog.
        </p>
      </div>
      <div className="flex items-center justify-center">
        <Parallax speed={0.1}>
          <div className="relative w-64 h-64 overflow-hidden rounded-full border-4 border-primary/20 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] hover:scale-[1.03]">
            <FallbackImage
              src="https://avatars.githubusercontent.com/u/92920739"
              alt="Dimas Maulana"
              width={256}
              height={256}
              className="object-cover rounded-full"
              priority
            />
          </div>
        </Parallax>
      </div>
    </div>
  </section>
));

AboutSection.displayName = "AboutSection";

// Memoized Blog section component
const BlogSection = memo(
  ({ posts, loading }: { posts: any[]; loading: boolean }) => (
    <section
      id="blog"
      className="container px-4 section-y mx-auto max-w-7xl scroll-mt-20"
    >
      <SectionHeader
        eyebrow="Writing"
        title="Latest Blog Posts"
        action={
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-md border border-primary/50 px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-primary hover:bg-primary/10"
          >
            View all posts
            <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      {loading ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found. Add markdown files to the /posts directory.
          </p>
        </div>
      )}
    </section>
  ),
);

BlogSection.displayName = "BlogSection";

// Loading fallback for lazily-loaded sections
const SectionFallback = memo(() => (
  <div className="container px-4 section-y mx-auto max-w-7xl">
    <div className="h-72 rounded-2xl border border-border/50 bg-card/15 animate-pulse" />
  </div>
));

SectionFallback.displayName = "SectionFallback";

function HomePageClient() {
  const { posts, loading } = usePosts();

  // Memoize latest posts to prevent unnecessary re-renders
  const latestPosts = useMemo(() => posts.slice(0, 3), [posts]);

  useEffect(() => {
    // Land page-load hash links (/#experience etc.) via the shared helper: it
    // retries until the target exists and re-pins until layout settles. A
    // one-shot timeout mis-lands here because several tall lazy sections sit
    // above the lower anchors and hydrate from 288px placeholders.
    handleHashOnPageLoad({
      // An explicit "smooth" would override the reduced-motion CSS
      // (scroll-behavior: auto !important) — honor the preference here.
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, []);

  return (
    // -mt-16 cancels the global main pt-16 so the hero sits under the
    // transparent fixed header (the hero supplies its own top padding).
    <div className="min-h-screen -mt-16">
      {/* Fixed day→night sky behind the whole page, driven by scroll */}
      <ScrollSky />

      {/* Section order: proof first (CTF wins + photos) right after the intro,
          then the pitch (projects/services); experience and blog close the page. */}
      <Suspense fallback={<SectionFallback />}>
        <HeroSection />
      </Suspense>

      <AboutSection />

      <Suspense fallback={<SectionFallback />}>
        <SkillsSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <CTFSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <PhotoGallerySection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ProjectsSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ServicesSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ExperienceSection />
      </Suspense>

      <BlogSection posts={latestPosts} loading={loading} />
    </div>
  );
}

export default memo(HomePageClient);
