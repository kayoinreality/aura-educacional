import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { HeroSection } from '@/components/sections/hero';
import { HowItWorksSection } from '@/components/sections/how-it-works';
import { PricingSection } from '@/components/sections/pricing';
import { CoursesPreviewSection } from '@/components/sections/courses-preview';
import { AboutCertificateSection } from '@/components/sections/about-certificate';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { FaqSection } from '@/components/sections/faq';
import { CtaSection } from '@/components/sections/cta';

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <PricingSection />
        <CoursesPreviewSection />
        <AboutCertificateSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
