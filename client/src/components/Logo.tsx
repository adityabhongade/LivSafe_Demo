import { Link } from 'wouter';

interface LogoProps {
  theme?: 'light' | 'dark';
  onNavigate?: () => void;
}

export function Logo({ theme = 'light', onNavigate }: LogoProps) {
  return (
    <Link href="/" onClick={onNavigate} aria-label="LivSafe home" className={`brand brand--${theme}`}>
      <div className="flex items-center space-x-2 cursor-pointer">
        <span className="brand__mark">TR</span>
        <span className="brand__name">LivSafe</span>
      </div>
    </Link>
  );
}
