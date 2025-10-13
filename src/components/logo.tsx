import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="24"
        height="24"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <defs>
          <linearGradient id="red-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" style={{ stopColor: '#D92D27', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#A5221C', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="grey-gradient" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" style={{ stopColor: '#B3B3B3', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#E6E6E6', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <ellipse cx="50" cy="50" rx="45" ry="25" fill="url(#red-gradient)" />
        <ellipse cx="50" cy="50" rx="25" ry="45" fill="url(#red-gradient)" transform="rotate(0 50 50)" />
        <path d="M50 5 L75 50 L50 95 L25 50 Z" fill="rgba(255,255,255,0.2)" />
        <path d="M 50,5 a 25,45 0 0,0 0,90" fill="url(#grey-gradient)" />
      </svg>
      <span className="font-headline text-lg font-bold">SilentBid</span>
    </div>
  );
}
