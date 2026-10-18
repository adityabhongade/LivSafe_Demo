import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingPrinciples } from '@/components/landing/LandingPrinciples';

export default function Landing() {
  return (
    <div className="landing-page min-h-screen">
      <Navbar variant="public" />
      <main>
        <LandingHero />
        <LandingPrinciples />
      </main>
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <span>LivSafe</span>
          <p>Decision support only. Not a diagnosis. Requires clinician review.</p>
          <Link href="/about">About LivSafe</Link>
        </div>
      </footer>
    </div>
  );
}
