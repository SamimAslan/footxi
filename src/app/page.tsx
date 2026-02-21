import HeroSection from "@/components/HeroSection";
import Marquee from "@/components/Marquee";
import LeagueSection from "@/components/LeagueSection";
import FeaturedProducts from "@/components/FeaturedProducts";
import PricingSection from "@/components/PricingSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <Marquee />
      <LeagueSection />
      <FeaturedProducts />
      <PricingSection />
    </>
  );
}
