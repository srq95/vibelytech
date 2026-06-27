export const site = {
  name: "VibelyTech",
  tagline: "Building digital experiences that drive real growth.",
  description:
    "VibelyTech is a design & development agency crafting digital experiences that drive real growth — web, mobile, design, and marketing.",
  url: "https://vibelytech.com",
  email: "hello@vibelytech.com",
  phone: "+1 (555) 123-4567",
  address: "123 Innovation Drive, Suite 400, Austin, TX 78701, USA",
} as const;

export type NavLink = { label: string; href: string };

/** Primary navigation. Section anchors for now; routes added as pages ship. */
export const navLinks: NavLink[] = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const socialLinks: NavLink[] = [
  { label: "X / Twitter", href: "https://x.com" },
  { label: "Dribbble", href: "https://dribbble.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
];

/** Footer column groups — point to future routes. */
export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: [
      { label: "Web Development", href: "/services/web-development" },
      { label: "Mobile App Development", href: "/services/mobile-app-development" },
      { label: "Digital Marketing", href: "/services/digital-marketing" },
      { label: "UI/UX Design", href: "/services/ui-ux-design" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];
