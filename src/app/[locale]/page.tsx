import { CtaBand } from "@/components/home/cta-band";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/home/marquee";
import { Pillars } from "@/components/home/pillars";
import { Steps } from "@/components/home/steps";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Pillars />
      <Steps />
      <CtaBand />
    </>
  );
}
