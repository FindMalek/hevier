import { Compare } from '@/components/compare';
import { Faq } from '@/components/faq';
import { Features } from '@/components/features';
import { Footer } from '@/components/footer';
import { Get } from '@/components/get';
import { Facts, Hero } from '@/components/hero';
import { JsonLd } from '@/components/json-ld';
import { Nav } from '@/components/nav';
import { Privacy } from '@/components/privacy';
import { RecoverySection } from '@/components/recovery-section';
import { RevealRoot } from '@/components/reveal-root';
import { RunRecovery } from '@/components/run-recovery';
import { Science } from '@/components/science';
import { Widgets } from '@/components/widgets';

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Facts />
        <Features />
        <RecoverySection />
        <Science />
        <Widgets />
        <Privacy />
        <Compare />
        <RunRecovery />
        <Faq />
        <Get />
      </main>
      <Footer />
      <JsonLd />
      <RevealRoot />
    </>
  );
}
