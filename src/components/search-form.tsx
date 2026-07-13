type SearchFormProps = {
  defaultValue?: string;
  compact?: boolean;
};

export function SearchForm({ defaultValue = "", compact = false }: SearchFormProps) {
  return (
    <form
      action="/search"
      method="get"
      className="group flex w-full gap-2"
      role="search"
    >
      <label htmlFor="catalogue-search" className="sr-only">
        Search the vehicle catalogue
      </label>
      <input
        id="catalogue-search"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search BMW, 3 Series, G20, 2025, M340i…"
        className={`min-w-0 flex-1 border border-white/15 bg-black/30 px-4 font-mono text-xs tracking-[0.04em] text-white placeholder:text-white/35 focus:border-[var(--signal)] focus:outline-none ${compact ? "py-3" : "py-4 sm:px-5 sm:py-5"}`}
      />
      <button
        type="submit"
        className={`shrink-0 bg-[var(--signal)] px-4 font-mono text-[0.65rem] font-medium tracking-[0.13em] text-black uppercase transition-colors hover:bg-[#ff6858] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--signal)] ${compact ? "py-3" : "py-4 sm:px-6 sm:py-5"}`}
      >
        Search
      </button>
    </form>
  );
}
