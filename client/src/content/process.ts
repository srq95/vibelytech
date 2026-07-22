export type ProcessStep = {
  id: string;
  index: string;
  title: string;
  description: string;
  /** A line of pseudo-code shown in the editor visual. */
  code: string;
  /** Transparent illustration (in /public/process) shown for this step. */
  image: string;
  /** Width/height of the illustration, for intrinsic sizing (no layout shift). */
  imageWidth: number;
  imageHeight: number;
};

export const processSteps: ProcessStep[] = [
  {
    id: "discover",
    index: "01",
    title: "Discover",
    description:
      "We dig into your goals, users, and market — turning ambiguity into a sharp, validated strategy.",
    code: "const goals = await discover(client)",
    image: "/process/discovery.webp",
    imageWidth: 830,
    imageHeight: 654,
  },
  {
    id: "design",
    index: "02",
    title: "Design",
    description:
      "Research-led UX and bold visual systems. We prototype fast and validate with real users.",
    code: "<Design system='scalable' />",
    image: "/process/design.webp",
    imageWidth: 978,
    imageHeight: 822,
  },
  {
    id: "develop",
    index: "03",
    title: "Develop",
    description:
      "Clean, tested, scalable code shipped continuously — engineered for performance from day one.",
    code: "git commit -m 'ship it 🚀'",
    image: "/process/develop.webp",
    imageWidth: 1000,
    imageHeight: 803,
  },
  {
    id: "deploy",
    index: "04",
    title: "Deploy & Grow",
    description:
      "Launch on the edge, measure everything, and iterate relentlessly toward real, compounding growth.",
    code: "deploy({ region: 'global' })",
    image: "/process/deploy.webp",
    imageWidth: 1000,
    imageHeight: 783,
  },
];
