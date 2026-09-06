import portfolio from "@/lib/portfolio-data.json";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Minus,
  FileText,
  Mail,
  MessageCircle,
  Lock,
  FileCode2,
} from "lucide-react";
import { withBasePath } from "@/lib/utils";
import { faqs } from "@/lib/services-data";
import { ServiceBrief } from "@/components/service-brief";
import "@/lib/services.css";

const samplePdf = withBasePath(
  "/sample-report/source-code-pentest-sample-report.pdf",
);
const sampleMarkdown = withBasePath(
  "/sample-report/source-code-pentest-sample-report.md",
);
const deliverables = [
  {
    title: "Reviewed findings",
    text: "AI-assisted codebase coverage with personal triage. Genuine issues, potential risks, and hardening notes are clearly distinguished.",
    label: "Human-reviewed",
  },
  {
    title: "Suggested fixes",
    text: "A suggested patch for each finding, alongside dynamic checks that the program runs and behaves correctly.",
    label: "Actionable changes",
  },
  {
    title: "A report you can use",
    text: "Plain-English PDF and Markdown reports, plus one free re-test after you apply the fixes.",
    label: "PDF + Markdown + re-test",
  },
];
const process = [
  {
    title: "Agree on scope",
    text: "Tell me about your project. We agree on scope and price, then arrange a private repo invite or ZIP.",
  },
  {
    title: "Review and check",
    text: "An AI agent reviews the code. I triage the findings and run the program to check its behavior.",
  },
  {
    title: "Report and follow up",
    text: "Receive the report and suggested fixes. Apply and test them, then use your included re-test.",
  },
];

export function ServicesDetail() {
  return (
    <div className="services-content service-redesign">
      <header className="service-hero">
        <div className="service-intro">
          <p className="service-eyebrow">Services / The review desk</p>
          <h1>
            Source code security review<span>.</span>
          </h1>
          <p className="service-lead">
            Understand the risks in your code—and what to do next.
          </p>
          <p className="service-description">
            AI-assisted review, personally triaged by me. Get reviewed findings,
            suggested fixes, and a plain-English report you can act on.
          </p>
          <div className="service-author">
            <span aria-hidden="true">DM</span>
            <p>
              Dimas Maulana<small>Security researcher & CTF player</small>
            </p>
          </div>
          <Link href="/blog/" prefetch={false} className="service-text-link">
            Explore my security write-ups{" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <aside
          className="service-review-card"
          aria-label="Review pricing and summary"
        >
          <div className="service-card-heading">
            <span>Project review</span>
            <FileCode2 size={20} aria-hidden="true" />
          </div>
          <p className="service-price-label">Starting at</p>
          <p className="service-price">
            {portfolio.services.price}
            <span> / project</span>
          </p>
          <p className="service-local-price">{portfolio.services.localPrice}</p>
          <p className="service-price-note">
            Final scope and price agreed before work begins.
          </p>
          <a
            href="#start-a-review"
            className="service-button service-button-primary"
          >
            Discuss your project <ArrowDown size={16} aria-hidden="true" />
          </a>
          <dl className="service-facts">
            <div>
              <dt>Delivery</dt>
              <dd>PDF + Markdown report</dd>
            </div>
            <div>
              <dt>Follow-up</dt>
              <dd>One free re-test</dd>
            </div>
            <div>
              <dt>Typical timing</dt>
              <dd>
                1–2 days<small>Subject to scope and availability</small>
              </dd>
            </div>
          </dl>
          <a
            href={samplePdf}
            target="_blank"
            rel="noopener noreferrer"
            className="service-text-link"
          >
            View sample report (PDF){" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </aside>
      </header>
      <nav className="service-jump-nav" aria-label="Service page sections">
        {[
          ["deliverables", "What you get"],
          ["scope", "Scope & limits"],
          ["process", "How it works"],
          ["questions", "Questions"],
          ["start-a-review", "Contact"],
        ].map(([id, title]) => (
          <a key={id} href={`#${id}`}>
            {title}
          </a>
        ))}
      </nav>
      <section
        id="deliverables"
        className="service-section"
        aria-labelledby="deliverables-heading"
      >
        <div className="service-section-heading">
          <div>
            <p className="service-eyebrow">01 / Deliverables</p>
            <h2 id="deliverables-heading">Clarity, fixes, and a next step.</h2>
          </div>
          <p>A reviewed result—not a raw scanner export.</p>
        </div>
        <div className="service-deliverables">
          {deliverables.map((item, index) => (
            <article key={item.title}>
              <span className="service-item-number" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="service-deliverable-label">
                <Check size={14} aria-hidden="true" />
                {item.label}
              </span>
            </article>
          ))}
        </div>
        <div className="service-sample">
          <div>
            <FileText size={24} aria-hidden="true" />
            <h3>See the report before we talk.</h3>
            <p>
              Browse the published sample’s structure, findings, and suggested
              fixes to see whether the format fits your project.
            </p>
            <div className="service-sample-links">
              <a
                className="service-button"
                href={samplePdf}
                target="_blank"
                rel="noopener noreferrer"
              >
                Sample PDF <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a
                className="service-text-link"
                href={sampleMarkdown}
                target="_blank"
                rel="noopener noreferrer"
              >
                Markdown version <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            </div>
          </div>
          <div
            className="service-report-outline"
            aria-label="Sample report contents"
          >
            <p>
              Inside the sample report <span>PDF / MD</span>
            </p>
            <ol>
              {[
                "Executive summary",
                "Scope & methodology",
                "Findings & suggested fixes",
                "Hardening & next steps",
              ].map((text, index) => (
                <li key={text}>
                  <span aria-hidden="true">0{index + 1}</span>
                  {text}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section
        id="scope"
        className="service-section service-scope"
        aria-labelledby="scope-heading"
      >
        <div>
          <p className="service-eyebrow">02 / Scope</p>
          <h2 id="scope-heading">Know exactly what’s covered.</h2>
          <p className="service-section-description">
            This is a source code review with program checks. It is not a live
            production or infrastructure pentest.
          </p>
          <div className="service-privacy">
            <Lock size={19} aria-hidden="true" />
            <div>
              <h3>Private by arrangement</h3>
              <p>
                Isolated review workspace. NDA and code deletion after delivery
                are available on request. Agree on access before sharing your
                repository.
              </p>
            </div>
          </div>
        </div>
        <ul className="service-scope-list">
          {portfolio.services.limits.map((limit) => (
            <li key={limit}>
              <Minus size={16} aria-hidden="true" />
              <span>{limit}</span>
            </li>
          ))}
        </ul>
      </section>
      <section
        id="process"
        className="service-section"
        aria-labelledby="process-heading"
      >
        <div className="service-section-heading">
          <div>
            <p className="service-eyebrow">03 / Process</p>
            <h2 id="process-heading">A straightforward handoff.</h2>
          </div>
        </div>
        <ol className="service-process">
          {process.map((step, index) => (
            <li key={step.title}>
              <span aria-hidden="true">0{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section
        id="questions"
        className="service-section service-faq"
        aria-labelledby="questions-heading"
      >
        <div>
          <p className="service-eyebrow">04 / Questions</p>
          <h2 id="questions-heading">Before we start.</h2>
          <p className="service-section-description">
            Not sure whether your project fits? Send a short overview and we can
            discuss the scope.
          </p>
          <a href="#start-a-review" className="service-text-link">
            Ask about your project <ArrowDown size={14} aria-hidden="true" />
          </a>
        </div>
        <div>
          {faqs.map((faq) => (
            <details key={faq.q}>
              <summary>
                {faq.q}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      <section
        id="start-a-review"
        className="service-contact"
        aria-labelledby="contact-heading"
      >
        <div>
          <p className="service-eyebrow">Let’s work together</p>
          <h2 id="contact-heading">Start with a conversation.</h2>
          <p>
            Send your stack, approximate codebase size, concerns, and preferred
            timeline. We’ll agree on scope and price before you share access.
          </p>
          <div className="service-contact-links">
            <a
              className="service-button service-button-primary"
              href={portfolio.services.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} aria-hidden="true" />
              WhatsApp <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <a
              className="service-button"
              href={`mailto:${portfolio.email}?subject=Source%20code%20security%20review`}
            >
              <Mail size={16} aria-hidden="true" />
              Email
            </a>
            <a
              className="service-text-link"
              href={portfolio.services.discord}
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
          <p className="service-contact-note">
            Choose whichever channel works for you.
          </p>
        </div>
        <ServiceBrief />
      </section>
    </div>
  );
}
