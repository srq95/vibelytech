export type Service = {
  id: string;
  index: string;
  title: string;
  tagline: string;
  description: string;
  /** A short code-editor motif shown on the card. */
  snippet: string;
  capabilities: string[];
};

export const services: Service[] = [
  {
    id: "web-development",
    index: "01",
    title: "Web Development",
    tagline: "Fast, scalable, future-proof.",
    description:
      "High-performance web apps built on modern stacks — server-rendered, edge-deployed, and engineered to scale with your business.",
    snippet: "<App ship='fast' scale='∞' />",
    capabilities: ["Next.js & React", "Headless CMS", "E-commerce", "Web3 / APIs"],
  },
  {
    id: "mobile-app-development",
    index: "02",
    title: "Mobile App Development",
    tagline: "Native feel, everywhere.",
    description:
      "iOS and Android apps that feel native and load instantly — crafted with React Native and Swift for pixel-perfect experiences.",
    snippet: "build('ios', 'android')",
    capabilities: ["React Native", "Swift / Kotlin", "Offline-first", "App Store launch"],
  },
  {
    id: "digital-marketing",
    index: "03",
    title: "Digital Marketing",
    tagline: "Growth you can measure.",
    description:
      "Data-driven campaigns, SEO, and content that turn attention into revenue — measured, optimized, and relentlessly tested.",
    snippet: "growth.optimize({ roi: true })",
    capabilities: ["SEO & Content", "Paid Media", "Analytics", "Conversion (CRO)"],
  },
  {
    id: "ui-ux-design",
    index: "04",
    title: "UI/UX Design",
    tagline: "Design that converts.",
    description:
      "Research-led product design and brand systems — interfaces that are beautiful, intuitive, and built to convert.",
    snippet: "<Experience delightful />",
    capabilities: ["Product Design", "Design Systems", "Branding", "Prototyping"],
  },
];
