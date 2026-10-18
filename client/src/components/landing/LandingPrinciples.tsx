import { BookOpenCheck, CircleHelp, UserRoundCheck } from 'lucide-react';

const principles = [
  {
    title: 'Evidence before certainty',
    description: 'Clinical decision support should make uncertainty visible, not hide it.',
    icon: BookOpenCheck,
  },
  {
    title: 'The clinician stays in control',
    description: 'Automated output is a draft for review, never a substitute for judgment.',
    icon: UserRoundCheck,
  },
  {
    title: 'Limits are part of the result',
    description: 'Imaging findings need to be interpreted in the context of the full case.',
    icon: CircleHelp,
  },
];

export function LandingPrinciples() {
  return (
    <section className="landing-principles" aria-labelledby="principles-title">
      <div className="landing-principles__heading">
        <p className="landing-kicker">How we approach the work</p>
        <h2 id="principles-title">Designed for careful review.</h2>
      </div>
      <div className="landing-principles__list">
        {principles.map(({ title, description, icon: Icon }) => (
          <article className="landing-principle" key={title}>
            <Icon className="landing-principle__icon" aria-hidden="true" size={21} />
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}