import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import FeaturedProducts from "@/components/FeaturedProducts";
import MiniLeagueGrid from "@/components/MiniLeagueGrid";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Marquee />
      <FeaturedProducts />
      <MiniLeagueGrid />
      <PricingSection />
    </>
  );
}
