import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'wouter';

interface UserMenuProps {
  initials?: string;
  name?: string;
}



export function UserMenu({ initials, name }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const [, navigate] = useLocation();

  const handleLogout=()=>{
    logout().then(
      () => {
        navigate('/login');
      },
      (error) => {
        console.error('Logout failed:', error);
      }
    );
  };
  
  const displayName = name || user?.name || 'User';
  const displayInitials = initials || (user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U');

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={toggleMenu} 
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-10 h-10 rounded-full bg-primary-600 border-2 border-primary-400 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold">{displayInitials}</span>
        </div>
        <div className="hidden md:block">
          <span className="text-white font-semibold">{displayName}</span>
        </div>
        <ChevronDown className="text-white h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-primary-800 rounded-xl shadow-xl border border-primary-600 py-2 z-50">
          {user?.type === 'organization' && (
            <Link href="/organization/profile" className="block px-4 py-3 text-sm text-white hover:bg-primary-700 transition-colors duration-150 font-medium">
              Organization Profile
            </Link>
          )}
          <Link href="/update-password" className="block px-4 py-3 text-sm text-white hover:bg-primary-700 transition-colors duration-150 font-medium">
            Update Password
          </Link>
          <div className="border-t border-primary-600 my-2"></div>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-primary-700 hover:text-red-300 transition-colors duration-150 font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
