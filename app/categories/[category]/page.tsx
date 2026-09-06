import CategoryPageClient from "@/components/category-page-client";
import { getPublishedPostSummaries } from "@/lib/content-index.server";
import { pageMetadata } from "@/lib/site-seo";
import {
  BreadcrumbStructuredData,
  CollectionStructuredData,
} from "@/components/seo";
import { notFound } from "next/navigation";

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    // Read the blog index file directly from the file system during build
    const fs = require("fs");
    const path = require("path");

    const indexPath = path.join(process.cwd(), "public", "blog-index.json");
    const indexContent = fs.readFileSync(indexPath, "utf8");
    const blogIndex = JSON.parse(indexContent);

    // Extract categories from the blog index structure
    let categories: string[] = [];

    if (
      blogIndex.taxonomy &&
      blogIndex.taxonomy.categories &&
      Array.isArray(blogIndex.taxonomy.categories)
    ) {
      // Get categories from taxonomy section
      categories = blogIndex.taxonomy.categories.map((cat: any) => cat.name);
      console.log(
        `📁 Generated static params for ${categories.length} categories from taxonomy`,
      );
    } else if (
      blogIndex.posts &&
      blogIndex.posts.all &&
      Array.isArray(blogIndex.posts.all)
    ) {
      // Extract categories from posts
      const categoriesSet = new Set<string>();

      blogIndex.posts.all.forEach((post: any) => {
        if (post.categories && Array.isArray(post.categories)) {
          post.categories.forEach((category: string) => {
            categoriesSet.add(category);
          });
        }
      });

      categories = Array.from(categoriesSet);
      console.log(
        `📁 Generated static params for ${categories.length} categories from posts`,
      );
    }

    console.log("📁 Categories found:", categories);

    // Generate params for both exact case and lowercase versions
    const categoryParams: { category: string }[] = [];

    categories.forEach((category) => {
      // Add exact case
      categoryParams.push({ category: category });

      // Add URL-encoded version for categories with spaces
      const encoded = encodeURIComponent(category);
      if (encoded !== category) {
        categoryParams.push({ category: encoded });
      }

      // Add lowercase version if it's different
      const lowercase = category.toLowerCase();
      if (lowercase !== category) {
        categoryParams.push({ category: lowercase });

        // Add URL-encoded lowercase version
        const encodedLowercase = encodeURIComponent(lowercase);
        if (encodedLowercase !== lowercase) {
          categoryParams.push({ category: encodedLowercase });
        }
      }
    });

    console.log("📁 Total category params generated:", categoryParams.length);
    return categoryParams;
  } catch (error) {
    console.error("Error generating static params for categories:", error);

    // Fallback: return common categories with both cases
    const fallbackCategories = [
      "CTF",
      "ctf",
      "Web",
      "web",
      "Security",
      "security",
      "wordpress",
      "XSS",
      "xss",
      "Programming",
      "programming",
      "Domclobering",
      "domclobering",
      "CSS Leak",
      "css leak",
      "css-leak",
      "CSS%20Leak",
      "css%20leak",
      "XXE",
      "xxe",
    ];

    return fallbackCategories.map((category) => ({
      category: category,
    }));
  }
}

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

function categoryData(category: string) {
  const decoded = decodeURIComponent(category).toLowerCase();
  const allPosts = getPublishedPostSummaries();
  const name = allPosts
    .flatMap((post) => post.categories)
    .find((name) => name.toLowerCase() === decoded);
  return {
    name,
    posts: name
      ? allPosts.filter((post) => post.categories.includes(name))
      : [],
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const { name } = categoryData(category);
  if (!name) {
    notFound();
  }
  return pageMetadata({
    title: `${name} Research & Writeups`,
    path: `/categories/${encodeURIComponent(name.toLowerCase())}/`,
    description: `Explore ${name} articles, cybersecurity research, and CTF writeups by Dimas Maulana. Read the published work collected under this topic.`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const { name, posts } = categoryData(category);
  if (!name) {
    notFound();
  }
  const canonicalPath = `/categories/${encodeURIComponent(name.toLowerCase())}/`;
  return (
    <>
      <BreadcrumbStructuredData
        items={[
          { name: "Categories", path: "/categories/" },
          { name, path: canonicalPath },
        ]}
      />
      <CollectionStructuredData
        title={`${name} Research & Writeups`}
        path={canonicalPath}
        items={posts.map((post) => ({
          title: post.title,
          path: `/posts/${post.slug}/`,
        }))}
      />
      <CategoryPageClient key={name} category={name} posts={posts} />
    </>
  );
}
