import { Link } from 'wouter';
import { sitePath } from '@/lib/utils';

interface LogoProps {
  theme?: 'light' | 'dark';
  onNavigate?: () => void;
}

/**
 * Brand logo component.
 *
 * theme="light"  → used on the public/landing pages (light-coloured navbar bg)
 *                   renders the standard icon + wordmark (dark purple ink on white)
 * theme="dark"   → used on all app pages (dark navy bg)
 *                   renders the reversed icon (white shield, purple liver)
 *
 * The icon is shown alone in compact contexts (app navbar).
 * On wider public pages the full wordmark is shown beside the icon.
 */
export function Logo({ theme = 'light', onNavigate }: LogoProps) {
  const iconSrc =
    theme === 'dark'
      ? sitePath('logos/livsafe-icon-reversed.svg')
      : sitePath('logos/livsafe-icon.svg');

  const wordmarkSrc =
    theme === 'dark'
      ? sitePath('logos/livsafe-wordmark-reversed.svg')
      : sitePath('logos/livsafe-wordmark.svg');

  return (
    <Link href="/" onClick={onNavigate} aria-label="LivSafe home" className={`brand brand--${theme}`}>
      <div className="flex items-center gap-2.5 cursor-pointer">
        {/* Shield / liver icon — always visible */}
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          className="h-8 w-auto"
        />
        {/* Wordmark — hidden on narrow app navbars via CSS, visible on public pages */}
        <img
          src={wordmarkSrc}
          alt="LivSafe"
          className="brand__wordmark h-6 w-auto"
        />
      </div>
    </Link>
  );
}
