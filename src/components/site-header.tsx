import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Container } from "@/components/container";

const navigation = [
  { href: "/browse", label: "Browse" },
  { href: "/manufacturers", label: "Manufacturers" },
  { href: "/search", label: "Search" },
] as const;

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080808]/95 backdrop-blur-md">
      <Container className="flex min-h-[4.25rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3.5">
        <BrandMark />
        <nav
          aria-label="Primary navigation"
          className="order-3 hidden items-center gap-0.5 rounded-full border border-white/[0.09] bg-[#0e0e0e] p-1 md:order-none md:flex"
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
          aria-label="Primary navigation mobile"
          className="order-3 flex w-full items-center gap-5 md:hidden"
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
        <div className="flex items-center">
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
