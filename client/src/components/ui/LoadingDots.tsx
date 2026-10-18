import React from 'react';

export default function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden>
      <span className="block w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce [animation-delay:-0.2s]"></span>
      <span className="block w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce [animation-delay:-0.1s]"></span>
      <span className="block w-1.5 h-1.5 rounded-full bg-white/90 animate-bounce"></span>
    </span>
  );
}