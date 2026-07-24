import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Container } from "@/components/container";

export function SiteFooter() {
  return (
    <footer data-site-footer className="mt-auto border-t border-white/10 bg-[#080808]/25">
      <Container className="flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <BrandMark />
          <p className="max-w-sm text-sm leading-6 text-white/55">
            Verified vehicle records, built to last. Manufacturer specs with sources
            behind every number.
          </p>
          <ul className="max-w-sm space-y-1.5 text-xs leading-5 text-white/40">
            <li>
              Vehicle photos are sourced from{" "}
              <a
                href="https://www.encycarpedia.com/us/makes/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/25 underline-offset-2 transition-colors hover:text-white/70 hover:decoration-white/50"
              >
                encyCARpedia
              </a>
              {", "}
              with{" "}
              <a
                href="https://api.auto-data.net/image-database"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-white/25 underline-offset-2 transition-colors hover:text-white/70 hover:decoration-white/50"
              >
                auto-data.net
              </a>{" "}
              as fallback when a match isn’t available.
            </li>
            <li>
              Images within the same model may look similar — trims often share a
              generation gallery.
            </li>
          </ul>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap gap-x-6 gap-y-3 font-mono text-[0.62rem] tracking-[0.14em] text-white/45 uppercase"
        >
          <Link
            href="/browse"
            className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Browse
          </Link>
          <Link
            href="/manufacturers"
            className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Manufacturers
          </Link>
          <Link
            href="/search"
            className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Search
          </Link>
        </nav>
      </Container>
    </footer>
  );
}
