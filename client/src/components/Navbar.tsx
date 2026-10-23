import { Link } from 'wouter';
import { useState } from 'react';
import { Logo } from './Logo';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  showAuthButtons?: boolean;
  userType?: 'doctor' | 'organization' | null;
  variant?: 'public' | 'app';
}

export function Navbar({ showAuthButtons = true, userType = null, variant = 'app' }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const links = variant === 'public'
    ? [
        { href: '/about', label: 'About' },
      ]
    : userType === 'doctor'
    ? [
        { href: '/doctor/dashboard', label: 'Dashboard' },
        { href: '/doctor/search', label: 'Search' },
        { href: '/about', label: 'About' },
      ]
    : userType === 'organization'
    ? [
        { href: '/organization/dashboard', label: 'Dashboard' },
        { href: '/about', label: 'About' },
      ]
    : [
        { href: '/about', label: 'About' },
      ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`site-header site-header--${variant}`}>
      <nav className="site-nav" aria-label="Main navigation">
        <Logo theme="light" onNavigate={closeMenu} />

        <div className="site-nav__links">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="site-nav__link">
              {link.label}
            </Link>
          ))}
        </div>

        {showAuthButtons && (
          <div className="site-nav__actions">
            {variant === 'public' ? (
              <>
                <Link href="/signup" className="site-nav__login">Create account</Link>
                <Link href="/login" className="site-nav__signup"><span>Sign in</span></Link>
              </>
            ) : (
              <Link href="/login" className="site-nav__login">Log in</Link>
            )}
          </div>
        )}

        <button
          type="button"
          className="site-nav__menu-toggle"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMenuOpen ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
        </button>

        <div id="mobile-navigation" className={`site-nav__mobile${isMenuOpen ? ' is-open' : ''}`} hidden={!isMenuOpen}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="site-nav__mobile-link" onClick={closeMenu}>
              {link.label}
            </Link>
          ))}
          {showAuthButtons && (
            <>
              {variant === 'public' ? (
                <>
                  <Link href="/signup" className="site-nav__mobile-link" onClick={closeMenu}>Create account</Link>
                  <Link href="/login" className="site-nav__mobile-link site-nav__mobile-link--cta" onClick={closeMenu}>Sign in</Link>
                </>
              ) : (
                <Link href="/login" className="site-nav__mobile-link" onClick={closeMenu}>Log in</Link>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
