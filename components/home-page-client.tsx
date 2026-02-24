"use client";

import { memo, useMemo, Suspense, lazy, useEffect } from "react";
import Link from "next/link";
import { usePosts } from "@/hooks/use-posts";
import PostCard from "@/components/post-card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FallbackImage } from "@/components/fallback-image";
import { motion } from "framer-motion";

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

// Motion variants
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const containerStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 as number } },
};

// Memoized About section component
const AboutSection = memo(() => (
  <motion.section
    id="about"
    className="container px-4 py-16 mx-auto max-w-7xl"
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.2 }}
    variants={containerStagger}
  >
    <motion.h2
      className="mb-8 text-3xl font-bold tracking-tight text-gradient-neon"
      variants={fadeInUp}
    >
      About Me
    </motion.h2>
    <div className="grid gap-8 md:grid-cols-2 glass-panel p-8 rounded-2xl">
      <motion.div className="space-y-4" variants={fadeInUp}>
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
      </motion.div>
      <motion.div
        className="flex items-center justify-center"
        variants={fadeInUp}
      >
        <motion.div
          className="relative w-64 h-64 overflow-hidden rounded-full border-4 border-primary/20"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <FallbackImage
            src="https://avatars.githubusercontent.com/u/92920739"
            alt="Dimas Maulana"
            width={256}
            height={256}
            className="object-cover rounded-full"
            priority
          />
        </motion.div>
      </motion.div>
    </div>
  </motion.section>
));

AboutSection.displayName = "AboutSection";

// Memoized Blog section component
const BlogSection = memo(
  ({ posts, loading }: { posts: any[]; loading: boolean }) => (
    <motion.section
      id="blog"
      className="container px-4 py-16 mx-auto max-w-7xl"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerStagger}
    >
      <motion.div
        className="flex items-center justify-between mb-8"
        variants={fadeInUp}
      >
        <h2 className="text-3xl font-bold tracking-tight text-gradient-neon">
          Latest Blog Posts
        </h2>
        <Link href="/blog" className="text-primary hover:underline">
          View all posts →
        </Link>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 3).map((post, i) => (
            <motion.div
              key={post.id}
              variants={fadeInUp}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found. Add markdown files to the /posts directory.
          </p>
        </div>
      )}
    </motion.section>
  ),
);

BlogSection.displayName = "BlogSection";

// Loading fallback component
const SectionFallback = memo(() => (
  <div className="flex items-center justify-center py-16">
    <LoadingSpinner />
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
      // Wait a bit for the content to render
      setTimeout(() => {
        const element = document.getElementById(hash.substring(1));
        if (element) {
          const headerOffset = 80; // Account for sticky header
          const elementPosition =
            element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 500); // Longer delay for home page as sections are lazy loaded
    }
  }, []);

  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Suspense fallback={<SectionFallback />}>
          <HeroSection />
        </Suspense>
      </motion.div>

      <AboutSection />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <Suspense fallback={<SectionFallback />}>
          <SkillsSection />
        </Suspense>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <Suspense fallback={<SectionFallback />}>
          <ExperienceSection />
        </Suspense>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <Suspense fallback={<SectionFallback />}>
          <ProjectsSection />
        </Suspense>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
      >
        <Suspense fallback={<SectionFallback />}>
          <CTFSection />
        </Suspense>
      </motion.div>

      <BlogSection posts={latestPosts} loading={loading} />
    </div>
  );
}

export default memo(HomePageClient);
