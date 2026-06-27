export type Stat = {
  id: string;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
};

export const stats: Stat[] = [
  { id: "years", value: 5, suffix: "+", label: "Years building" },
  { id: "projects", value: 120, suffix: "+", label: "Projects shipped" },
  { id: "team", value: 40, suffix: "+", label: "Team members" },
  { id: "retention", value: 98, suffix: "%", label: "Client retention" },
];

/** Marquee strip phrases — the "design × development" rhythm. */
export const marqueeItems: string[] = [
  "Web Development",
  "UI/UX Design",
  "Mobile Apps",
  "Digital Marketing",
  "Brand Systems",
  "Motion Design",
  "Product Strategy",
  "Design Engineering",
];
