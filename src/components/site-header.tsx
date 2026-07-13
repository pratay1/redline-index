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
    <header className="sticky top-0 z-50 bg-background">
      <Container className="flex min-h-16 flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <BrandMark />
        <nav
          aria-label="Primary navigation"
          className="order-3 flex w-full items-center gap-5 sm:order-none sm:w-auto sm:gap-7"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase transition-colors duration-200 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="inline-flex min-h-10 items-center bg-foreground px-4 py-2 font-mono text-[0.64rem] tracking-[0.14em] text-background uppercase transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
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
