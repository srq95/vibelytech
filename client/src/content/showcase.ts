export type Project = {
  id: string;
  title: string;
  client: string;
  category: string;
  year: string;
  description: string;
  /** Tailwind gradient classes used for the project's visual panel. */
  gradient: string;
  metrics: { label: string; value: string }[];
  tags: string[];
};

export const projects: Project[] = [
  {
    id: "nova-finance",
    title: "Nova Finance",
    client: "Nova",
    category: "Fintech Platform",
    year: "2025",
    description:
      "A complete digital banking experience — onboarding to investments — rebuilt for speed and trust.",
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    metrics: [
      { label: "Conversion", value: "+212%" },
      { label: "Load time", value: "0.6s" },
    ],
    tags: ["Web", "Product Design", "Brand"],
  },
  {
    id: "aurora-health",
    title: "Aurora Health",
    client: "Aurora",
    category: "Mobile App",
    year: "2024",
    description:
      "A care companion app that puts patients first — booking, records, and telehealth in one native experience.",
    gradient: "from-cyan-500 via-blue-600 to-indigo-700",
    metrics: [
      { label: "App rating", value: "4.9★" },
      { label: "Retention", value: "+78%" },
    ],
    tags: ["iOS", "Android", "UX Research"],
  },
  {
    id: "pulse-commerce",
    title: "Pulse Commerce",
    client: "Pulse",
    category: "E-commerce",
    year: "2025",
    description:
      "Headless storefront engineered for scale — sub-second pages and a checkout that converts.",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
    metrics: [
      { label: "Revenue", value: "+340%" },
      { label: "Lighthouse", value: "100" },
    ],
    tags: ["Next.js", "Headless", "CRO"],
  },
  {
    id: "vertex-saas",
    title: "Vertex SaaS",
    client: "Vertex",
    category: "Brand & Web",
    year: "2024",
    description:
      "A category-defining brand and marketing site for a developer-tools startup going to market.",
    gradient: "from-indigo-600 via-blue-600 to-sky-500",
    metrics: [
      { label: "Demo signups", value: "+156%" },
      { label: "Bounce", value: "-44%" },
    ],
    tags: ["Branding", "Web", "Motion"],
  },
];
