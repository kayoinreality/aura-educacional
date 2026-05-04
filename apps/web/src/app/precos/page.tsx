import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { PricingSection } from '@/components/sections/pricing';
import { FaqSection } from '@/components/sections/faq';

export const metadata = { title: 'Planos — Aura Educacional' };

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PricingSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
