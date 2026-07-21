"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { useCartItemCount } from "@/lib/cart/hooks";
import { t } from "@/lib/i18n/sq";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/layout/SiteLogo";

type CollectionLink = { slug: string; label: string };

export function Header({
  logoUrl,
  collections,
}: {
  logoUrl?: string | null;
  collections: CollectionLink[];
}) {
  const cartCount = useCartItemCount();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setCollectionOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-beige bg-ivory/95 backdrop-blur-sm">
        {/* Mobile / tablet */}
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:h-20 sm:gap-6 sm:px-6 lg:hidden lg:px-8">
          <Link href="/" className="shrink-0" aria-label="Talja&mom">
            <SiteLogo logoUrl={logoUrl} priority />
          </Link>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Suspense fallback={null}>
              <HeaderSearchIcon className="sm:hidden" />
            </Suspense>
            <Suspense fallback={<SearchFallback className="hidden sm:block" />}>
              <HeaderSearch className="hidden sm:block" />
            </Suspense>

            <Link
              href="/shporta"
              aria-label={t.shporta}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-choco transition-colors hover:bg-cream"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-choco px-1 text-[11px] font-medium text-ivory">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t.mbyll : t.menu}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-choco transition-colors hover:bg-cream"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Desktop */}
        <div className="mx-auto hidden max-w-7xl px-6 lg:block lg:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6 py-4">
            <div className="justify-self-start">
              <Suspense fallback={<SearchFallback />}>
                <HeaderSearch />
              </Suspense>
            </div>

            <div className="flex items-center justify-center gap-8">
              <Link href="/" className="shrink-0" aria-label="Talja&mom">
                <SiteLogo logoUrl={logoUrl} priority />
              </Link>
              <nav aria-label="Kryesore" className="flex items-center gap-8">
                <CollectionDropdown collections={collections} />
                <NavLink href="/rreth-nesh">{t.rrethNesh}</NavLink>
                <NavLink href="/kontakt">{t.kontakt}</NavLink>
              </nav>
            </div>

            <div className="flex justify-self-end">
              <Link
                href="/shporta"
                aria-label={t.shporta}
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-choco transition-colors hover:bg-cream"
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-choco px-1 text-[11px] font-medium text-ivory">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t.menu}
          className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden"
        >
          <div className="flex h-16 items-center justify-between border-b border-beige px-4 sm:h-20 sm:px-6">
            <SiteLogo logoUrl={logoUrl} />
            <button
              type="button"
              aria-label={t.mbyll}
              className="flex h-10 w-10 items-center justify-center rounded-full text-choco hover:bg-cream"
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="flex flex-1 flex-col gap-2 overflow-y-auto px-6 py-10">
            <div className="mb-4">
              <Suspense fallback={<SearchFallback className="w-full" />}>
                <HeaderSearch
                  onSubmit={() => setMenuOpen(false)}
                  className="w-full max-w-none"
                  autoFocus
                />
              </Suspense>
            </div>

            <div>
              <button
                type="button"
                aria-expanded={collectionOpen}
                className="flex w-full items-center justify-between py-4 font-display text-3xl text-choco"
                onClick={() => setCollectionOpen((open) => !open)}
              >
                {t.koleksioni}
                <ChevronIcon open={collectionOpen} />
              </button>
              {collectionOpen && (
                <div className="mb-4 flex flex-col gap-1 border-l border-beige pl-6">
                  <MobileNavLink
                    href="/koleksioni"
                    onNavigate={() => setMenuOpen(false)}
                    className="text-xl"
                  >
                    {t.teGjitha}
                  </MobileNavLink>
                  {collections.map((season) => (
                    <MobileNavLink
                      key={season.slug}
                      href={`/koleksioni/${season.slug}`}
                      onNavigate={() => setMenuOpen(false)}
                      className="text-xl"
                    >
                      {season.label}
                    </MobileNavLink>
                  ))}
                </div>
              )}
            </div>

            <MobileNavLink
              href="/rreth-nesh"
              onNavigate={() => setMenuOpen(false)}
            >
              {t.rrethNesh}
            </MobileNavLink>
            <MobileNavLink href="/kontakt" onNavigate={() => setMenuOpen(false)}>
              {t.kontakt}
            </MobileNavLink>
          </nav>
        </div>
      )}
    </>
  );
}

function SearchFallback({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-9 w-full max-w-[14rem] rounded-full border border-beige bg-cream/70 lg:max-w-[16rem]",
        className,
      )}
      aria-hidden
    />
  );
}

function HeaderSearch({
  className,
  onSubmit,
  autoFocus,
}: {
  className?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial =
    pathname.startsWith("/koleksioni") ? (searchParams.get("kerko") ?? "") : "";
  const [query, setQuery] = useState(initial);

  useEffect(() => {
    setQuery(
      pathname.startsWith("/koleksioni") ? (searchParams.get("kerko") ?? "") : "",
    );
  }, [pathname, searchParams]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const href = trimmed
      ? `/koleksioni?kerko=${encodeURIComponent(trimmed)}`
      : "/koleksioni";
    router.push(href);
    onSubmit?.();
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative w-full max-w-[14rem] lg:max-w-[16rem]", className)}
    >
      <label htmlFor="header-search" className="sr-only">
        {t.kerko}
      </label>
      <input
        id="header-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t.kerkoPlaceholder}
        autoFocus={autoFocus}
        className="w-full rounded-full border border-beige bg-cream/70 py-2 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-choco-soft focus:border-choco focus:bg-ivory"
      />
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-choco-soft">
        <SearchIcon />
      </span>
    </form>
  );
}

function HeaderSearchIcon({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    setOpen(false);
    router.push(
      trimmed
        ? `/koleksioni?kerko=${encodeURIComponent(trimmed)}`
        : "/koleksioni",
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        aria-label={t.kerko}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-choco transition-colors hover:bg-cream"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t.mbyll}
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <form
            role="search"
            onSubmit={handleSubmit}
            className="absolute right-0 top-full z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-beige bg-ivory p-3 shadow-lg"
          >
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.kerkoPlaceholder}
              className="w-full rounded-full border border-beige bg-cream px-4 py-2.5 text-sm text-ink outline-none focus:border-choco"
            />
          </form>
        </>
      )}
    </div>
  );
}

function CollectionDropdown({
  collections,
  centered = false,
}: {
  collections: CollectionLink[];
  centered?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-sm uppercase tracking-widest text-choco transition-colors hover:text-choco-soft"
        onClick={() => setOpen((value) => !value)}
      >
        {t.koleksioni}
        <ChevronIcon open={open} className="h-3 w-3" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full z-50 mt-3 min-w-48 rounded-lg border border-beige bg-ivory py-2 shadow-lg",
            centered ? "left-1/2 -translate-x-1/2" : "left-0",
          )}
        >
          <DropdownLink href="/koleksioni" onNavigate={() => setOpen(false)}>
            {t.teGjitha}
          </DropdownLink>
          {collections.map((season) => (
            <DropdownLink
              key={season.slug}
              href={`/koleksioni/${season.slug}`}
              onNavigate={() => setOpen(false)}
            >
              {season.label}
            </DropdownLink>
          ))}
        </div>
      )}
    </div>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm uppercase tracking-widest text-choco transition-colors hover:text-choco-soft"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onNavigate,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "py-4 font-display text-3xl text-choco transition-colors hover:text-choco-soft",
        className,
      )}
    >
      {children}
    </Link>
  );
}

function DropdownLink({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block px-4 py-2 text-sm text-ink transition-colors hover:bg-cream hover:text-choco"
    >
      {children}
    </Link>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn("h-4 w-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 6h15l-1.5 9h-12z" strokeLinejoin="round" />
      <path d="M6 6L5 3H2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ChevronIcon({
  open,
  className,
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className={cn(
        "h-4 w-4 transition-transform duration-200",
        open && "rotate-180",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
