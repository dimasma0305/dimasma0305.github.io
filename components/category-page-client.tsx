"use client";

import { useState, useMemo, useCallback } from "react";
import type { Post } from "@/lib/posts-client";
import { getAllCategories, getPostsByCategory } from "@/lib/posts-client";
import PostCard from "@/components/post-card";
import { SearchBar } from "@/components/search-bar";
import { SectionHeader } from "@/components/section-header";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryPageClientProps {
  category: string;
  posts: Post[];
}

export default function CategoryPageClient({
  category,
  posts,
}: CategoryPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Decode URL-encoded category name (e.g., "CSS%20Leak" -> "CSS Leak")
  const decodedCategory = decodeURIComponent(category);

  const categories = getAllCategories(posts);

  // Find the actual category name (case-insensitive)
  const actualCategoryName =
    categories.find(
      (cat) => cat.toLowerCase() === decodedCategory.toLowerCase(),
    ) || decodedCategory;

  const categoryPosts = getPostsByCategory(posts, actualCategoryName);

  // Filter category posts based on search query
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) {
      return categoryPosts;
    }

    const query = searchQuery.toLowerCase();
    return categoryPosts.filter((post) => {
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.content && post.content.toLowerCase().includes(query))
      );
    });
  }, [categoryPosts, searchQuery]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl">
      <Link
        href="/categories/"
        className="mb-6 -ml-2 inline-flex items-center gap-2 rounded-md p-2 text-sm font-medium text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Categories
      </Link>

      <SectionHeader
        titleAs="h1"
        eyebrow="Category"
        title={actualCategoryName}
        subtitle={`${categoryPosts.length} post${categoryPosts.length !== 1 ? "s" : ""}`}
        action={
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            placeholder={`Search in ${actualCategoryName}...`}
            className="w-full sm:w-64"
          />
        }
      />

      {searchQuery && (
        <div className="mb-6 flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {filteredPosts.length} result{filteredPosts.length !== 1 ? "s" : ""}{" "}
            for "{searchQuery}" in {actualCategoryName}
          </p>
          <button
            onClick={handleClearSearch}
            className="text-sm text-primary hover:underline focus-ring rounded-sm"
          >
            Clear search
          </button>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found matching "{searchQuery}" in {actualCategoryName}.
          </p>
          <button
            onClick={handleClearSearch}
            className="mt-2 text-primary hover:underline focus-ring rounded-sm"
          >
            Clear search to see all posts in this category
          </button>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No posts found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
