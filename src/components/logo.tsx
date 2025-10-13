import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        {...props}
      >
        <path d="M14.5 17.5c.3-.3.5-.7.5-1.1s-.2-.8-.5-1.1c-.3-.3-.7-.5-1.1-.5s-.8.2-1.1.5c-.3.3-.5.7-.5 1.1s.2.8.5 1.1c.3.3.7.5 1.1.5s.8-.2 1.1-.5z" />
        <path d="m12 15-8.3 8.3" />
        <path d="M14 17.8 22 10" />
        <path d="m15 11-1 4-4 1 2-8Z" />
        <path d="M2.3 13.7 5 11l6 6" />
        <path d="m13 2-2.5 2.5" />
        <path d="m3 21 8.3-8.3" />
        <path d="M5 11m-1 1 6 6" />
      </svg>
      <span className="font-headline text-xl font-bold">SilentBid</span>
    </div>
  );
}
