import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const navigation = [
  { href: "/browse", label: "Browse" },
  { href: "/manufacturers", label: "Manufacturers" },
  { href: "/search", label: "Search" },
] as const;

export async function SiteHeader() {
  return (
    <header className="border-b border-white/10 bg-[#090a0b]/85 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3 sm:px-8 lg:px-10">
        <BrandMark />
        <nav
          aria-label="Primary navigation"
          className="order-3 flex w-full items-center gap-5 sm:order-none sm:w-auto sm:gap-6"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-[0.65rem] tracking-[0.13em] text-[var(--muted)] uppercase transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]"
            >
              {item.label}
            </Link>
          ))}
          <span
            className="font-mono text-[0.65rem] tracking-[0.13em] text-white/25 uppercase"
            aria-label="Comparison tools are coming soon"
          >
            Compare / Soon
          </span>
        </nav>
        <div className="flex items-center">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="border border-white/20 px-3 py-2 font-mono text-[0.64rem] tracking-[0.13em] uppercase transition-colors hover:border-[var(--signal)] hover:text-[var(--signal)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)]">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
