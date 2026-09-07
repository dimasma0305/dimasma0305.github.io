import reviews from "@/lib/note-reviews.json";
import { formatBlogDate } from "@/lib/blog-archive";
type Review = { reviewedAt: string; environment: string; note?: string };
export function NoteReview({ slug }: { slug: string }) {
  const review = (reviews as Record<string, Review>)[slug];
  const recorded =
    review &&
    Number.isFinite(Date.parse(review.reviewedAt)) &&
    review.environment;
  return (
    <details className="note-review">
      <summary>
        {recorded
          ? `Reviewed ${formatBlogDate(review.reviewedAt)}`
          : "Review status: not recorded"}{" "}
        <span aria-hidden="true">+</span>
      </summary>
      <p>
        {recorded
          ? `Environment: ${review.environment}. ${review.note || ""}`
          : "This is a working reference. The source’s edit date is not a verification date; examples can depend on software versions and configuration. No separate technical review has been recorded."}
      </p>
    </details>
  );
}
