import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';

export function LandingHero() {
  return (
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-hero__content">
        <div className="landing-hero__copy">
          <p className="landing-kicker">
            <span className="landing-kicker__mark" aria-hidden="true" />
            Liver fibrosis review
          </p>
          <h1 id="landing-title">A clearer view of the evidence.</h1>
          <p className="landing-hero__description">
            LivSafe is being built to support clinicians reviewing liver ultrasound findings,
            with careful attention to uncertainty and clinical context.
          </p>
          <div className="landing-hero__actions">
            <Link href="/login" className="landing-button landing-button--primary">
              Sign in <ArrowRight aria-hidden="true" size={17} />
            </Link>
            <Link href="/signup" className="landing-button landing-button--secondary">
              Create account
            </Link>
          </div>
          <p className="landing-hero__disclaimer">
            <ShieldCheck aria-hidden="true" size={17} />
            Decision support only. Not a diagnosis. Requires clinician review.
          </p>
        </div>

        <figure className="landing-hero__image">
          <img
            src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=85"
            alt="Clinician reviewing a medical image on a screen"
          />
          <figcaption>
            <span className="landing-image-label__dot" aria-hidden="true" />
            Built around clinician review
          </figcaption>
        </figure>
      </div>
    </section>
  );
}