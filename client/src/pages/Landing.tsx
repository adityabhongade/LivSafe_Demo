import { ArrowRight } from 'lucide-react';
import { Link } from 'wouter';
import { Navbar } from '@/components/Navbar';
import { SEO } from '@/components/SEO';
import { LandingHero } from '@/components/landing/LandingHero';
import './Landing.css';

export default function Landing() {
  return (
    <div className="landing-page">
      <SEO
        title="LivSafe Demo | Liver Ultrasound Review Prototype"
        description="Explore LivSafe, an interactive research prototype for liver ultrasound review, simulated fibrosis staging, and clinician decision-support workflows. Demonstration use only."
        path="/"
        indexable
      />
      <Navbar variant="public" />
      <main>
        <LandingHero />
        <section className="ref-invitation" aria-labelledby="invitation-title">
          <div>
            <h2 id="invitation-title">A tool for careful review.</h2>
            <p>Every result is a draft for clinician review, with model limitations kept in view.</p>
          </div>
          <Link href="/login" className="ref-button ref-button--primary">
            Create an account <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </section>
      </main>
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          <span>LivSafe</span>
          <p>Demo experience · Simulated outputs only. Not for clinical use.</p>
          <Link href="/about">About LivSafe</Link>
        </div>
      </footer>
    </div>
  );
}
