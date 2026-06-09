import { SiteHeader } from "../components/layout/header"
import { SiteFooter } from "../components/layout/footer"
import { HeroSection } from "../components/landing/hero"
import { SocialProofSection } from "../components/landing/social-proof"
import { CourtReservationSection } from "../components/landing/court-reservation"
import { PlayerAppSection } from "../components/landing/player-app"
import { LessonsSection } from "../components/landing/lessons"
import { BenefitsSection } from "../components/landing/benefits"
import { FinalCtaSection } from "../components/landing/cta"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f4f1e8] text-zinc-950">
      <SiteHeader />
      <HeroSection />
      <SocialProofSection />
      <CourtReservationSection />
      <PlayerAppSection />
      <LessonsSection />
      <BenefitsSection />
      <FinalCtaSection />
      <SiteFooter />
    </main>
  )
}