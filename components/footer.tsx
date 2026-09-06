import portfolio from "@/lib/portfolio-data.json";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, ArrowUpLeft } from "lucide-react";

const socials = portfolio.socials.map((item, i) => ({
  ...item,
  icon: [Github, Twitter, Linkedin, Mail][i],
}));

export function Footer() {
  // One quiet bar: copyright + socials. Transparent so the homepage ends in
  // the night landscape (hills, fireflies, stars); on other routes the body
  // background shows through identically.
  return (
    <footer className="content-footer border-t border-border/60 bg-transparent">
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div>
          <Link href="/" prefetch={false} className="content-footer-home">
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            Back to my room
          </Link>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Dimas Maulana
          </p>
        </div>

        <div className="flex items-center gap-1">
          {socials.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              href={href}
              {...(href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              aria-label={name}
              className="grid h-11 w-11 place-items-center rounded-full text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Icon aria-hidden className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
