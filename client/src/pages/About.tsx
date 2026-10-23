import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import './About.css';

const LIVSCP_BIBTEX = `@Article{livscp,
AUTHOR = {Dubey, Yogita and Bhongade, Aditya and Fulzele, Punit},
TITLE = {LivSCP: Improving Liver Fibrosis Classification Through Supervised Contrastive Pretraining},
JOURNAL = {Diagnostics},
VOLUME = {15},
YEAR = {2025},
NUMBER = {24},
ARTICLE-NUMBER = {3226},
URL = {https://www.mdpi.com/2075-4418/15/24/3226},
PubMedID = {41464225},
ISSN = {2075-4418},
DOI = {10.3390/diagnostics15243226}
}`;

function AboutPage() {
  const { user } = useAuth();
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'manual'>('idle');
  const userType = user?.type === 'doctor'
    ? 'doctor'
    : user?.type === 'organization'
      ? 'organization'
      : null;

  const copyBibtex = async () => {
    try {
      await navigator.clipboard.writeText(LIVSCP_BIBTEX);
      setCopyStatus('copied');
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = LIVSCP_BIBTEX;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const didCopy = document.execCommand('copy');
      textarea.remove();
      setCopyStatus(didCopy ? 'copied' : 'manual');
    }
  };

  return (
    <div className="about-page">
      <Navbar variant={user ? 'app' : 'public'} userType={userType} showAuthButtons={!user} />
      <main className="about-main">
        <section className="about-content" aria-labelledby="about-title">
          <h1 id="about-title">About LivSafe</h1>
          <p className="about-method-note">
            This site is an interactive demo. Its records, classifier results, activation maps, and assistant replies are simulated; it has no production backend or database.
          </p>
          <p className="about-method-note">
            LivSafe’s research includes{' '}
            <a href="https://www.mdpi.com/2075-4418/15/24/3226" target="_blank" rel="noreferrer">
              LivSCP
            </a>.
          </p>

          <section className="about-citation" aria-labelledby="citation-title">
            <div className="about-citation__heading">
              <h2 id="citation-title">BibTeX</h2>
              <button type="button" className="about-copy-button" onClick={copyBibtex}>
                {copyStatus === 'copied' ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
                {copyStatus === 'copied' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              className="about-citation__text"
              aria-label="LivSCP BibTeX citation"
              value={LIVSCP_BIBTEX}
              readOnly
              spellCheck={false}
              wrap="soft"
              onFocus={(event) => event.currentTarget.select()}
            />
            <span className="about-copy-status" aria-live="polite">
              {copyStatus === 'copied' ? 'BibTeX copied to clipboard.' : ''}
              {copyStatus === 'manual' ? 'Copy unavailable. Select and copy the citation manually.' : ''}
            </span>
          </section>

          <section className="about-contributors" aria-labelledby="contributors-title">
            <h2 id="contributors-title">Contributors</h2>
            <div className="about-contributors__links">
              <div className="about-contributor">
                <span className="about-contributor__name">Aditya Bhongade</span>
                <span>Deep Learning and AI</span>
                <a className="about-contributor__linkedin" href="https://linkedin.com/in/adityabhongade" target="_blank" rel="noreferrer">
                  LinkedIn <ArrowUpRight aria-hidden="true" size={16} />
                </a>
              </div>
              <div className="about-contributor">
                <span className="about-contributor__name">Aniket Bhandwalkar</span>
                <span>Full Stack Development</span>
                <a className="about-contributor__linkedin" href="https://www.linkedin.com/in/aniket-bhandwalkar" target="_blank" rel="noreferrer">
                  LinkedIn <ArrowUpRight aria-hidden="true" size={16} />
                </a>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
