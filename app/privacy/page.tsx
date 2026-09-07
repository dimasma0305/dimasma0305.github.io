import Link from "next/link";
import { PerformanceSettings } from "@/components/performance-settings";
import { pageMetadata } from "@/lib/site-seo";
export const metadata = pageMetadata({
  title: "Privacy & performance",
  description:
    "Control optional performance diagnostics and learn how local saved reading works on dimasc.tf.",
  path: "/privacy/",
  noIndex: true,
});
export default function PrivacyPage() {
  return (
    <div className="container library-page">
      <header className="library-heading">
        <p className="library-eyebrow">YOUR DEVICE · YOUR CHOICE</p>
        <h1>Privacy & performance.</h1>
        <p>
          Reading shouldn’t require an account or a tracking banner. Optional
          measurements are off by default; you can inspect them locally before
          deciding whether to share.
        </p>
      </header>
      <PerformanceSettings />
      <section className="performance-explainer">
        <h2>What stays in your browser</h2>
        <p>
          Saving a post or note stores its title, local link, reading position,
          and revision date on this device. It isn’t synced or included in
          performance reports. Search runs on public summaries in your browser;
          its query remains in the address bar so you can reuse the link.
        </p>
        <Link href="/reading-list/" prefetch={false}>
          Manage saved reading ↗
        </Link>
        <h2>What optional sharing includes</h2>
        <p>
          Performance values, broad page categories, screen-size groups, motion
          preference, room rendering mode, and a small set of room-chapter and
          contact/repository-link events. Each measurement has a short-lived
          sample key for deduplication, not a persistent visitor ID. No pointer
          recording, session replay, fingerprint, article text, search query, or
          full URL is sent.
        </p>
        <p>
          A collection server necessarily receives network metadata such as an
          IP address. Its operator must configure retention, access controls,
          and aggregation before enabling sharing. Turning sharing off stops
          future reports; clearing local data cannot remove a report already
          delivered.
        </p>
        <h2>Ordinary hosting and external links</h2>
        <p>
          The host and any external image providers still receive normal
          requests needed to serve pages and images. External sites you choose
          to visit have their own privacy policies. Optional diagnostics do not
          change those ordinary requests.
        </p>
      </section>
      <noscript>
        <p>
          JavaScript is disabled. Optional diagnostics are off, and these
          settings do not run.
        </p>
      </noscript>
    </div>
  );
}
