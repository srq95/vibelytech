'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { navLinks } from '@/config/site';
import { cn } from '@/lib/utils';
import { useLoader } from '@/providers/LoaderProvider';

// ── Animated hamburger icon ──────────────────────────────────────────────────

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span
      className="flex flex-col items-center justify-center gap-[5px] w-[18px]"
      aria-hidden="true"
    >
      <span
        className={cn(
          'block h-[2px] w-full rounded-full bg-foreground transition-all duration-300 origin-center',
          open ? 'rotate-45 translate-y-[7px]' : '',
        )}
      />
      <span
        className={cn(
          'block h-[2px] rounded-full bg-foreground transition-all duration-200',
          open ? 'w-0 opacity-0' : 'w-3',
        )}
      />
      <span
        className={cn(
          'block h-[2px] w-full rounded-full bg-foreground transition-all duration-300 origin-center',
          open ? '-rotate-45 -translate-y-[7px]' : '',
        )}
      />
    </span>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Trigger the entrance only once the preloader has fully exited, otherwise
  // the animation plays unseen behind the z-100 overlay.
  const { isReady } = useLoader();

  // Compact the navbar once user scrolls past 40 px.
  // State is set INSIDE the event handler, not directly in the effect body.
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on Escape.
  // Listener is added/removed with cleanup; state set inside handler.
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    // pointer-events-none on the fixed shell so the hero beneath remains
    // clickable through the transparent parts.
    <header
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 md:px-6 pt-3"
      style={
        isReady ? { animation: 'header-in 0.6s ease-out both' } : undefined
      }
    >
      {/* Constrained container — pointer events restored */}
      <div className="pointer-events-auto relative w-full max-w-5xl">

        {/* ── Pill navbar ──────────────────────────────────────────────── */}
        <div
          className={cn(
            'glass-strong rounded-full flex items-center justify-between',
            'px-3 md:px-5 transition-all duration-300',
            scrolled ? 'py-3 shadow-[0_12px_48px_-8px_var(--glass-shadow)]' : 'py-3',
          )}
        >
          {/* Logo — anchored to top of page */}
          <a
            href="#top"
            aria-label="VibelyTech — go to top"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-full"
          >
            <Logo withWord />
          </a>

          {/* Desktop nav links */}
          <nav aria-label="Primary" className="hidden md:flex items-center gap-0.5">
            {navLinks.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className={cn(
                  'relative px-3.5 py-2 text-sm font-medium text-muted',
                  'rounded-full transition-colors duration-200 hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
                  'group',
                )}
              >
                {label}
                {/* Animated gradient underline */}
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 left-3 right-3 h-[2px] rounded-full bg-brand-gradient scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center"
                />
              </a>
            ))}
          </nav>

          {/* Right cluster: theme toggle + CTA + mobile burger */}
          <div className="flex items-center gap-2 md:gap-3">
            <ThemeToggle className="hidden md:inline-flex" />

            <Button
              variant="primary"
              size="md"
              href="#contact"
              className="hidden md:inline-flex"
            >
              Start a project
            </Button>

            {/* Mobile hamburger button */}
            <button
              type="button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((prev) => !prev)}
              className={cn(
                'md:hidden glass inline-flex h-9 w-9 items-center justify-center rounded-full',
                'transition-all duration-200 hover:scale-105',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
              )}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown panel ─────────────────────────────────────── */}
        <div
          id="mobile-menu"
          aria-hidden={!menuOpen}
          // When closed, `inert` removes the panel + its links from the tab
          // order and resolves the aria-hidden-focusable conflict (React 19
          // supports the boolean `inert` prop).
          inert={!menuOpen ? true : undefined}
          className={cn(
            'md:hidden glass-strong rounded-2xl mt-2 overflow-hidden',
            'transition-all duration-300 ease-out',
            menuOpen
              ? 'max-h-[420px] opacity-100'
              : 'max-h-0 opacity-0 pointer-events-none',
          )}
        >
          <nav aria-label="Mobile primary navigation" className="p-3">
            <ul role="list" className="flex flex-col gap-0.5">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium text-muted rounded-xl',
                      'hover:text-foreground hover:bg-white/[0.05] transition-all duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue',
                    )}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Bottom row: theme toggle + CTA */}
            <div className="mt-2 pt-3 border-t border-border flex items-center justify-between px-2 pb-1">
              <ThemeToggle />
              {/* Styled inline anchor avoids conflicting onClick types with Button */}
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-full cursor-pointer select-none',
                  'bg-brand-gradient text-white font-semibold px-6 py-2.5 text-sm',
                  'shadow-[0_0_0_0_rgb(var(--brand-glow)_/_0)] hover:shadow-[0_0_24px_6px_rgb(var(--brand-glow)_/_0.40)]',
                  'hover:scale-[1.03] active:scale-[0.97] transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2',
                )}
              >
                Start a project
              </a>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
