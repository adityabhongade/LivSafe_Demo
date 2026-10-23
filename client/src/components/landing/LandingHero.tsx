import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { sitePath } from '@/lib/utils';

export function LandingHero() {
  return (
    <section className="ref-hero" aria-labelledby="landing-title">
      <div className="ref-hero__copy">
        <h1 id="landing-title">Liver ultrasound review, with care.</h1>
        <p className="ref-hero__intro">
          Explore a simulated version of LivSafe’s clinician-led liver ultrasound review workflow.
        </p>
        <p className="ref-hero__detail">
          Review sample records, illustrative class scores, an activation-map mockup, and example assistant responses.
        </p>
        <div className="ref-hero__actions">
          <Link href="/login" className="ref-button ref-button--primary">
            Sign in <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <p className="ref-hero__safety">
          <ShieldCheck aria-hidden="true" size={18} />
          Demo only. Simulated outputs. Not for clinical use.
        </p>
      </div>
      <figure className="ref-hero__visual">
        <div className="ref-hero__photo-field">
          <img
            src={sitePath('liver-fibroscan-transient-elastography-lsm-cap-navi.jpg')}
            alt="A clinician reviewing a FibroScan measurement during an examination"
            width="1500"
            height="1377"
            fetchPriority="high"
          />
        </div>
        <figcaption>
          <a href="https://commons.wikimedia.org/wiki/File:Liver_Fibroscan_Transient_Elastography_LSM_CAP_Navi_Mumbai.jpg" target="_blank" rel="noreferrer">
            Image: Goleisureintl · CC BY 4.0
          </a>
        </figcaption>
      </figure>
    </section>
  );
}
