import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Container } from '@/components/ui/Container';
import { site, socialLinks, footerColumns } from '@/config/site';

// Computed once at build/request time on the server — no hydration drift.
const YEAR = new Date().getFullYear();

// ── Social icons (inline SVG, aria-hidden) ───────────────────────────────────

function XTwitterIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function DribbbleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271a25.6 25.6 0 00-.748-1.681c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.686 8.686 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.287.662zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
      />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function SocialIcon({ label }: { label: string }) {
  if (label === 'X / Twitter') return <XTwitterIcon />;
  if (label === 'Dribbble') return <DribbbleIcon />;
  if (label === 'LinkedIn') return <LinkedInIcon />;
  if (label === 'GitHub') return <GitHubIcon />;
  // Fallback: first letter of the label
  return <span className="text-xs font-bold">{label[0]}</span>;
}

// ── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  return (
    <footer className="relative bg-background">
      {/* Gradient top-border line */}
      <div
        className="absolute top-0 left-0 right-0 h-px bg-brand-gradient"
        aria-hidden="true"
      />

      {/* Large brand watermark — decorative, hidden from a11y tree */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="text-[22vw] font-bold leading-none tracking-tighter text-gradient opacity-[0.04]">
          V
        </span>
      </div>

      <Container className="relative pt-16 pb-10 md:pt-20 md:pb-12">

        {/* ── Main grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12 md:mb-14">

          {/* Brand block */}
          <div className="lg:col-span-2">
            <Logo withWord className="mb-5" />
            <p className="text-sm text-muted leading-relaxed mb-5 max-w-xs">
              {site.tagline}
            </p>
            <a
              href={`mailto:${site.email}`}
              className="text-sm text-brand-blue hover:text-brand-violet transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
            >
              {site.email}
            </a>

            {/* Social links */}
            <div className="flex items-center gap-2.5 mt-6">
              {socialLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-foreground hover:scale-105 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  <SocialIcon label={label} />
                </a>
              ))}
            </div>
          </div>

          {/* Link column groups */}
          {footerColumns.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-blue mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="text-sm text-muted hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ─────────────────────────────────────────────────── */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted order-2 sm:order-1">
            &copy; {YEAR} VibelyTech. All rights reserved.
          </p>

          <div className="flex items-center gap-4 order-1 sm:order-2">
            <a
              href="/privacy"
              className="text-xs text-muted hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-xs text-muted hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
            >
              Terms of Service
            </a>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </footer>
  );
}
