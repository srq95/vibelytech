import Hero from "@/components/sections/Hero";
import MarqueeStrip from "@/components/sections/MarqueeStrip";
import Services from "@/components/sections/Services";
import Showcase from "@/components/sections/Showcase";
import Process from "@/components/sections/Process";
import Stats from "@/components/sections/Stats";
import CTA from "@/components/sections/CTA";

export default function Home() {
  return (
    <main>
      <Hero />
      <MarqueeStrip />
      <Services />
      <Showcase />
      <Process />
      <Stats />
      <CTA />
    </main>
  );
}
