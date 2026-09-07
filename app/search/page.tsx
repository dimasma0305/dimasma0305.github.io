import { getSearchDirectory } from "@/lib/site-search.server";
import { SiteSearch } from "@/components/site-search";
export default function SearchPage() {
  return <SiteSearch entries={getSearchDirectory()} />;
}
