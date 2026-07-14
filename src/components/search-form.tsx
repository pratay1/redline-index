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
        className={`min-h-11 min-w-0 flex-1 rounded-full border border-white/12 bg-[#101010] px-5 font-mono text-xs tracking-[0.04em] text-white transition-[border-color,background-color] placeholder:text-white/35 focus:border-white/35 focus:bg-[#161616] focus:outline-none ${compact ? "py-3" : "py-4 sm:px-6 sm:py-5"}`}
      />
      <button
        type="submit"
        className={`min-h-11 shrink-0 rounded-full bg-white px-5 font-mono text-[0.65rem] font-medium tracking-[0.13em] text-black uppercase transition-colors duration-200 hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white ${compact ? "py-3" : "py-4 sm:px-6 sm:py-5"}`}
      >
        Search
      </button>
    </form>
  );
}
