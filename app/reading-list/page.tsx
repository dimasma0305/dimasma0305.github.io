import { SavedReading } from "@/components/saved-reading";
import { pageMetadata } from "@/lib/site-seo";
export const metadata = pageMetadata({
  title: "Saved reading",
  description:
    "Your locally saved posts, field notes, and reading positions. Private to this browser, with no account required.",
  path: "/reading-list/",
  noIndex: true,
});
export default function ReadingListPage() {
  return <SavedReading />;
}
