import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Container } from "@/components/container";

const navigation = [
  { href: "/browse", label: "Browse" },
  { href: "/manufacturers", label: "Manufacturers" },
  { href: "/racing", label: "Racing" },
  { href: "/search", label: "Search" },
] as const;

export async function SiteHeader() {
  return (
    <header
      data-site-header
      className="sticky top-0 z-50 bg-gradient-to-b from-[#080808]/75 to-[#080808]/0"
    >
      <Container className="grid min-h-[4.25rem] grid-cols-[1fr_auto] items-center gap-x-6 gap-y-3 py-3.5 md:grid-cols-[1fr_auto_1fr]">
        <BrandMark />
        <nav
          data-primary-nav
          aria-label="Primary navigation"
          className="hidden items-center gap-0.5 rounded-full border border-transparent bg-transparent p-1 md:flex md:justify-self-center"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 font-mono text-[0.62rem] tracking-[0.16em] text-white/55 uppercase transition-all duration-300 hover:bg-white/[0.06] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <nav
          data-primary-nav
          aria-label="Primary navigation mobile"
          className="col-span-2 flex w-full items-center gap-5 md:hidden"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[0.62rem] tracking-[0.16em] text-white/55 uppercase transition-colors duration-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-self-end">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="inline-flex min-h-10 items-center rounded-full bg-white px-5 py-2 font-mono text-[0.62rem] tracking-[0.16em] text-black uppercase transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </Container>
    </header>
  );
}
