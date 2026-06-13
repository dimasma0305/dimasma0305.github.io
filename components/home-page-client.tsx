"use client";

import { memo, useMemo, Suspense, lazy, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
          I'm a cybersecurity enthusiast and CTF player based in Denpasar, Bali,
          Indonesia. Currently exploring cyber security and computer science
          with a focus on Linux OS and security.
        </p>
        <p className="text-lg">
          I'm a member of{" "}
          <Link
            href="https://github.com/TCP1P"
            className="text-primary hover:underline"
          >
            @TCP1P
          </Link>{" "}
          and
          <Link
            href="https://github.com/project-sekai-ctf"
            className="text-primary hover:underline"
          >
            {" "}
            @project-sekai-ctf
          </Link>{" "}
          teams, as well as{" "}
          <span className="text-primary font-semibold">SKSD</span> and{" "}
          <span className="text-primary font-semibold">HCS</span> teams, where I
          participate in various CTF competitions and security research.
        </p>
        <p className="text-lg">
          I enjoy creating CTF challenges, developing security tools, and
          sharing my knowledge through blog posts and resources.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Passionate cybersecurity professional with expertise in penetration
          testing, CTF competitions, and secure development practices. I love
          sharing knowledge and experiences through my blog. Check out my latest{" "}
          <Link href={"/blog"} className="text-primary hover:underline">
            blog posts
          </Link>{" "}
          for insights into cybersecurity, CTF writeups, and technical
          tutorials.
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
    // Handle scroll to hash on page load
    const hash = window.location.hash;
    if (hash) {
      // Wait a bit for the content to render (sections are lazy loaded)
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const headerOffset = 80; // Account for sticky header
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - headerOffset,
            // An explicit "smooth" would override the reduced-motion CSS
            // (scroll-behavior: auto !important) — honor the preference here.
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
          });
        }
      }, 500);
    }
  }, []);

  return (
    // -mt-16 cancels the global main pt-16 so the hero sits under the
    // transparent fixed header (the hero supplies its own top padding).
    <div className="min-h-screen -mt-16">
      {/* Fixed day→night sky behind the whole page, driven by scroll */}
      <ScrollSky />

      <Suspense fallback={<SectionFallback />}>
        <HeroSection />
      </Suspense>

      <AboutSection />

      <Suspense fallback={<SectionFallback />}>
        <SkillsSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ServicesSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ExperienceSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <ProjectsSection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <CTFSection />
      </Suspense>

      <BlogSection posts={latestPosts} loading={loading} />
    </div>
  );
}

export default memo(HomePageClient);
