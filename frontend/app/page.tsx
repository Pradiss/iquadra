import { SiteFooter, SiteHeader } from "@/shared/layout"
import {
  BenefitsSection,
  CourtReservationSection,
  FinalCtaSection,
  HeroSection,
  LessonsSection,
  PlayerAppSection,
  SocialProofSection,
} from "@/features/landing/components"

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
