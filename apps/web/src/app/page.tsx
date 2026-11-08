import { Afterglow } from '@/components/afterglow';
import { AfterglowDriver } from '@/components/afterglow-driver';
import { Footer } from '@/components/footer';
import { JsonLd } from '@/components/json-ld';
import { Nav } from '@/components/nav';
import { RevealRoot } from '@/components/reveal-root';

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Afterglow />
      </main>
      <Footer />
      <JsonLd />
      <RevealRoot />
      <AfterglowDriver />
    </>
  );
}
