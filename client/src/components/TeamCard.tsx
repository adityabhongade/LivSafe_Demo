import React from 'react';

interface TeamCardProps {
  name: string;
  role?: string;
  imgSrc: string;
}

// A card that blurs the photo on hover and raises a name pill to ~20% height
export const TeamCard: React.FC<TeamCardProps> = ({ name, role, imgSrc }) => {
  return (
    <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-2xl">
      {/* Image */}
      <img
        src={imgSrc}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover transition-all duration-300 group-hover:blur-sm group-hover:scale-[1.02]"
      />

      {/* Dark gradient to improve text legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-70" />

      {/* Floating name pill that slides up to ~20% of the card on hover */}
      <div
        className="absolute left-1/2 -translate-x-1/2 bottom-[6%] group-hover:bottom-[10%] transition-all duration-300"
      >
        <div className="rounded-2xl bg-white px-6 py-3 text-center">
          <p className="text-base font-semibold text-gray-900 whitespace-nowrap">{name}</p>
          {role ? (
            <p className="-mt-0.5 text-xs text-gray-500 whitespace-nowrap">{role}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TeamCard;